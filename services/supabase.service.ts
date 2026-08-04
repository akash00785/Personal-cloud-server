// =============================================================
// Supabase service — thin wrapper for common DB operations.
// Import createClient from lib/supabase/client (browser) or
// lib/supabase/server (server) depending on context.
// =============================================================

export type { SupabaseClient } from '@supabase/supabase-js';

// Re-export auth service helpers for convenience
export { getProfile, ensureProfile } from '@/services/auth.service';
