import React, { ReactNode } from 'react';
import './Card.css';

interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hoverable?: boolean;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
    children,
    className = '',
    padding = 'md',
    hoverable = false,
    onClick,
}) => {
    const classes = [
        'card',
        `card--padding-${padding}`,
        hoverable ? 'card--hoverable' : '',
        onClick ? 'card--clickable' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes} onClick={onClick}>
            {children}
        </div>
    );
};

interface CardHeaderProps {
    children: ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
    return <div className={`card__header ${className}`}>{children}</div>;
};

interface CardBodyProps {
    children: ReactNode;
    className?: string;
}

export const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => {
    return <div className={`card__body ${className}`}>{children}</div>;
};

interface CardFooterProps {
    children: ReactNode;
    className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
    return <div className={`card__footer ${className}`}>{children}</div>;
};

export default Card;
