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
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-6" />
      </div>
      <div className="flex flex-1 items-center justify-between space-x-2">
        <HeaderCrumbs
          href={href}
          page={page}
          slug_page={slug_page}
          slug={slug}
        />
        {/* <ProfileMenuSettings /> */}
        <ModeToggle />
        <LogoutButton />
      </div>
    </header>
  );
};

export default Header;
