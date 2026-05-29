import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Paper,
  Stack,
  alpha,
  useTheme,
  Divider,
} from '@mui/material';
import { useQuery } from 'react-query';
import {
  EventNote as EventIcon,
  LibraryMusic as SongIcon,
  Slideshow as PPTIcon,
  Group as MemberIcon,
  AutoAwesome as WelcomeIcon,
} from '@mui/icons-material';
import { statsService } from '../api/statsService';

export default function Dashboard() {
  const theme = useTheme();
  const { data: stats, isLoading } = useQuery('dashboardStats', statsService.getStats, {
    initialData: {
      totalLiturgies: 0,
      totalSongs: 0,
      totalPPTs: 0,
      totalSchedules: 0
    }
  });

  const statCards = [
    { title: 'Total Liturgi', value: stats.totalLiturgies, icon: <EventIcon />, color: theme.palette.primary.main },
    { title: 'Pustaka Lagu', value: stats.totalSongs, icon: <SongIcon />, color: theme.palette.secondary.main },
    { title: 'Proyek PPT', value: stats.totalPPTs, icon: <PPTIcon />, color: '#F59E0B' },
    { title: 'Jadwal Petugas', value: stats.totalSchedules, icon: <MemberIcon />, color: '#10B981' },
  ];

  return (
    <Box>
      <Paper 
        elevation={0}
        sx={{ 
          p: 4, 
          mb: 4, 
          borderRadius: '24px', 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
            <WelcomeIcon sx={{ color: alpha('#fff', 0.8) }} />
            <Typography variant="overline" sx={{ letterSpacing: '0.2em', fontWeight: 800, opacity: 0.8 }}>
              SMART WORSHIP SYSTEM
            </Typography>
          </Stack>
          <Typography variant="h3" fontWeight="900" sx={{ mb: 1, fontFamily: 'Outfit' }}>
            Soli Deo Gloria
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400, maxWidth: '600px' }}>
            Selamat melayani! Semua persiapan multimedia Anda kini lebih cerdas, cepat, dan profesional.
          </Typography>
        </Box>
        {/* Abstract background shapes */}
        <Box sx={{ 
          position: 'absolute', top: -50, right: -50, width: 250, height: 250, 
          bgcolor: alpha('#fff', 0.1), borderRadius: '50%' 
        }} />
      </Paper>

      <Grid container spacing={3}>
        {statCards.map((card) => (
          <Grid item xs={12} sm={6} md={3} key={card.title}>
            <Card sx={{ 
              height: '100%',
              border: 'none',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              borderRadius: '20px'
            }}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ 
                    p: 1.5, 
                    borderRadius: '12px', 
                    bgcolor: alpha(card.color, 0.1), 
                    color: card.color,
                    display: 'flex'
                  }}>
                    {card.icon}
                  </Box>
                  <Typography variant="h4" fontWeight="900" color="text.primary">
                    {isLoading ? '...' : card.value}
                  </Typography>
                </Stack>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2, fontWeight: 700 }}>
                  {card.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, borderRadius: '24px', height: '100%' }}>
            <Typography variant="h6" fontWeight="900" sx={{ mb: 3 }}>
              Panduan Pelayanan
            </Typography>
            <Stack spacing={3}>
              {[
                { t: 'Buat Liturgi', d: 'Gunakan template untuk menyusun tata ibadah hari raya.', c: 'primary' },
                { t: 'Import Lagu', d: 'Ekstrak lagu dari PDF ke pustaka digital secara otomatis.', c: 'secondary' },
                { t: 'Generate PPT', d: 'Hasilkan presentasi proyektor dalam hitungan detik.', c: 'amber' },
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ 
                    width: 32, height: 32, borderRadius: '50%', 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, color: 'primary.main', flexShrink: 0
                  }}>
                    {i + 1}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="800">{item.t}</Typography>
                    <Typography variant="body2" color="text.secondary">{item.d}</Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 4, borderRadius: '24px', height: '100%', bgcolor: alpha(theme.palette.secondary.main, 0.02) }}>
            <Typography variant="h6" fontWeight="900" sx={{ mb: 2 }}>
              Status Sistem
            </Typography>
            <Divider sx={{ mb: 3 }} />
            <Stack spacing={2}>
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                <Typography variant="caption" color="text.secondary" fontWeight="700">Database</Typography>
                <Typography variant="body2" fontWeight="800" color="success.main">Terhubung (Online)</Typography>
              </Box>
              <Box sx={{ p: 2, bgcolor: 'white', borderRadius: '16px', border: '1px solid #F1F5F9' }}>
                <Typography variant="caption" color="text.secondary" fontWeight="700">Penyimpanan</Typography>
                <Typography variant="body2" fontWeight="800">850 MB Tersedia</Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}