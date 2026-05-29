import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Tooltip,
  alpha,
  useTheme,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  UploadFile as ImportIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { songService } from '../api/songService';
import { parseSongsFromPdf } from '../utils/pdfParser';
import toast from 'react-hot-toast';

export default function SongLibrary() {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: 'NNBT',
    lyrics: '',
    number: ''
  });

  const { data: response, isLoading } = useQuery(['songs', search], () => songService.getAll(search));
  const songs = Array.isArray(response) ? response : (response?.data || []);

  const createMutation = useMutation(songService.create, {
    onSuccess: () => {
      queryClient.invalidateQueries('songs');
      toast.success('Lagu berhasil ditambahkan');
      setOpen(false);
    }
  });

  const updateMutation = useMutation(
    (data) => songService.update(data.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('songs');
        toast.success('Lagu berhasil diperbarui');
        setOpen(false);
      }
    }
  );

  const deleteMutation = useMutation(songService.delete, {
    onSuccess: () => {
      queryClient.invalidateQueries('songs');
      toast.success('Lagu telah dihapus');
    }
  });

  const deleteAllMutation = useMutation(songService.deleteAll, {
    onSuccess: () => {
      queryClient.invalidateQueries('songs');
      toast.success('Seluruh pustaka lagu telah dikosongkan');
    }
  });

  const handlePdfImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    const id = toast.loading('Mengekstrak lagu dari PDF...');
    
    try {
      const extractedSongs = await parseSongsFromPdf(file);
      
      if (extractedSongs.length === 0) {
        toast.error('Tidak ada lagu yang berhasil diekstrak dari PDF.', { id });
        return;
      }

      // Bulk create is much more reliable than a loop
      const result = await songService.createBulk(extractedSongs);
      
      queryClient.invalidateQueries('songs');
      toast.success(`${result.count || extractedSongs.length} lagu berhasil diimpor!`, { id });
    } catch (error) {
      console.error(error);
      toast.error(`Gagal mengekstrak PDF: ${error.message || 'Pastikan file tidak terkunci'}`, { id });
    } finally {
      setImporting(false);
    }
  };

  const handleOpen = (song = null) => {
    if (song) {
      setIsEdit(true);
      setFormData(song);
    } else {
      setIsEdit(false);
      setFormData({ title: '', category: 'NNBT', lyrics: '', number: '' });
    }
    setOpen(true);
  };

  const handleSave = () => {
    if (isEdit) updateMutation.mutate(formData);
    else createMutation.mutate(formData);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="900" color="primary">Pustaka Lagu</Typography>
          <Typography variant="body2" color="text.secondary">Database lagu rohani digital untuk pelayanan ibadah Anda.</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button 
            component="label" 
            variant="outlined" 
            startIcon={importing ? <CircularProgress size={20} /> : <PdfIcon />}
            disabled={importing}
            sx={{ borderRadius: '12px' }}
          >
            Import PDF
            <input type="file" hidden accept="application/pdf" onChange={handlePdfImport} />
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => handleOpen()}
            sx={{ borderRadius: '12px', px: 3 }}
          >
            Tambah Lagu
          </Button>
          {songs.length > 0 && (
            <Button 
              variant="outlined" 
              color="error"
              startIcon={<DeleteIcon />} 
              onClick={() => { if(window.confirm('Hapus seluruh lagu di pustaka? Tindakan ini tidak dapat dibatalkan.')) deleteAllMutation.mutate() }}
              sx={{ borderRadius: '12px' }}
            >
              Hapus Semua
            </Button>
          )}
        </Stack>
      </Box>

      <Paper sx={{ mb: 4, p: 2.5, borderRadius: '20px', border: '1px solid', borderColor: 'divider' }}>
        <TextField
          fullWidth
          placeholder="Cari lagu berdasarkan judul, nomor, atau potongan lirik..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="primary" />
              </InputAdornment>
            ),
            sx: { borderRadius: '12px', bgcolor: 'background.default' }
          }}
        />
      </Paper>

      <TableContainer component={Paper} sx={{ borderRadius: '20px', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <TableCell sx={{ fontWeight: 800, width: 80 }}>No</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Judul Lagu</TableCell>
              <TableCell sx={{ fontWeight: 800 }}>Kategori</TableCell>
              <TableCell sx={{ fontWeight: 800 }} align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={4} align="center">Memuat lagu...</TableCell></TableRow>
            ) : songs.length === 0 ? (
              <TableRow><TableCell colSpan={4} align="center">Tidak ada lagu yang ditemukan.</TableCell></TableRow>
            ) : songs.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="800" color="primary">{row.number || '-'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="600">{row.title}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 400, noWrap: true, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.lyrics?.substring(0, 80)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={row.category} 
                    size="small" 
                    variant="filled" 
                    sx={{ 
                      fontWeight: 700, 
                      bgcolor: alpha(theme.palette.secondary.main, 0.1),
                      color: 'secondary.main',
                      border: '1px solid',
                      borderColor: 'secondary.main'
                    }} 
                  />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => handleOpen(row)} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Hapus">
                      <IconButton size="small" color="error" onClick={() => { if(window.confirm('Hapus lagu dari pustaka?')) deleteMutation.mutate(row.id) }} sx={{ bgcolor: alpha(theme.palette.error.main, 0.05) }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ px: 4, pt: 4 }}>
          <Typography variant="h5" fontWeight="900">{isEdit ? 'Edit Lagu' : 'Tambah Lagu Baru'}</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pb: 4 }}>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Nomor" sx={{ width: 120 }} 
                value={formData.number} onChange={(e) => setFormData({...formData, number: e.target.value})} 
              />
              <TextField 
                fullWidth label="Judul Lagu" 
                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} 
              />
            </Box>
            <TextField 
              fullWidth label="Kategori" placeholder="Misal: NNBT, KJ, PKJ, NKB"
              value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} 
            />
            <TextField 
              fullWidth multiline rows={10} label="Lirik Lagu" 
              placeholder="Masukkan lirik bait demi bait..."
              value={formData.lyrics} onChange={(e) => setFormData({...formData, lyrics: e.target.value})} 
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '16px' } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Batal</Button>
          <Button variant="contained" onClick={handleSave} sx={{ px: 4 }}>Simpan ke Pustaka</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}