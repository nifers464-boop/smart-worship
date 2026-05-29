import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// Get all church calendar
router.get('/', async (req, res) => {
  try {
    const { year } = req.query;
    let where = {};
    
    if (year) {
      where.date = {
        gte: new Date(`${year}-01-01`),
        lte: new Date(`${year}-12-31`)
      };
    }
    
    const calendars = await prisma.churchCalendar.findMany({
      where,
      orderBy: { date: 'asc' }
    });
    res.json(calendars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single calendar event
router.get('/:id', async (req, res) => {
  try {
    const calendar = await prisma.churchCalendar.findUnique({
      where: { id: req.params.id }
    });
    if (!calendar) {
      return res.status(404).json({ error: 'Calendar event not found' });
    }
    res.json(calendar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create calendar event
router.post('/', async (req, res) => {
  try {
    const { name, date, description, color } = req.body;
    const id = `${name.toLowerCase().replace(/\s/g, '_')}_${new Date(date).getFullYear()}`;
    
    const calendar = await prisma.churchCalendar.create({
      data: {
        id,
        name,
        date: new Date(date),
        description,
        color
      }
    });
    res.status(201).json(calendar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update calendar event
router.put('/:id', async (req, res) => {
  try {
    const { name, date, description, color } = req.body;
    const calendar = await prisma.churchCalendar.update({
      where: { id: req.params.id },
      data: {
        name,
        date: new Date(date),
        description,
        color
      }
    });
    res.json(calendar);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete calendar event
router.delete('/:id', async (req, res) => {
  try {
    await prisma.churchCalendar.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed church calendar
router.post('/seed', async (req, res) => {
  try {
    const churchDays = [
      { 
        id: "advent_1_2024",
        name: "Advent 1", 
        date: new Date("2024-12-01"), 
        description: "Awal masa Advent, minggu pertama persiapan Natal", 
        color: "Ungu" 
      },
      { 
        id: "advent_2_2024",
        name: "Advent 2", 
        date: new Date("2024-12-08"), 
        description: "Minggu kedua Advent", 
        color: "Ungu" 
      },
      { 
        id: "advent_3_2024",
        name: "Advent 3", 
        date: new Date("2024-12-15"), 
        description: "Minggu ketiga Advent (Minggu Gaudete)", 
        color: "Merah Muda" 
      },
      { 
        id: "advent_4_2024",
        name: "Advent 4", 
        date: new Date("2024-12-22"), 
        description: "Minggu keempat Advent", 
        color: "Ungu" 
      },
      { 
        id: "natal_2024",
        name: "Natal", 
        date: new Date("2024-12-25"), 
        description: "Hari Kelahiran Yesus Kristus", 
        color: "Putih" 
      },
      { 
        id: "tahun_baru_2025",
        name: "Tahun Baru", 
        date: new Date("2025-01-01"), 
        description: "Tahun Baru Masehi", 
        color: "Putih" 
      },
      { 
        id: "jumat_agung_2025",
        name: "Jumat Agung", 
        date: new Date("2025-04-18"), 
        description: "Wafatnya Yesus Kristus", 
        color: "Hitam" 
      },
      { 
        id: "paskah_2025",
        name: "Paskah", 
        date: new Date("2025-04-20"), 
        description: "Kebangkitan Yesus Kristus", 
        color: "Putih" 
      },
      { 
        id: "kenaikan_2025",
        name: "Kenaikan Isa Almasih", 
        date: new Date("2025-05-29"), 
        description: "Kenaikan Yesus ke Surga", 
        color: "Putih" 
      },
      { 
        id: "pentakosta_2025",
        name: "Pentakosta", 
        date: new Date("2025-06-08"), 
        description: "Turunnya Roh Kudus", 
        color: "Merah" 
      }
    ];
    
    for (const day of churchDays) {
      await prisma.churchCalendar.upsert({
        where: { id: day.id },
        update: day,
        create: day
      });
    }
    
    res.json({ message: "Church calendar seeded successfully", count: churchDays.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;