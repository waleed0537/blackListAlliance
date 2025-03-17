import React, { useState } from 'react';
import { FaUserAlt, FaLock, FaArrowRight } from 'react-icons/fa';
import './styles/auth.css';

const Login = ({ onLogin, onNavigateToSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError('Please fill in all fields');
            return;
        }
        
        // In a real app, you would validate credentials against a backend
        setIsLoading(true);
        
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            onLogin(email);
        }, 1000);
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1 className="auth-logo">THE BLACKLIST<span>ALLIANCE</span></h1>
                    <p>- (MARS Advertising LLC)</p>
                </div>
                
                <h2 className="auth-title">Login to Your Account</h2>
                
                {error && <div className="auth-error">{error}</div>}
                
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