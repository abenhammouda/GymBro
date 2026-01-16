import React, { ReactNode } from 'react';
import './Badge.css';

interface BadgeProps {
    children: ReactNode;
    variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
    size?: 'sm' | 'md';
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'neutral',
    size = 'md',
    className = '',
}) => {
    const classes = ['badge', `badge--${variant}`, `badge--${size}`, className]
        .filter(Boolean)
        .join(' ');

    return <span className={classes}>{children}</span>;
};

export default Badge;
