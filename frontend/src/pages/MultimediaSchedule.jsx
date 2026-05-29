import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Stack,
  Divider,
  Avatar,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AutoAwesome as AutoIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { multimediaService } from '../api/multimediaService';
import toast from 'react-hot-toast';

export default function MultimediaSchedule() {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  const [autoMonth, setAutoMonth] = useState(new Date().getMonth());
  const [autoYear, setAutoYear] = useState(new Date().getFullYear());
  const [newMember, setNewMember] = useState('');
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    name: '',
    shift: 'Minggu Pagi'
  });

  const { data: memberRes = [] } = useQuery('operators', multimediaService.getOperators);
  const members = Array.isArray(memberRes) ? memberRes : (memberRes?.data || []);
  
  const { data: scheduleRes, isLoading } = useQuery('schedules', () => multimediaService.getSchedules());
  const schedules = Array.isArray(scheduleRes) ? scheduleRes : (scheduleRes?.data || []);

  const addMemberMutation = useMutation(multimediaService.createOperator, {
    onSuccess: () => {
      queryClient.invalidateQueries('operators');
      toast.success('Anggota tim berhasil ditambahkan');
      setNewMember('');
    }
  });

  const deleteMemberMutation = useMutation(multimediaService.deleteOperator, {
    onSuccess: () => {
      queryClient.invalidateQueries('operators');
      toast.success('Anggota tim dihapus');
    }
  });

  const createScheduleMutation = useMutation(multimediaService.createSchedule, {
    onSuccess: () => {
      queryClient.invalidateQueries('schedules');
      toast.success('Jadwal berhasil dibuat');
      setOpen(false);
    }
  });

  const deleteScheduleMutation = useMutation(multimediaService.deleteSchedule, {
    onSuccess: () => {
      queryClient.invalidateQueries('schedules');
      toast.success('Jadwal dihapus');
    }
  });

  const handleAutoSchedule = async () => {
    if (members.length === 0) return toast.error('Belum ada anggota tim');
    
    const sundays = [];
    for (let i = 1; i <= 31; i++) {
      const d = new Date(autoYear, autoMonth, i);
      if (d.getMonth() !== autoMonth) break;
      if (d.getDay() === 0) {
        // Build local YYYY-MM-DD to avoid timezone shifting to Saturday
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        sundays.push(`${y}-${m}-${day}`);
      }
    }

    toast.loading('Menghasilkan jadwal otomatis...', { id: 'auto' });
    const shuffledMembers = [...members].sort(() => Math.random() - 0.5);
    
    try {
      for (let i = 0; i < sundays.length; i++) {
        const member = shuffledMembers[i % shuffledMembers.length];
        await multimediaService.createSchedule({
          date: sundays[i],
          name: member.name,
          shift: 'Minggu Pagi'
        });
      }
      queryClient.invalidateQueries('schedules');
      toast.success('Jadwal otomatis berhasil dibuat!', { id: 'auto' });
      setAutoOpen(false);
    } catch (error) {
      toast.error('Gagal membuat jadwal otomatis', { id: 'auto' });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="900" color="primary">Jadwal Multimedia</Typography>
          <Typography variant="body2" color="text.secondary">Atur rotasi petugas multimedia dengan adil dan efisien.</Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button 
            variant="outlined" 
            startIcon={<AutoIcon />} 
            onClick={() => setAutoOpen(true)}
            sx={{ borderRadius: '12px' }}
          >
            Jadwal Otomatis
          </Button>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />} 
            onClick={() => setOpen(true)}
            sx={{ borderRadius: '12px', px: 3 }}
          >
            Buat Jadwal
          </Button>
        </Stack>
      </Box>

      <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', md: 'row' } }}>
        {/* Sidebar: Anggota Tim */}
        <Box sx={{ width: { xs: '100%', md: 300 } }}>
          <Paper sx={{ p: 3, borderRadius: '20px' }}>
            <Typography variant="h6" fontWeight="800" sx={{ mb: 2 }}>Anggota Tim</Typography>
            <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
              <TextField 
                fullWidth size="small" placeholder="Nama..." 
                value={newMember} onChange={(e) => setNewMember(e.target.value)}
              />
              <Button variant="contained" size="small" onClick={() => { if(newMember) addMemberMutation.mutate(newMember) }}>
                <AddIcon />
              </Button>
            </Stack>
            
            <Stack spacing={1.5}>
              {members.map(member => (
                <Box key={member.id} sx={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  p: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.03), borderRadius: '12px',
                  border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.05)
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.7rem' }}>
                      {member.name.charAt(0)}
                    </Avatar>
                    <Typography variant="body2" fontWeight="600">{member.name}</Typography>
                  </Box>
                  <IconButton size="small" color="error" onClick={() => { if(window.confirm('Hapus anggota?')) deleteMemberMutation.mutate(member.id) }}>
                    <DeleteIcon fontSize="inherit" />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Box>

        {/* Main Content: Jadwal */}
        <Box sx={{ flex: 1 }}>
          <TableContainer component={Paper} sx={{ borderRadius: '20px', overflow: 'hidden' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                  <TableCell sx={{ fontWeight: 800 }}>Tanggal</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Petugas Multimedia</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Shift / Keterangan</TableCell>
                  <TableCell sx={{ fontWeight: 800 }} align="right">Aksi</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={4} align="center">Memuat jadwal...</TableCell></TableRow>
                ) : schedules.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center">Belum ada jadwal yang dibuat.</TableCell></TableRow>
                ) : schedules.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ p: 1, bgcolor: alpha(theme.palette.secondary.main, 0.1), borderRadius: '8px', color: 'secondary.main', display: 'flex' }}>
                          <CalendarIcon fontSize="small" />
                        </Box>
                        <Typography variant="body2" fontWeight="600">
                          {new Date(row.date).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        avatar={<Avatar>{(row.name || 'P').charAt(0)}</Avatar>}
                        label={row.name || 'Petugas'} 
                        color="primary" variant="outlined" sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">{row.shift}</Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" color="error" onClick={() => { if(window.confirm('Hapus jadwal?')) deleteScheduleMutation.mutate(row.id) }}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Dialog: Buat Jadwal */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ px: 4, pt: 4 }}>
          <Typography variant="h5" fontWeight="900">Buat Jadwal Baru</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pb: 4, minWidth: 350 }}>
          <TextField
            fullWidth type="date" label="Tanggal" margin="normal" InputLabelProps={{ shrink: true }}
            value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
          <TextField
            select fullWidth label="Pilih Petugas" margin="normal"
            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          >
            {members.map(m => <MenuItem key={m.id} value={m.name}>{m.name}</MenuItem>)}
          </TextField>
          <TextField
            fullWidth label="Shift / Keterangan" margin="normal" placeholder="Misal: Minggu Pagi"
            value={formData.shift} onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
          />
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Batal</Button>
          <Button variant="contained" onClick={() => createScheduleMutation.mutate(formData)} sx={{ px: 4 }}>Simpan Jadwal</Button>
        </DialogActions>
      </Dialog>
      {/* Dialog: Buat Jadwal Otomatis */}
      <Dialog open={autoOpen} onClose={() => setAutoOpen(false)} PaperProps={{ sx: { borderRadius: '24px' } }}>
        <DialogTitle sx={{ px: 4, pt: 4 }}>
          <Typography variant="h5" fontWeight="900">Jadwal Otomatis</Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 4, pb: 4, minWidth: 350 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Sistem akan menugaskan anggota tim secara acak untuk setiap hari Minggu pada bulan dan tahun yang Anda pilih.
          </Typography>
          <Stack spacing={3} direction="row">
            <TextField
              select fullWidth label="Bulan"
              value={autoMonth} onChange={(e) => setAutoMonth(Number(e.target.value))}
            >
              {['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'].map((m, i) => (
                <MenuItem key={i} value={i}>{m}</MenuItem>
              ))}
            </TextField>
            <TextField
              select fullWidth label="Tahun"
              value={autoYear} onChange={(e) => setAutoYear(Number(e.target.value))}
            >
              {[new Date().getFullYear(), new Date().getFullYear() + 1, new Date().getFullYear() + 2].map((y) => (
                <MenuItem key={y} value={y}>{y}</MenuItem>
              ))}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 4, pb: 4 }}>
          <Button onClick={() => setAutoOpen(false)} color="inherit">Batal</Button>
          <Button variant="contained" onClick={handleAutoSchedule} sx={{ px: 4 }} startIcon={<AutoIcon />}>Generate</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}