"use client";
import React, { useState, useEffect } from "react";
import { useLoginSession } from "@/context/LoginSessionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/LoginService";
import { ErrorAlert } from "@/components/ErrorAlert";

// export const metadata: Metadata = {
//   title: "Login",
//   description: "Login to your account",
// };

export default function LoginPage() {
  const router = useRouter();
  const { setToken, isAuthenticated } = useLoginSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorVisible, setErrorVisible] = useState(false);

  const handleLogin = async () => {
    // const token = { data: "bypass" }; // For testing purposes, replace with actual token retrieval logic

    const token = await getToken(username, password);
    if (token && token.status === 201) {
      setToken(token.data);
      sessionStorage.setItem("login_successful", "true"); // Set login success flag
      // console.log("Login successful:", token.data); // For Debugging
    } else if (token && token.status === 404) {
      setErrorVisible(true);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex h-screen w-screen flex-col place-content-center">
      <Card className="w-[350px] self-center bg-background text-background-foreground shadow-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
        >
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Login</CardTitle>
            <CardDescription className="text-center text-md text-background-foreground">
              CULI Essay Scoring
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            {errorVisible ? <ErrorAlert description="Login Failed!" /> : null}
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              variant="default"
              className="w-full hover:bg-secondary hover:text-secondary-foreground"
            >
              Sign In
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
