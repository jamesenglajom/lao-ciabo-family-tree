// Creates a Supabase auth user with a random password via the Admin API.
// This is the supported way to seed users — inserting rows into auth.users
// directly with SQL skips internal triggers/identity rows and can produce
// accounts that can't actually log in.
//
// Usage:
//   node --env-file=.env.local scripts/create-user.mjs <email>
//
// Prints the new user's id and a one-time generated password as JSON. Run
// the SQL migration's `profiles` insert afterwards using the printed id.
import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const [, , email] = process.argv;

if (!email) {
  console.error("Usage: node --env-file=.env.local scripts/create-user.mjs <email>");
  process.exit(1);
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.");
  process.exit(1);
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const password = crypto.randomBytes(12).toString("base64url");

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error(`Failed to create ${email}: ${error.message}`);
  process.exit(1);
}

console.log(JSON.stringify({ id: data.user.id, email: data.user.email, password }, null, 2));
