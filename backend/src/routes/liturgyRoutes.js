import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// Get all liturgies
router.get('/', async (req, res) => {
  try {
    const liturgies = await prisma.liturgy.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(liturgies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single liturgy
router.get('/:id', async (req, res) => {
  try {
    const liturgy = await prisma.liturgy.findUnique({
      where: { id: req.params.id }
    });
    if (!liturgy) {
      return res.status(404).json({ error: 'Liturgy not found' });
    }
    res.json(liturgy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create liturgy
router.post('/', async (req, res) => {
  try {
    const { title, content, theme, date, churchDay } = req.body;
    const liturgy = await prisma.liturgy.create({
      data: {
        title,
        content: content, // Langsung pakai JSON
        theme,
        date: new Date(date),
        churchDay
      }
    });
    res.status(201).json(liturgy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update liturgy
router.put('/:id', async (req, res) => {
  try {
    const { title, content, theme, date, churchDay } = req.body;
    const liturgy = await prisma.liturgy.update({
      where: { id: req.params.id },
      data: {
        title,
        content,
        theme,
        date: new Date(date),
        churchDay
      }
    });
    res.json(liturgy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete liturgy
router.delete('/:id', async (req, res) => {
  try {
    await prisma.liturgy.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;