import {
    getEmployeesFromSheets,
    addEmployeeToSheets,
    updateEmployeeInSheets,
    getAttendanceForDateFromSheets,
    saveAttendanceForDateToSheets,
    getLockedDates,
    getAttendanceReportFromSheets,
} from './google-sheets';

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

// Map the DB interface to use Google Sheets natively
class SheetsDatabase {
  
  async getEmployees(): Promise<Employee[]> {
    return getEmployeesFromSheets();
  }

  async addEmployee(emp: Omit<Employee, "sNo">): Promise<void> {
    await addEmployeeToSheets(emp);
  }

  async updateEmployee(employeeId: string, data: Partial<Employee>): Promise<void> {
    await updateEmployeeInSheets(employeeId, data);
  }

  async getAttendanceForDate(dateStr: string): Promise<Record<string, AttendanceCode>> {
    return getAttendanceForDateFromSheets(dateStr);
  }

  async saveAttendanceForDate(dateStr: string, data: Record<string, AttendanceCode>): Promise<void> {
    await saveAttendanceForDateToSheets(dateStr, data);
  }

  async isDateLocked(dateStr: string): Promise<boolean> {
    const locked = await getLockedDates();
    return locked.has(dateStr);
  }

  async getAttendanceReport(monthStr: string): Promise<any> {
    return getAttendanceReportFromSheets(monthStr);
  }
}

// Ensure it's a singleton in development
const globalForDb = globalThis as unknown as { realDb: SheetsDatabase };
export const db = globalForDb.realDb || new SheetsDatabase();
if (process.env.NODE_ENV !== "production") globalForDb.realDb = db;
