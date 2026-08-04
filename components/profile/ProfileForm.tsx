'use client';

import { useActionState } from 'react';
import { updateProfile } from '@/app/auth/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface ProfileFormProps {
  displayName: string;
  avatarUrl: string;
}

export function ProfileForm({ displayName, avatarUrl }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string | null; success: boolean }, formData: FormData) => {
      const result = await updateProfile(formData);
      return { ...result, success: !result.error };
    },
    { error: null, success: false }
  );

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.error && (
        <div className="rounded-md border border-red-800 bg-red-950/50 px-4 py-3">
          <p className="text-sm text-red-400">{state.error}</p>
        </div>
      )}
      {state.success && (
        <div className="rounded-md border border-green-800 bg-green-950/50 px-4 py-3">
          <p className="text-sm text-green-400">Profile updated successfully.</p>
        </div>
      )}

      <Input
        id="displayName"
        name="displayName"
        type="text"
        label="Display name"
        defaultValue={displayName}
        placeholder="Your name"
        disabled={isPending}
      />

      <Input
        id="avatarUrl"
        name="avatarUrl"
        type="url"
        label="Avatar URL (optional)"
        defaultValue={avatarUrl}
        placeholder="https://example.com/avatar.png"
        disabled={isPending}
      />

      <div className="flex justify-end">
        <Button type="submit" variant="primary" isLoading={isPending}>
          {isPending ? 'Saving…' : 'Save changes'}
        </Button>
      </div>
    </form>
  );
}
