import React, { useState } from 'react';
import { Menu, MenuItem, Box, Typography, Paper, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Tooltip, Grid, alpha, useTheme } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Description as WordIcon, AutoAwesome as TemplateIcon, KeyboardArrowDown as ArrowDownIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { liturgyService } from '../api/liturgyService';
import { liturgyTemplateService } from '../api/liturgyTemplateService';
import { exportLiturgyToWord } from '../utils/wordExport';
import toast from 'react-hot-toast';
import * as mammoth from 'mammoth';

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

const LITURGY_TEMPLATES = {
  minggu_biasa: { title: 'Ibadah Minggu Biasa', theme: '', churchDay: 'Minggu', content: JSON.stringify(GMIM_LITURGY_BASE) },
  advent: { title: 'Ibadah Advent', theme: 'Penantian', churchDay: 'Advent', content: JSON.stringify(GMIM_LITURGY_BASE) },
  natal: { title: 'Ibadah Natal', theme: 'Kelahiran Sang Raja', churchDay: 'Natal', content: JSON.stringify([...GMIM_LITURGY_BASE.slice(0,3), { title: 'Penyalaan Lilin', content: 'Malam Kudus...' }, ...GMIM_LITURGY_BASE.slice(3)]) },
  tahun_baru: { title: 'Ibadah Tahun Baru', theme: 'Harapan Baru', churchDay: 'Tahun Baru', content: JSON.stringify(GMIM_LITURGY_BASE) },
  jumat_agung: { title: 'Ibadah Jumat Agung', theme: 'Pengorbanan Kristus', churchDay: 'Jumat Agung', content: JSON.stringify(GMIM_LITURGY_BASE) },
  paskah: { title: 'Ibadah Paskah', theme: 'Kebangkitan Kristus', churchDay: 'Paskah', content: JSON.stringify(GMIM_LITURGY_BASE) }
};

