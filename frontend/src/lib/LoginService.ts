/* eslint-disable @typescript-eslint/no-explicit-any */
import { toast } from '@/hooks/use-toast';
import dotenv from 'dotenv';
dotenv.config();

interface TokenResponse {
  status: number;
  access_token?: string;
}

interface User {
  role: string;
  // ...other user properties...
}

export async function getToken(username: string, password: string): Promise<TokenResponse | null> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/auth/token`;
  const params = new URLSearchParams({
    grant_type: "password",
    username,
    password,
    scope: "",
    client_id: "",
    client_secret: "",
  });

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/json", 
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (response.status === 401) {
      window.location.href = "/login";
      return null;
    }

    if (response.status === 404) {
      return { status: response.status };
    }
    if (response.status === 201) {
      const data = await response.json();
      return { status: response.status, access_token: data.access_token };
    }

    throw new Error(`Unexpected response status: ${response.status}`);
  } catch (error) {
    console.error("Error retrieving token:", error);
    return null;
  }
}

export async function verifyToken(token: string): Promise<User | null> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/users/me`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 200) {
      return await response.json();
    } else if (response.status === 401) {
      toast({
        title: "Session Timeout",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user_info");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return null;
    } else {
      console.error("Token is invalid or expired. Please log in again.");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user_info");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return null;
    }
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

export async function checkAuthentication(token: string | null): Promise<boolean> {

  if (token) {
    return true;
  }
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user_info");
  toast({
    title: "Authentication Error",
    description: "You are not logged in.",
    variant: "destructive",
  });
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
  return false;
}

export async function isAdmin(token: string): Promise<boolean> {
  const userInfo = await verifyToken(token);
  return userInfo?.role === "admin";
}

export async function updateProfile(token: string, profileData: { email: string, phone?: string }): Promise<Record<string, unknown> | null> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/users/settings/profile`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileData),
    });

    if (response.ok) {
      return await response.json();
    } else {
      // NEW: Log error details to help diagnose the failure.
      const errorText = await response.text();
      console.error("Failed to update profile. Status:", response.status, "Response:", errorText);
      return null;
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return null;
  }
}

export async function updatePassword(token: string, passwordData: Record<string, any>): Promise<Record<string, unknown> | null> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/users/settings/password`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwordData),
    });

    if (response.ok) {
      return await response.json();
    } else {
      console.error("Failed to update password.");
      return null;
    }
  } catch (error) {
    console.error("Error updating password:", error);
    return null;
  }
}