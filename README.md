# Kaspi Seller Assistant - Frontend

A modern, fast, and beautiful web dashboard for Kaspi.kz marketplace sellers. Built with Next.js 14, TypeScript, and TailwindCSS.

## Features

- **Dashboard** - Overview of products, reviews, and inventory stats
- **Products Management** - View all products, filter by stock status, enable/disable price dumping
- **Reviews** - AI-powered review responses, edit and copy replies
- **Settings** - Manage API keys, automation preferences, and language settings
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Dark Mode Ready** - Supports system dark mode preference

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Running backend API (see [seller-assistant](../seller-assistant))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd seller-assistant-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Update API URL in .env.local if needed
# NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login)
│   ├── (dashboard)/       # Dashboard pages
│   │   ├── dashboard/     # Main dashboard
│   │   ├── products/      # Products management
│   │   ├── reviews/       # Reviews with AI replies
│   │   └── settings/      # User settings
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home (redirects)
├── components/
│   ├── layout/            # Layout components (sidebar, header)
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   ├── store.ts          # Zustand stores
│   └── utils.ts          # Helper functions
└── types/                 # TypeScript types
```

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Login with Telegram credentials |
| `/dashboard` | Main dashboard with stats and overview |
| `/products` | Products list with filtering and dumping controls |
| `/reviews` | Reviews list with AI reply generation |
| `/settings` | Account and automation settings |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080/api/v1` |

## Design Principles

This frontend follows modern SaaS design patterns:

- **Clean & Minimal** - Focus on content, no clutter
- **Fast** - Optimized for performance with Next.js
- **Responsive** - Mobile-first design approach
- **Accessible** - Proper ARIA labels and keyboard navigation
- **Consistent** - Unified design system with reusable components

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run ESLint
```

## License

MIT
