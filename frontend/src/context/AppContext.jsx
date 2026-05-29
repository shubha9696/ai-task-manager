import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { API_URL } from '../config';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Toast Helper
  const addToast = useCallback((message, type = 'success') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch Current User Profile on Mount if token exists
  const fetchUser = useCallback(async (authToken) => {
    if (!authToken) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      } else {
        // Token might be invalid or expired
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        addToast(data.error || 'Session expired. Please log in again.', 'error');
      }
    } catch (err) {
      console.error(err);
      setError('Connection to server failed.');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (token) {
      fetchUser(token);
    }
  }, [token, fetchUser]);

  // Auth Operations
  const register = async (username, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        addToast('Welcome! Account created successfully.', 'success');
        return true;
      } else {
        setError(data.error);
        addToast(data.error || 'Registration failed.', 'error');
        return false;
      }
    } catch (err) {
      console.error(err);
      setError('Connection to server failed.');
      addToast('Cannot connect to server.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('token', data.token);
        setToken(data.token);
        setUser(data.user);
        addToast(`Welcome back, ${data.user.username}!`, 'success');
        return true;
      } else {
        setError(data.error);
        addToast(data.error || 'Login failed.', 'error');
        return false;
      }
    } catch (err) {
      console.error(err);
      setError('Connection to server failed.');
      addToast('Cannot connect to server.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setTasks([]);
    addToast('Logged out successfully.', 'info');
  };

  // Task Operations
  const fetchTasks = useCallback(async (filters = {}) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.stage) queryParams.append('stage', filters.stage);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.search) queryParams.append('search', filters.search);

      const queryString = queryParams.toString();
      const url = `${API_URL}/tasks${queryString ? `?${queryString}` : ''}`;

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTasks(data.tasks);
      } else {
        addToast(data.error || 'Failed to fetch tasks.', 'error');
      }
    } catch (err) {
      console.error(err);
      addToast('Error loading tasks from server.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [token, addToast]);

  const createTask = async (taskData) => {
    if (!token) return false;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      const data = await res.json();
      if (res.ok) {
        setTasks((prev) => [data.task, ...prev]);
        addToast('Task created successfully!', 'success');
        return true;
      } else {
        addToast(data.error || 'Failed to create task.', 'error');
        return false;
      }
    } catch (err) {
      console.error(err);
      addToast('Network error during task creation.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (taskId, taskData) => {
    if (!token) return false;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
      const data = await res.json();
      if (res.ok) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? data.task : t)));
        addToast('Task updated successfully!', 'success');
        return true;
      } else {
        addToast(data.error || 'Failed to update task.', 'error');
        return false;
      }
    } catch (err) {
      console.error(err);
      addToast('Network error during task update.', 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Quick move update function (e.g. for single-click moving columns)
  const updateTaskStage = async (taskId, newStage) => {
    if (!token) return false;
    // Optimistic UI Update for ultra-responsive feel
    const originalTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, stage: newStage, updated_at: new Date().toISOString() } : t))
    );

    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ stage: newStage })
      });
      const data = await res.json();
      if (!res.ok) {
        // Rollback state on failure
        setTasks(originalTasks);
        addToast(data.error || 'Failed to move task.', 'error');
        return false;
      }
      addToast(`Moved to ${newStage}`, 'success');
      return true;
    } catch (err) {
      console.error(err);
      setTasks(originalTasks);
      addToast('Network error moving task.', 'error');
      return false;
    }
  };

  const deleteTask = async (taskId) => {
    if (!token) return false;
    // Optimistic UI Update
    const originalTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    try {
      const res = await fetch(`${API_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        addToast('Task deleted.', 'info');
        return true;
      } else {
        setTasks(originalTasks);
        addToast(data.error || 'Failed to delete task.', 'error');
        return false;
      }
    } catch (err) {
      console.error(err);
      setTasks(originalTasks);
      addToast('Network error deleting task.', 'error');
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        tasks,
        isLoading,
        error,
        toasts,
        register,
        login,
        logout,
        fetchTasks,
        createTask,
        updateTask,
        updateTaskStage,
        deleteTask,
        addToast,
        removeToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
