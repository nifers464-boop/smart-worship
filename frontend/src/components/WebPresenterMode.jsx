import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { Close as CloseIcon, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';

export default function WebPresenterMode({ slides, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    // Request fullscreen on mount
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().catch(err => console.log(err));
    }

    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') {
        setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.log(err));
      }
    };
  }, [slides.length]);

  const handleClose = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.log(err));
    }
    onClose();
  };

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        bgcolor: '#000',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          maxHeight: '100vh',
          aspectRatio: '16/9',
          bgcolor: '#0F172A',
          backgroundImage: currentSlide.backgroundImage ? `url(${currentSlide.backgroundImage})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 6,
          boxSizing: 'border-box'
        }}
      >
        {/* Semi-transparent overlay to ensure text readability if there's a background image */}
        {currentSlide.backgroundImage && (
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)', zIndex: 1 }} />
        )}

        <Box sx={{ position: 'relative', zIndex: 2, textAlign: 'center', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          {currentSlide.title && (
            <Typography
              variant="h3"
              sx={{
                color: '#38BDF8', // Cyan 400
                fontWeight: 900,
                fontFamily: 'Arial, sans-serif',
                mb: 4,
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
              }}
            >
              {currentSlide.title}
            </Typography>
          )}

          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography
              sx={{
                color: '#FFFFFF',
                fontWeight: 700,
                fontFamily: 'Arial, sans-serif',
                fontSize: currentSlide.content && currentSlide.content.length > 200 ? '2.5vw' : '3.5vw',
                whiteSpace: 'pre-wrap',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                lineHeight: 1.4
              }}
            >
              {currentSlide.content}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Navigation and Controls - Hidden when idle or pure presentation, shown on hover (simplified) */}
      <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 16, right: 16, color: 'white', bgcolor: 'rgba(0,0,0,0.5)' }}>
        <CloseIcon />
      </IconButton>
      
      <IconButton 
        onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))} 
        sx={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'white', bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}
      >
        <ArrowBackIos />
      </IconButton>

      <IconButton 
        onClick={() => setCurrentIndex((prev) => Math.min(slides.length - 1, prev + 1))} 
        sx={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', color: 'white', bgcolor: 'rgba(0,0,0,0.3)', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}
      >
        <ArrowForwardIos />
      </IconButton>
    </Box>
  );
}
