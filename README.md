
  # Task Management Dashboard

  This is a code bundle for Task Management Dashboard. The original project is available at https://www.figma.com/design/jzmWcCH530bvjtX3YsM2DV/Task-Management-Dashboard.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

## Supabase Backend & Multi‑Tenant Architecture

  The application now connects to Supabase for authentication and data
  persistence. It is structured as a multi‑tenant SaaS platform where each
  company is isolated by `company_id` on every table. Row Level Security
  (RLS) should be enabled in Supabase to enforce access control so that
  users can only access rows matching their own `company_id`.

  ### Database schema (each table includes `company_id`)

  **companies**
  - `id` (uuid)
  - `name` (text)
  - `created_at` (timestamp)

  **users**
  - `id` (uuid, matches auth.user.id)
  - `company_id` (uuid) → companies.id
  - `full_name` (text)
  - `email` (text)
  - `role` (enum 'admin'|'member')
  - `created_at` (timestamp)

  **tasks**
  - `id` (uuid)
  - `company_id` (uuid)
  - `created_by` (uuid)
  - `assigned_to` (uuid)
  - `type` ('assigned'|'personal')
  - `title`, `description`, `priority`, `status`
  - `created_at` (timestamp)

  **meetings**
  - `id` (uuid)
  - `company_id` (uuid)
  - `created_by` (uuid)
  - `title`, `description`, `meeting_time`, `status`
  - `participants` (array of uuid)
  - `created_at` (timestamp)

  ### Authentication & signup

  - Only administrators may sign up; the signup form collects company name
    along with admin credentials. A new company row is created, then the
    Supabase auth user is registered, and finally the corresponding row in
    `users` is inserted with `role = 'admin'`.
  - Admin users can invite/create other users (admins or members) from the
    **Users** page. New users inherit the current admin's `company_id`.
  - There is no public signup link for regular users.

  ### Access rules

  - All Supabase client queries include `.eq('company_id', currentUser.company_id)`
    to restrict data to the current tenant.
  - Admins can view and manage all data for their company.
  - Members only see tasks assigned to them and meetings they participate in.
  - Route protection ensures unauthenticated users are redirected to login,
    and role mismatches send users back to the appropriate dashboard.

  This layered approach lets the UI remain unchanged while the backend
  enforces strict isolation between companies.

  ## Meetings Page

  Both admin and user dashboards include a **Meetings** section. Admins can
  schedule new meetings with participants, while users will only see meetings
  where they are listed as a participant. The data is stored in memory via the
  `TaskContext` provider.