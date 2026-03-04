import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);

  // only reload when the user ID changes (not every render)
  useEffect(() => {
    if (currentUser?.id) {
      loadTasks();
      loadMeetings();
    } else {
      setTasks([]);
      setMeetings([]);
    }
  }, [currentUser?.id]);

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('company_id', currentUser.company_id);
    if (error) {
      console.error('loadTasks error', error);
      return;
    }
    setTasks(
      data.map((t) => ({
        ...t,
        assignedTo: t.assigned_to,
        createdBy: t.created_by,
        createdAt: t.created_at,
      }))
    );
  };

  const loadMeetings = async () => {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('company_id', currentUser.company_id);
    if (error) {
      console.error('loadMeetings error', error);
      return;
    }
    setMeetings(
      data.map((m) => ({
        ...m,
        createdAt: m.created_at,
      }))
    );
  };

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
    loadTasks();
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
      .from('tasks')
      .update(row)
      .eq('id', updated.id)
      .eq('company_id', currentUser.company_id);
    if (error) { console.error(error); return; }
    loadTasks();
  };

  const deleteTask = async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('company_id', currentUser.company_id);
    if (error) { console.error(error); return; }
    loadTasks();
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
    loadMeetings();
  };

  const deleteMeeting = async (id) => {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)
      .eq('company_id', currentUser.company_id);
    if (error) { console.error(error); return; }
    loadMeetings();
  };

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