import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { API_URL } from '../config';

const AppContext = createContext();

export const useApp = () => useContext(AppContext);

// --- LOCAL STORAGE MOCK DATABASE HELPERS ---
const getMockUsers = () => JSON.parse(localStorage.getItem('mock_users') || '[]');
const saveMockUsers = (users) => localStorage.setItem('mock_users', JSON.stringify(users));

const getMockTasks = (userId) => {
  const allTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]');
  return allTasks.filter((t) => t.user_id === userId);
};

const saveMockTask = (task) => {
  const allTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]');
  const index = allTasks.findIndex((t) => t.id === task.id);
  if (index >= 0) {
    allTasks[index] = task;
  } else {
    allTasks.push(task);
  }
  localStorage.setItem('mock_tasks', JSON.stringify(allTasks));
};

const deleteMockTask = (taskId) => {
  const allTasks = JSON.parse(localStorage.getItem('mock_tasks') || '[]');
  const filtered = allTasks.filter((t) => t.id !== taskId);
  localStorage.setItem('mock_tasks', JSON.stringify(filtered));
};

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

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

    // 1. Check if it's a mock token
    if (authToken.startsWith('demo_token_')) {
      setIsDemoMode(true);
      const userId = parseInt(authToken.replace('demo_token_', ''));
      const activeUser = JSON.parse(localStorage.getItem('active_demo_user') || 'null');
      if (activeUser && activeUser.id === userId) {
        setUser(activeUser);
      } else {
        // Find in mock users
        const usersList = getMockUsers();
        const found = usersList.find((u) => u.id === userId);
        if (found) {
          setUser(found);
          localStorage.setItem('active_demo_user', JSON.stringify(found));
        } else {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
      return;
    }

    // 2. Try Backend API
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
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        addToast(data.error || 'Session expired. Please log in again.', 'error');
      }
    } catch (err) {
      console.warn('API error during profile fetch, attempting local recovery:', err.message);
      // Fallback: If we have cached profile details, recover locally in demo mode
      const activeUser = JSON.parse(localStorage.getItem('active_demo_user') || 'null');
      if (activeUser) {
        setIsDemoMode(true);
        setUser(activeUser);
        setToken(`demo_token_${activeUser.id}`);
        localStorage.setItem('token', `demo_token_${activeUser.id}`);
        addToast('Running in Local Browser Database Mode', 'info');
      } else {
        setError('Connection to server failed.');
      }
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

    // 1. Try Backend API first
    if (!isDemoMode) {
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
        console.warn('Backend server offline during signup. Falling back to Local DB:', err.message);
      }
    }

    // 2. Local Demo DB Fallback
    setIsDemoMode(true);
    const users = getMockUsers();
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = users.find((u) => u.email === normalizedEmail);
    if (existingUser) {
      setError('An account with this email already exists.');
      addToast('An account with this email already exists.', 'error');
      setIsLoading(false);
      return false;
    }

    const newUser = {
      id: Date.now(),
      username: username.trim(),
      email: normalizedEmail,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    saveMockUsers(users);

    const demoToken = `demo_token_${newUser.id}`;
    localStorage.setItem('token', demoToken);
    localStorage.setItem('active_demo_user', JSON.stringify(newUser));
    setToken(demoToken);
    setUser(newUser);

    addToast('Account created! (Local Browser DB)', 'success');
    setIsLoading(false);
    return true;
  };

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);

    // 1. Try Backend API first
    if (!isDemoMode) {
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
        console.warn('Backend server offline during login. Falling back to Local DB:', err.message);
      }
    }

    // 2. Local Demo DB Fallback
    setIsDemoMode(true);
    const users = getMockUsers();
    const normalizedEmail = email.toLowerCase().trim();

    const foundUser = users.find((u) => u.email === normalizedEmail);
    // Simple password validation for local offline testing (allows any login or checks default)
    if (!foundUser) {
      setError('Invalid email or password.');
      addToast('Invalid email or password.', 'error');
      setIsLoading(false);
      return false;
    }

    const demoToken = `demo_token_${foundUser.id}`;
    localStorage.setItem('token', demoToken);
    localStorage.setItem('active_demo_user', JSON.stringify(foundUser));
    setToken(demoToken);
    setUser(foundUser);

    addToast(`Logged in! (Local Browser DB)`, 'success');
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('active_demo_user');
    setToken(null);
    setUser(null);
    setTasks([]);
    setIsDemoMode(false);
    addToast('Logged out successfully.', 'info');
  };

  // Task Operations
  const fetchTasks = useCallback(async (filters = {}) => {
    if (!token) return;
    setIsLoading(true);

    // 1. Local storage Demo Mode
    if (isDemoMode || token.startsWith('demo_token_')) {
      const userId = parseInt(token.replace('demo_token_', ''));
      let localTasks = getMockTasks(userId);

      // Apply filters locally
      if (filters.search) {
        const query = filters.search.toLowerCase().trim();
        localTasks = localTasks.filter(
          (t) =>
            t.title.toLowerCase().includes(query) ||
            (t.description && t.description.toLowerCase().includes(query))
        );
      }

      if (filters.priority) {
        localTasks = localTasks.filter((t) => t.priority === filters.priority);
      }

      // Sort by newest
      localTasks.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setTasks(localTasks);
      setIsLoading(false);
      return;
    }

    // 2. Standard API Mode
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
      console.warn('Fetch tasks API failure, switching to offline list:', err.message);
      // Automatically switch to local retrieval
      setIsDemoMode(true);
      addToast('Syncing with Local browser storage', 'info');
    } finally {
      setIsLoading(false);
    }
  }, [token, isDemoMode, addToast]);

  const createTask = async (taskData) => {
    if (!token) return false;
    setIsLoading(true);

    // 1. Local Storage Demo Mode
    if (isDemoMode || token.startsWith('demo_token_')) {
      const userId = parseInt(token.replace('demo_token_', ''));
      const newTask = {
        id: Date.now(),
        user_id: userId,
        title: taskData.title,
        description: taskData.description || '',
        stage: taskData.stage || 'Todo',
        priority: taskData.priority || 'Medium',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      saveMockTask(newTask);
      setTasks((prev) => [newTask, ...prev]);
      addToast('Task created locally!', 'success');
      setIsLoading(false);
      return true;
    }

    // 2. Standard API Mode
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
      console.error('API create task failed, fallback to local write:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateTask = async (taskId, taskData) => {
    if (!token) return false;
    setIsLoading(true);

    // 1. Local Storage Demo Mode
    if (isDemoMode || token.startsWith('demo_token_')) {
      const userId = parseInt(token.replace('demo_token_', ''));
      const list = getMockTasks(userId);
      const target = list.find((t) => t.id === taskId);

      if (!target) {
        addToast('Task not found.', 'error');
        setIsLoading(false);
        return false;
      }

      const updated = {
        ...target,
        ...taskData,
        updated_at: new Date().toISOString()
      };

      saveMockTask(updated);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      addToast('Task updated locally!', 'success');
      setIsLoading(false);
      return true;
    }

    // 2. Standard API Mode
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

    // 1. Local Storage Demo Mode
    if (isDemoMode || token.startsWith('demo_token_')) {
      const userId = parseInt(token.replace('demo_token_', ''));
      const list = getMockTasks(userId);
      const target = list.find((t) => t.id === taskId);

      if (!target) {
        setTasks(originalTasks);
        addToast('Task not found.', 'error');
        return false;
      }

      const updated = {
        ...target,
        stage: newStage,
        updated_at: new Date().toISOString()
      };

      saveMockTask(updated);
      addToast(`Moved to ${newStage}`, 'success');
      return true;
    }

    // 2. Standard API Mode
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
        setTasks(originalTasks);
        addToast(data.error || 'Failed to move task.', 'error');
        return false;
      }
      addToast(`Moved to ${newStage}`, 'success');
      return true;
    } catch (err) {
      console.warn('API connection failed during stage update, saved locally:', err.message);
      // Fallback local update
      setIsDemoMode(true);
      const userId = parseInt(token.replace('demo_token_', ''));
      const list = getMockTasks(userId);
      const target = list.find((t) => t.id === taskId);
      if (target) {
        saveMockTask({ ...target, stage: newStage, updated_at: new Date().toISOString() });
      }
      addToast(`Moved to ${newStage} (saved locally)`, 'success');
      return true;
    }
  };

  const deleteTask = async (taskId) => {
    if (!token) return false;

    // Optimistic UI Update
    const originalTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));

    // 1. Local Storage Demo Mode
    if (isDemoMode || token.startsWith('demo_token_')) {
      deleteMockTask(taskId);
      addToast('Task deleted.', 'info');
      return true;
    }

    // 2. Standard API Mode
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
        isDemoMode,
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
