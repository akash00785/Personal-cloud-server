import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { APP_NAME } from '@/lib/constants';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-20 text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-5xl font-bold tracking-tight text-white">{APP_NAME}</h1>
          <p className="max-w-lg text-lg text-zinc-400">
            Your self-hosted personal cloud — manage files, access from anywhere, stay in control.
          </p>
        </div>

        <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-3">
          {[
            { title: 'Secure', description: 'End-to-end ownership of your data.' },
            { title: 'Fast', description: 'Built on Next.js App Router for maximum speed.' },
            { title: 'Extensible', description: 'Modular architecture for easy feature additions.' },
          ].map(({ title, description }) => (
            <div
              key={title}
              className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 text-left"
            >
              <h2 className="mb-1 font-semibold text-white">{title}</h2>
              <p className="text-sm text-zinc-400">{description}</p>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
