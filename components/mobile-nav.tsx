"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, CalendarCheck, LayoutDashboard, Users, FileText, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Attendance", href: "/attendance", icon: CalendarCheck },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Reports", href: "/reports", icon: FileText },
  { name: "Settings", href: "/settings", icon: Settings },
]

export function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex h-14 items-center border-b border-slate-800 bg-[#0F1218] px-4 md:hidden shrink-0">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden text-slate-300 hover:text-white">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0 flex flex-col bg-[#11141B] border-r border-slate-800">
          <div className="flex h-16 items-center px-6 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2 font-semibold text-lg text-white">
              <Image src="/logo.png" alt="Hindtech HRMS Logo" width={24} height={24} className="h-6 w-6 object-contain" referrerPolicy="no-referrer" />
              <span>Hindtech HRMS</span>
            </div>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group flex items-center rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-600/10 text-indigo-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  )}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0",
                      isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="ml-4 font-semibold text-white">
        Hindtech HRMS
      </div>
    </div>
  )
}
