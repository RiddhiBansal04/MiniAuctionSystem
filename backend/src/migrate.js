
import { sync } from "./models/index.js";

async function run() {
  try {
    console.log("Running database migration...");
    await sync({ force: false }); 
    console.log(" Migration completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err);
    process.exit(1);
  }
}

run();
