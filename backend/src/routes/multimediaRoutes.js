import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// ---------- OPERATORS (Members) ----------

// Get all operators
router.get('/operators', async (req, res) => {
  try {
    const operators = await prisma.operator.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(operators);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create operator
router.post('/operators', async (req, res) => {
  try {
    const { name } = req.body;
    const operator = await prisma.operator.create({
      data: { name }
    });
    res.status(201).json(operator);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete operator
router.delete('/operators/:id', async (req, res) => {
  try {
    await prisma.operator.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- SCHEDULES ----------

// Get all schedules
router.get('/schedules', async (req, res) => {
  try {
    const { month, year } = req.query;
    let where = {};
    
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      where.date = {
        gte: startDate,
        lte: endDate
      };
    }
    
    const schedules = await prisma.schedule.findMany({
      where,
      orderBy: { date: 'asc' }
    });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create schedule
router.post('/schedules', async (req, res) => {
  try {
    const { name, shift, date, notes } = req.body;
    const schedule = await prisma.schedule.create({
      data: {
        name,
        shift,
        date: new Date(date),
        notes
      }
    });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auto generate schedules
router.post('/schedules/generate', async (req, res) => {
  try {
    const { month, year, schedules } = req.body;
    
    // Clear existing for that month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    
    await prisma.schedule.deleteMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });
    
    // Create new ones
    const created = [];
    for (const s of schedules) {
      const item = await prisma.schedule.create({
        data: {
          name: s.name,
          shift: s.shift,
          date: new Date(s.date),
          notes: s.notes
        }
      });
      created.push(item);
    }
    
    res.json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update schedule
router.put('/schedules/:id', async (req, res) => {
  try {
    const { name, shift, date, notes } = req.body;
    const schedule = await prisma.schedule.update({
      where: { id: req.params.id },
      data: {
        name,
        shift,
        date: new Date(date),
        notes
      }
    });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete schedule
router.delete('/schedules/:id', async (req, res) => {
  try {
    await prisma.schedule.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all schedules
router.delete('/schedules', async (req, res) => {
  try {
    await prisma.schedule.deleteMany();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;