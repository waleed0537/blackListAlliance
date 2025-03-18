import React, { useState, useContext } from 'react';
import { FaUserAlt, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import './styles/auth.css';
import AuthContext from './AuthContext';

const Signup = ({ onNavigateToLogin }) => {
    const { signup, error: authError } = useContext(AuthContext);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        setIsLoading(true);
        
        try {
            await signup(name, email, password);
            // No need to navigate - App.jsx will handle this based on auth state
        } catch (err) {
            setError(err.message || 'Signup failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-logo">THE BLACKLIST<span>ALLIANCE</span></h1>
                    <p>- (MARS Advertising LLC)</p>
                </div>
                
                <h2 className="auth-title">Create New Account</h2>
                
                {(error || authError) && <div className="auth-error">{error || authError}</div>}
                
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <div className="input-icon-wrapper">
                            <FaUserAlt className="input-icon" />
                            <input 
                                type="text" 
                                id="name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your full name" 
                                className="form-control"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <div className="input-icon-wrapper">
                            <FaEnvelope className="input-icon" />
                            <input 
                                type="email" 
                                id="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
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
                                placeholder="Create password" 
                                className="form-control"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <div className="input-icon-wrapper">
                            <FaLock className="input-icon" />
                            <input 
                                type="password" 
                                id="confirmPassword" 
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password" 
                                className="form-control"
                            />
                        </div>
                    </div>
                    
                    <div className="form-footer">
                        <button type="submit" className="auth-button" disabled={isLoading}>
                            {isLoading ? 'Creating Account...' : 'Create Account'} {!isLoading && <FaArrowRight />}
                        </button>
                    </div>
                </form>
                
                <div className="auth-alt">
                    <p>Already have an account?</p>
                    <button onClick={onNavigateToLogin} className="auth-alt-button">
                        Login <FaArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Signup;