import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Dumbbell } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import './LoginPage.css';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [userType, setUserType] = useState<'Coach' | 'Adherent'>('Coach');
    const [formData, setFormData] = useState({
        emailOrPhone: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(formData.emailOrPhone, formData.password, userType);
            navigate('/dashboard');
        } catch (err: any) {
            const errorMessage = err.message || 'Login failed. Please check your credentials.';

            // Check if error is about unverified account
            if (errorMessage.includes('verify your account') || errorMessage.includes('verification code')) {
                setError(errorMessage);
                // Navigate to verification page after a short delay
                setTimeout(() => {
                    navigate('/verify', {
                        state: {
                            emailOrPhone: formData.emailOrPhone,
                            userType: userType,
                        },
                    });
                }, 2000);
            } else {
                setError(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-page__container">
                <div className="login-page__header">
                    <div className="login-page__logo">
                        <Dumbbell size={40} className="login-page__logo-icon" />
                        <h1 className="login-page__logo-text">COACHFLOW</h1>
                    </div>
                    <h2 className="login-page__title">Welcome Back</h2>
                    <p className="login-page__subtitle">Sign in to your account to continue</p>
                </div>

                {/* User Type Selector */}
                <div className="login-page__role-selector">
                    <button
                        type="button"
                        className={`login-page__role-btn ${userType === 'Coach' ? 'login-page__role-btn--active' : ''}`}
                        onClick={() => setUserType('Coach')}
                    >
                        Coach
                    </button>
                    <button
                        type="button"
                        className={`login-page__role-btn ${userType === 'Adherent' ? 'login-page__role-btn--active' : ''}`}
                        onClick={() => setUserType('Adherent')}
                    >
                        Adherent
                    </button>
                </div>

                <form className="login-page__form" onSubmit={handleSubmit}>
                    {error && <div className="login-page__error">{error}</div>}

                    <Input
                        type="text"
                        name="emailOrPhone"
                        label="Email or Phone Number"
                        placeholder="Enter your email or phone"
                        value={formData.emailOrPhone}
                        onChange={handleChange}
                        leftIcon={<Mail size={18} />}
                        fullWidth
                        required
                    />

                    <Input
                        type="password"
                        name="password"
                        label="Password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        leftIcon={<Lock size={18} />}
                        fullWidth
                        required
                    />

                    <div className="login-page__forgot">
                        <Link to="/forgot-password" className="login-page__link">
                            Forgot password?
                        </Link>
                    </div>

                    <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                        Sign In
                    </Button>
                </form>

                <div className="login-page__footer">
                    <p className="login-page__footer-text">
                        Don't have an account?{' '}
                        <Link to="/signup" className="login-page__link">
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
