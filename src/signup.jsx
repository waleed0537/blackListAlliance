import React, { useState } from 'react';
import { FaUserAlt, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import './styles/auth.css';

const Signup = ({ onSignup, onNavigateToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        // In a real app, you would send the registration data to a backend
        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            onSignup(email);
        }, 1000);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-logo">THE BLACKLIST<span>ALLIANCE</span></h1>
                    <p>- (MARS Advertising LLC)</p>
                </div>
                
                <h2 className="auth-title">Create New Account</h2>
                
                {error && <div className="auth-error">{error}</div>}
                
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