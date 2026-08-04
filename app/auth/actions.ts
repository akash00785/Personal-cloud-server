'use server';

import { createClient } from '@/lib/supabase/server';
import {
  isValidEmail,
  isValidPassword,
  isValidDisplayName,
  isValidAvatarUrl,
} from '@/lib/validation';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

// ─── Sign Up ───────────────────────────────────────────────────────────────

export async function signUp(formData: FormData): Promise<{ error: string | null }> {
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';
  const rawDisplayName = (formData.get('displayName') as string | null)?.trim() ?? '';
  const displayName = rawDisplayName || null;

  // ── Server-side validation ──────────────────────────────────────────────
  if (!isValidEmail(email)) {
    return { error: 'Please enter a valid email address.' };
  }

  const pwCheck = isValidPassword(password);
  if (!pwCheck.valid) {
    return { error: pwCheck.message };
  }

  if (displayName) {
    const nameCheck = isValidDisplayName(displayName);
    if (!nameCheck.valid) {
      return { error: nameCheck.message };
    }
  }

  // ── Supabase sign-up ────────────────────────────────────────────────────
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Create profile row — also created by the DB trigger, but upsert is safe
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await supabase.from('profiles').upsert(
      {
        id: user.id,
        email: user.email,
        display_name: displayName,
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );
  }

  revalidatePath('/', 'layout');
  return { error: null };
}

// ─── Sign In ───────────────────────────────────────────────────────────────

export async function signIn(formData: FormData): Promise<{ error: string | null }> {
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';

  // ── Server-side validation ──────────────────────────────────────────────
  if (!isValidEmail(email)) {
    return { error: 'Please enter a valid email address.' };
  }
  if (!password) {
    return { error: 'Password is required.' };
  }

  // ── Supabase sign-in ────────────────────────────────────────────────────
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

// ─── Sign Out ──────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/auth/login');
}

// ─── Update Profile ────────────────────────────────────────────────────────

export async function updateProfile(formData: FormData): Promise<{ error: string | null }> {
  const supabase = await createClient();

  // ── Authorization: verify session server-side ────────────────────────────
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Not authenticated.' };
  }

  const displayName = (formData.get('displayName') as string | null)?.trim() ?? '';
  const avatarUrlRaw = (formData.get('avatarUrl') as string | null)?.trim() ?? '';

  // ── Server-side validation ──────────────────────────────────────────────
  if (displayName) {
    const nameCheck = isValidDisplayName(displayName);
    if (!nameCheck.valid) {
      return { error: nameCheck.message };
    }
  }

  const urlCheck = isValidAvatarUrl(avatarUrlRaw);
  if (!urlCheck.valid) {
    return { error: urlCheck.message };
  }

  const avatarUrl = avatarUrlRaw || null;

  // ── Database update (RLS enforces ownership) ────────────────────────────
  const { error } = await supabase
    .from('profiles')
    .update({
      display_name: displayName || null,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/profile');
  return { error: null };
}
