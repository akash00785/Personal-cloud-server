'use client';

import { useTransition } from 'react';
import { signOut } from '@/app/auth/actions';
import { Button } from '@/components/ui/Button';

interface SignOutButtonProps {
  className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      isLoading={isPending}
      onClick={handleSignOut}
      className={className}
    >
      Sign out
    </Button>
  );
}
