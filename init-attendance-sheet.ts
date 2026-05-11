import { google } from 'googleapis';
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
    const res = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheetTitles = res.data.sheets?.map(s => s.properties?.title) || [];
    if (!sheetTitles.includes("Attendance")) {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            requestBody: { requests: [{ addSheet: { properties: { title: "Attendance" } } }] }
        });
        await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: "Attendance!A1:C1",
            valueInputOption: "USER_ENTERED",
            requestBody: { values: [["Date", "EmployeeId", "Status"]] }
        });
        console.log("Attendance sheet created");
    }
}
run();
