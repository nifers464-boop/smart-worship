import React from 'react';
import { Box, Typography } from '@mui/material';

export default function Logo({ variant = 'full', size = 'medium', sx = {} }) {
  const sizes = {
    small: { icon: 32, text: 'h6', sub: 'caption' },
    medium: { icon: 56, text: 'h5', sub: 'caption' },
    large: { icon: 80, text: 'h3', sub: 'body1' },
  };

  const currentSize = sizes[size];

  const LogoIcon = () => (
    <svg width={currentSize.icon} height={currentSize.icon} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#06B6D4" />
        </linearGradient>
        <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Abstract Modern Shape */}
      <circle cx="50" cy="50" r="45" stroke="url(#logo-grad)" strokeWidth="1" strokeDasharray="5 5" opacity="0.3" />
      <path d="M50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C69.33 85 85 69.33 85 50" stroke="url(#logo-grad)" strokeWidth="8" strokeLinecap="round" />
      
      {/* The Cross - Stylized */}
      <rect x="46" y="25" width="8" height="40" rx="4" fill="url(#logo-grad)" filter="url(#glow-filter)" />
      <rect x="30" y="38" width="40" height="8" rx="4" fill="url(#logo-grad)" filter="url(#glow-filter)" />
      
      {/* Pulse Rings */}
      <circle cx="50" cy="50" r="10" fill="url(#logo-grad)" opacity="0.2" />
    </svg>
  );

  if (variant === 'icon') {
    return <LogoIcon />;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ...sx }}>
      <Box sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 1,
        background: 'rgba(99, 102, 241, 0.05)',
        borderRadius: '8px',
      }}>

        <LogoIcon />
      </Box>
      <Box>
        <Typography 
          variant={currentSize.text} 
          sx={{ 
            fontWeight: 900, 
            color: variant === 'sidebar' ? '#FFFFFF' : '#0F172A', 
            lineHeight: 1,
            letterSpacing: '-0.04em',
            textTransform: 'uppercase'
          }}
        >
          Smart<span style={{ color: '#06B6D4' }}>Worship</span>
        </Typography>
        <Typography 
          variant={currentSize.sub} 
          sx={{ 
            color: variant === 'sidebar' ? 'rgba(255, 255, 255, 0.4)' : '#64748B', 
            fontWeight: 800,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            mt: 0.5,
            fontSize: '0.65rem'
          }}
        >
          Soli Deo Gloria
        </Typography>
      </Box>
    </Box>
  );
}