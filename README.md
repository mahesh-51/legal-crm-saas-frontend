# LegalCRM SaaS Frontend

A modern Legal CRM SaaS platform frontend built with Next.js, TypeScript, Tailwind CSS, ShadCN UI, and Formik.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** ShadCN UI (Base UI)
- **Forms:** Formik + Yup validation
- **HTTP Client:** Axios

## Features

### Public Website
- Home, Features, About, Screens pages
- Login and Signup with role selection (Firm, Lawyer, Client)

### Dashboard (Role-Based)
- **Firm Admin:** Dashboard, Clients, Matters, Hearings, Documents, Invoices, Users, Reports, Settings
- **Lawyer:** Dashboard, Clients, Matters, Hearings, Documents, Invoices, Reports, Settings
- **Client:** Dashboard, My Cases, Hearings, Documents, Invoices, Settings

### Reusable Components
- Layout: Sidebar, Navbar, PageHeader, DashboardCard
- Tables: DataTable with loading/empty states
- Modals: ModalWrapper, ConfirmDialog
- Forms: FormikInputField, FormikSelectField, FormikTextareaField, FormikDatePicker, FormikFileUpload
- UI: EmptyState, LoadingSkeleton, ProtectedRoute

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Mode

When the API backend is not available, the app runs in demo mode:
- **Login:** Any email/password will create a mock session
- **Signup:** Creates a mock user with the selected role

Set `NEXT_PUBLIC_API_URL` to connect to your backend API.

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public pages with navbar/footer
│   │   ├── page.tsx       # Home
│   │   ├── features/
│   │   ├── screens/
│   │   ├── about/
│   │   ├── login/
│   │   └── signup/
│   └── (dashboard)/       # Protected dashboard pages
│       ├── dashboard/
│       ├── clients/
│       ├── matters/
│       ├── hearings/
│       ├── documents/
│       ├── invoices/
│       ├── users/
│       ├── reports/
│       ├── settings/
│       ├── profile/
│       └── my-cases/      # Client-specific
├── components/
│   ├── layout/
│   ├── dashboard/
│   ├── tables/
│   ├── modals/
│   └── ui/
├── formik/                # Formik field components
├── hooks/
├── lib/api/               # Axios client and API modules
└── types/
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (default: http://localhost:3001/api) |
