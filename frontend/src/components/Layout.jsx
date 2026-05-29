import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  Stack,
  useTheme,
  alpha,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  EventNote as EventIcon,
  LibraryMusic as SongIcon,
  Slideshow as PPTIcon,
  Group as MemberIcon,
  Logout,
} from '@mui/icons-material';
import Logo from './Logo';

const drawerWidth = 280;

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('gmim_logged_in');
    localStorage.removeItem('gmim_current_user');
    navigate('/');
    handleMenuClose();
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Manajemen Liturgi', icon: <EventIcon />, path: '/liturgy' },
    { text: 'Pustaka Lagu', icon: <SongIcon />, path: '/songs' },
    { text: 'PPT Generator', icon: <PPTIcon />, path: '/ppt-generator' },
    { text: 'Jadwal Multimedia', icon: <MemberIcon />, path: '/multimedia-schedule' },
  ];

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 4 }}>
        <Logo size="small" />
      </Box>
      
      <List sx={{ px: 2, flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.text}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              selected={isActive}
              sx={{
                borderRadius: '12px',
                mb: 1,
                py: 1.5,
                transition: 'all 0.2s',
                '&.Mui-selected': {
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    right: 12,
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                  }
                },
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  transform: 'translateX(4px)',
                },
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 45, 
                color: isActive ? 'primary.main' : 'text.secondary' 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.95rem'
                }} 
              />
            </ListItemButton>
          );
        })}
      </List>

      <Box sx={{ p: 2, mt: 'auto' }}>
        <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.primary.main, 0.03), border: '1px dashed', borderColor: 'primary.light' }}>
          <Typography variant="caption" fontWeight="bold" color="primary">
            Soli Deo Gloria
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
            Melayani Tuhan dengan sepenuh hati melalui teknologi.
          </Typography>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F1F5F9' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, md: 4 } }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" color="text.primary" fontWeight="800">
            {menuItems.find(item => item.path === location.pathname)?.text || 'Smart Worship'}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton onClick={handleMenuOpen} sx={{ p: 0.5, border: '2px solid', borderColor: 'primary.light' }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '1rem', fontWeight: 800 }}>
                A
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              PaperProps={{
                elevation: 4,
                sx: { mt: 1.5, minWidth: 200, borderRadius: '16px' }
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight="800">Admin Church</Typography>
                <Typography variant="caption" color="text.secondary">admin@smartworship.com</Typography>
              </Box>
              <Divider />
              <MenuItem onClick={handleLogout} sx={{ py: 1.5 }}>
                <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                Keluar
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, border: 'none' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: '1px solid #E2E8F0',
              bgcolor: 'white'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: '64px',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}