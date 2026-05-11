"use client"

import { useEffect, useState } from "react"
import { Users, Search, Plus, Edit2, Loader2, Upload } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import type { Employee } from "@/lib/db"

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [search, setSearch] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [bulkData, setBulkData] = useState("")
  
  // New Employee Form
  const [newEmployee, setNewEmployee] = useState({
    employeeId: "",
    employeeName: "",
    department: "BATCHING PLANT",
    designation: "",
    joiningDate: new Date().toISOString().split('T')[0],
    status: "Active" as const
  })

  // Edit Employee Form
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)

  const fetchEmployees = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/employees")
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setEmployees(data)
    } catch {
      toast.error("Error loading employees")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const filteredEmployees = employees.filter(e => 
    e.employeeName.toLowerCase().includes(search.toLowerCase()) ||
    e.employeeId.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  )

  const handleAddEmployee = async () => {
    if (!newEmployee.employeeId || !newEmployee.employeeName) {
      toast.error("Please fill required fields (Emp ID, Name)")
      return
    }
    try {
      setIsSaving(true)
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEmployee)
      })
      if (!res.ok) throw new Error("Failed to add")
      
      toast.success("Employee added successfully")
      setIsAddOpen(false)
      fetchEmployees()
      // Reset
      setNewEmployee({ ...newEmployee, employeeId: "", employeeName: "", designation: "" })
    } catch {
      toast.error("Failed to add employee")
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditEmployee = async () => {
    if (!editingEmployee || !editingEmployee.employeeId || !editingEmployee.employeeName) {
      toast.error("Please fill required fields (Emp ID, Name)")
      return
    }
    try {
      setIsSaving(true)
      const res = await fetch(`/api/employees/${editingEmployee.employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingEmployee)
      })
      if (!res.ok) throw new Error("Failed to update")
      
      toast.success("Employee updated successfully")
      setIsEditOpen(false)
      fetchEmployees()
    } catch {
      toast.error("Failed to edit employee")
    } finally {
      setIsSaving(false)
    }
  }

  const handleBulkImport = async () => {
    if (!bulkData.trim()) {
      toast.error("Please enter data");
      return;
    }
    const lines = bulkData.trim().split("\n");
    const employeesToImport = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Skip header row if someone pastes it
      if (i === 0 && line.toLowerCase().includes("id")) continue;

      const parts = line.split(",").map(p => p.trim());
      if (parts.length >= 2) {
        employeesToImport.push({
          employeeId: parts[0],
          employeeName: parts[1],
          department: parts[2] || "BATCHING PLANT",
          designation: parts[3] || "",
          joiningDate: parts[4] || new Date().toISOString().split('T')[0],
          status: "Active"
        });
      }
    }

    if (employeesToImport.length === 0) {
      toast.error("No valid data found");
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch("/api/employees/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(employeesToImport)
      });
      if (!res.ok) throw new Error("Failed to bulk import");
      
      toast.success(`Successfully imported ${employeesToImport.length} employees`);
      setIsBulkOpen(false);
      setBulkData("");
      fetchEmployees();
    } catch {
      toast.error("Failed to import employees");
    } finally {
      setIsSaving(false);
    }
  }

  const toggleStatus = async (emp: Employee) => {
    try {
      const newStatus = emp.status === "Active" ? "Inactive" : "Active"
      const res = await fetch(`/api/employees/${emp.employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      })
      if (!res.ok) throw new Error("Failed to update")
      
      toast.success(`Employee marked as ${newStatus}`)
      fetchEmployees()
    } catch {
      toast.error("Failed to update status")
    }
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">Employees Setup</h2>
        <div className="flex items-center space-x-2">
          <Dialog open={isBulkOpen} onOpenChange={setIsBulkOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-slate-300 border-slate-700 bg-transparent hover:bg-slate-800">
                <Upload className="mr-2 h-4 w-4" /> Bulk Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Bulk Import Employees</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">
                    Paste CSV data here. <br/>
                    Format: <span className="font-mono text-indigo-400">Emp ID, Name, Department, Designation, Joining Date</span>
                  </p>
                  <textarea 
                    className="w-full h-48 rounded-lg border border-slate-700 bg-[#0A0C10] p-3 text-sm text-white focus:border-indigo-500 focus:outline-none resize-none font-mono"
                    placeholder={`EMP001, John Doe, BATCHING PLANT, Operator, 2025-01-10\nEMP002, Jane Smith, INCHARGE, QA, 2025-02-15`}
                    value={bulkData}
                    onChange={e => setBulkData(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleBulkImport} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Import Employees
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employeeId" className="text-right">Emp ID</Label>
                  <Input 
                    id="employeeId" 
                    value={newEmployee.employeeId} 
                    onChange={e => setNewEmployee({...newEmployee, employeeId: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <Input 
                    id="name" 
                    value={newEmployee.employeeName} 
                    onChange={e => setNewEmployee({...newEmployee, employeeName: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="department" className="text-right">Department</Label>
                  <select 
                    id="department"
                    className="flex h-9 w-full rounded-lg border border-slate-700 bg-[#0A0C10] px-3 py-1 text-sm col-span-3 text-white focus:border-indigo-500 focus:outline-none"
                    value={newEmployee.department}
                    onChange={e => setNewEmployee({...newEmployee, department: e.target.value})}
                  >
                    <option value="BOOM PUMP">BOOM PUMP</option>
                    <option value="BATCHING PLANT">BATCHING PLANT</option>
                    <option value="INCHARGE">INCHARGE</option>
                    <option value="SCRAPER OP">SCRAPER OP</option>
                  </select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="designation" className="text-right">Designation</Label>
                  <Input 
                    id="designation" 
                    value={newEmployee.designation} 
                    onChange={e => setNewEmployee({...newEmployee, designation: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="joining" className="text-right">Joining Date</Label>
                  <Input 
                    id="joining" 
                    type="date"
                    value={newEmployee.joiningDate} 
                    onChange={e => setNewEmployee({...newEmployee, joiningDate: e.target.value})}
                    className="col-span-3" 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddEmployee} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Save Employee
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Employee Dialog */}
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Employee</DialogTitle>
              </DialogHeader>
              {editingEmployee && (
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-employeeId" className="text-right">Emp ID</Label>
                    <Input 
                      id="edit-employeeId" 
                      value={editingEmployee.employeeId} 
                      disabled
                      className="col-span-3 opacity-50" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-name" className="text-right">Name</Label>
                    <Input 
                      id="edit-name" 
                      value={editingEmployee.employeeName} 
                      onChange={e => setEditingEmployee({...editingEmployee, employeeName: e.target.value})}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-department" className="text-right">Department</Label>
                    <select 
                      id="edit-department"
                      className="flex h-9 w-full rounded-lg border border-slate-700 bg-[#0A0C10] px-3 py-1 text-sm col-span-3 text-white focus:border-indigo-500 focus:outline-none"
                      value={editingEmployee.department}
                      onChange={e => setEditingEmployee({...editingEmployee, department: e.target.value})}
                    >
                      <option value="BOOM PUMP">BOOM PUMP</option>
                      <option value="BATCHING PLANT">BATCHING PLANT</option>
                      <option value="INCHARGE">INCHARGE</option>
                      <option value="SCRAPER OP">SCRAPER OP</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-designation" className="text-right">Designation</Label>
                    <Input 
                      id="edit-designation" 
                      value={editingEmployee.designation} 
                      onChange={e => setEditingEmployee({...editingEmployee, designation: e.target.value})}
                      className="col-span-3" 
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-joining" className="text-right">Joining Date</Label>
                    <Input 
                      id="edit-joining" 
                      type="date"
                      value={editingEmployee.joiningDate} 
                      onChange={e => setEditingEmployee({...editingEmployee, joiningDate: e.target.value})}
                      className="col-span-3" 
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button onClick={handleEditEmployee} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Update Employee
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Master</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4 space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search employees..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Emp ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Joining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((emp) => (
                <TableRow key={emp.employeeId}>
                  <TableCell className="font-medium">{emp.employeeId}</TableCell>
                  <TableCell>{emp.employeeName}</TableCell>
                  <TableCell>{emp.department}</TableCell>
                  <TableCell>{emp.designation}</TableCell>
                  <TableCell>{emp.joiningDate}</TableCell>
                  <TableCell>
                    <Badge variant={emp.status === "Active" ? "default" : "secondary"}>
                      {emp.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => { setEditingEmployee(emp); setIsEditOpen(true); }}>
                      <Edit2 className="h-4 w-4 text-indigo-400" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toggleStatus(emp)}>
                      {emp.status === "Active" ? "Mark Inactive" : "Mark Active"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && filteredEmployees.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-slate-500">
                  No employees found
                </TableCell>
              </TableRow>
            )}
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-indigo-500" />
                  <p className="text-slate-400 mt-2 text-sm">Loading employees...</p>
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
