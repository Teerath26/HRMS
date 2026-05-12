import { db } from "./lib/db";
async function run() {
  try {
    const emps = await db.getEmployees();
    console.log(emps);
  } catch (e) {
    console.error("error fetching emps", e);
  }
}
run();
