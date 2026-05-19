import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as authSchema from "../../auth-schema";
import * as appSchema from "@/db/schema";

export const schema = {
  ...appSchema,
  ...authSchema,
};

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });

export type Database = typeof db;
