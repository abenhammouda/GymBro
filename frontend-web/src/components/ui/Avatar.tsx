import React from 'react';
import './Avatar.css';

interface AvatarProps {
    src?: string;
    alt?: string;
    name?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
    src,
    alt,
    name = '',
    size = 'md',
    className = '',
}) => {
    const getInitials = (fullName: string): string => {
        const names = fullName.trim().split(' ');
        if (names.length >= 2) {
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        }
        return fullName.slice(0, 2).toUpperCase();
    };

    const classes = ['avatar', `avatar--${size}`, className].filter(Boolean).join(' ');

    return (
        <div className={classes}>
            {src ? (
                <img src={src} alt={alt || name} className="avatar__image" />
            ) : (
                <div className="avatar__initials">{getInitials(name)}</div>
            )}
        </div>
    );
};

export default Avatar;
