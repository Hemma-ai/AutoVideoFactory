import React from 'react';
import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate, Img } from 'remotion';
import logoImg from './your_logo.png'; 

export const OutroScene: React.FC<{ videoThemeColor: string; videoType: string }> = ({ videoThemeColor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ fps, frame, config: { damping: 20, mass: 2, stiffness: 60 } });
  const logoOpacity = interpolate(frame, [0, 30], [0, 1], { extrapolateRight: 'clamp' });
  const textY = interpolate(frame, [40, 70], [35, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });
  const textOpacity = interpolate(frame, [40, 70], [0, 1], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  return (
    <AbsoluteFill style={{ 
      backgroundColor: '#F8F9FA', 
      justifyContent: 'center', alignItems: 'center',
      boxShadow: `inset 0 0 300px ${videoThemeColor}15`, 
      flexDirection: 'column', gap: '65px'
    }}>
      <div style={{ transform: `scale(${logoScale})`, opacity: logoOpacity, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Img src={logoImg} style={{ width: '620px', objectFit: 'contain' }} />
      </div>

      <div style={{ 
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px',
        transform: `translateY(${textY}px)`, opacity: textOpacity,
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        direction: 'ltr'
      }}>
        <div style={{ fontSize: '46px', fontWeight: '900', color: '#1A1A1A' }}>
         Visit Our Website: <span style={{ color: videoThemeColor }}>www.website.com</span>
        </div>
        <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#555555' }}>
         Whatsapp <span style={{ direction: 'ltr', display: 'inline-block', color: '#1A1A1A' }}>+966 12 34 5678</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};