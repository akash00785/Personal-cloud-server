// =============================================================
// Auth service — server-side helpers for user/profile data.
// Always call from Server Components or Route Handlers.
// =============================================================

import { createClient } from '@/lib/supabase/server';
import type { UserProfile } from '@/types';

/**
 * Fetch the authenticated user's profile from the `profiles` table.
 * Returns null when there is no session or no matching profile row.
 */
export async function getProfile(): Promise<UserProfile | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, display_name, avatar_url, created_at')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id as string,
    email: data.email as string,
    displayName: (data.display_name as string | null) ?? null,
    avatarUrl: (data.avatar_url as string | null) ?? null,
    createdAt: data.created_at as string,
  };
}

/**
 * Ensure a profile row exists for the current user.
 * Safe to call multiple times (uses upsert).
 */
export async function ensureProfile(): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email,
      display_name: user.user_metadata?.display_name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id', ignoreDuplicates: true }
  );
}
