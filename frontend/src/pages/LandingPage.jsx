import React, { useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  LibraryMusic as SongIcon,
  Slideshow as PPTIcon,
  EventNote as EventIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const navigate = useNavigate();
  const featuresRef = useRef(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const features = [
    {
      title: 'Manajemen Liturgi',
      desc: 'Kelola alur ibadah dengan mudah, rapi, dan terstruktur sesuai agenda gereja.',
      icon: <EventIcon color="primary" sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Pustaka Lagu Digital',
      desc: 'Akses cepat ke ribuan lagu dari KJ, PKJ, NKB, hingga lagu kontemporer.',
      icon: <SongIcon color="secondary" sx={{ fontSize: 40 }} />,
    },
    {
      title: 'PPT Generator',
      desc: 'Hasilkan presentasi ibadah profesional dalam satu klik tanpa repot copy-paste.',
      icon: <PPTIcon color="primary" sx={{ fontSize: 40 }} />,
    },
    {
      title: 'Sistem Terintegrasi',
      desc: 'Satu platform cerdas untuk seluruh kebutuhan multimedia dan jadwal petugas.',
      icon: <AutoAwesomeIcon color="warning" sx={{ fontSize: 40 }} />,
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', overflow: 'hidden' }}>
      {/* NAVBAR */}
      <Box sx={{ 
        py: 2, px: { xs: 2, md: 6 }, 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        bgcolor: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 1000 
      }}>
        <Logo size="small" />
        <Button 
          variant="contained" 
          onClick={() => navigate('/auth')}
          sx={{ borderRadius: '8px', fontWeight: 800, px: 3 }}
        >
          Masuk Sekarang
        </Button>
      </Box>

      {/* HERO SECTION */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
        pt: { xs: 8, md: 12 }, pb: { xs: 10, md: 15 } 
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={8} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={10} textAlign="center">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
              >
                <Typography variant="h1" sx={{ fontSize: { xs: '2.8rem', md: '4.5rem' }, mb: 3, lineHeight: 1.1 }}>
                  Melayani Tuhan dengan <br/><span style={{ color: '#6366F1' }}>Teknologi Cerdas</span>
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 6, lineHeight: 1.8, fontWeight: 400, maxWidth: '700px' }}>
                  Smart Worship menyederhanakan persiapan multimedia ibadah Anda. 
                  Fokuslah pada pelayanan, biarkan sistem kami menangani sisanya.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                  <Button 
                    variant="contained" 
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => navigate('/auth')}
                    sx={{ py: 2, px: 5, borderRadius: '12px' }}
                  >
                    Mulai Sekarang
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large" 
                    onClick={scrollToFeatures}
                    sx={{ py: 2, px: 5, borderRadius: '12px', borderWidth: 2, '&:hover': { borderWidth: 2 } }}
                  >
                    Pelajari Lebih Lanjut
                  </Button>
                </Stack>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FEATURES SECTION */}
      <Box ref={featuresRef} sx={{ bgcolor: 'white', py: 15 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="overline" sx={{ color: '#6366F1', fontWeight: 800, letterSpacing: '0.2em' }}>
              FITUR UNGGULAN
            </Typography>
            <Typography variant="h2" sx={{ mt: 2 }}>
              Semua yang Anda Butuhkan <br/> dalam <span style={{ color: '#06B6D4' }}>Satu Platform</span>
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {features.map((f, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <motion.div whileHover={{ y: -10 }} transition={{ duration: 0.3 }}>
                  <Card sx={{ 
                    height: '100%', p: 4, borderRadius: '16px', 
                    border: '1px solid #F1F5F9', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' 
                  }}>
                    <CardContent sx={{ p: 0 }}>
                      <Box sx={{ 
                        mb: 4, p: 2, bgcolor: '#F8FAFC', borderRadius: '12px', 
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center' 
                      }}>
                        {f.icon}
                      </Box>
                      <Typography variant="h5" sx={{ mb: 2, fontWeight: 800 }}>{f.title}</Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {f.desc}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* FOOTER */}
      <Box sx={{ py: 8, bgcolor: '#0F172A', color: 'white' }}>
        <Container maxWidth="lg">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="center" spacing={4}>
            <Logo size="small" variant="sidebar" />
            <Typography variant="body2" sx={{ opacity: 0.5 }}>
              © 2026 Smart Worship System. Memberdayakan Pelayanan Melalui Teknologi.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
