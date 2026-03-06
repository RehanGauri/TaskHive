import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const currentUserRef = useRef(currentUser);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.id) {
      setTasks([]);
      setMeetings([]);
      setNotifications([]);
      return;
    }

    loadTasks();
    loadMeetings();
    loadNotifications();

    // ✅ Unique channel names per user to avoid conflicts across tabs
    const taskChannel = `tasks-${currentUser.company_id}-${currentUser.id}`;
    const meetingChannel = `meetings-${currentUser.company_id}-${currentUser.id}`;

    const taskSub = supabase
      .channel(taskChannel)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `company_id=eq.${currentUser.company_id}`,
      }, (payload) => {
        loadTasks();
        // ✅ Show notification when a task is assigned to current user
        if (
          payload.eventType === 'INSERT' &&
          payload.new?.assigned_to === currentUserRef.current?.id
        ) {
          setNotifications((prev) => [
            {
              id: payload.new.id,
              message: `New task assigned: "${payload.new.title}"`,
              time: new Date().toISOString(),
              read: false,
            },
            ...prev,
          ]);
        }
      })
      .subscribe();

    const meetingSub = supabase
      .channel(meetingChannel)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'meetings',
        filter: `company_id=eq.${currentUser.company_id}`,
      }, (payload) => {
        loadMeetings();
        // ✅ Notify user when added to a meeting
        if (
          payload.eventType === 'INSERT' &&
          payload.new?.participants?.includes(currentUserRef.current?.id)
        ) {
          setNotifications((prev) => [
            {
              id: `meet-${payload.new.id}`,
              message: `You were added to meeting: "${payload.new.title}"`,
              time: new Date().toISOString(),
              read: false,
            },
            ...prev,
          ]);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(taskSub);
      supabase.removeChannel(meetingSub);
    };
  }, [currentUser?.id]);

  const loadTasks = async () => {
    const user = currentUserRef.current;
    if (!user) return;
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('company_id', user.company_id);
    if (error) { console.error('loadTasks error', error); return; }
    setTasks(data.map((t) => ({
      ...t,
      assignedTo: t.assigned_to,
      createdBy: t.created_by,
      createdAt: t.created_at,
    })));
  };

  const loadMeetings = async () => {
    const user = currentUserRef.current;
    if (!user) return;
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('company_id', user.company_id);
    if (error) { console.error('loadMeetings error', error); return; }
    setMeetings(data.map((m) => ({ ...m, createdAt: m.created_at })));
  };

  const loadNotifications = async () => {
    // Notifications are in-memory only (real-time from this session)
    // Could be persisted to DB later
    setNotifications([]);
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => setNotifications([]);

  const addTask = async (task) => {
    const row = {
      company_id: currentUser.company_id,
      created_by: currentUser.id,
      assigned_to: task.assignedTo,
      type: task.type,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
    };
    const { error } = await supabase.from('tasks').insert(row);
    if (error) { console.error(error); return; }
  };

  const updateTask = async (updated) => {
    const row = {
      assigned_to: updated.assignedTo,
      type: updated.type,
      title: updated.title,
      description: updated.description,
      priority: updated.priority,
      status: updated.status,
    };
    const { error } = await supabase
      .from('tasks').update(row)
      .eq('id', updated.id)
      .eq('company_id', currentUser.company_id);
    if (error) { console.error(error); return; }
  };

  const deleteTask = async (id) => {
    const { error } = await supabase
      .from('tasks').delete()
      .eq('id', id)
      .eq('company_id', currentUser.company_id);
    if (error) { console.error(error); return; }
  };

  const addMeeting = async (meeting) => {
    const row = {
      title: meeting.title,
      participants: meeting.participants,
      meet_link: meeting.meet_link || '#',
      company_id: currentUser.company_id,
      created_by: currentUser.id,
    };
    const { error } = await supabase.from('meetings').insert(row);
    if (error) { console.error(error); return; }
  };

  const deleteMeeting = async (id) => {
    const { error } = await supabase
      .from('meetings').delete()
      .eq('id', id)
      .eq('company_id', currentUser.company_id);
    if (error) { console.error(error); return; }
  };

  return (
    <TaskContext.Provider value={{
      tasks, addTask, updateTask, deleteTask,
      meetings, addMeeting, deleteMeeting,
      notifications, markAllRead, clearNotifications,
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => useContext(TaskContext);