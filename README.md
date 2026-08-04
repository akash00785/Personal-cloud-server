# Personal Cloud Server

A self-hosted personal cloud server for managing your files and data — built with Next.js 15, TypeScript, Tailwind CSS, and Supabase.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Database / Auth | Supabase |
| Deployment | Render |
| Package Manager | npm |

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/akash00785/Personal-cloud-server.git
cd Personal-cloud-server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
# Fill in your Supabase credentials in .env.local
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Folder Structure

```
├── app/                  # Next.js App Router pages & layouts
├── components/
│   ├── ui/               # Reusable UI primitives (Button, Card, Input…)
│   └── layout/           # Layout shells (Header, Footer, Sidebar…)
├── lib/
│   ├── supabase/         # Supabase client, server, and middleware helpers
│   ├── utils.ts          # Shared utility functions
│   └── constants.ts      # App-wide constants
├── hooks/                # Custom React hooks
├── services/             # Business-logic / API service layer
├── types/                # Global TypeScript types
├── styles/               # Additional CSS
├── public/               # Static assets
└── docs/                 # Project documentation
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

## Deployment (Render)

1. Create a new **Web Service** on Render.
2. Set **Build Command** to `npm install && npm run build`.
3. Set **Start Command** to `npm run start`.
4. Add all environment variables from `.env.example`.

## Contributing

See [PROJECT_RULES.md](./PROJECT_RULES.md) for coding standards and contribution guidelines.

## Status

See [PROJECT_STATUS.md](./PROJECT_STATUS.md) for current progress.
