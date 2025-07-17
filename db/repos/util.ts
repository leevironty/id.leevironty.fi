import db from "../client.ts"
import { ZodObject } from "zod";
import { getSessionUser } from "./session.ts";
import { getCookies } from "@std/http/cookie";


/**
 * Get the current time as an ISO datetime string.
 * 
 * @param offset_seconds the time offset in seconds to apply to the current time.
 */
export function now(offset_seconds?: number){
  return new Date(Date.now() + 1000 * (offset_seconds || 0)).toISOString()
};

export function listObjs<T extends ZodObject>(model: T, tablename: string) {
  return () => {
    const response = db.prepare(`SELECT * FROM ${tablename};`).all();
    return response.map(obj => model.parse(obj))
  }
}