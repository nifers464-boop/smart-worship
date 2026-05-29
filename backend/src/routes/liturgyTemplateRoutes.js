import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// Get all templates
router.get('/', async (req, res) => {
  try {
    const templates = await prisma.liturgyTemplate.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create template
router.post('/', async (req, res) => {
  try {
    const { title, content, theme, churchDay } = req.body;
    const template = await prisma.liturgyTemplate.create({
      data: {
        title,
        content,
        theme,
        churchDay
      }
    });
    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete template
router.delete('/:id', async (req, res) => {
  try {
    await prisma.liturgyTemplate.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
