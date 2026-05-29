import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckSquare, ListTodo, PlayCircle, Trophy, BarChart2 } from 'lucide-react';

export default function Stats() {
  const { tasks } = useApp();

  const total = tasks.length;
  const todo = tasks.filter((t) => t.stage === 'Todo').length;
  const progress = tasks.filter((t) => t.stage === 'In Progress').length;
  const done = tasks.filter((t) => t.stage === 'Done').length;

  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="stats-wrapper" id="stats-dashboard">
      <div className="progress-panel glass-panel" id="stats-progress-panel">
        <div className="progress-header">
          <div className="progress-title-section">
            <Trophy size={18} style={{ color: 'var(--stage-done)' }} />
            <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>Project Completion Rate</span>
          </div>
          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', color: 'var(--stage-done)' }}>
            {completionRate}%
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-bar-fill" style={{ width: `${completionRate}%` }}></div>
        </div>
      </div>

      <div className="stats-container">
        <div className="stat-card glass-panel" id="stat-total">
          <div className="stat-icon-wrapper" style={{ background: 'var(--color-primary-glow)', color: 'var(--color-primary)' }}>
            <BarChart2 size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{total}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
        </div>

        <div className="stat-card glass-panel" id="stat-todo">
          <div className="stat-icon-wrapper" style={{ background: 'var(--stage-todo-glow)', color: 'var(--stage-todo)' }}>
            <ListTodo size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{todo}</span>
            <span className="stat-label">Todo</span>
          </div>
        </div>

        <div className="stat-card glass-panel" id="stat-progress">
          <div className="stat-icon-wrapper" style={{ background: 'var(--stage-progress-glow)', color: 'var(--stage-progress)' }}>
            <PlayCircle size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{progress}</span>
            <span className="stat-label">In Progress</span>
          </div>
        </div>

        <div className="stat-card glass-panel" id="stat-done">
          <div className="stat-icon-wrapper" style={{ background: 'var(--stage-done-glow)', color: 'var(--stage-done)' }}>
            <CheckSquare size={20} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{done}</span>
            <span className="stat-label">Done</span>
          </div>
        </div>
      </div>
    </div>
  );
}
