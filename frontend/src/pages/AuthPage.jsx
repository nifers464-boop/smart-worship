import React, { useState } from 'react';
import {
  Box,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Stack,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Email,
  Lock,
  Person,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import apiClient from '../api/apiClient';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });

  // LOGIN
  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast.error('Email dan password wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', loginData);
      localStorage.setItem('gmim_logged_in', 'true');
      localStorage.setItem('gmim_current_user', JSON.stringify(response.data.user));
      toast.success('Login berhasil!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const handleRegister = async () => {
    if (!registerData.name || !registerData.email || !registerData.password) {
      toast.error('Semua field wajib diisi');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/register', registerData);
      toast.success('Registrasi berhasil! Silakan login.');
      setTab(0);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', 
      background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #6366F1 100%)', p: 2 
    }}>
      <Paper elevation={0} sx={{ width: '100%', maxWidth: 460, borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.98)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
        <Box sx={{ p: 5 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}><Logo size="large" /></Box>
            <Chip label="SISTEM MANAJEMEN IBADAH" sx={{ bgcolor: '#F3E8FF', color: '#4338CA', fontWeight: 800 }} />
          </Box>

          <Tabs value={tab} onChange={(e, val) => setTab(val)} variant="fullWidth" sx={{ mb: 4 }}>
            <Tab label="Login" sx={{ fontWeight: 800 }} />
            <Tab label="Daftar" sx={{ fontWeight: 800 }} />
          </Tabs>

          {tab === 0 ? (
            <Stack spacing={3}>
              <TextField 
                fullWidth label="Email" 
                value={loginData.email} 
                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Email color="primary" /></InputAdornment>) }}
              />
              <TextField 
                fullWidth type="password" label="Password" 
                value={loginData.password} 
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Lock color="primary" /></InputAdornment>) }}
              />
              <Button 
                variant="contained" fullWidth size="large" onClick={handleLogin} disabled={loading}
                sx={{ borderRadius: '8px', py: 1.5, fontWeight: 800 }}
              >
                {loading ? 'Memproses...' : 'Masuk Sekarang'}
              </Button>
            </Stack>
          ) : (
            <Stack spacing={3}>
              <TextField 
                fullWidth label="Nama Lengkap" 
                value={registerData.name} 
                onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Person color="primary" /></InputAdornment>) }}
              />
              <TextField 
                fullWidth label="Email" 
                value={registerData.email} 
                onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Email color="primary" /></InputAdornment>) }}
              />
              <TextField 
                fullWidth type="password" label="Password" 
                value={registerData.password} 
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                InputProps={{ startAdornment: (<InputAdornment position="start"><Lock color="primary" /></InputAdornment>) }}
              />
              <Button 
                variant="contained" fullWidth size="large" onClick={handleRegister} disabled={loading}
                sx={{ borderRadius: '8px', py: 1.5, fontWeight: 800, bgcolor: '#06B6D4', '&:hover': { bgcolor: '#0891B2' } }}
              >
                {loading ? 'Memproses...' : 'Daftar Sekarang'}
              </Button>
            </Stack>
          )}
        </Box>
      </Paper>
    </Box>
  );
}