"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash, UserRoundIcon, UserRoundPlus } from "lucide-react";
import Header from "@/components/Header";
import { register } from "@/lib/RegisterService";
import { checkAuthentication, isAdmin } from "@/lib/LoginService";
import { SidebarInset } from "@/components/ui/sidebar";
import { easeInOut, motion } from "motion/react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "../types/user";

export default function RegisterPage() {
  const [id, setId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<
    { id: string; username: string; createdDate: string }[]
  >([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  // Crude Get all "USERS"
  useEffect(() => {
    async function loadUsers() {
      setUsersLoading(true);
      const token = sessionStorage.getItem("token");
      if (!checkAuthentication(token) || !token) return;

      try {
        // const fetchedUsers = await fetchUsers(token);
        // setUsers(
        //   fetchedUsers.map((user: User) => ({
        //     id: user.id.toString(),
        //     username: user.username,
        //     createdDate: user.created_at
        //       ? user.created_at
        //       : new Date().toISOString(),
        //   }))
        // );
        const fetchedUsers = [
          {
            id: 1,
            username: "Not Implemented Yet",
            created_at: new Date().toISOString(),
          },
        ];
        setUsers(
          fetchedUsers.map((user: User) => ({
            id: user.id.toString(),
            username: user.username,
            createdDate: user.created_at,
          }))
        );
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        toast({
          title: "Users loaded successfully",
          description: `${users.length} users found.`,
          variant: "default",
        });
        setUsersLoading(false);
      }
    }
    loadUsers();
  }, [toast, users.length]);

  const handleDelete = async (userId: string) => {
    setUsers(users.filter((user) => user.id !== userId));
    toast({
      title: "User deleted successfully",
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = sessionStorage.getItem("token");
    if (!checkAuthentication(token) || !token) return;

    try {
      const admin = await isAdmin(token);
      if (!admin) {
        toast({
          title: "Authorization Error",
          description: "You are not authorized to register an account.",
          variant: "destructive",
        });
        router.push("/");
        return;
      }

      await register(token, { id, username, password, role });
      toast({
        title: "Registration Successful",
        description: "Successfully created an account 🎉",
      });
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: "Failed to create an account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SidebarInset>
        <Header page="Register" href="/register" />
        <div className="container mx-auto p-4">
          {/* Registered Users Table */}
          <div className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <UserRoundIcon className="mr-2" />
                    Registered Users
                  </div>
                  {/* Registration Form Button */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <motion.button
                        data-tour="register-button"
                        className="h-8"
                        whileHover={{
                          scale: 1.1,
                          rotateZ: [30, -30, 0, 0],
                          transition: {
                            rotateZ: {
                              duration: 1,
                              repeatType: "mirror",
                              repeat: Infinity,
                              easeInOut,
                            },
                          },
                        }}
                        initial={{ scale: 1, rotateZ: 0 }}
                      >
                        <UserRoundPlus className="size-6" />
                      </motion.button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Register New User</DialogTitle>
                        <DialogDescription>
                          Create a new account for a teacher or admin.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                          <label htmlFor="id">ID</label>
                          <Input
                            id="id"
                            type="text"
                            value={id}
                            onChange={(e) => setId(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="username">Username</label>
                          <Input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="password">Password</label>
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label htmlFor="role">Role</label>
                          <Select onValueChange={setRole} required>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="teacher">Teacher</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full hover:bg-green-500 hover:text-green-50"
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Registering...
                              </>
                            ) : (
                              "Register"
                            )}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardTitle>
              <CardDescription>View all registered users.</CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div>Loading users...</div>
              ) : (
                <div className="rounded-t-lg w-full overflow-hidden">
                  <Table className="min-w-full divide-y border divide-primary text-center">
                    <TableHeader className="bg-card">
                      <TableRow>
                        <TableHead className="text-center">ID</TableHead>
                        <TableHead className="text-center">Username</TableHead>
                        <TableHead className="text-center">
                          Created Date
                        </TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-primary bg-background">
                      {users.map((user) => (
                        <TableRow key={user.id} className="h-12">
                          <TableCell className="text-center">
                            {user.id}
                          </TableCell>
                          <TableCell className="text-center">
                            {user.username}
                          </TableCell>
                          <TableCell className="text-center">
                            {user.createdDate}
                          </TableCell>
                          <TableCell className="text-center">
                            <motion.button
                              className="border-none text-red-500 hover:bg-transparent"
                              whileHover={{
                                scale: 1.1,
                                rotateZ: [30, -30],
                                transition: {
                                  rotateZ: {
                                    repeat: Infinity,
                                    repeatType: "mirror",
                                    duration: 1,
                                    easeInOut,
                                  },
                                },
                              }}
                              initial={{ scale: 1, rotateZ: 0 }}
                              onClick={() => setPendingDelete(user.id)}
                            >
                              <Trash className="size-5" />
                            </motion.button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </div>
          {/* Global Confirmation Dialog */}
          {pendingDelete && (
            <AlertDialog
              open
              onOpenChange={(open: boolean) => {
                if (!open) setPendingDelete(null);
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete this user?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setPendingDelete(null)}>
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (pendingDelete) {
                        handleDelete(pendingDelete);
                        setPendingDelete(null);
                      }
                    }}
                    className="bg-red-400 text-white hover:bg-red-600"
                  >
                    Confirm
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </SidebarInset>
    </>
  );
}
