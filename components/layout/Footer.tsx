import { APP_NAME } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="border-t border-zinc-800/40 bg-zinc-950/40 py-4">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-zinc-600">
          &copy; {new Date().getFullYear()} {APP_NAME}
        </p>
        <p className="text-xs text-zinc-700">Secure cloud storage</p>
      </div>
    </footer>
  );
}
