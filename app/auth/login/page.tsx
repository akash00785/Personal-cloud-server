'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useActionState, Suspense } from 'react';
import { signIn } from '@/app/auth/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirectTo') ?? '/dashboard';
  const urlError = searchParams.get('error');

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string | null }, formData: FormData) => {
      const result = await signIn(formData);
      if (!result.error) {
        router.push(redirectTo);
      }
      return result;
    },
    { error: null }
  );

  const error = urlError ?? state.error;

  return (
    <Card variant="bordered" className="w-full max-w-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Sign in to your account</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Don&apos;t have an account?{' '}
          <Link href="/auth/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign up
          </Link>
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        {error && (
          <div className="rounded-md border border-red-800 bg-red-950/50 px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <Input
          id="email"
          name="email"
          type="email"
          label="Email address"
          placeholder="you@example.com"
          autoComplete="email"
          required
          disabled={isPending}
        />

        <div className="flex flex-col gap-1">
          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            disabled={isPending}
          />
        </div>

        <Button type="submit" variant="primary" size="lg" isLoading={isPending} className="mt-2 w-full">
          {isPending ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="h-64 w-full max-w-md animate-pulse rounded-xl bg-zinc-900" />}>
      <LoginForm />
    </Suspense>
  );
}
