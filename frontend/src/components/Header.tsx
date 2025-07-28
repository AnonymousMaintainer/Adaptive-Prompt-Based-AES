import type React from "react";
import HeaderCrumbs from "./header-breadcrumbs";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ModeToggle } from "./ModeToggle";
import LogoutButton from "./LogoutButton";

interface HeaderProps {
  href?: string;
  page: string;
  slug?: string;
  slug_page?: string;
}

const Header: React.FC<HeaderProps> = ({ href, page, slug, slug_page }) => {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <div className="flex items-center gap-2">
        <SidebarTrigger data-tour="sidebar-toggle" />
        <Separator orientation="vertical" className="h-6" />
        {/* Test Onboarding Tour Trigger */}
        {/* <button
          className="text-sm text-primary-500 hover:underline"
          onClick={() => window.dispatchEvent(new Event("startOnboarding"))}
        >
          Start Tour
        </button> */}
      </div>
      <div className="flex flex-1 items-center justify-between space-x-2">
        <HeaderCrumbs
          href={href}
          page={page}
          slug_page={slug_page}
          slug={slug}
        />
        {/* <ProfileMenuSettings /> */}
        <ModeToggle data-tour="mode-toggle" />
        <LogoutButton data-tour="logout-button" />
      </div>
    </header>
  );
};

export default Header;
