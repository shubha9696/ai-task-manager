import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Loader2 } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, taskToEdit }) {
  const { createTask, updateTask, isLoading } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState('Todo');
  const [priority, setPriority] = useState('Medium');
  const [error, setError] = useState('');

  // Sync state if editing a task
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setStage(taskToEdit.stage || 'Todo');
      setPriority(taskToEdit.priority || 'Medium');
    } else {
      // Clear fields for new task creation
      setTitle('');
      setDescription('');
      setStage('Todo');
      setPriority('Medium');
    }
    setError('');
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title || title.trim().length === 0) {
      setError('Task title is required.');
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      stage,
      priority
    };

    let success;
    if (taskToEdit) {
      success = await updateTask(taskToEdit.id, payload);
    } else {
      success = await createTask(payload);
    }

    if (success) {
      onClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      id="task-modal-overlay"
    >
      <div
        className="modal-content glass-panel"
        onClick={(e) => e.stopPropagation()}
        id="task-modal-content"
      >
        <div className="modal-header">
          <h3 className="modal-title">
            {taskToEdit ? 'Edit Task Details' : 'Create New Task'}
          </h3>
          <button
            className="btn-modal-close"
            onClick={onClose}
            aria-label="Close dialog"
            id="btn-close-modal"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.6rem',
              color: '#f87171',
              fontSize: '0.85rem',
              marginBottom: '1rem',
              textAlign: 'center'
            }}
            id="modal-error-message"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} id="task-modal-form">
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="task-title">Title</label>
            <input
              type="text"
              id="task-title"
              className="form-control"
              style={{ paddingLeft: '1rem' }}
              placeholder="e.g. Design Landing Page"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label className="form-label" htmlFor="task-desc">Description (Optional)</label>
            <textarea
              id="task-desc"
              className="form-control"
              style={{ paddingLeft: '1rem', height: '100px', resize: 'none' }}
              placeholder="Provide a detailed description of the task details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="task-stage">Stage</label>
              <select
                id="task-stage"
                className="filter-select"
                style={{ width: '100%', paddingLeft: '1rem' }}
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                disabled={isLoading}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" htmlFor="task-priority">Priority</label>
              <select
                id="task-priority"
                className="filter-select"
                style={{ width: '100%', paddingLeft: '1rem' }}
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                disabled={isLoading}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
              id="btn-modal-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
              id="btn-modal-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
