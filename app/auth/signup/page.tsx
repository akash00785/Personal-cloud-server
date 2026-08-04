'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useActionState, Suspense } from 'react';
import { signUp } from '@/app/auth/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

function SignUpForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string | null; success: boolean }, formData: FormData) => {
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;

      if (password !== confirmPassword) {
        return { error: 'Passwords do not match', success: false };
      }
      if (password.length < 8) {
        return { error: 'Password must be at least 8 characters', success: false };
      }

      const result = await signUp(formData);
      if (!result.error) {
        router.push('/dashboard');
      }
      return { ...result, success: !result.error };
    },
    { error: null, success: false }
  );

  return (
    <Card variant="bordered" className="w-full max-w-md">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Create your account</h2>
        <p className="mt-1 text-sm text-zinc-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      {state.success ? (
        <div className="rounded-md border border-green-800 bg-green-950/50 px-4 py-3">
          <p className="text-sm text-green-400">
            Account created! Check your email to confirm your address, then sign in.
          </p>
          <Link
            href="/auth/login"
            className="mt-2 inline-block text-sm font-medium text-blue-400 hover:text-blue-300"
          >
            Go to login →
          </Link>
        </div>
      ) : (
        <form action={formAction} className="flex flex-col gap-4">
          {state.error && (
            <div className="rounded-md border border-red-800 bg-red-950/50 px-4 py-3">
              <p className="text-sm text-red-400">{state.error}</p>
            </div>
          )}

          <Input
            id="displayName"
            name="displayName"
            type="text"
            label="Display name"
            placeholder="Your name"
            autoComplete="name"
            disabled={isPending}
          />

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

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            required
            disabled={isPending}
          />

          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            label="Confirm password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            required
            disabled={isPending}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isPending}
            className="mt-2 w-full"
          >
            {isPending ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="h-96 w-full max-w-md animate-pulse rounded-xl bg-zinc-900" />}>
      <SignUpForm />
    </Suspense>
  );
}
