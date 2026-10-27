import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Puffy clay surface card.
 * Features 3-layer soft drop shadow + top inset highlight + bottom inset shade.
 */
export function ClayCard({
  children,
  className = '',
  hover = true,
  ...props
}) {
  return (
    <div
      className={`clay-card ${hover ? 'clay-card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Clay Button.
 * Supports `to` for react-router-dom Link, `href` for external links, or standard <button>.
 */
export function ClayButton({
  children,
  to,
  href,
  onClick,
  disabled,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  const sizeClasses = size === 'sm' ? 'clay-btn-sm' : '';
  const classes = `clay-btn clay-btn-${variant} ${sizeClasses} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} aria-disabled={disabled} {...props}>
        {children}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}

/**
 * Clay Pill Badge (e.g. Nav logo container or status tag)
 */
export function ClayPill({
  children,
  accent = false,
  className = '',
  ...props
}) {
  return (
    <div
      className={`clay-pill ${accent ? 'clay-pill-accent' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
