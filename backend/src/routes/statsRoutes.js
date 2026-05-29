import express from 'express';
import { prisma } from '../index.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const [liturgies, songs, ppts, schedules] = await Promise.all([
      prisma.liturgy.count(),
      prisma.song.count(),
      prisma.pPTProject.count(),
      prisma.schedule.count()
    ]);

    res.json({
      totalLiturgies: liturgies,
      totalSongs: songs,
      totalPPTs: ppts,
      totalSchedules: schedules
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
