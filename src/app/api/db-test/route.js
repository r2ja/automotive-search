import { NextResponse } from "next/server";
import { Pool } from "pg";

function buildConnectionString() {
  const password = process.env.SUPABASE_PASSWORD;
  if (!password) throw new Error("SUPABASE_PASSWORD missing");
  // Supabase Transaction Pooler DSN with injected password
  // postgresql://postgres.tjdntoaeanaiandevdim:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres
  const encoded = encodeURIComponent(password);
  return `postgresql://postgres.tjdntoaeanaiandevdim:${encoded}@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres`;
}

let pool;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: buildConnectionString(),
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

export async function GET() {
  try {
    const client = await getPool().connect();
    try {
      const result = await client.query("SELECT NOW() AS now");
      const now = result?.rows?.[0]?.now ?? null;
      return NextResponse.json({ ok: true, now });
    } finally {
      client.release();
    }
  } catch (err) {
    const message = err?.message || "Connection failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}


