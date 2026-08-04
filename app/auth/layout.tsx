import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: {
    default: `Auth | ${APP_NAME}`,
    template: `%s | ${APP_NAME}`,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
        <p className="mt-1 text-sm text-zinc-400">Your personal cloud, your data</p>
      </div>
      {children}
    </div>
  );
}
