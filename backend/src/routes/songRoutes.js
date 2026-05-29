import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

// Get all songs with pagination and search
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    let where = {};
    if (search) {
      where = {
        OR: [
          { title: { contains: search } },
          { number: parseInt(search) || 0 },
          { songBook: { contains: search } }
        ]
      };
    }
    
    const songs = await prisma.song.findMany({
      where,
      skip: skip,
      take: parseInt(limit),
      orderBy: { number: 'asc' }
    });
    
    const total = await prisma.song.count({ where });
    
    res.json({
      data: songs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single song
router.get('/:id', async (req, res) => {
  try {
    const song = await prisma.song.findUnique({
      where: { id: req.params.id }
    });
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or Update song (Upsert)
router.post('/', async (req, res) => {
  try {
    const { number, title, lyrics, songBook, author, category } = req.body;
    const songNumber = parseInt(number);
    
    if (isNaN(songNumber)) {
      return res.status(400).json({ error: 'Nomor lagu harus berupa angka' });
    }

    const song = await prisma.song.upsert({
      where: { number: songNumber },
      update: {
        title,
        lyrics,
        songBook: songBook || category,
        author,
        category
      },
      create: {
        number: songNumber,
        title,
        lyrics,
        songBook: songBook || category,
        author,
        category
      }
    });
    res.status(201).json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk Create/Update songs
router.post('/bulk', async (req, res) => {
  try {
    const { songs } = req.body;
    if (!Array.isArray(songs)) {
      return res.status(400).json({ error: 'Database Lagu Rohani harus berupa array' });
    }

    const results = await prisma.$transaction(
      songs.map(songData => {
        const songNumber = parseInt(songData.number);
        if (isNaN(songNumber)) return null;

        return prisma.song.upsert({
          where: { number: songNumber },
          update: {
            title: songData.title,
            lyrics: songData.lyrics,
            songBook: songData.songBook || songData.category,
            category: songData.category
          },
          create: {
            number: songNumber,
            title: songData.title,
            lyrics: songData.lyrics,
            songBook: songData.songBook || songData.category,
            category: songData.category
          }
        });
      }).filter(Boolean)
    );
    
    res.json({ message: `${results.length} lagu berhasil diproses`, count: results.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update song
router.put('/:id', async (req, res) => {
  try {
    const { number, title, lyrics, songBook, author } = req.body;
    const song = await prisma.song.update({
      where: { id: req.params.id },
      data: {
        number: parseInt(number),
        title,
        lyrics,
        songBook,
        author
      }
    });
    res.json(song);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete all songs
router.delete('/all/confirm', async (req, res) => {
  try {
    await prisma.song.deleteMany({});
    res.json({ message: 'Semua lagu telah dihapus' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete song
router.delete('/:id', async (req, res) => {
  try {
    await prisma.song.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Seed initial songs
router.post('/seed/initial-songs', async (req, res) => {
  try {
    const songs = [
      { number: 1, title: "O Tuhan, Bukalah Mulutku", lyrics: "O Tuhan, bukalah mulutku, supaya mulutku memberitakan pujian kepada-Mu...", songBook: "Pustaka Lagu", author: "Traditional" },
      { number: 2, title: "Mari Berlomba", lyrics: "Mari berlomba, berlomba dalam iman, berlomba dalam kesalehan...", songBook: "Pustaka Lagu", author: "Traditional" },
      { number: 3, title: "Haleluya, Pujilah Tuhan", lyrics: "Haleluya, pujilah Tuhan, hai segala bangsa, pujilah Dia...", songBook: "Pustaka Lagu", author: "Traditional" },
      { number: 4, title: "Yesus Kawan yang Sejati", lyrics: "Yesus kawan yang sejati, tiada tara kasih-Nya, Ia selalu beserta kita...", songBook: "Pustaka Lagu", author: "Traditional" },
      { number: 5, title: "Ku Cinta Kau Tuhan", lyrics: "Ku cinta Kau Tuhan, dengan segenap hati, ku cinta Kau Tuhan...", songBook: "Pustaka Lagu", author: "Traditional" }
    ];
    
    for (const song of songs) {
      await prisma.song.upsert({
        where: { number: song.number },
        update: song,
        create: song
      });
    }
    
    res.json({ message: "Songs seeded successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;