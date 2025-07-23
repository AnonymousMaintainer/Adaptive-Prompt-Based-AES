"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Bell, Lock, Eye, EyeOff } from "lucide-react";
import Header from "@/components/Header";
import { SidebarInset } from "@/components/ui/sidebar";
import { checkAuthentication, updateProfile } from "@/lib/LoginService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isClearCacheConfirmOpen, setIsClearCacheConfirmOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const { toast } = useToast();
  const router = useRouter();
  useEffect(() => {
    async function check() {
      const token = sessionStorage.getItem("token");
      if (!checkAuthentication(token) || !token) return;
    }
    check();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const token = sessionStorage.getItem("token");
    if (!token) {
      setIsLoading(false);
      return;
    }
    // Sanitize phone input to digits only
    const phoneSanitized = phone.replace(/\D/g, "");
    const profileData = { email, phone: phoneSanitized || undefined };
    const result = await updateProfile(token, profileData);
    setIsLoading(false);
    if (result) {
      toast({
        title: "Settings Saved",
        description: "Your profile has been successfully updated.",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  function handleClearCache() {
    localStorage.clear();
    sessionStorage.clear();
    router.push("/login");
    toast({
      title: "Cache Cleared",
      description: "All cached data has been cleared.",
    });
  }

  return (
    <>
      <SidebarInset>
        <Header page="Settings" href="/settings" />
        <div className="container mx-auto p-4">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Settings</CardTitle>
            <CardDescription>
              Manage your account settings and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="account" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="account">Account</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="xxx-xxx-xxxx"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <User className="mr-2 h-4 w-4" />
                        Save Account Settings
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="notifications">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications about your account.
                      </p>
                    </div>
                    <Switch id="email-notifications" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications on your devices.
                      </p>
                    </div>
                    <Switch id="push-notifications" />
                  </div>
                  <Button onClick={handleSaveProfile} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Bell className="mr-2 h-4 w-4" />
                        Save Notification Settings
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="security">
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Update Password
                      </>
                    )}
                  </Button>
                </form>
                <Button
                  onClick={() => setIsClearCacheConfirmOpen(true)}
                  variant="destructive"
                  className="mt-4"
                >
                  Clear Cache
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </div>
      </SidebarInset>

      <Dialog
        open={isClearCacheConfirmOpen}
        onOpenChange={setIsClearCacheConfirmOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cache Clearing</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear the cache? All cached data will be
              lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsClearCacheConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                handleClearCache();
                setIsClearCacheConfirmOpen(false);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
