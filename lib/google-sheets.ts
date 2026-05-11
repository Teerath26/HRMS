import { google } from 'googleapis';
import type { Employee, AttendanceCode, AttendanceRecord } from './db';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const getAuthClient = () => {
  return new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: SCOPES,
  });
};

const getSheets = () => {
  const auth = getAuthClient();
  return google.sheets({ version: 'v4', auth });
};

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

export async function getEmployeesFromSheets(): Promise<Employee[]> {
  const sheets = getSheets();
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Employees!A2:G', 
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) return [];

  return rows.map((row) => ({
    sNo: parseInt(row[0] || "0", 10),
    employeeId: row[1] || "",
    employeeName: row[2] || "",
    department: row[3] || "",
    designation: row[4] || "",
    joiningDate: row[5] || "",
    status: (row[6] || "Active") as 'Active' | 'Inactive',
  }));
}

export async function addEmployeeToSheets(emp: Omit<Employee, "sNo">): Promise<void> {
  const sheets = getSheets();
  const currentEmployees = await getEmployeesFromSheets();
  const sNo = currentEmployees.length > 0 ? Math.max(...currentEmployees.map(e => e.sNo)) + 1 : 1;

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Employees!A:G',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        sNo,
        emp.employeeId,
        emp.employeeName,
        emp.department,
        emp.designation,
        emp.joiningDate,
        emp.status
      ]],
    },
  });
}

export async function updateEmployeeInSheets(employeeId: string, data: Partial<Employee>): Promise<void> {
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Employees!A2:G', 
    });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex(row => row[1] === employeeId);
    
    if (rowIndex === -1) return;
    
    const rowNumber = rowIndex + 2; 
    
    // Update individual cells or whole row? Whole row is easier
    const existing = rows[rowIndex];
    const updatedRow = [
      existing[0], // SNo
      employeeId,
      data.employeeName !== undefined ? data.employeeName : existing[2],
      data.department !== undefined ? data.department : existing[3],
      data.designation !== undefined ? data.designation : existing[4],
      data.joiningDate !== undefined ? data.joiningDate : existing[5],
      data.status !== undefined ? data.status : existing[6],
    ];
    
    await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `Employees!A${rowNumber}:G${rowNumber}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
            values: [updatedRow]
        }
    });
}

export async function getLockedDates(): Promise<Set<string>> {
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Locked_Dates!A2:B', 
    });
    const rows = response.data.values || [];
    const locked = new Set<string>();
    rows.forEach(row => {
        if (row[0]) locked.add(row[0]);
    });
    return locked;
}

export async function lockDateInSheets(dateStr: string): Promise<void> {
    const sheets = getSheets();
    await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Locked_Dates!A:B',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[dateStr, new Date().toISOString()]],
        },
      });
}

export async function getAttendanceForDateFromSheets(dateStr: string): Promise<Record<string, AttendanceCode>> {
    const sheets = getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: 'Attendance!A2:C', 
    });
    const rows = response.data.values || [];
    const result: Record<string, AttendanceCode> = {};
    
    rows.forEach(row => {
        if (row[0] === dateStr && row[1]) {
            result[row[1]] = row[2] as AttendanceCode;
        }
    });
    
    return result;
}

export async function saveAttendanceForDateToSheets(dateStr: string, data: Record<string, AttendanceCode>): Promise<void> {
    const isLocked = (await getLockedDates()).has(dateStr);
    if (isLocked) {
        throw new Error("Cannot save attendance. Date is locked.");
    }
    
    const sheets = getSheets();
    
    // First, fetch existing attendance to see if we need to update or insert
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: 'Attendance!A2:C', 
    });
    const rows = response.data.values || [];
    
    const existingMap = new Map<string, number>(); // employeeId -> rowNumber
    rows.forEach((row, idx) => {
        if (row[0] === dateStr && row[1]) {
            existingMap.set(row[1], idx + 2); 
        }
    });
    
    // Process updates and inserts
    const dataArray = Object.entries(data);
    const updates = [];
    const appends = [];
    
    for (const [employeeId, status] of dataArray) {
        if (existingMap.has(employeeId)) {
            const rowNo = existingMap.get(employeeId);
            updates.push({
                range: `Attendance!C${rowNo}`,
                values: [[status]]
            });
        } else {
            appends.push([dateStr, employeeId, status]);
        }
    }
    
    if (updates.length > 0) {
        // Can use batchUpdate for values
        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: {
                valueInputOption: 'USER_ENTERED',
                data: updates
            }
        });
    }
    
    if (appends.length > 0) {
        await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Attendance!A:C',
            valueInputOption: 'USER_ENTERED',
            requestBody: {
                values: appends
            }
        });
    }
    
    await lockDateInSheets(dateStr);
}

export async function getAttendanceReportFromSheets(monthStr: string): Promise<any> {
    const sheets = getSheets();
    const [employeesRes, attendanceRes] = await Promise.all([
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Employees!A2:G' }),
        sheets.spreadsheets.values.get({ spreadsheetId: SPREADSHEET_ID, range: 'Attendance!A2:C' })
    ]);
    
    const employeeRows = employeesRes.data.values || [];
    const attendanceRows = attendanceRes.data.values || [];
    
    // Group attendance by employee
    const monthAttendanceMap = new Map<string, Record<string, number>>(); 
    // employeeId -> counts
    
    // Initialize map for all employees
    employeeRows.forEach(row => {
        if (row[1]) {
            monthAttendanceMap.set(row[1], { P: 0, A: 0, L: 0, HD: 0, WO: 0, H: 0 });
        }
    });
    
    attendanceRows.forEach(row => {
        const date = row[0] || "";
        const empId = row[1] || "";
        const status = row[2] as AttendanceCode;
        
        if (date.startsWith(monthStr) && monthAttendanceMap.has(empId)) {
            const counts = monthAttendanceMap.get(empId)!;
            if (status && counts[status] !== undefined) {
                counts[status]++;
            }
        }
    });
    
    return employeeRows.map(row => {
        const empId = row[1] || "";
        const counts = monthAttendanceMap.get(empId) || { P: 0, A: 0, L: 0, HD: 0, WO: 0, H: 0 };
        return {
            employeeName: row[2] || "Unknown",
            employeeId: empId,
            department: row[3] || "Unknown",
            counts
        };
    }).filter(e => e.employeeId !== "");
}
