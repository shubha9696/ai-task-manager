const express = require('express');
const router = express.Router();
const { dbQuery } = require('../db');
const { authenticateToken } = require('../middleware/auth');

// All task routes require authentication
router.use(authenticateToken);

const VALID_STAGES = ['Todo', 'In Progress', 'Done'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High'];

// GET / - Retrieve all tasks for current user
router.get('/', async (req, res) => {
  const userId = req.user.id;
  const { stage, priority, search } = req.query;

  try {
    let sql = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [userId];

    if (stage) {
      if (VALID_STAGES.includes(stage)) {
        sql += ' AND stage = ?';
        params.push(stage);
      }
    }

    if (priority) {
      if (VALID_PRIORITIES.includes(priority)) {
        sql += ' AND priority = ?';
        params.push(priority);
      }
    }

    if (search) {
      sql += ' AND (title LIKE ? OR description LIKE ?)';
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    sql += ' ORDER BY created_at DESC';

    const tasks = await dbQuery.all(sql, params);
    return res.status(200).json({ tasks });
  } catch (err) {
    console.error('Fetch tasks error:', err);
    return res.status(500).json({ error: 'Internal server error occurred while retrieving tasks.' });
  }
});

// POST / - Create a new task
router.post('/', async (req, res) => {
  const userId = req.user.id;
  const { title, description, stage = 'Todo', priority = 'Medium' } = req.body;

  // Validation
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  if (!VALID_STAGES.includes(stage)) {
    return res.status(400).json({ error: `Invalid stage. Must be one of: ${VALID_STAGES.join(', ')}` });
  }

  if (!VALID_PRIORITIES.includes(priority)) {
    return res.status(400).json({ error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` });
  }

  try {
    const result = await dbQuery.run(
      'INSERT INTO tasks (user_id, title, description, stage, priority) VALUES (?, ?, ?, ?, ?)',
      [userId, title.trim(), description ? description.trim() : '', stage, priority]
    );

    const task = await dbQuery.get('SELECT * FROM tasks WHERE id = ?', [result.id]);
    return res.status(201).json({
      message: 'Task created successfully.',
      task
    });
  } catch (err) {
    console.error('Create task error:', err);
    return res.status(500).json({ error: 'Internal server error occurred while creating task.' });
  }
});

// PUT /:id - Update task
router.put('/:id', async (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;
  const { title, description, stage, priority } = req.body;

  try {
    // Check ownership
    const task = await dbQuery.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized access.' });
    }

    // Prepare fields to update
    const updates = [];
    const params = [];

    if (title !== undefined) {
      if (title.trim().length === 0) {
        return res.status(400).json({ error: 'Task title cannot be empty.' });
      }
      updates.push('title = ?');
      params.push(title.trim());
    }

    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description.trim());
    }

    if (stage !== undefined) {
      if (!VALID_STAGES.includes(stage)) {
        return res.status(400).json({ error: `Invalid stage. Must be one of: ${VALID_STAGES.join(', ')}` });
      }
      updates.push('stage = ?');
      params.push(stage);
    }

    if (priority !== undefined) {
      if (!VALID_PRIORITIES.includes(priority)) {
        return res.status(400).json({ error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` });
      }
      updates.push('priority = ?');
      params.push(priority);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields provided for update.' });
    }

    // Set updated_at
    updates.push('updated_at = CURRENT_TIMESTAMP');

    const sql = `UPDATE tasks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`;
    params.push(taskId, userId);

    await dbQuery.run(sql, params);

    const updatedTask = await dbQuery.get('SELECT * FROM tasks WHERE id = ?', [taskId]);
    return res.status(200).json({
      message: 'Task updated successfully.',
      task: updatedTask
    });
  } catch (err) {
    console.error('Update task error:', err);
    return res.status(500).json({ error: 'Internal server error occurred while updating task.' });
  }
});

// DELETE /:id - Delete task
router.delete('/:id', async (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;

  try {
    // Check ownership
    const task = await dbQuery.get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    if (!task) {
      return res.status(404).json({ error: 'Task not found or unauthorized access.' });
    }

    await dbQuery.run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [taskId, userId]);
    return res.status(200).json({
      message: 'Task deleted successfully.',
      taskId: parseInt(taskId)
    });
  } catch (err) {
    console.error('Delete task error:', err);
    return res.status(500).json({ error: 'Internal server error occurred while deleting task.' });
  }
});

module.exports = router;
