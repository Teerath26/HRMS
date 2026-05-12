import { db } from "./lib/db";
import { format } from "date-fns";

async function run() {
  try {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    const attRes = await db.getAttendanceForDate(todayStr);
    console.log(attRes);
    const monthStr = format(new Date(), "yyyy-MM");
    const rep = await db.getAttendanceReport(monthStr);
    console.log(rep);
  } catch (e) {
    console.error("error fetching", e);
  }
}
run();
