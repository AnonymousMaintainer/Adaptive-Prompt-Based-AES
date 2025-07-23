import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { LoginSessionProvider } from "@/context/LoginSessionContext";
import { AuthWrapper } from "@/components/AuthWrapper";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CULI-Essay-Checker",
  description: "Made with 💖",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LoginSessionProvider>
            <SidebarProvider>
              <AppSidebar />
              <AuthWrapper>{children}</AuthWrapper>
            </SidebarProvider>
          </LoginSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
