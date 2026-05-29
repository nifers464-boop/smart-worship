import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Stack,
  Tooltip,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AutoAwesome as TemplateIcon,
  Download as ExportIcon,
  Save as SaveIcon,
  Search as SearchIcon,
  MusicNote as SongIcon,
  Slideshow as PPTIcon,
  ContentCopy as DuplicateIcon,
  Image as ImageIcon,
  PlayArrow as PlayIcon,
  KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { pptService } from '../api/pptService';
import { songService } from '../api/songService';
import { exportPPTX } from '../utils/pptxExport';
import toast from 'react-hot-toast';
import WebPresenterMode from '../components/WebPresenterMode';
import { Menu, MenuItem } from '@mui/material';

const GMIM_LITURGY_BASE = [
  { title: 'Persiapan', content: 'Jemaat bersaat teduh...' },
  { title: 'Votum dan Salam', content: 'Pertolongan kita adalah dalam nama TUHAN, yang menjadikan langit dan bumi. Amin.' },
  { title: 'Nas Pembimbing', content: '...' },
  { title: 'Pengakuan Dosa & Berita Anugerah', content: 'Mari kita merendahkan diri dan mengaku dosa kita...' },
  { title: 'Petunjuk Hidup Baru', content: 'Dengarlah petunjuk hidup baru...' },
  { title: 'Pembacaan Alkitab', content: '...' },
  { title: 'Pengakuan Iman', content: 'Aku percaya kepada Allah, Bapa yang Mahakuasa...' },
  { title: 'Persembahan', content: 'Mari kita membawa persembahan kita...' },
  { title: 'Doa Syafaat', content: 'Mari kita berdoa...' },
  { title: 'Pengutusan dan Berkat', content: 'Terimalah berkat TUHAN...' }
];

const HOLIDAY_TEMPLATES = {
  minggu_biasa: { title: 'Ibadah Minggu Biasa', slides: JSON.stringify(GMIM_LITURGY_BASE) },
  advent: { title: 'Ibadah Advent', slides: JSON.stringify(GMIM_LITURGY_BASE) },
  natal: { title: 'Ibadah Natal', slides: JSON.stringify([...GMIM_LITURGY_BASE.slice(0,3), { title: 'Penyalaan Lilin', content: 'Malam Kudus...' }, ...GMIM_LITURGY_BASE.slice(3)]) },
  tahun_baru: { title: 'Ibadah Tahun Baru', slides: JSON.stringify(GMIM_LITURGY_BASE) },
  jumat_agung: { title: 'Ibadah Jumat Agung', slides: JSON.stringify(GMIM_LITURGY_BASE) },
  paskah: { title: 'Ibadah Paskah', slides: JSON.stringify(GMIM_LITURGY_BASE) }
};

