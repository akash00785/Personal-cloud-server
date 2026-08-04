import { APP_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="w-full border-t border-zinc-800 bg-zinc-950 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm text-zinc-500">
          &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
