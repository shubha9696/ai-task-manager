import React from 'react';
import { useApp } from '../context/AppContext';
import { ChevronLeft, ChevronRight, Edit2, Trash2, Calendar } from 'lucide-react';

export default function TaskCard({ task, onEdit }) {
  const { updateTaskStage, deleteTask } = useApp();

  const handleMoveLeft = () => {
    if (task.stage === 'In Progress') {
      updateTaskStage(task.id, 'Todo');
    } else if (task.stage === 'Done') {
      updateTaskStage(task.id, 'In Progress');
    }
  };

  const handleMoveRight = () => {
    if (task.stage === 'Todo') {
      updateTaskStage(task.id, 'In Progress');
    } else if (task.stage === 'In Progress') {
      updateTaskStage(task.id, 'Done');
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${task.title}"?`)) {
      deleteTask(task.id);
    }
  };

  // Drag and drop event handlers
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', task.id.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div
      className="task-card glass-panel"
      draggable
      onDragStart={handleDragStart}
      id={`task-card-${task.id}`}
    >
      <div className={`task-card-glow-line ${task.stage.toLowerCase().replace(' ', '')}`}></div>
      
      <div className="task-card-header">
        <h4 className="task-card-title">{task.title}</h4>
      </div>
      
      {task.description && (
        <p className="task-card-desc">{task.description}</p>
      )}

      <div className="task-card-footer">
        <span className={`priority-badge ${task.priority.toLowerCase()}`}>
          {task.priority}
        </span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div className="task-card-actions">
            {task.stage !== 'Todo' && (
              <button
                className="btn-card-action move"
                onClick={handleMoveLeft}
                title="Move to previous stage"
                aria-label="Move left"
                id={`btn-move-left-${task.id}`}
              >
                <ChevronLeft size={16} />
              </button>
            )}

            <button
              className="btn-card-action"
              onClick={() => onEdit(task)}
              title="Edit details"
              aria-label="Edit task"
              id={`btn-edit-task-${task.id}`}
            >
              <Edit2 size={14} />
            </button>

            <button
              className="btn-card-action delete"
              onClick={handleDelete}
              title="Delete task"
              aria-label="Delete task"
              id={`btn-delete-task-${task.id}`}
            >
              <Trash2 size={14} />
            </button>

            {task.stage !== 'Done' && (
              <button
                className="btn-card-action move"
                onClick={handleMoveRight}
                title="Move to next stage"
                aria-label="Move right"
                id={`btn-move-right-${task.id}`}
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--color-text-muted)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>
            <Calendar size={10} />
            <span>{formatDate(task.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