export default function PPTGenerator() {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const [view, setView] = useState('list');
  const [songSearch, setSongSearch] = useState('');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPresenting, setIsPresenting] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    churchDay: '',
    date: new Date().toISOString().split('T')[0],
    theme: 'modern_dark',
    slides: '[]'
  });

  const { data: response, isLoading } = useQuery('pptProjects', pptService.getProjects);
  const projects = Array.isArray(response) ? response : (response?.data || []);
  const { data: songRes } = useQuery(['songs', songSearch], () => songService.getAll(songSearch), {
    enabled: view === 'editor'
  });
  const songs = Array.isArray(songRes) ? songRes : (songRes?.data || []);

  const createMutation = useMutation(pptService.createProject, {
    onSuccess: (data) => {
      queryClient.invalidateQueries('pptProjects');
      toast.success('Proyek berhasil dibuat');
      setFormData(prev => ({ ...prev, id: data.id })); // Set the new ID so future saves are updates
      if (view === 'list') handleOpenEditor(data);
    }
  });

  const updateMutation = useMutation(
    (data) => pptService.updateProject(data.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('pptProjects');
        toast.success('Perubahan disimpan');
      }
    }
  );

  const deleteMutation = useMutation(pptService.deleteProject, {
    onSuccess: () => {
      queryClient.invalidateQueries('pptProjects');
      toast.success('Proyek dihapus');
    }
  });

  const handleOpenEditor = (project = null) => {
    if (project) {
      setFormData({
        ...project,
        slides: typeof project.slides === 'string' ? project.slides : JSON.stringify(project.slides || []),
        date: new Date(project.date).toISOString().split('T')[0]
      });
    } else {
      setFormData({
        title: 'Proyek Tanpa Judul',
        churchDay: 'Minggu',
        date: new Date().toISOString().split('T')[0],
        theme: 'modern_dark',
        slides: JSON.stringify([{ title: 'Slide Utama', content: 'Soli Deo Gloria' }])
      });
    }
    setView('editor');
    setCurrentSlideIndex(0);
  };

  const applyHolidayTemplate = (key) => {
    const template = HOLIDAY_TEMPLATES[key];
    setFormData({ ...formData, ...template });
    setAnchorEl(null);
    toast.success(`Template ${template.title} diterapkan`);
  };

  const handleImageUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Ukuran gambar terlalu besar! Maksimal 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateSlide(index, 'backgroundImage', reader.result);
        toast.success('Latar belakang berhasil diatur');
      };
      reader.readAsDataURL(file);
    }
  };

  const slides = JSON.parse(formData.slides || '[]');

  const updateSlide = (index, field, value) => {
    const newSlides = [...slides];
    newSlides[index][field] = value;
    setFormData({ ...formData, slides: JSON.stringify(newSlides) });
  };

  const addSlide = () => {
    const newSlides = [...slides, { title: 'Slide Baru', content: '' }];
    setFormData({ ...formData, slides: JSON.stringify(newSlides) });
    setCurrentSlideIndex(newSlides.length - 1);
  };

  const addSongToPPT = (song) => {
    const lyricsParts = song.lyrics.split('\n\n');
    const newSlides = [...slides, ...lyricsParts.map((lyrics, i) => ({
      title: `${song.title} (${i + 1})`,
      content: lyrics
    }))];
    setFormData({ ...formData, slides: JSON.stringify(newSlides) });
    toast.success(`Lagu ${song.title} ditambahkan`);
  };

  const handleExport = () => {
    toast.promise(exportPPTX(formData), {
      loading: 'Menghasilkan file PPTX...',
      success: 'File siap diunduh!',
      error: 'Gagal mengekspor PPTX',
    });
  };

  if (isPresenting) {
    return <WebPresenterMode slides={slides} onClose={() => setIsPresenting(false)} />;
  }

  if (view === 'editor') {
    return (
      <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
        {/* TOP BAR EDITOR */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Button onClick={() => setView('list')} color="inherit" sx={{ fontWeight: 600 }}>&larr; Keluar</Button>
            <Divider orientation="vertical" flexItem />
            <TextField 
              size="small" variant="outlined" label="Judul Proyek" 
              value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
              sx={{ minWidth: 300, '& input': { fontWeight: 800, fontSize: '1.1rem' } }}
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button 
              color="secondary" 
              variant="outlined" 
              endIcon={<ArrowDownIcon />} 
              onClick={(e) => setAnchorEl(e.currentTarget)}
            >
              Template GMIM
            </Button>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              {Object.keys(HOLIDAY_TEMPLATES).map((key) => (
                <MenuItem key={key} onClick={() => applyHolidayTemplate(key)}>
                  {HOLIDAY_TEMPLATES[key].title}
                </MenuItem>
              ))}
            </Menu>
            
            <Button 
              variant="outlined" 
              startIcon={<SaveIcon />} 
              onClick={() => {
                if (formData.id) {
                  updateMutation.mutate(formData);
                } else {
                  createMutation.mutate(formData);
                }
              }} 
              sx={{ borderRadius: '10px' }}
            >
              Simpan
            </Button>
            <Button variant="contained" color="success" startIcon={<PlayIcon />} onClick={() => setIsPresenting(true)} sx={{ borderRadius: '10px' }}>Mulai Presentasi</Button>
            <Button variant="contained" color="primary" startIcon={<ExportIcon />} onClick={handleExport} sx={{ borderRadius: '10px' }}>Download PPTX</Button>
          </Stack>
        </Paper>

        <Grid container spacing={3} sx={{ flex: 1, minHeight: 0 }}>
          {/* COLUMN 1: SLIDE LIST (EasyWorship Navigation) */}
          <Grid item xs={12} md={2.5} sx={{ height: '100%', overflowY: 'auto' }}>
            <Paper sx={{ p: 2, height: '100%', borderRadius: '20px' }}>
              <Typography variant="overline" fontWeight="900" color="primary">Navigasi Slide</Typography>
              <List sx={{ mt: 1 }}>
                {slides.map((s, i) => (
                  <Card 
                    key={i} 
                    onClick={() => setCurrentSlideIndex(i)}
                    sx={{ 
                      mb: 1.5, cursor: 'pointer',
                      border: currentSlideIndex === i ? '2px solid' : '1px solid',
                      borderColor: currentSlideIndex === i ? 'primary.main' : 'divider',
                      bgcolor: currentSlideIndex === i ? alpha(theme.palette.primary.main, 0.05) : 'background.paper',
                    }}
                  >
                    <CardContent sx={{ p: '12px !important', textAlign: 'center' }}>
                      <Typography variant="caption" fontWeight="800" color="primary">Slide {i + 1}</Typography>
                      <Typography variant="body2" noWrap sx={{ fontSize: '0.75rem' }}>{s.title || '...'}</Typography>
                    </CardContent>
                  </Card>
                ))}
              </List>
              <Button 
                fullWidth 
                startIcon={<AddIcon />} 
                variant="outlined" 
                onClick={addSlide} 
                sx={{ 
                  mt: 1, 
                  border: '2px dashed', 
                  borderColor: '#CBD5E1',
                  '&:hover': { border: '2px dashed', borderColor: 'primary.main' } 
                }}
              >
                Tambah Slide
              </Button>
            </Paper>
          </Grid>

          {/* COLUMN 2: LIVE EDITOR */}
          <Grid item xs={12} md={6} sx={{ height: '100%' }}>
            <Paper sx={{ p: 4, height: '100%', borderRadius: '20px', display: 'flex', flexDirection: 'column' }}>
              {slides[currentSlideIndex] ? (
                <Stack spacing={3} sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" fontWeight="900" color="primary">Slide {currentSlideIndex + 1} / {slides.length}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button variant="outlined" size="small" startIcon={<ImageIcon />} component="label" sx={{ borderRadius: '8px' }}>
                        Latar Foto
                        <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, currentSlideIndex)} />
                      </Button>
                      {slides[currentSlideIndex].backgroundImage && (
                        <Button color="error" variant="outlined" size="small" onClick={() => updateSlide(currentSlideIndex, 'backgroundImage', null)} sx={{ borderRadius: '8px' }}>Hapus Foto</Button>
                      )}
                      <IconButton size="small" color="error" onClick={() => {
                        const newSlides = slides.filter((_, i) => i !== currentSlideIndex);
                        setFormData({...formData, slides: JSON.stringify(newSlides)});
                        setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
                      }}><DeleteIcon /></IconButton>
                    </Stack>
                  </Box>
                  
                  {/* Preview Background mini jika ada */}
                  {slides[currentSlideIndex].backgroundImage && (
                    <Box sx={{ height: 60, width: '100%', borderRadius: 1, backgroundImage: `url(${slides[currentSlideIndex].backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center', mb: 1 }} />
                  )}

                  <TextField 
                    fullWidth label="Judul Slide" 
                    variant="outlined"
                    value={slides[currentSlideIndex].title} 
                    onChange={(e) => updateSlide(currentSlideIndex, 'title', e.target.value)} 
                    sx={{ '& input': { fontWeight: 700 } }}
                  />
                  <TextField 
                    fullWidth multiline rows={8} label="Konten / Lirik (Gunakan Enter 2x untuk Pisah Slide Otomatis)" 
                    variant="outlined"
                    value={slides[currentSlideIndex].content} 
                    onChange={(e) => updateSlide(currentSlideIndex, 'content', e.target.value)} 
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#F8FAFC', fontFamily: 'monospace', fontSize: '1.1rem', borderRadius: '12px' } }}
                  />
                </Stack>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Typography color="text.secondary">Pilih slide untuk mulai mengedit</Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* COLUMN 3: SONG RESOURCE */}
          <Grid item xs={12} md={3.5} sx={{ height: '100%', overflowY: 'auto' }}>
            <Paper sx={{ p: 2, height: '100%', borderRadius: '20px' }}>
              <Typography variant="overline" fontWeight="900" color="secondary">Pustaka Lagu Cepat</Typography>
              <TextField 
                fullWidth size="small" placeholder="Cari lagu..." sx={{ mt: 1, mb: 2 }}
                value={songSearch} onChange={(e) => setSongSearch(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} /> }}
              />
              <List>
                {songs.slice(0, 10).map(song => (
                  <ListItemButton key={song.id} sx={{ borderRadius: '8px', mb: 0.5 }} onClick={() => addSongToPPT(song)}>
                    <ListItemIcon sx={{ minWidth: 32 }}><SongIcon fontSize="small" /></ListItemIcon>
                    <ListItemText primary={song.title} secondary={song.category} primaryTypographyProps={{ fontSize: '0.85rem', fontWeight: 600 }} />
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // LIST VIEW
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="900" color="primary">PPT Generator</Typography>
          <Typography variant="body2" color="text.secondary">Buat presentasi liturgi profesional hanya dalam hitungan detik.</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpenEditor()}
          sx={{ px: 4, py: 1.5, borderRadius: '12px' }}
        >
          Buat Proyek Baru
        </Button>
      </Box>

      <Grid container spacing={3}>
        {isLoading ? (
          <Grid item xs={12}><Typography align="center">Menyiapkan data...</Typography></Grid>
        ) : projects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', borderRadius: '12px', display: 'flex' }}>
                    <PPTIcon />
                  </Box>
                  <Stack direction="row" spacing={0.5}>
                    <IconButton size="small" onClick={() => createMutation.mutate({...project, id: undefined, title: project.title + ' (Salinan)'})}><DuplicateIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => { if(window.confirm('Hapus proyek?')) deleteMutation.mutate(project.id) }}><DeleteIcon fontSize="small" /></IconButton>
                  </Stack>
                </Box>
                <Typography variant="h6" fontWeight="800" gutterBottom noWrap>{project.title}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>{project.churchDay}</Typography>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 2 }}>{new Date(project.date).toLocaleDateString()}</Typography>
                <Button fullWidth variant="outlined" onClick={() => handleOpenEditor(project)} sx={{ borderRadius: '8px' }}>Buka Editor</Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}