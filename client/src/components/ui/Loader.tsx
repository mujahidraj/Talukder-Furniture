import React from 'react';

interface LoaderProps {
  text?: string;
}

export default function Loader({ text = "Loading..." }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full py-24">
      {/* Fantastic SVG Animated Container */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-10">
        <svg
          className="w-full h-full animate-spin"
          viewBox="0 0 100 100"
          style={{ animationDuration: '3s' }}
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="2"
            strokeDasharray="70 200"
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="none"
            stroke="#8b7355"
            strokeWidth="4"
            strokeDasharray="50 150"
            strokeLinecap="round"
            className="origin-center animate-spin"
            style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}
          />
          <circle
            cx="50"
            cy="50"
            r="25"
            fill="none"
            stroke="#1a1a1a"
            strokeWidth="1"
            strokeDasharray="30 100"
            strokeLinecap="round"
            className="origin-center animate-spin"
            style={{ animationDuration: '2s' }}
          />
        </svg>
        
        {/* Center Pulsing Core */}
        <div className="absolute w-3 h-3 bg-accent rounded-sm rotate-45 animate-pulse shadow-lg"></div>
      </div>
      
      {/* Sleek Text with Bouncing Dots */}
      {text && (
        <div className="flex items-center gap-1">
          <span className="text-sm font-serif italic tracking-[0.2em] text-primary">{text}</span>
          <span className="flex gap-1 ml-2">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </span>
        </div>
      )}
    </div>
  );
}
