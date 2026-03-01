
  # Task Management Dashboard

  This is a code bundle for Task Management Dashboard. The original project is available at https://www.figma.com/design/jzmWcCH530bvjtX3YsM2DV/Task-Management-Dashboard.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Local Auth & Mock Data

  This prototype uses simple in-memory state and React context for both
  authentication and task/meeting management. There is no backend service
  required at the moment — everything lives in the browser and is reset on
  reload.

  - Visit `/login` to select a role (Admin or User).
  - Admins can view all tasks, manage users, and schedule meetings.
  - Regular users see only their assigned tasks and meetings they are invited to.
  - The data is seeded with dummy tasks and meetings defined in the
    `TaskContext` provider.

  This setup makes it easy to prototype the UI before integrating a real
  authentication system or backend.

  ## Meetings Page

  Both admin and user dashboards include a **Meetings** section. Admins can
  schedule new meetings with participants, while users will only see meetings
  where they are listed as a participant. The data is stored in memory via the
  `TaskContext` provider.