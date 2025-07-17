import { DatabaseSync } from "node:sqlite";

import { DB_INIT_STATEMENT } from "./models.ts";

// const db = new DatabaseSync(":memory:");
const db = new DatabaseSync("database.db");

db.exec(DB_INIT_STATEMENT);
export default db;
