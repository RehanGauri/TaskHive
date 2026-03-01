import { createContext, useContext, useState } from 'react';

const TaskContext = createContext();

const initialTasks = [
  {
    id: '1',
    title: 'Update landing page design',
    description: 'Redesign the landing page with modern UI components and improved user experience',
    type: 'assigned',
    createdBy: '1',
    assignedTo: '2',
    createdAt: '2026-02-20',
    priority: 'high',
    status: 'in-progress',
  },
  {
    id: '2',
    title: 'Fix authentication bug',
    description: 'Fix login issue where users cannot reset password with special characters',
    type: 'assigned',
    createdBy: '1',
    assignedTo: '2',
    createdAt: '2026-02-18',
    priority: 'high',
    status: 'pending',
  },
  {
    id: '3',
    title: 'Write API documentation',
    description: 'Complete API documentation for all endpoints with examples and error codes',
    type: 'assigned',
    createdBy: '1',
    assignedTo: '2',
    createdAt: '2026-02-19',
    priority: 'medium',
    status: 'in-progress',
  },
  {
    id: '4',
    title: 'Review pull requests',
    description: 'Review and approve pending pull requests from team members',
    type: 'personal',
    createdBy: '1',
    assignedTo: '1',
    createdAt: '2026-02-22',
    priority: 'low',
    status: 'completed',
  },
  {
    id: '5',
    title: 'Update dependencies',
    description: 'Update all npm packages to latest stable versions and test compatibility',
    type: 'personal',
    createdBy: '2',
    assignedTo: '2',
    createdAt: '2026-02-23',
    priority: 'low',
    status: 'pending',
  },
  {
    id: '6',
    title: 'Design new dashboard',
    description: 'Create a new dashboard layout with real-time analytics and charts',
    type: 'assigned',
    createdBy: '1',
    assignedTo: '2',
    createdAt: '2026-02-24',
    priority: 'medium',
    status: 'pending',
  },
  {
    id: '7',
    title: 'Implement user feedback feature',
    description: 'Add feedback widget and survey system for collecting user insights',
    type: 'assigned',
    createdBy: '1',
    assignedTo: '2',
    createdAt: '2026-02-25',
    priority: 'high',
    status: 'pending',
  },
  {
    id: '8',
    title: 'Optimize database queries',
    description: 'Improve query performance by adding indexes and refactoring slow queries',
    type: 'assigned',
    createdBy: '1',
    assignedTo: '2',
    createdAt: '2026-02-21',
    priority: 'medium',
    status: 'in-progress',
  },
];

const initialMeetings = [
  {
    id: 'm1',
    title: 'Sprint Planning',
    participants: ['1', '2'],
    created_at: '2026-02-25T10:00:00Z',
    meet_link: 'https://meet.example.com/abc123',
  },
  {
    id: 'm2',
    title: 'Design Review',
    participants: ['2'],
    created_at: '2026-02-26T14:00:00Z',
    meet_link: 'https://meet.example.com/xyz789',
  },
];

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [meetings, setMeetings] = useState(initialMeetings);

  const addTask = (task) => setTasks((prev) => [...prev, task]);
  const updateTask = (updated) =>
    setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  const deleteTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const addMeeting = (meeting) => setMeetings((prev) => [...prev, meeting]);
  const deleteMeeting = (id) =>
    setMeetings((prev) => prev.filter((m) => m.id !== id));

  return (
    <TaskContext.Provider
      value={{
        tasks,
        addTask,
        updateTask,
        deleteTask,
        meetings,
        addMeeting,
        deleteMeeting,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);
