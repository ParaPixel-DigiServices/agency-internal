# ParaPixel Admin Dashboard

<div align="center">
  <img src="public/logo.svg" alt="ParaPixel Logo" width="120" style="filter: invert(1);">
  <p><strong>Internal Operations & Management Platform</strong></p>
</div>

## Overview

The ParaPixel Admin Dashboard is a comprehensive internal management system built by the ParaPixel DigiServices team to streamline business operations and data management. This application serves as the central hub for managing clients, projects, invoices, payments, and expenses across all service offerings including websites, SaaS applications, web apps, and mobile applications (Android/iOS).

## Features

### 📊 Dashboard Analytics

- Real-time financial overview with revenue, expenses, and profit metrics
- Monthly and yearly trend visualization with toggle
- Last 12 months data display
- Recent transaction tracking
- Invoice status monitoring
- Interactive charts with hover details

### 👥 Client Management

- Complete client database with contact information
- Client status tracking
- Project association and history
- Quick access to client details

### 📁 Project Management

- Project tracking with budget monitoring
- Payment status indicators (Paid, Partial, Unpaid)
- Client-project associations
- Deadline management
- Outstanding balance calculations

### 💳 Payment Processing

- Payment recording and tracking
- Multiple payment method support
- Client and project linkage with smart dependency
- Optimized project selection (filtered by client)
- Historical payment records
- Payment amount validation

### 💰 Expense Management

- Expense categorization and tracking
- Detailed notes with smart collapse (character + line count based)
- Icon-based expand/collapse controls for better UX
- Monthly cost analysis
- Total expense calculations
- Category-wise breakdowns
- Scrollable textarea to prevent dialog overflow

### 📄 Invoice System

- Professional invoice generation
- PDF export functionality powered by Browserless + Puppeteer
- High-quality PDF rendering with custom templates
- Status management (Draft, Sent, Paid, Overdue, Cancelled)
- Automatic overdue detection
- Invoice template customization
- Bulk export capabilities

### 🔐 Security

- Google OAuth 2.0 authentication
- Domain-restricted access (@parapixel.net only)
- Supabase authentication and session management
- Automatic session refresh and validation
- Protected routes and API endpoints with Bearer token authentication
- Session-based authorization on all API routes
- No password management required
- Service role key isolation (never exposed to client)

### 🎨 User Experience

- Consistent AlertDialog confirmations for destructive actions
- Smart data display with collapsible content
- Icon-based controls for intuitive interaction
- Accessible components with proper ARIA labels
- Responsive design optimized for all screen sizes
- Loading states and skeleton screens
- Real-time data updates

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Language:** TypeScript
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **UI Components:** Custom components with shadcn/ui
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Authentication:** Google OAuth 2.0 via Supabase Auth
- **Notifications:** Sonner (toast notifications)
- **PDF Export:** Puppeteer + Browserless (headless Chrome)

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account and project
- Google Cloud Console account (for OAuth setup)
- Browserless account (for Invoice PDF export) - [Get free account](https://www.browserless.io/)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/parapixel/admin-dashboard.git
cd admin-dashboard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Update the `.env` file with your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Browserless Configuration (for Invoice PDF Export)
# Get WebSocket endpoint from: https://www.browserless.io/
BROWSERLESS_URL=wss://production-sfo.browserless.io?token=your-browserless-token
```

**Note:** The `BROWSERLESS_URL` is required for Invoice PDF export functionality. Sign up at [browserless.io](https://www.browserless.io/) to get your WebSocket endpoint with API token.

### 4. Configure Google OAuth

**Important:** You must configure Google OAuth before the authentication will work.

Follow the detailed setup guide: [GOOGLE_AUTH_SETUP.md](GOOGLE_AUTH_SETUP.md)

Quick summary:

1. Create OAuth 2.0 credentials in Google Cloud Console
2. Configure Google provider in Supabase Dashboard
3. Add authorized redirect URIs for your domains

### 5

### 4. Database Setup

Create the following tables in your Supabase project:

#### Clients Table

```sql
create table clients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text,
  phone text,
  company text,
  status text,
  created_at timestamp with time zone default now()
);
```

#### Projects Table

```sql
create table projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  client_id uuid references clients(id),
  budget numeric,
  deadline date,
  status text,
  created_at timestamp with time zone default now()
);
```

#### Payments Table

```sql
create table payments (
  id uuid default gen_random_uuid() primary key,
  client_id uuid references clients(id),
  project_id uuid references projects(id),
  amount numeric not null,
  method text,
  payment_date date,
  created_at timestamp with time zone default now()
);
```

#### Expenses Table

```sql
create table expenses (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  notes text,
  amount numeric not null,
  category text,
  date date,
  created_at timestamp with time zone default now()
);
```

#### Invoices Table

```sql
create table invoices (
  id uuid default gen_random_uuid() primary key,
  invoice_number text not null unique,
  client_id uuid references clients(id),
  project_id uuid references projects(id),
  issue_date date,
  due_date date,
  amount numeric not null,
  status text,
  created_at timestamp with time zone default now()
);
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in with your @parapixel.net Google account.

