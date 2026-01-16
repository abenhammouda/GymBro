import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Dumbbell, User, Phone, Calendar, Ruler } from 'lucide-react';
import authService from '../../services/auth.service';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import type { RegisterCoachRequest, RegisterAdherentRequest } from '../../types';
import './SignUpPage.css';

type UserRole = 'Coach' | 'Adherent';

const SignUpPage: React.FC = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState<UserRole>('Coach');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Coach form data
    const [coachData, setCoachData] = useState<RegisterCoachRequest>({
        name: '',
        email: '',
        phoneNumber: '',
        password: '',
        bio: '',
        specialization: '',
    });

    // Adherent form data
    const [adherentData, setAdherentData] = useState<RegisterAdherentRequest>({
        name: '',
        email: '',
        password: '',
        dateOfBirth: '',
        gender: undefined,
        height: undefined,
    });

    const handleCoachChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setCoachData({
            ...coachData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleAdherentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAdherentData({
            ...adherentData,
            [name]: name === 'height' ? (value ? parseFloat(value) : undefined) : value,
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (selectedRole === 'Coach') {
                // Validate at least email or phone
                if (!coachData.email && !coachData.phoneNumber) {
                    setError('Please provide either an email or phone number');
                    setIsLoading(false);
                    return;
                }

                await authService.registerCoach(coachData);
                // Navigate to verification page with email/phone
                navigate('/verify', {
                    state: {
                        emailOrPhone: coachData.email || coachData.phoneNumber,
                        userType: 'Coach',
                    },
                });
            } else {
                await authService.registerAdherent(adherentData);
                // Navigate to verification page with email
                navigate('/verify', {
                    state: {
                        emailOrPhone: adherentData.email,
                        userType: 'Adherent',
                    },
                });
            }
        } catch (err: any) {
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="signup-page">
            <div className="signup-page__container">
                <div className="signup-page__header">
                    <div className="signup-page__logo">
                        <Dumbbell size={40} className="signup-page__logo-icon" />
                        <h1 className="signup-page__logo-text">COACHFLOW</h1>
                    </div>
                    <h2 className="signup-page__title">Create Account</h2>
                    <p className="signup-page__subtitle">Join us and start your coaching journey</p>
                </div>

                {/* Role Selector */}
                <div className="signup-page__role-selector">
                    <button
                        type="button"
                        className={`signup-page__role-btn ${selectedRole === 'Coach' ? 'signup-page__role-btn--active' : ''}`}
                        onClick={() => setSelectedRole('Coach')}
                    >
                        I'm a Coach
                    </button>
                    <button
                        type="button"
                        className={`signup-page__role-btn ${selectedRole === 'Adherent' ? 'signup-page__role-btn--active' : ''}`}
                        onClick={() => setSelectedRole('Adherent')}
                    >
                        I'm an Adherent
                    </button>
                </div>

                <form className="signup-page__form" onSubmit={handleSubmit}>
                    {error && <div className="signup-page__error">{error}</div>}

                    {selectedRole === 'Coach' ? (
                        <>
                            <Input
                                type="text"
                                name="name"
                                label="Full Name"
                                placeholder="Enter your full name"
                                value={coachData.name}
                                onChange={handleCoachChange}
                                leftIcon={<User size={18} />}
                                fullWidth
                                required
                            />

                            <Input
                                type="email"
                                name="email"
                                label="Email"
                                placeholder="Enter your email"
                                value={coachData.email}
                                onChange={handleCoachChange}
                                leftIcon={<Mail size={18} />}
                                fullWidth
                            />

                            <Input
                                type="tel"
                                name="phoneNumber"
                                label="Phone Number"
                                placeholder="Enter your phone number"
                                value={coachData.phoneNumber}
                                onChange={handleCoachChange}
                                leftIcon={<Phone size={18} />}
                                fullWidth
                            />

                            <Input
                                type="password"
                                name="password"
                                label="Password"
                                placeholder="Create a password"
                                value={coachData.password}
                                onChange={handleCoachChange}
                                leftIcon={<Lock size={18} />}
                                fullWidth
                                required
                            />

                            <div className="signup-page__input-group">
                                <label className="signup-page__label">Specialization</label>
                                <input
                                    type="text"
                                    name="specialization"
                                    placeholder="e.g., Weight Loss, Muscle Building"
                                    value={coachData.specialization}
                                    onChange={handleCoachChange}
                                    className="signup-page__input"
                                />
                            </div>

                            <div className="signup-page__input-group">
                                <label className="signup-page__label">Bio</label>
                                <textarea
                                    name="bio"
                                    placeholder="Tell us about yourself"
                                    value={coachData.bio}
                                    onChange={handleCoachChange}
                                    className="signup-page__textarea"
                                    rows={3}
                                />
                            </div>
                        </>
                    ) : (
                        <>
                            <Input
                                type="text"
                                name="name"
                                label="Full Name"
                                placeholder="Enter your full name"
                                value={adherentData.name}
                                onChange={handleAdherentChange}
                                leftIcon={<User size={18} />}
                                fullWidth
                                required
                            />

                            <Input
                                type="email"
                                name="email"
                                label="Email"
                                placeholder="Enter your email"
                                value={adherentData.email}
                                onChange={handleAdherentChange}
                                leftIcon={<Mail size={18} />}
                                fullWidth
                                required
                            />

                            <Input
                                type="password"
                                name="password"
                                label="Password"
                                placeholder="Create a password"
                                value={adherentData.password}
                                onChange={handleAdherentChange}
                                leftIcon={<Lock size={18} />}
                                fullWidth
                                required
                            />

                            <Input
                                type="date"
                                name="dateOfBirth"
                                label="Date of Birth"
                                value={adherentData.dateOfBirth}
                                onChange={handleAdherentChange}
                                leftIcon={<Calendar size={18} />}
                                fullWidth
                            />

                            <div className="signup-page__input-group">
                                <label className="signup-page__label">Gender</label>
                                <select
                                    name="gender"
                                    value={adherentData.gender || ''}
                                    onChange={handleAdherentChange}
                                    className="signup-page__select"
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <Input
                                type="number"
                                name="height"
                                label="Height (cm)"
                                placeholder="Enter your height"
                                value={adherentData.height?.toString() || ''}
                                onChange={handleAdherentChange}
                                leftIcon={<Ruler size={18} />}
                                fullWidth
                            />
                        </>
                    )}

                    <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
                        Sign Up
                    </Button>
                </form>

                <div className="signup-page__footer">
                    <p className="signup-page__footer-text">
                        Already have an account?{' '}
                        <Link to="/login" className="signup-page__link">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignUpPage;
