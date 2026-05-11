import { google } from 'googleapis';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config({path: '.env.local'});

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });
const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

async function run() {
  try {
    const res = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID
    });
    const sheetTitles = res.data.sheets?.map(s => s.properties?.title) || [];
    
    const requests = [];
    if (!sheetTitles.includes("Employees")) {
      requests.push({
        addSheet: { properties: { title: "Employees" } }
      });
    }
    if (!sheetTitles.includes("Locked_Dates")) {
        requests.push({
          addSheet: { properties: { title: "Locked_Dates" } }
        });
      }

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId: SPREADSHEET_ID,
        requestBody: { requests }
      });
      console.log("Created missing sheets!");
      
      // Initialize Employees header
      if (!sheetTitles.includes("Employees")) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: "Employees!A1:G1",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [["SNo", "EmployeeId", "EmployeeName", "Department", "Designation", "JoiningDate", "Status"]]
          }
        });
      }
      
      // Initialize Locked_Dates header
      if (!sheetTitles.includes("Locked_Dates")) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: "Locked_Dates!A1:B1",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [["Date", "LockedBy"]]
          }
        });
      }
    } else {
      console.log("Sheets already exist.");
    }
  } catch(e) {
    console.error(e);
  }
}
run();
