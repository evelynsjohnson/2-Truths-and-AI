/**
 * @fileoverview Reusable Button component with sound effect on click.
 */

import React from 'react';
import './Button.css';
import { useSoundEffect } from '../../hooks/useSoundEffect';

export default function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  className = '',
  ...props 
}) {
  const { playClick } = useSoundEffect();

  // Handle button click with sound effect
  const handleClick = (e) => {
    if (!disabled) {
      playClick();
      onClick?.(e);
    }
  };

  return (
    <button
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
