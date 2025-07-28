"use client";
import * as React from "react";
import {
  NotepadText,
  Home,
  CloudUpload,
  FileText,
  Cog,
  Clipboard,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useLoginSession } from "@/context/LoginSessionContext";

import { AnimatePresence, easeInOut, motion } from "motion/react";

// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: (
        <Home className="size-10 border-2 border-sidebar-foreground rounded-lg p-2 shadow-lg  " />
      ),
    },
    {
      title: "Projects",
      url: "/projects",
      icon: (
        <CloudUpload className="size-10 border-2 border-sidebar-foreground rounded-lg p-2 shadow-lg  " />
      ),
    },
    {
      title: "Task",
      url: "/task",
      icon: (
        <FileText className="size-10 border-2 border-sidebar-foreground rounded-lg p-2 shadow-lg  " />
      ),
    },
    // {
    //   title: "Status",
    //   url: "/status",
    //   icon: (
    //     <Clock className="size-10 border-2 border-sidebar-foreground rounded-lg p-2 shadow-lg  " />
    //   ),
    // },
    {
      title: "Settings",
      url: "/settings",
      icon: (
        <Cog className="size-10 border-2 border-sidebar-foreground rounded-lg p-2 shadow-lg  " />
      ),
    },
    {
      title: "Register",
      url: "/register",
      icon: (
        <Clipboard className="size-10 border-2 border-sidebar-foreground rounded-lg p-2 shadow-lg  " />
      ),
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isAuthenticated } = useLoginSession();
  return (
    <>
      {isAuthenticated ? (
        <div>
          <Sidebar {...props} className="border-none">
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" asChild>
                    <a href="#">
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <NotepadText className="size-4" />
                      </div>
                      <div className="flex flex-col gap-0.5 leading-none">
                        <span className="font-semibold text-md">Ezzay </span>
                        <span className="text-xs">Easy Essay Scoring Tool</span>
                      </div>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarMenu>
                  {data.navMain.map((item) => (
                    <AnimatePresence key={item.title}>
                      <SidebarMenuItem
                        key={item.title}
                        className="h-16 space-y-4"
                      >
                        <SidebarMenuButton asChild>
                          <motion.a
                            href={item.url}
                            className="font-medium flex items-center rounded-2xl h-full justify-start text-sidebar-primary"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <motion.div
                              whileHover={{
                                rotateY: 180,
                                transition: {
                                  rotateY: {
                                    repeat: 0,
                                    repeatType: "loop",
                                    duration: 0.3,
                                    easeInOut,
                                  },
                                },
                              }}
                              initial={{ rotateY: 0 }}
                              className="absolute w-full p-2 rounded-lg"
                              style={{ transformOrigin: "12% center" }} // Anchor rotation to the left center
                            >
                              {item.icon}
                            </motion.div>
                            <span className="pl-16 ml-2 font-semibold">
                              {item.title}
                            </span>
                          </motion.a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </AnimatePresence>
                  ))}
                </SidebarMenu>

                <div className="flex w-full place-content-center align-middle mt-10">
                  <p className="text-md font-bold">Made by CULI</p>
                </div>
                <div className="flex w-full place-content-center align-middle">
                  <p className="text-sm">v1.0.1</p>
                </div>
              </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
            <SidebarTrigger />
          </Sidebar>
        </div>
      ) : null}
    </>
  );
}
