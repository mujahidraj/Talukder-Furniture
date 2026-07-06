import React, { useState } from 'react';

const WHATSAPP_NUMBER = '8801966333355';
const DEFAULT_MESSAGE = 'Hello! I\'m interested in your furniture products. Can you help me?';

export default function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="whatsapp-float"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: isHovered ? '10px' : '0px',
        backgroundColor: '#25D366',
        color: 'white',
        borderRadius: '50px',
        padding: isHovered ? '14px 24px 14px 16px' : '14px',
        boxShadow: '0 6px 24px rgba(37, 211, 102, 0.45), 0 2px 8px rgba(0,0,0,0.1)',
        textDecoration: 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        cursor: 'pointer',
      }}
    >
      {/* WhatsApp SVG Icon */}
      <svg
        viewBox="0 0 32 32"
        fill="white"
        style={{
          width: '28px',
          height: '28px',
          flexShrink: 0,
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))',
        }}
      >
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.908 15.908 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.342 22.616c-.39 1.1-1.932 2.014-3.17 2.28-.848.18-1.956.322-5.686-1.222-4.774-1.974-7.842-6.826-8.08-7.142-.23-.316-1.89-2.516-1.89-4.8 0-2.282 1.196-3.404 1.62-3.868.39-.426 1.022-.62 1.628-.62.196 0 .372.01.53.018.466.02.7.048 1.008.778.384.914 1.32 3.218 1.436 3.452.118.234.234.542.078.856-.148.32-.276.52-.508.798-.234.278-.452.49-.686.79-.214.262-.454.542-.194.996.26.45 1.156 1.906 2.482 3.088 1.706 1.52 3.144 1.992 3.59 2.212.346.172.758.134.988-.11.294-.312.658-.828 1.028-1.338.264-.366.596-.41.976-.248.384.158 2.434 1.148 2.852 1.358.418.21.696.316.798.49.1.172.1.998-.292 2.1z" />
      </svg>

      {/* Hover text */}
      <span
        style={{
          fontSize: '14px',
          fontWeight: 600,
          letterSpacing: '0.3px',
          whiteSpace: 'nowrap',
          maxWidth: isHovered ? '200px' : '0px',
          overflow: 'hidden',
          opacity: isHovered ? 1 : 0,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        Chat with us
      </span>

      {/* Pulse animation ring */}
      <span
        style={{
          position: 'absolute',
          inset: '-4px',
          borderRadius: '50px',
          border: '2px solid rgba(37, 211, 102, 0.4)',
          animation: 'whatsapp-pulse 2s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />

      <style>{`
        @keyframes whatsapp-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 0; }
        }
      `}</style>
    </a>
  );
}
