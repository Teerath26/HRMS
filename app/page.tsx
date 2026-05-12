"use client"

import { useEffect, useState } from "react"
import { Users, UserCheck, UserX, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { format } from "date-fns"
import { toast } from "sonner"

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0,
    leave: 0,
    monthlyAttendance: 0
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const todayStr = format(new Date(), "yyyy-MM-dd")
        const monthStr = format(new Date(), "yyyy-MM")
        
        // Fetch employees
        const empRes = await fetch("/api/employees")
        if (!empRes.ok) throw new Error("Failed to fetch employees")
        const employees = await empRes.json()
        const total = employees.filter((e: any) => e.status === "Active").length

        // Fetch today's attendance
        const attRes = await fetch(`/api/attendance?date=${todayStr}`)
        if (!attRes.ok) throw new Error("Failed to fetch attendance")
        const { attendance } = await attRes.json()

        let present = 0
        let absent = 0
        let leave = 0

        Object.values(attendance).forEach((status) => {
          if (status === "P" || status === "HD") present++
          else if (status === "A") absent++
          else if (status === "L") leave++
        })

        setStats({
          total,
          present,
          absent,
          leave,
          monthlyAttendance: total > 0 ? Math.round((present / total) * 100) : 0
        })
      } catch (error: any) {
        toast.error("Failed to load dashboard statistics: " + error.message)
      }
    }
    loadStats()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Active Employees
            </CardTitle>
            <Users className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Present Today
            </CardTitle>
            <UserCheck className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{stats.present}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Absent Today
            </CardTitle>
            <UserX className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{stats.absent}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Leave Today
            </CardTitle>
            <Clock className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">{stats.leave}</div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8">
        <div className="rounded-2xl border border-slate-800 bg-[#161B22] p-8 mb-4 text-center">
          <h3 className="text-lg font-medium text-white mb-2">Welcome to Hindtech HRMS Attendance Management</h3>
          <p className="text-slate-400 max-w-lg mx-auto">
            Manage your daily attendance, monitor leaves, and review monthly reports. Active employees automatically appear in the daily attendance list.
          </p>
        </div>
      </div>
    </div>
  )
}
