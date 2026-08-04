import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  const displayName = profile?.display_name ?? '';
  const avatarUrl = profile?.avatar_url ?? '';
  const createdAt = profile?.created_at ?? user?.created_at ?? '';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-zinc-400">Manage your account information.</p>
      </div>

      {/* Account info (read-only) */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-3">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">Email</dt>
              <dd className="text-sm text-zinc-200">{user?.email}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Member Since
              </dt>
              <dd className="text-sm text-zinc-200">
                {createdAt ? formatDate(createdAt) : '—'}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                User ID
              </dt>
              <dd className="font-mono text-xs text-zinc-500">{user?.id}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Editable profile */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileForm displayName={displayName} avatarUrl={avatarUrl} />
        </CardContent>
      </Card>
    </div>
  );
}