## Project Structure

```
├── public/               # Static assets
│   ├── logo.svg         # ParaPixel logo
│   └── invoice/         # Invoice templates
├── src/
│   ├── app/             # Next.js app directory
│   │   ├── api/         # API routes
│   │   │   └── invoice/export/  # Invoice PDF export
│   │   ├── auth/        # OAuth callback handler
│   │   ├── clients/     # Client management pages
│   │   ├── dashboard/   # Dashboard page
│   │   ├── expenses/    # Expense management pages
│   │   ├── invoices/    # Invoice management pages
│   │   ├── login/       # Authentication page
│   │   ├── payments/    # Payment tracking pages
│   │   └── projects/    # Project management pages
│   ├── components/      # React components
│   │   ├── clients/     # Client-specific components
│   │   ├── dashboard/   # Dashboard components
│   │   ├── expenses/    # Expense management components
│   │   ├── invoice/     # Invoice components
│   │   ├── layouts/     # Layout components (Sidebar)
│   │   ├── payments/    # Payment components
│   │   ├── projects/    # Project components
│   │   └── ui/          # Reusable UI components
│   ├── lib/             # Utility functions
│   │   ├── auth.ts      # Authentication logic
│   │   ├── utils.ts     # General utilities
│   │   └── supabase/    # Supabase client
│   └── types/           # TypeScript type definitions
├── .env.example         # Environment variables template
├── GOOGLE_AUTH_SETUP.md # OAuth configuration guide
└── README.md            # This file
```

## Authentication

### First Time Setup

1. Navigate to `/login`
2. Click "Sign in with Google"
3. Authenticate with your @parapixel.net Google account
4. Access the dashboard and all management features

**Note:** Only Google accounts with @parapixel.net email addresses can access the system.

## Usage

### Managing Data

- **Clients:** Add, edit, and delete client information with comprehensive contact details
- **Projects:** Create projects, track budgets, and monitor payment status
- **Payments:** Record payments with client-project dependencies and multiple payment methods
- **Expenses:** Track business expenses with detailed notes and smart collapse features
- **Invoices:** Generate invoices, export to PDF, and manage payment status with automatic overdue detection

## Building for Production

```bash
npm run build
npm start
```

## Deployment

The application can be deployed on [Vercel](https://vercel.com), [Netlify](https://netlify.com), or any platform supporting Next.js applications.

### Vercel Deployment

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `BROWSERLESS_URL` (required for invoice PDF export)
4. Deploy

**Note:** The `vercel.json` configuration file is included to set a 60-second timeout for the invoice PDF export API route, as PDF generation may take longer than the default 10-second limit.

## Contributing

This is an internal ParaPixel project. For contributions, please contact the development team.

## Security Notice

⚠️ **Critical Security Measures:**

1. **Never commit the `.env` file** to version control. The `.gitignore` is configured to exclude it, but always verify before committing.

2. **Protect Service Role Key**: The `SUPABASE_SERVICE_ROLE_KEY` bypasses all Row Level Security policies. Never expose it to the client or in public repositories.

3. **Rotate Credentials Immediately if Exposed**: If any credentials are accidentally committed or exposed:
   - Regenerate all Supabase keys from the Supabase Dashboard
   - Generate a new Browserless token
   - Update environment variables in all deployment environments
   - Review git history to ensure complete removal

4. **API Security**: All API routes are protected with Bearer token authentication. Only authenticated users with @parapixel.net email addresses can access API endpoints.

5. **Use `.env.example` as Template**: Always reference `.env.example` for required environment variables and never add actual credentials to it.

## Support

For internal support and issues, contact the ParaPixel development team.

---

<div align="center">
  <p>Built with ❤️ by <strong>ParaPixel DigiServices</strong></p>
  <p>© 2026 ParaPixel DigiServices. All rights reserved.</p>
</div>
