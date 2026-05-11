"use client"

import { useEffect, useState } from "react"
import { FileText, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { toast } from "sonner"

interface ReportRow {
  employeeId: string;
  employeeName: string;
  department: string;
  counts: {
    P: number;
    A: number;
    L: number;
    HD: number;
    WO: number;
    H: number;
  };
}

export default function ReportsPage() {
  const [monthStr, setMonthStr] = useState(format(new Date(), "yyyy-MM"))
  const [reportData, setReportData] = useState<ReportRow[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchReport = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/reports?month=${monthStr}`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setReportData(data)
    } catch {
      toast.error("Failed to fetch report")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [monthStr])

  const handleExportCSV = () => {
    const headers = ["Emp ID", "Name", "Department", "Present", "Absent", "Leave", "Half Day", "Week Off"]
    const rows = reportData.map(r => [
      r.employeeId, 
      r.employeeName, 
      r.department, 
      r.counts.P, 
      r.counts.A, 
      r.counts.L, 
      r.counts.HD, 
      r.counts.WO
    ])
    
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n")
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `attendance_report_${monthStr}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">Monthly Reports</h2>
        <div className="flex items-center space-x-2">
          <Input 
            type="month" 
            value={monthStr} 
            onChange={e => setMonthStr(e.target.value)}
            className="w-40"
          />
          <Button onClick={handleExportCSV} variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Summary - {format(new Date(monthStr + "-01"), "MMMM yyyy")}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-slate-500">Loading report...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Emp ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-center text-emerald-400">Present (P)</TableHead>
                  <TableHead className="text-center text-red-400">Absent (A)</TableHead>
                  <TableHead className="text-center text-amber-400">Leave (L)</TableHead>
                  <TableHead className="text-center text-blue-400">Half Day (HD)</TableHead>
                  <TableHead className="text-center text-slate-400">Week Off (WO)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.map((row) => (
                  <TableRow key={row.employeeId}>
                    <TableCell className="font-medium">{row.employeeId}</TableCell>
                    <TableCell>{row.employeeName}</TableCell>
                    <TableCell>{row.department}</TableCell>
                    <TableCell className="text-center font-bold text-emerald-400">{row.counts.P}</TableCell>
                    <TableCell className="text-center font-bold text-red-400">{row.counts.A}</TableCell>
                    <TableCell className="text-center font-bold text-amber-400">{row.counts.L}</TableCell>
                    <TableCell className="text-center font-bold text-blue-400">{row.counts.HD}</TableCell>
                    <TableCell className="text-center font-bold text-slate-400">{row.counts.WO}</TableCell>
                  </TableRow>
                ))}
                {reportData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      No data found for this month
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
