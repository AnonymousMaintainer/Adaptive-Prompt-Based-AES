import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const LogoutButton = () => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user_info");
    window.location.href = "/login";
  };

  return (
    <>
      <Button
        variant="ghost"
        className="relative h-8 w-8 rounded-full"
        onClick={() => setShowLogoutConfirm(true)}
      >
        <LogOut className="h-5 w-5" />
      </Button>
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              className="hover:bg-red-700"
              onClick={handleLogout}
            >
              Confirm
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowLogoutConfirm(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LogoutButton;
