import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const VerifyEmail = () => {
    const { verifyEmail } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState(location.state?.email || '');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const normalizedCode = code.replace(/\D/g, '');
        if (!email || normalizedCode.length !== 6) {
            setError('Enter your email address and the six-digit code.');
            return;
        }

        setLoading(true);
        setError('');
        const result = await verifyEmail(email, normalizedCode);
        setLoading(false);

        if (result.success) {
            navigate('/login', { state: { message: 'Email verified. Please sign in.' } });
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="login-page">
            <div className="login-bg-pattern" />
            <div className="login-container">
                <div className="login-card">
                    <div className="login-logo-section">
                        <div className="login-logo">RentFlow</div>
                        <p className="login-logo-subtitle">Email verification</p>
                    </div>
                    <h1>Enter verification code</h1>
                    <p className="login-subtitle">We sent a six-digit code to your email. It expires in 10 minutes.</p>
                    {location.state?.message && <div className="login-success-message">{location.state.message}</div>}
                    {error && <div className="login-error-message">{error}</div>}
                    <form onSubmit={handleSubmit}>
                        <div className="login-form-group">
                            <label htmlFor="email">Email address</label>
                            <input id="email" type="email" className="login-input" value={email} onChange={(event) => setEmail(event.target.value)} required />
                        </div>
                        <div className="login-form-group">
                            <label htmlFor="code">Six-digit code</label>
                            <input id="code" inputMode="numeric" autoComplete="one-time-code" className="login-input" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="123456" required />
                        </div>
                        <button type="submit" className="login-btn" disabled={loading}>{loading ? 'Verifying...' : 'Verify email'}</button>
                    </form>
                    <p className="login-signup-link">Need a new code? <Link to="/login">Sign in again</Link>.</p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
