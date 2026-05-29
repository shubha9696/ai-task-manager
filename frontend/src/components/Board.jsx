import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import Column from './Column';
import Stats from './Stats';
import TaskModal from './TaskModal';
import { Plus, Search, Filter, Loader2 } from 'lucide-react';

export default function Board() {
  const { tasks, fetchTasks, isLoading } = useApp();
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Trigger search and filters automatically
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchTasks({
        search: search.trim(),
        priority: priorityFilter
      });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, priorityFilter, fetchTasks]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  // Group tasks by stages
  const todoTasks = tasks.filter((t) => t.stage === 'Todo');
  const progressTasks = tasks.filter((t) => t.stage === 'In Progress');
  const doneTasks = tasks.filter((t) => t.stage === 'Done');

  return (
    <div className="board-wrapper" id="kanban-board-panel">
      {/* Visual Analytics */}
      <Stats />

      {/* Control Filters panel */}
      <div className="board-filters glass-panel" id="board-filters-controls" style={{ padding: '1rem', marginTop: '1.5rem' }}>
        <div className="search-filter-wrapper">
          <div className="input-icon-wrapper" style={{ flex: 1 }}>
            <Search size={16} className="input-icon" style={{ left: '0.9rem' }} />
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.5rem', fontSize: '0.85rem' }}
              placeholder="Search tasks by title or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="filter-search-input"
            />
          </div>
        </div>

        <div className="select-filters-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={14} style={{ color: 'var(--color-text-sub)' }} />
            <select
              className="filter-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              id="filter-priority-select"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={handleCreateTask}
            id="btn-create-task-trigger"
          >
            <Plus size={16} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Column Grid */}
      {isLoading && tasks.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '300px', color: 'var(--color-text-sub)' }}>
          <Loader2 size={32} className="spinner" style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
          <span>Synchronizing tasks from server...</span>
        </div>
      ) : (
        <div className="kanban-grid" style={{ marginTop: '1.5rem' }}>
          <Column
            title="Todo"
            stageName="Todo"
            tasks={todoTasks}
            onEditTask={handleEditTask}
          />
          <Column
            title="In Progress"
            stageName="In Progress"
            tasks={progressTasks}
            onEditTask={handleEditTask}
          />
          <Column
            title="Done"
            stageName="Done"
            tasks={doneTasks}
            onEditTask={handleEditTask}
          />
        </div>
      )}

      {/* Task Creation & Modification Dialog Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        taskToEdit={selectedTask}
      />
    </div>
  );
}
