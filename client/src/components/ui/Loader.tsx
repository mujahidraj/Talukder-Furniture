import React from 'react';

interface LoaderProps {
  text?: string;
}

export default function Loader({ text = "Loading..." }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full py-24">
      <div className="relative flex items-center justify-center w-56 h-56 mb-6">
        <img src="/LOGO.gif" alt="Loading..." className="w-full h-full object-contain" />
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
