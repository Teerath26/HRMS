export interface Employee {
  sNo: number;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  joiningDate: string;
  status: 'Active' | 'Inactive';
}

export type AttendanceCode = 'P' | 'A' | 'L' | 'HD' | 'WO' | 'H' | '';

export interface DailyAttendance {
  date: string;
  employeeId: string;
  status: AttendanceCode;
}

export interface AttendanceRecord {
  employeeId: string;
  attendance: Record<string, AttendanceCode>; // date (YYYY-MM-DD) -> code
}

// In-memory mock database for AI Studio Preview
class MockDatabase {
  employees: Employee[] = [];
  
  // month (YYYY-MM) -> array of employee attendance
  attendance: Record<string, AttendanceRecord[]> = {};
  
  // Set of locked dates (YYYY-MM-DD)
  lockedDates: Set<string> = new Set();
  
  constructor() {
    this.initializeMonth("2026-05");
  }

  private initializeMonth(monthStr: string) {
    if (!this.attendance[monthStr]) {
      this.attendance[monthStr] = this.employees.map(emp => ({
        employeeId: emp.employeeId,
        attendance: {}
      }));
    } else {
      // Add missing employees to this month
      this.employees.forEach(emp => {
        if (!this.attendance[monthStr].find(a => a.employeeId === emp.employeeId)) {
          this.attendance[monthStr].push({ employeeId: emp.employeeId, attendance: {} });
        }
      });
    }
  }

  async getEmployees(): Promise<Employee[]> {
    return this.employees;
  }

  async addEmployee(emp: Omit<Employee, "sNo">): Promise<void> {
    const sNo = this.employees.length > 0 ? Math.max(...this.employees.map(e => e.sNo)) + 1 : 1;
    this.employees.push({ ...emp, sNo });
  }

  async updateEmployee(employeeId: string, data: Partial<Employee>): Promise<void> {
    const idx = this.employees.findIndex(e => e.employeeId === employeeId);
    if (idx !== -1) {
      this.employees[idx] = { ...this.employees[idx], ...data };
    }
  }

  async getAttendanceForDate(dateStr: string): Promise<Record<string, AttendanceCode>> {
    const monthStr = dateStr.substring(0, 7);
    this.initializeMonth(monthStr);
    
    const result: Record<string, AttendanceCode> = {};
    for (const record of this.attendance[monthStr]) {
      result[record.employeeId] = record.attendance[dateStr] || '';
    }
    return result;
  }

  async saveAttendanceForDate(dateStr: string, data: Record<string, AttendanceCode>): Promise<void> {
    if (this.lockedDates.has(dateStr)) {
      throw new Error("Cannot save attendance. Date is locked.");
    }
    
    const monthStr = dateStr.substring(0, 7);
    this.initializeMonth(monthStr);
    
    for (const employeeId of Object.keys(data)) {
      let record = this.attendance[monthStr].find(a => a.employeeId === employeeId);
      if (!record) {
        record = { employeeId, attendance: {} };
        this.attendance[monthStr].push(record);
      }
      record.attendance[dateStr] = data[employeeId];
    }
    
    this.lockedDates.add(dateStr);
  }

  async isDateLocked(dateStr: string): Promise<boolean> {
    return this.lockedDates.has(dateStr);
  }

  async getAttendanceReport(monthStr: string): Promise<any> {
    this.initializeMonth(monthStr);
    return this.attendance[monthStr].map(record => {
      const emp = this.employees.find(e => e.employeeId === record.employeeId);
      const counts = { P: 0, A: 0, L: 0, HD: 0, WO: 0, H: 0 };
      
      Object.values(record.attendance).forEach(val => {
        if (val && counts[val] !== undefined) {
          counts[val]++;
        }
      });
      
      return {
        employeeName: emp?.employeeName || "Unknown",
        employeeId: record.employeeId,
        department: emp?.department || "Unknown",
        counts
      };
    });
  }
}

// Ensure it's a singleton in development
const globalForDb = globalThis as unknown as { mockDb: MockDatabase };
export const db = globalForDb.mockDb || new MockDatabase();
if (process.env.NODE_ENV !== "production") globalForDb.mockDb = db;
