import { DatabaseSync } from "node:sqlite";

import { DB_INIT_STATEMENT } from "./models.ts";

import config from "@/config.ts";

const db = new DatabaseSync(config.dbPath);

db.exec(DB_INIT_STATEMENT);
export default db;