export default function LiturgyManagement() {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentLiturgy, setCurrentLiturgy] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    theme: '',
    churchDay: '',
    date: new Date().toISOString().split('T')[0],
    content: '[]'
  });

  const { data: response, isLoading } = useQuery('liturgies', liturgyService.getAll);
  const liturgies = Array.isArray(response) ? response : (response?.data || []);

  const { data: templatesRes } = useQuery('liturgyTemplates', liturgyTemplateService.getAll);
  const dynamicTemplates = Array.isArray(templatesRes) ? templatesRes : (templatesRes?.data || []);

  const createMutation = useMutation(liturgyService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('liturgies');
      toast.success('Liturgi berhasil dibuat');
      handleClose();
    }
  });

  const updateMutation = useMutation(
    (data) => liturgyService.update(data.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('liturgies');
        toast.success('Liturgi berhasil diperbarui');
        handleClose();
      }
    }
  );

  const deleteMutation = useMutation(liturgyService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('liturgies');
      toast.success('Liturgi berhasil dihapus');
    }
  });

  const applyTemplate = (template) => {
    setFormData({
      ...formData,
      ...template,
      id: undefined // jangan timpa ID liturgi saat ini jika sedang mengedit
    });
    setAnchorEl(null);
    toast.success(`Template ${template.title} diterapkan`);
  };

  const handleWordUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer });
        const html = result.value;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        let templatesToSave = [];
        let currentTemplateName = `[Word] ${file.name.replace('.docx', '')}`;
        let parsedParts = [];
        let currentTitle = 'Persiapan';
        let currentContent = [];
        
        const saveCurrentPart = () => {
          if (currentContent.length > 0 || currentTitle !== 'Persiapan') {
            if (currentTitle.toUpperCase() !== "URUTAN IBADAH") {
              parsedParts.push({ title: currentTitle, content: currentContent.join('\n') });
            }
          }
        };

        const saveCurrentTemplate = () => {
          saveCurrentPart();
          if (parsedParts.length > 0) {
            templatesToSave.push({
              title: currentTemplateName.substring(0, 50), // keep title reasonable
              theme: '',
              churchDay: 'Kustom',
              content: JSON.stringify(parsedParts)
            });
          }
          parsedParts = [];
          currentTitle = 'Persiapan';
          currentContent = [];
        };

        doc.body.childNodes.forEach(node => {
          if (node.nodeName === 'TABLE') {
            const rows = node.querySelectorAll('tr');
            rows.forEach(row => {
              const cells = row.querySelectorAll('td');
              if (cells.length === 2) {
                const t = cells[0].textContent.trim();
                const c = cells[1].innerHTML.replace(/<br\s*[\/]?>/gi, '\n').replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '').trim();
                if (t && t.toUpperCase() !== "URUTAN IBADAH") {
                  parsedParts.push({ title: t, content: c });
                }
              }
            });
          } else {
            const text = node.textContent.trim();
            if (!text) return;

            const textUpper = text.toUpperCase();
            const isHeading = node.nodeName.match(/^H[1-6]$/);
            
            const isTemplateDelimiter = 
              textUpper.includes('BENTUK IBADAH') || 
              textUpper.match(/^BENTUK\s+[IVX0-9]+/) || 
              textUpper.includes('TATA IBADAH');
              
            const isBoldParagraph = node.nodeName === 'P' && (node.innerHTML.startsWith('<strong>') || node.innerHTML.startsWith('<b>')) && text.length < 60;
            const isAllUppercase = text === textUpper && text.length > 3 && text.length < 60 && !text.includes('...');
            const isPartTitle = isHeading || isBoldParagraph || (isAllUppercase && !isTemplateDelimiter);

            if (isTemplateDelimiter) {
              if (parsedParts.length > 0 || currentContent.length > 0) saveCurrentTemplate();
              currentTemplateName = text;
            } else if (isPartTitle) {
              saveCurrentPart();
              currentTitle = text;
              currentContent = [];
            } else {
              currentContent.push(text);
            }
          }
        });
        
        saveCurrentTemplate();

        if (templatesToSave.length === 0) {
          toast.error("Tidak ada data valid dalam file Word");
          return;
        }

        for (const tpl of templatesToSave) {
          await liturgyTemplateService.create(tpl);
        }
        
        queryClient.invalidateQueries('liturgyTemplates');
        setAnchorEl(null);
        toast.success(`${templatesToSave.length} Template Word berhasil diimpor`);
      } catch (error) {
        console.error(error);
        toast.error('Gagal memproses file Word');
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleOpen = (liturgy = null) => {
    if (liturgy) {
      setIsEdit(true);
      setCurrentLiturgy(liturgy);
      setFormData({
        ...liturgy,
        date: new Date(liturgy.date).toISOString().split('T')[0]
      });
    } else {
      setIsEdit(false);
      setFormData({
        title: '',
        theme: '',
        churchDay: '',
        date: new Date().toISOString().split('T')[0],
        content: JSON.stringify([{ title: 'Tahapan 1', content: '' }])
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCurrentLiturgy(null);
  };

  const handleSave = () => {
    if (isEdit) updateMutation.mutate({ ...formData, id: currentLiturgy.id });
    else createMutation.mutate(formData);
  };

  const liturgyParts = JSON.parse(formData.content || '[]');

  const updatePart = (index, field, value) => {
    const newParts = [...liturgyParts];
    newParts[index][field] = value;
    setFormData({ ...formData, content: JSON.stringify(newParts) });
  };

  const addPart = () => {
    const newParts = [...liturgyParts, { title: '', content: '' }];
    setFormData({ ...formData, content: JSON.stringify(newParts) });
  };

  const removePart = (index) => {
    const newParts = liturgyParts.filter((_, i) => i !== index);
    setFormData({ ...formData, content: JSON.stringify(newParts) });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="900" color="primary">Manajemen Liturgi</Typography>
          <Typography variant="body2" color="text.secondary">Kelola alur ibadah dan tata gereja secara profesional.</Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={() => handleOpen()}
          sx={{ px: 4, py: 1.5, borderRadius: '12px' }}
        >
          Buat Liturgi Baru
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableCell sx={{ fontWeight: 800 }}>Judul Ibadah</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Hari Gerejawi</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Tanggal</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} align="center">Memuat data...</TableCell></TableRow>
            ) : liturgies.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell sx={{ fontWeight: 600 }}>{row.title}</TableCell>
                <TableCell>{row.churchDay}</TableCell>
                <TableCell>{new Date(row.date).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Download Word">
                      <IconButton onClick={() => exportLiturgyToWord(row)} color="secondary" size="small"><WordIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => handleOpen(row)} color="primary" size="small"><EditIcon /></IconButton>
                    </Tooltip>
                    <Tooltip title="Hapus">
                      <IconButton onClick={() => { if(window.confirm('Hapus liturgi?')) deleteMutation.mutate(row.id) }} color="error" size="small"><DeleteIcon /></IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ px: 4, pt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" fontWeight="900">{isEdit ? 'Edit Liturgi' : 'Buat Liturgi Baru'}</Typography>
          {!isEdit && (
            <Box>
              <Button 
                variant="outlined" 
                startIcon={<TemplateIcon />} 
                endIcon={<ArrowDownIcon />}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                Template GMIM
              </Button>
              <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
                <MenuItem disabled sx={{ opacity: 1, py: 0 }}><Typography variant="caption" fontWeight="bold">Bawaan Sistem</Typography></MenuItem>
                {Object.keys(LITURGY_TEMPLATES).map((key) => (
                  <MenuItem key={key} onClick={() => applyTemplate(LITURGY_TEMPLATES[key])}>
                    {LITURGY_TEMPLATES[key].title}
                  </MenuItem>
                ))}
                
                {dynamicTemplates.length > 0 && (
                  <MenuItem disabled sx={{ opacity: 1, py: 0, mt: 1 }}><Typography variant="caption" fontWeight="bold">Template Kustom (Impor)</Typography></MenuItem>
                )}
                {dynamicTemplates.map((tpl) => (
                  <MenuItem key={tpl.id} onClick={() => applyTemplate(tpl)}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span>{tpl.title}</span>
                      <IconButton 
                        size="small" color="error" 
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          liturgyTemplateService.delete(tpl.id).then(() => queryClient.invalidateQueries('liturgyTemplates')); 
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </MenuItem>
                ))}
                
                <Box sx={{ p: 1, mt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Button fullWidth variant="outlined" component="label" size="small" startIcon={<WordIcon />}>
                    Impor Word Template
                    <input type="file" hidden accept=".docx" onChange={handleWordUpload} />
                  </Button>
                </Box>
              </Menu>
            </Box>
          )}
        </DialogTitle>
        <DialogContent sx={{ px: 4, pb: 4 }}>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Judul Ibadah" variant="outlined"
                value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Hari Gerejawi"
                value={formData.churchDay} onChange={(e) => setFormData({ ...formData, churchDay: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Tema"
                value={formData.theme} onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth label="Tanggal" type="date" InputLabelProps={{ shrink: true }}
                value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 5, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight="800">Urutan Ibadah</Typography>
            <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={addPart}>Tambah Tahapan</Button>
          </Box>
          
          <Box sx={{ bgcolor: '#F1F5F9', p: 4, borderRadius: '16px', display: 'flex', justifyContent: 'center' }}>
            <Paper 
              elevation={3} 
              sx={{ 
                width: '100%', 
                maxWidth: '800px', 
                minHeight: '1050px', 
                bgcolor: 'white', 
                p: { xs: 3, md: 6 },
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              <Typography variant="h5" align="center" fontWeight="900" sx={{ mb: 4, textTransform: 'uppercase', color: '#0F172A' }}>
                {formData.title || 'JUDUL IBADAH'}
              </Typography>

              <Stack spacing={3}>
                {liturgyParts.map((part, index) => (
                  <Box key={index} sx={{ display: 'flex', flexDirection: 'column', position: 'relative', borderBottom: '1px solid #E2E8F0', pb: 3, '&:hover .delete-btn': { opacity: 1 } }}>
                    <TextField
                      fullWidth placeholder="JUDUL TAHAPAN (misal: PERSIAPAN)" variant="standard" 
                      InputProps={{ disableUnderline: true, sx: { fontWeight: 800, fontSize: '1.1rem', textTransform: 'uppercase', color: '#0F172A' } }}
                      value={part.title} onChange={(e) => updatePart(index, 'title', e.target.value)}
                    />
                    <TextField
                      fullWidth placeholder="Naskah / Keterangan (Gunakan Shift+Enter untuk baris baru)" multiline variant="standard" 
                      InputProps={{ disableUnderline: true, sx: { lineHeight: 1.6 } }}
                      value={part.content} onChange={(e) => updatePart(index, 'content', e.target.value)}
                      sx={{ mt: 1, pl: { xs: 0, md: 2 } }} // Slight indent for content
                    />
                    <IconButton 
                      className="delete-btn"
                      size="small" color="error" 
                      sx={{ position: 'absolute', top: 0, right: -16, opacity: 0, transition: 'opacity 0.2s', bgcolor: 'error.lighter' }}
                      onClick={() => removePart(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4 }}>
          <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>Batal</Button>
          <Button variant="contained" onClick={handleSave} sx={{ px: 4 }}>Simpan Liturgi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}