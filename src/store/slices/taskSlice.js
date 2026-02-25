import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  tasks: [
    {
      id: '1',
      title: 'Update landing page design',
      description: 'Redesign the landing page with modern UI components and improved user experience',
      assignee: 'Sarah Johnson',
      dueDate: 'Feb 25, 2026',
      priority: 'high',
      status: 'in-progress',
    },
    {
      id: '2',
      title: 'Fix authentication bug',
      description: 'Fix login issue where users cannot reset password with special characters',
      assignee: 'Mike Chen',
      dueDate: 'Feb 23, 2026',
      priority: 'high',
      status: 'pending',
    },
    {
      id: '3',
      title: 'Write API documentation',
      description: 'Complete API documentation for all endpoints with examples and error codes',
      assignee: 'Emma Wilson',
      dueDate: 'Feb 28, 2026',
      priority: 'medium',
      status: 'in-progress',
    },
    {
      id: '4',
      title: 'Review pull requests',
      description: 'Review and approve pending pull requests from team members',
      assignee: 'David Lee',
      dueDate: 'Feb 22, 2026',
      priority: 'low',
      status: 'completed',
    },
    {
      id: '5',
      title: 'Update dependencies',
      description: 'Update all npm packages to latest stable versions and test compatibility',
      assignee: 'Alex Turner',
      dueDate: 'Mar 1, 2026',
      priority: 'low',
      status: 'pending',
    },
    {
      id: '6',
      title: 'Design new dashboard',
      description: 'Create a new dashboard layout with real-time analytics and charts',
      assignee: 'Lisa Brown',
      dueDate: 'Mar 5, 2026',
      priority: 'medium',
      status: 'pending',
    },
    {
      id: '7',
      title: 'Implement user feedback feature',
      description: 'Add feedback widget and survey system for collecting user insights',
      assignee: 'Sarah Johnson',
      dueDate: 'Mar 8, 2026',
      priority: 'high',
      status: 'pending',
    },
    {
      id: '8',
      title: 'Optimize database queries',
      description: 'Improve query performance by adding indexes and refactoring slow queries',
      assignee: 'Mike Chen',
      dueDate: 'Feb 26, 2026',
      priority: 'medium',
      status: 'in-progress',
    },
  ],
  selectedTask: null,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setSelectedTask: (state, action) => {
      state.selectedTask = action.payload;
    },
    addTask: (state, action) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action) => {
      const index = state.tasks.findIndex(task => task.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    deleteTask: (state, action) => {
      state.tasks = state.tasks.filter(task => task.id !== action.payload);
      if (state.selectedTask?.id === action.payload) {
        state.selectedTask = null;
      }
    },
    updateTaskStatus: (state, action) => {
      const task = state.tasks.find(task => task.id === action.payload.id);
      if (task) {
        task.status = action.payload.status;
      }
    },
  },
});

export const { setSelectedTask, addTask, updateTask, deleteTask, updateTaskStatus } = taskSlice.actions;
export default taskSlice.reducer;