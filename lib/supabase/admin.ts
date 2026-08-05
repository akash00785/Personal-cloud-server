// =============================================================
// Supabase admin client — uses service role key to bypass RLS.
// ONLY import this in server-side route handlers or services.
// NEVER import in client components or expose to the browser.
// Requires: SUPABASE_SERVICE_ROLE_KEY environment variable.
// =============================================================

import { createClient } from '@supabase/supabase-js';

/**
 * Create an admin Supabase client that bypasses RLS.
 * Use only for operations that require elevated access,
 * such as resolving public share tokens.
 *
 * @throws {Error} if required environment variables are missing.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      'Missing Supabase admin credentials. ' +
        'Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local.'
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
