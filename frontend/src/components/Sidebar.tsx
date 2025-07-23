"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Exams", href: "/exams", icon: DocumentTextIcon },
  { name: "Tasks", href: "/tasks", icon: ClipboardDocumentListIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
  { name: "Register", href: "/register", icon: UserPlusIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-[#EFFAFB] border-r border-[#A2E4F1]">
      <div className="flex h-16 items-center justify-center border-b border-[#A2E4F1]">
        <h1 className="text-xl font-bold text-[#040316]">Email Scoring</h1>
      </div>
      <nav className="flex-1 space-y-1 px-2 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${
                isActive ? "bg-[#9EC6FF] text-[#040316]" : "text-[#040316] hover:bg-[#9EC6FF] hover:bg-opacity-75"
              }`}
            >
              <item.icon
                className={`mr-3 h-6 w-6 flex-shrink-0 ${
                  isActive ? "text-[#040316]" : "text-[#040316] group-hover:text-[#040316]"
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

