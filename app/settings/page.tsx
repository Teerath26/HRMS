"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

export default function SettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight text-white">Settings & Configuration</h2>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Backend Integration</CardTitle>
          <CardDescription>Configure your genuine Google Sheets Sync</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-sm">
          <p className="text-slate-400">
            Currently, the application is using a lightweight local memory abstraction (`/lib/db.ts`) perfectly mapped to the expected Google Sheets data structure. This is required so the preview works instantly in AI Studio without waiting for Google Cloud IAM setup.
          </p>

          <div>
            <h3 className="font-semibold text-lg text-white mb-2">How to attach your Google Sheet</h3>
            <ol className="list-decimal space-y-3 pl-5 text-slate-300">
              <li>
                <strong>Setup Google Cloud Service Account</strong>: Create a service account in Google Cloud Console, download the JSON keys containing <code className="text-indigo-400">client_email</code> and <code className="text-indigo-400">private_key</code>.
              </li>
              <li>
                <strong>Share Sheet</strong>: Create a new Google Sheet and share it as Editor to your newly created <code className="text-indigo-400">client_email</code>.
              </li>
              <li>
                <strong>Add Environment Variables</strong>: Un-comment and append the following in your deployment platform (or `.env` file):
                <pre className="bg-[#0A0C10] border border-slate-800 p-4 mt-2 rounded-xl overflow-x-auto text-xs text-indigo-300 shadow-inner">
GOOGLE_CLIENT_EMAIL="your-service-account@..."<br/>
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."<br/>
GOOGLE_SHEET_ID="1BxiMVs0XRYFgPNmih..."
                </pre>
              </li>
              <li>
                <strong>Update the DB Adapter</strong>: The route <code className="text-indigo-400">/lib/db.ts</code> has the defined interfaces. Replace the <code className="text-indigo-400">MockDatabase</code> class inside it with the <code className="text-indigo-400">google-auth-library</code> and <code className="text-indigo-400">googleapis</code> logic mapped to those same interfaces.
              </li>
            </ol>
          </div>
          
          <div className="bg-indigo-900/20 border border-indigo-500/20 p-4 rounded-xl text-indigo-300">
            <strong>Note on Bulk Action Handling:</strong> The abstraction layer is currently designed so that hitting &quot;Save & Lock&quot; acts as a single batch transaction. When implementing the Google Sheets integration, map <code className="text-indigo-400">saveAttendanceForDate()</code> to the <code className="text-indigo-400">sheets.spreadsheets.values.batchUpdate()</code> endpoint to prevent quota throttling on larger datasets.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
