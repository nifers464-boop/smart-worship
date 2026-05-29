import express from 'express';
import PptxGenJS from 'pptxgenjs';
import { prisma } from '../index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../../temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// ---------- PROJECTS ----------

// Get all PPT projects
router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.pPTProject.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(projects.map(p => ({
      ...p,
      slides: JSON.parse(p.slides),
      selectedSongs: JSON.parse(p.selectedSongs)
    })));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create PPT project
router.post('/projects', async (req, res) => {
  try {
    const { title, churchDay, date, theme, slides, selectedSongs } = req.body;
    const project = await prisma.pPTProject.create({
      data: {
        title,
        churchDay,
        date: new Date(date),
        theme,
        slides: typeof slides === 'string' ? slides : JSON.stringify(slides || []),
        selectedSongs: typeof selectedSongs === 'string' ? selectedSongs : JSON.stringify(selectedSongs || [])
      }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update PPT project
router.put('/projects/:id', async (req, res) => {
  try {
    const { title, churchDay, date, theme, slides, selectedSongs } = req.body;
    const project = await prisma.pPTProject.update({
      where: { id: req.params.id },
      data: {
        title,
        churchDay,
        date: new Date(date),
        theme,
        slides: typeof slides === 'string' ? slides : JSON.stringify(slides || []),
        selectedSongs: typeof selectedSongs === 'string' ? selectedSongs : JSON.stringify(selectedSongs || [])
      }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete PPT project
router.delete('/projects/:id', async (req, res) => {
  try {
    await prisma.pPTProject.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------- GENERATION ----------

// Generate PPT from liturgy data
router.post('/generate', async (req, res) => {
  try {
    const { title, theme, slides, churchDay, date } = req.body;
    
    const pptx = new PptxGenJS();
    
    // Title Slide
    let slide = pptx.addSlide();
    slide.addText(title, { 
      x: 0.5, y: 2, w: 9, h: 1, fontSize: 36, bold: true, 
      align: 'center' 
    });
    slide.addText(`Hari Raya: ${churchDay}`, { 
      x: 0.5, y: 3.5, w: 9, h: 0.5, fontSize: 18, 
      align: 'center' 
    });
    slide.addText(`Tanggal: ${date}`, { 
      x: 0.5, y: 4, w: 9, h: 0.5, fontSize: 14, 
      align: 'center' 
    });
    
    // Slides
    if (slides && slides.length > 0) {
      for (const item of slides) {
        slide = pptx.addSlide();
        slide.addText(item.title, { 
          x: 0.5, y: 0.5, w: 9, h: 0.8, fontSize: 28, bold: true
        });
        slide.addText(item.content, { 
          x: 0.5, y: 1.5, w: 9, h: 4, fontSize: 18
        });
      }
    }
    
    const fileName = `${title.replace(/\s/g, '_')}_${Date.now()}.pptx`;
    const filePath = path.join(tempDir, fileName);
    
    await pptx.writeFile({ fileName: filePath });
    
    res.json({ 
      message: "PPT generated successfully",
      downloadUrl: `/api/ppt/download/${fileName}`,
      fileName: fileName
    });
  } catch (error) {
    console.error('Error generating PPT:', error);
    res.status(500).json({ error: error.message });
  }
});

// Download PPT file
router.get('/download/:fileName', async (req, res) => {
  try {
    const fileName = req.params.fileName;
    const filePath = path.join(tempDir, fileName);
    
    if (fs.existsSync(filePath)) {
      res.download(filePath, fileName);
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;