"use client"

import { useEffect, useState } from "react"
import { Calendar as CalendarIcon, CheckSquare, Save, Lock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { Employee, AttendanceCode } from "@/lib/db"

export default function AttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [attendance, setAttendance] = useState<Record<string, AttendanceCode>>({})
  const [isLocked, setIsLocked] = useState(false)
  const [selectedEmps, setSelectedEmps] = useState<Set<string>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [deptFilter, setDeptFilter] = useState("All")
  
  const fetchEmployeesAndAttendance = async (targetDate: string) => {
    try {
      // Fetch Active Employees
      const empRes = await fetch("/api/employees")
      if (!empRes.ok) throw new Error()
      const allEmps: Employee[] = await empRes.json()
      const activeEmps = allEmps.filter(e => e.status === "Active")
      
      setEmployees(activeEmps)
      
      // Fetch Attendance for Date
      const attRes = await fetch(`/api/attendance?date=${targetDate}`)
      if (!attRes.ok) throw new Error()
      const { attendance: existingAtt, isLocked: locked } = await attRes.json()
      
      setIsLocked(locked)
      
      const newAtt: Record<string, AttendanceCode> = {}
      activeEmps.forEach(emp => {
        // Smart Default Workflow: Present by default if not set
        if (!locked && (!existingAtt[emp.employeeId] || existingAtt[emp.employeeId] === '')) {
          newAtt[emp.employeeId] = 'P'
        } else {
          newAtt[emp.employeeId] = existingAtt[emp.employeeId] || ''
        }
      })
      setAttendance(newAtt)
      setSelectedEmps(new Set())
    } catch (err: any) {
      toast.error("Failed to load attendance data: " + err.message)
    }
  }

  useEffect(() => {
    fetchEmployeesAndAttendance(date)
  }, [date])

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
  }

  const handleStatusChange = (empId: string, status: AttendanceCode) => {
    if (isLocked) return
    setAttendance(prev => ({ ...prev, [empId]: status }))
  }

  const handleSave = async () => {
    if (isLocked) {
      toast.error("This date is locked.")
      return
    }
    
    setIsSaving(true)
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, attendance })
      })
      
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to save")
      }
      
      toast.success("Attendance saved and locked.")
      setIsLocked(true)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setIsSaving(false)
    }
  }

  // Bulk Actions
  const toggleSelectAll = () => {
    if (selectedEmps.size === filteredEmployees.length) {
      setSelectedEmps(new Set())
    } else {
      setSelectedEmps(new Set(filteredEmployees.map(e => e.employeeId)))
    }
  }

  const toggleSelect = (empId: string) => {
    const newSet = new Set(selectedEmps)
    if (newSet.has(empId)) newSet.delete(empId)
    else newSet.add(empId)
    setSelectedEmps(newSet)
  }

  const applyBulkStatus = (status: AttendanceCode) => {
    if (isLocked || selectedEmps.size === 0) return
    
    const newAtt = { ...attendance }
    selectedEmps.forEach(id => {
      newAtt[id] = status
    })
    setAttendance(newAtt)
    toast.success(`Marked ${selectedEmps.size} employees as ${status}`)
    setSelectedEmps(new Set()) // clear selection
  }

  const departments = ["All", ...Array.from(new Set(employees.map(e => e.department)))]
  const filteredEmployees = employees.filter(e => deptFilter === "All" || e.department === deptFilter)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Daily Attendance</h2>
          <p className="text-slate-400">Only Active employees are shown in the list.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isLocked ? "destructive" : "default"} className="px-3 py-1 text-sm">
            {isLocked ? <><Lock className="mr-1 h-3 w-3" /> Locked</> : "Open"}
          </Badge>
          <div className="flex items-center space-x-2 border border-slate-700 rounded-lg px-3 py-1 bg-[#161B22]">
            <CalendarIcon className="h-4 w-4 text-slate-400" />
            <Input 
              type="date" 
              value={date} 
              onChange={handleDateChange}
              className="border-0 focus-visible:ring-0 shadow-none px-0 py-1 h-auto bg-transparent border-transparent"
            />
          </div>
          <Button onClick={handleSave} disabled={isLocked || isSaving}>
            {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save & Lock</>}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Attendance Sheet</CardTitle>
              <CardDescription>Default attendance is Present ('P'). Modify as needed.</CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-slate-300">Filter Dept:</span>
              <select 
                className="flex h-9 rounded-lg border border-slate-700 bg-[#0A0C10] text-white px-3 py-1 text-sm w-40 focus:border-indigo-500 focus:outline-none"
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
              >
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {!isLocked && (
            <div className="bg-[#1C2128]/50 p-3 rounded-lg border border-slate-800 flex items-center gap-3 mt-4">
              <span className="text-sm font-medium text-slate-300">Bulk Actions ({selectedEmps.size}):</span>
              <Button size="sm" variant="outline" onClick={() => applyBulkStatus('P')} disabled={selectedEmps.size === 0}>Present (P)</Button>
              <Button size="sm" variant="outline" onClick={() => applyBulkStatus('A')} disabled={selectedEmps.size === 0}>Absent (A)</Button>
              <Button size="sm" variant="outline" onClick={() => applyBulkStatus('L')} disabled={selectedEmps.size === 0}>Leave (L)</Button>
              <Button size="sm" variant="outline" onClick={() => applyBulkStatus('HD')} disabled={selectedEmps.size === 0}>Half Day (HD)</Button>
              <Button size="sm" variant="outline" onClick={() => applyBulkStatus('WO')} disabled={selectedEmps.size === 0}>Week Off (WO)</Button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">
                  <Checkbox 
                    checked={selectedEmps.size === filteredEmployees.length && filteredEmployees.length > 0}
                    onCheckedChange={toggleSelectAll}
                    disabled={isLocked || filteredEmployees.length === 0}
                  />
                </TableHead>
                <TableHead>Emp ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => {
                const checked = selectedEmps.has(emp.employeeId)
                const currentStatus = attendance[emp.employeeId]
                
                return (
                  <TableRow key={emp.employeeId} className={checked ? "bg-blue-50/50" : ""}>
                    <TableCell>
                      <Checkbox 
                        checked={checked} 
                        onCheckedChange={() => toggleSelect(emp.employeeId)}
                        disabled={isLocked}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{emp.employeeId}</TableCell>
                    <TableCell>{emp.employeeName}</TableCell>
                    <TableCell>{emp.department}</TableCell>
                    <TableCell>
                      {currentStatus === 'P' && <Badge className="bg-emerald-500 hover:bg-emerald-600">Present</Badge>}
                      {currentStatus === 'A' && <Badge className="bg-red-500 hover:bg-red-600">Absent</Badge>}
                      {currentStatus === 'L' && <Badge className="bg-amber-500 hover:bg-amber-600">Leave</Badge>}
                      {currentStatus === 'HD' && <Badge className="bg-blue-500 hover:bg-blue-600">Half Day</Badge>}
                      {currentStatus === 'WO' && <Badge className="bg-gray-500 hover:bg-gray-600">Week Off</Badge>}
                      {currentStatus === 'H' && <Badge className="bg-purple-500 hover:bg-purple-600">Holiday</Badge>}
                    </TableCell>
                    <TableCell>
                      <select 
                        className="flex h-8 rounded-lg border border-slate-700 bg-[#0A0C10] text-white px-2 text-sm w-[120px] disabled:opacity-50 focus:border-indigo-500 focus:outline-none"
                        value={currentStatus || ''}
                        onChange={(e) => handleStatusChange(emp.employeeId, e.target.value as AttendanceCode)}
                        disabled={isLocked}
                      >
                        <option value="P">Present (P)</option>
                        <option value="A">Absent (A)</option>
                        <option value="L">Leave (L)</option>
                        <option value="HD">Half Day (HD)</option>
                        <option value="WO">Week Off (WO)</option>
                        <option value="H">Holiday (H)</option>
                      </select>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                    No active employees found for this date.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
