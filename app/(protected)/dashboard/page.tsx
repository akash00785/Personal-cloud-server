import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = { title: 'Dashboard' };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single();

  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'User';

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {displayName} 👋
        </h1>
        <p className="mt-1 text-zinc-400">
          This is your {APP_NAME} dashboard. Your files and data are safely stored here.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: 'Total Files', value: '—', description: 'Files stored in your cloud' },
          { label: 'Storage Used', value: '—', description: 'of your total storage' },
          { label: 'Last Activity', value: '—', description: 'Most recent file access' },
        ].map(({ label, value, description }) => (
          <Card key={label} variant="bordered">
            <CardHeader>
              <CardTitle>{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="mt-1 text-xs text-zinc-500">{description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-white">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { title: 'Upload Files', description: 'Add files to your cloud (coming soon)', icon: '📤' },
            { title: 'My Profile', description: 'Update your account settings', icon: '👤', href: '/profile' },
          ].map(({ title, description, icon }) => (
            <Card key={title} variant="bordered" className="flex items-start gap-4">
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-medium text-white">{title}</p>
                <p className="text-sm text-zinc-400">{description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
