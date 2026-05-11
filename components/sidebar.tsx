"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Users, CalendarCheck, FileText, Settings, LayoutDashboard } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <div className={cn("flex h-full w-64 flex-col border-r border-slate-800 bg-[#11141B]", className)}>
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2 font-semibold text-lg text-white">
          <Image src="/logo.png" alt="Hindtech HRMS Logo" width={24} height={24} className="h-6 w-6 object-contain" referrerPolicy="no-referrer" />
          <span>Hindtech HRMS</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600/10 text-indigo-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 shrink-0",
                  isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                )}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 mt-auto">
        <div className="bg-[#1C2128] rounded-xl p-3 flex items-center gap-3">
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-semibold text-white truncate">Google Sheets Sync</p>
            <p className="text-xs text-slate-500 truncate">Configured via DB</p>
          </div>
        </div>
      </div>
    </div>
  )
}
