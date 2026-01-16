import React, { InputHTMLAttributes, ReactNode } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helperText?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    fullWidth?: boolean;
}

const Input: React.FC<InputProps> = ({
    label,
    error,
    helperText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    className = '',
    id,
    ...props
}) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const hasError = !!error;

    const wrapperClasses = [
        'input-wrapper',
        fullWidth ? 'input-wrapper--full-width' : '',
    ]
        .filter(Boolean)
        .join(' ');

    const inputClasses = [
        'input',
        leftIcon ? 'input--with-left-icon' : '',
        rightIcon ? 'input--with-right-icon' : '',
        hasError ? 'input--error' : '',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={wrapperClasses}>
            {label && (
                <label htmlFor={inputId} className="input__label">
                    {label}
                </label>
            )}
            <div className="input__container">
                {leftIcon && <div className="input__icon input__icon--left">{leftIcon}</div>}
                <input id={inputId} className={inputClasses} {...props} />
                {rightIcon && <div className="input__icon input__icon--right">{rightIcon}</div>}
            </div>
            {error && <span className="input__error">{error}</span>}
            {helperText && !error && <span className="input__helper">{helperText}</span>}
        </div>
    );
};

export default Input;
