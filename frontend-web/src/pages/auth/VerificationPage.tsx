import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Dumbbell, ArrowLeft } from 'lucide-react';
import authService from '../../services/auth.service';
import Button from '../../components/ui/Button';
import './VerificationPage.css';

interface LocationState {
    emailOrPhone: string;
    userType: 'Coach' | 'Adherent';
}

const VerificationPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as LocationState;

    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Redirect if no state
    useEffect(() => {
        if (!state?.emailOrPhone || !state?.userType) {
            navigate('/signup');
        }
    }, [state, navigate]);

    // Countdown timer for resend
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setCode(value);
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (code.length !== 6) {
            setError('Please enter a 6-digit code');
            return;
        }

        setError('');
        setIsLoading(true);

        try {
            await authService.verifyCode({
                emailOrPhone: state.emailOrPhone,
                verificationCode: code,
                userType: state.userType,
            });

            // Redirect to dashboard on success
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Invalid or expired verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;

        setError('');
        setIsLoading(true);

        try {
            await authService.sendVerificationCode({
                emailOrPhone: state.emailOrPhone,
                userType: state.userType,
            });

            setResendTimer(60);
            setCanResend(false);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to resend code');
        } finally {
            setIsLoading(false);
        }
    };

    if (!state?.emailOrPhone) {
        return null;
    }

    return (
        <div className="verification-page">
            <div className="verification-page__container">
                <div className="verification-page__header">
                    <div className="verification-page__logo">
                        <Dumbbell size={40} className="verification-page__logo-icon" />
                        <h1 className="verification-page__logo-text">COACHFLOW</h1>
                    </div>
                    <h2 className="verification-page__title">Verify Your Account</h2>
                    <p className="verification-page__subtitle">
                        We've sent a 6-digit code to <strong>{state.emailOrPhone}</strong>
                    </p>
                </div>

                <form className="verification-page__form" onSubmit={handleSubmit}>
                    {error && <div className="verification-page__error">{error}</div>}

                    <div className="verification-page__code-input">
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={6}
                            value={code}
                            onChange={handleCodeChange}
                            placeholder="000000"
                            className="verification-page__input"
                            autoFocus
                        />
                    </div>

                    <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                        Verify & Continue
                    </Button>

                    <div className="verification-page__resend">
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResend}
                                className="verification-page__resend-btn"
                                disabled={isLoading}
                            >
                                Resend Code
                            </button>
                        ) : (
                            <p className="verification-page__timer">
                                Resend code in {resendTimer}s
                            </p>
                        )}
                    </div>
                </form>

                <div className="verification-page__footer">
                    <Link to="/signup" className="verification-page__back">
                        <ArrowLeft size={16} />
                        Back to Sign Up
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;
