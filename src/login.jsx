import React, { useState, useContext, useEffect } from 'react';
import { FaUserAlt, FaLock, FaArrowRight } from 'react-icons/fa';
import './styles/auth.css';
import AuthContext from './AuthContext';
import axios from 'axios';

const Login = ({ onNavigateToSignup }) => {
    const { login, error: authError } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);

    // Trigger pre-warming when component mounts
    useEffect(() => {
        const preWarmCache = async () => {
            try {
                // Get the API URL from environment or use default
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                console.log('Pre-warming blacklist data cache on login page load');
                await axios.get(`${API_URL}/api/pre-warm`);
            } catch (error) {
                console.error('Failed to pre-warm cache:', error);
                // Don't show error to user - this is a background operation
            }
        };

        preWarmCache();
    }, []);

    // Track user interaction with form fields
    const handleInteraction = () => {
        if (!hasInteracted) {
            setHasInteracted(true);
            
            // Trigger a more urgent pre-warm when user starts interacting
            const urgentPreWarm = async () => {
                try {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
                    await axios.get(`${API_URL}/api/pre-warm`);
                } catch (error) {
                    console.error('Failed to urgently pre-warm cache:', error);
                }
            };
            
            urgentPreWarm();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        
        setIsLoading(true);
        
        try {
            await login(email, password);
            // No need to navigate - App.jsx will handle this based on auth state
        } catch (err) {
            setError(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-logo">THE DNC<span>ALLIANCE</span></h1>
                    <p>- (MARS Advertising LLC)</p>
                </div>
                
                <h2 className="auth-title">Login to Your Account</h2>
                
                {(error || authError) && <div className="auth-error">{error || authError}</div>}
                
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-icon-wrapper">
                            <FaUserAlt className="input-icon" />
                            <input 
                                type="email" 
                                id="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={handleInteraction}
                                placeholder="Enter your email" 
                                className="form-control"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="input-icon-wrapper">
                            <FaLock className="input-icon" />
                            <input 
                                type="password" 
                                id="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={handleInteraction}
                                placeholder="Enter your password" 
                                className="form-control"
                            />
                        </div>
                    </div>
                    
                    <div className="form-footer">
                        <button type="submit" className="auth-button" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'} {!isLoading && <FaArrowRight />}
                        </button>
                        <div className="auth-links">
                            <a href="#" className="auth-link">Forgot Password?</a>
                        </div>
                    </div>
                </form>
                
                <div className="auth-alt">
                    <p>Don't have an account?</p>
                    <button onClick={onNavigateToSignup} className="auth-alt-button">
                        Create Account <FaArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;