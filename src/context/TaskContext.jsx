import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

const TaskContext = createContext();

export const TaskProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [meetings, setMeetings] = useState([]);

  // fetch tasks whenever currentUser changes
  useEffect(() => {
    if (currentUser?.company_id) {
      loadTasks();
      loadMeetings();
    } else {
      setTasks([]);
      setMeetings([]);
    }
  }, [currentUser]);

  const loadTasks = async () => {
    let query = supabase.from('tasks').select('*').eq('company_id', currentUser.company_id);
    if (currentUser.role === 'user') {
      query = query.eq('assigned_to', currentUser.id);
    }
    const { data, error } = await query;
    if (error) {
      console.error('loadTasks error', error);
    } else {
      // convert snake_case from supabase to camelCase for our UI
      setTasks(
        data.map((t) => ({
          ...t,
          assignedTo: t.assigned_to,
          createdBy: t.created_by,
          createdAt: t.created_at,
        }))
      );
    }
  };

  const loadMeetings = async () => {
    const { data, error } = await supabase
      .from('meetings')
      .select('*')
      .eq('company_id', currentUser.company_id);
    if (error) {
      console.error('loadMeetings error', error);
    } else {
      setMeetings(
        data.map((m) => ({
          ...m,
          createdAt: m.created_at,
        }))
      );
    }
  };

  const addTask = async (task) => {
    // convert camelCase keys to snake_case for database
    const row = {
      company_id: currentUser.company_id,
      created_by: currentUser.id,
      assigned_to: task.assignedTo,
      type: task.type,
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      created_at: task.createdAt,
    };
    const { data, error } = await supabase.from('tasks').insert(row);
    if (error) return console.error(error);
    loadTasks();
    return data;
  };

  const updateTask = async (updated) => {
    const row = {
      assigned_to: updated.assignedTo,
      type: updated.type,
      title: updated.title,
      description: updated.description,
      priority: updated.priority,
      status: updated.status,
      // created_at shouldn't change
    };
    const { data, error } = await supabase
      .from('tasks')
      .update(row)
      .eq('id', updated.id)
      .eq('company_id', currentUser.company_id);
    if (error) return console.error(error);
    loadTasks();
    return data;
  };

  const deleteTask = async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('company_id', currentUser.company_id);
    if (error) return console.error(error);
    loadTasks();
  };

  const addMeeting = async (meeting) => {
    const row = {
      ...meeting,
      company_id: currentUser.company_id,
      created_by: currentUser.id,
      created_at: meeting.createdAt,
    };
    const { data, error } = await supabase.from('meetings').insert(row);
    if (error) return console.error(error);
    loadMeetings();
    return data;
  };

  const deleteMeeting = async (id) => {
    const { error } = await supabase
      .from('meetings')
      .delete()
      .eq('id', id)
      .eq('company_id', currentUser.company_id);
    if (error) return console.error(error);
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
