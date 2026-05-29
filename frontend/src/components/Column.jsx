import React from 'react';
import TaskCard from './TaskCard';
import { useApp } from '../context/AppContext';
import { FolderOpen } from 'lucide-react';

export default function Column({ title, stageName, tasks, onEditTask }) {
  const { updateTaskStage } = useApp();

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const taskIdStr = e.dataTransfer.getData('text/plain');
    if (taskIdStr) {
      const taskId = parseInt(taskIdStr);
      updateTaskStage(taskId, stageName);
    }
  };

  // Get indicator CSS class
  const getIndicatorClass = () => {
    if (stageName === 'Todo') return 'todo';
    if (stageName === 'In Progress') return 'progress';
    return 'done';
  };

  return (
    <div
      className="column-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      id={`column-${stageName.toLowerCase().replace(' ', '')}`}
    >
      <div className="column-header">
        <div className="column-title-wrapper">
          <span className={`column-indicator ${getIndicatorClass()}`}></span>
          <h3 className="column-title">{title}</h3>
        </div>
        <span className="column-count">{tasks.length}</span>
      </div>

      <div className="tasks-list">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEditTask} />
          ))
        ) : (
          <div className="empty-column-message" id={`empty-message-${stageName.toLowerCase().replace(' ', '')}`}>
            <FolderOpen size={24} className="empty-column-icon" />
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>No tasks here</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '2px' }}>Drag tasks or create new ones</span>
          </div>
        )}
      </div>
    </div>
  );
}
