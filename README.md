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
- Monthly and yearly trend visualization
- Recent transaction tracking
- Invoice status monitoring

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
- Client and project linkage
- Historical payment records

### 💰 Expense Management

- Expense categorization and tracking
- Monthly cost analysis
- Total expense calculations
- Category-wise breakdowns

### 📄 Invoice System

- Professional invoice generation
- PDF export functionality
- Status management (Draft, Sent, Paid, Overdue, Cancelled)
- Automatic overdue detection
- Invoice template customization

### 🔐 Security

- Secure authentication system
- Environment-based secret management
- Session token implementation
- Protected routes and API endpoints

## Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) with App Router
- **Language:** TypeScript
- **Database:** [Supabase](https://supabase.com/) (PostgreSQL)
- **UI Components:** Custom components with shadcn/ui
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Authentication:** Custom auth with server-side validation

## Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Supabase account and project

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

# Authentication
AUTH_SECRET=your-secure-password
```

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
  description text,
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
  total numeric not null,
  status text,
  items jsonb,
  created_at timestamp with time zone default now()
);
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and log in with your configured `AUTH_SECRET`.

## Project Structure

```
├── public/               # Static assets
│   ├── logo.svg         # ParaPixel logo
│   └── invoice/         # Invoice templates
├── src/
│   ├── app/             # Next.js app directory
│   │   ├── api/         # API routes
│   │   ├── clients/     # Client management pages
│   │   ├── dashboard/   # Dashboard page
│   │   ├── expenses/    # Expense management pages
│   │   ├── invoices/    # Invoice management pages
│   │   ├── login/       # Authentication page
│   │   ├── payments/    # Payment tracking pages
│   │   └── projects/    # Project management pages
│   ├── components/      # React components
│   │   ├── layouts/     # Layout components
│   │   └── ui/          # UI components
│   ├── lib/             # Utility functions
│   │   ├── auth.ts      # Authentication logic
│   │   └── supabase/    # Supabase client
│   └── types/           # TypeScript type definitions
├── .env.example         # Environment variables template
└── README.md            # This file
```

## Usage

### Accessing the Dashboard

1. Navigate to `/login`
2. Enter your configured `AUTH_SECRET`
3. Access the dashboard and all management features

### Managing Data

- **Clients:** Add, edit, and delete client information
- **Projects:** Create projects, track budgets, and monitor payment status
- **Payments:** Record payments and associate them with clients/projects
- **Expenses:** Track business expenses by category
- **Invoices:** Generate invoices, export to PDF, and manage payment status

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
3. Configure environment variables in Vercel dashboard
4. Deploy

## Contributing

This is an internal ParaPixel project. For contributions, please contact the development team.

## Security Notice

⚠️ **Important:** Never commit the `.env` file to version control. Always use `.env.example` for reference and keep sensitive credentials secure.

## Support

For internal support and issues, contact the ParaPixel development team.

---

<div align="center">
  <p>Built with ❤️ by <strong>ParaPixel DigiServices</strong></p>
  <p>© 2026 ParaPixel DigiServices. All rights reserved.</p>
</div>
