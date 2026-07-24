import { DatabaseSync } from "node:sqlite";

const db = new DatabaseSync("data/leads.db");

const total = db
  .prepare("SELECT COUNT(*) AS total FROM leads")
  .get();

console.log(total);