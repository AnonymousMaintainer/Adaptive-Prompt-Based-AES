/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserModel } from "@/app/types/user"

export async function register(token: string, userRegisterDetails: Record<string, any>): Promise<Record<string, any>> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/users/register`
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userRegisterDetails),
  })

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`)
  }

  return response.json()
}

export async function fetchUsers(token: string): Promise<UserModel[]> {
  const url = `${process.env.BASE_BACKEND_URL}/api/v1/users/me/`

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      return await response.json()
    } else {
      console.error("Error fetching users:", response.statusText)
      return []
    }
  } catch (error) {
    console.error("Error fetching users:", error)
    return []
  }
}