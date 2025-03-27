import React, { useState, useContext, useEffect } from 'react';
import './styles/dashboard.css';
import './styles/pricing.css';
import './styles/CallerIdCheckCard.css';
import axios from 'axios';
        
import {
    FaHome,
    FaCog,
    FaBook,
    FaBalanceScale,
    FaDatabase,
    FaPhoneAlt,
    FaGraduationCap,
    FaArrowRight,
    FaBars,
    FaTimes,
    FaUserCircle,
    FaChevronDown,
    FaChevronUp,
    FaEnvelope,
    FaSignOutAlt,
    FaSync,
    FaPaperPlane,
    FaCheckCircle,
    FaClock,
    FaMapMarkerAlt,
    FaTwitter,
    FaFacebookF,
    FaLinkedinIn,
    FaBuilding,
    FaBriefcase,
    FaMapMarked,
    FaInfoCircle,
    FaLock,
    FaSearch,
    FaExclamationTriangle,
    FaSpinner
} from 'react-icons/fa';
import FileUploader from './FileUploader';
import AuthContext from './AuthContext';
import { useBlacklistData } from './BlacklistContext';
import CallerIdCheckCard from './CallerIdCheckCard';

const Dashboard = () => {
    const { user, logout } = useContext(AuthContext);
    const {
        newBlacklistedNumbers,
        remainingScrubs,
        isLoading: isLoadingBlacklistData,
        error: blacklistError,
        lastUpdated,
        refreshData
    } = useBlacklistData(); // Use the blacklist data hook

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [functionsOpen, setFunctionsOpen] = useState(false);
    const [activeSection, setActiveSection] = useState(null);
    const [numberCheckOpen, setNumberCheckOpen] = useState(false);
    const [emailCheckOpen, setEmailCheckOpen] = useState(false);
    const [scrubNumberOpen, setScrubNumberOpen] = useState(false);
    const [scrubEmailOpen, setScrubEmailOpen] = useState(false);
    const [apiStatsOpen, setApiStatsOpen] = useState(false);
    // NEW state for caller ID check details toggle - separate from numberCheckOpen
    const [callerIdDetailsOpen, setCallerIdDetailsOpen] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showFirewall, setShowFirewall] = useState(false);
    const [showCallerIdCheck, setShowCallerIdCheck] = useState(false);
    const [showPricing, setShowPricing] = useState(false);
    const [showAccountDetails, setShowAccountDetails] = useState(false);
    const [numberResult, setNumberResult] = useState(null);
    const [emailResult, setEmailResult] = useState(null);
    const [numberError, setNumberError] = useState(null);
    const [emailError, setEmailError] = useState(null);
    const [numberLoading, setNumberLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [isRefreshingStats, setIsRefreshingStats] = useState(false);
    const apiKey = "Pkcka4f2BbdHh2FhzJtx";
    
    // Account profile states
    const [accountName, setAccountName] = useState(user?.name || '');
    const [accountEmail, setAccountEmail] = useState(user?.email || '');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [accountError, setAccountError] = useState(null);
    const [accountSuccess, setAccountSuccess] = useState(null);
    const [accountUpdating, setAccountUpdating] = useState(false);

    // Contact form states
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactSubject, setContactSubject] = useState('');
    const [contactMessage, setContactMessage] = useState('');
    const [contactSubmitting, setContactSubmitting] = useState(false);
    const [contactSuccess, setContactSuccess] = useState(false);
    const [contactError, setContactError] = useState(null);

    // Pricing plan states
    const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);

    // Function to handle opening the contact form
    const openContactForm = () => {
        setShowContactForm(true);
        // Pre-fill the email if user is logged in
        if (user && user.email) {
            setContactEmail(user.email);
        }
        // Pre-fill the name if user is logged in
        if (user && user.name) {
            setContactName(user.name);
        }
    };

    // Function to handle closing the contact form
    const closeContactForm = () => {
        setShowContactForm(false);
        // Reset form state
        setContactSuccess(false);
        setContactError(null);
    };

    // Function to toggle pricing section visibility
    const togglePricing = () => {
        setShowPricing(!showPricing);
    };

    // Functions for plan upgrade
    const handleUpgradeClick = () => {
        setShowUpgradeConfirm(true);
    };
    
    const closeUpgradeModal = () => {
        setShowUpgradeConfirm(false);
    };
    
    const confirmUpgrade = () => {
        // Here you would implement the actual upgrade logic
        // For now, just close the modal and show a success message
        alert('Upgrade request submitted successfully!');
        setShowUpgradeConfirm(false);
    };

    // Function to handle contact form submission
    const handleContactSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form fields
        if (!contactName || !contactEmail || !contactSubject || !contactMessage) {
            setContactError("All fields are required");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contactEmail)) {
            setContactError("Please enter a valid email address");
            return;
        }

        // Set loading state
        setContactSubmitting(true);
        setContactError(null);

        try {
            // Contact form data
            const contactData = {
                name: contactName,
                email: contactEmail,
                subject: contactSubject,
                message: contactMessage
            };

            console.log('Sending contact form data:', contactData);

            // Use axios instead of fetch for better error handling
            
            try {
                const response = await axios.post('http://localhost:5000/api/contact', contactData, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('Email sent successfully:', response.data);
                
                // Set success state
                setContactSubmitting(false);
                setContactSuccess(true);
                
                // Reset form after a delay
                setTimeout(() => {
                    setContactName('');
                    setContactEmail('');
                    setContactSubject('');
                    setContactMessage('');
                }, 3000);
                
            } catch (axiosError) {
                console.error('Axios error:', axiosError);
                
                let errorMessage = 'Failed to send message. Please try again later.';
                
                if (axiosError.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    console.error('Response data:', axiosError.response.data);
                    console.error('Response status:', axiosError.response.status);
                    
                    errorMessage = axiosError.response.data.message || errorMessage;
                } else if (axiosError.request) {
                    // The request was made but no response was received
                    console.error('No response received:', axiosError.request);
                    errorMessage = 'No response from server. Please check your connection.';
                }
                
                setContactSubmitting(false);
                setContactError(errorMessage);
            }
            
        } catch (error) {
            console.error('Error sending contact form:', error);
            setContactSubmitting(false);
            setContactError('Failed to send message. Please try again later.');
        }
    };

    // Function to manually refresh blacklist data
    const handleRefreshBlacklistData = async () => {
        setIsRefreshingStats(true);
        try {
          console.log('Manual refresh button clicked, forcing refresh...');
          
          // No need to set blacklistData directly - refreshData will handle it
          // Wait a moment to ensure loading state is visible
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Trigger refresh with force=true
          await refreshData(true); 
          
          console.log('Manual refresh completed successfully');
        } catch (error) {
          console.error('Error refreshing blacklist data:', error);
        } finally {
          setIsRefreshingStats(false);
        }
    };
    
    const handleNumberUploadComplete = (data) => {
        console.log('Number scrub completed:', data);
        // You can add any additional handling here
        // For example, showing a notification or updating UI
    };

    const handleEmailUploadComplete = (data) => {
        console.log('Email scrub completed:', data);
        // Additional handling
    };

    // Format the lastUpdated time to a friendly string
    const formatLastUpdated = () => {
        if (!lastUpdated) return '';
        const updatedDate = new Date(lastUpdated);
        return updatedDate.toLocaleString();
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const toggleFunctions = () => {
        setFunctionsOpen(!functionsOpen);
    };

    const toggleSection = (section) => {
        if (section === 'litigation') {
            // Show loading screen
            setIsLoading(true);

            // Reset other sections
            setShowCallerIdCheck(false);

            // Simulate loading delay
            setTimeout(() => {
                setIsLoading(false);
                setShowFirewall(true);
            }, 800);
        } else if (section === 'callerid') {
            // Show loading screen
            setIsLoading(true);

            // Reset other sections
            setShowFirewall(false);

            // Simulate loading delay
            setTimeout(() => {
                setIsLoading(false);
                setShowCallerIdCheck(true);
            }, 800);
        } else if (activeSection === section) {
            setActiveSection(null);
        } else {
            setActiveSection(section);
        }
    };

    const goBackToDashboard = () => {
        setShowFirewall(false);
        setShowCallerIdCheck(false);
        // Reset the caller ID details state when going back to dashboard
        setCallerIdDetailsOpen(false);
    };

    const toggleNumberCheck = () => {
        setNumberCheckOpen(!numberCheckOpen);
    };

    const toggleEmailCheck = () => {
        setEmailCheckOpen(!emailCheckOpen);
    };

    const toggleScrubNumber = () => {
        setScrubNumberOpen(!scrubNumberOpen);
    };

    const toggleScrubEmail = () => {
        setScrubEmailOpen(!scrubEmailOpen);
    };

    const toggleApiStats = () => {
        setApiStatsOpen(!apiStatsOpen);
    };

    const handleLogout = () => {
        logout();
    };
    
    // Function to handle redirection to Number Verifier
    const handleAccessNumberVerifier = () => {
        window.open('https://app.numberverifier.com/', '_blank');
    };
    
    // Function to toggle account details panel
    const toggleAccountDetails = () => {
        setShowAccountDetails(!showAccountDetails);
        if (!showAccountDetails) {
            // Reset form when opening
            setAccountName(user?.name || '');
            setAccountEmail(user?.email || '');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setAccountError(null);
            setAccountSuccess(null);
        }
    };
    
    // Function to update account details
    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        
        // Reset status messages
        setAccountError(null);
        setAccountSuccess(null);
        
        // Validate form
        if (!accountName.trim()) {
            setAccountError("Name is required");
            return;
        }
        
        if (!accountEmail.trim()) {
            setAccountError("Email is required");
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(accountEmail)) {
            setAccountError("Please enter a valid email address");
            return;
        }
        
        // Password validation - only check if user is trying to change password
        if (newPassword || confirmPassword || currentPassword) {
            if (!currentPassword) {
                setAccountError("Current password is required to change password");
                return;
            }
            
            if (newPassword !== confirmPassword) {
                setAccountError("New passwords do not match");
                return;
            }
            
            if (newPassword.length < 8) {
                setAccountError("New password must be at least 8 characters");
                return;
            }
        }
        
        setAccountUpdating(true);
        
        try {
            // Create the request data
            const updateData = {
                name: accountName,
                email: accountEmail
            };
            
            // Only include password fields if the user is changing their password
            if (currentPassword && newPassword) {
                updateData.currentPassword = currentPassword;
                updateData.newPassword = newPassword;
            }
            
            // Get API URL from environment or use default
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
            
            // Make API call to update user profile
            const response = await axios.put(
                `${API_URL}/api/user/profile`, 
                updateData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': localStorage.getItem('token')
                    }
                }
            );
            
            // Handle successful response
            if (response.data.success) {
                setAccountSuccess(response.data.message || "Account information updated successfully!");
                
                // Update the user in localStorage
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = {
                    ...currentUser,
                    name: accountName,
                    email: accountEmail
                };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                // Clear password fields
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                
                // Update user context if available
                if (user) {
                    user.name = accountName;
                    user.email = accountEmail;
                }
            }
        } catch (error) {
            console.error('Error updating account:', error);
            
            let errorMessage = "Failed to update account. Please try again later.";
            
            if (error.response) {
                // Extract error message from API response
                errorMessage = error.response.data.message || errorMessage;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setAccountError(errorMessage);
        } finally {
            setAccountUpdating(false);
        }
    };

    // UPDATED: Phone lookup function that handles both litigation firewall and caller ID check
    const handlePhoneLookup = () => {
        // Remove any non-digit characters except the plus sign at the start
        const cleanedNumber = phoneNumber.replace(/[^\+\d]/g, '');

        // Validate number format
        const phoneRegex = /^\d{10}$/; // Validates exactly 10 digits

        if (!cleanedNumber) {
            setNumberError("Please enter a phone number");
            return;
        }

        if (!phoneRegex.test(cleanedNumber)) {
            setNumberError("Please enter a 10-digit phone number");
            return;
        }

        // Extract the last 10 digits for API call
        const apiPhoneNumber = cleanedNumber;

        setNumberResult(null);
        setNumberError(null);
        setNumberLoading(true);
        // Reset the details section toggle when starting a new lookup
        setCallerIdDetailsOpen(false);

        // For the Caller ID Check page, we'll use the NEE (Number Evaluation Engine) API
        // which has a different endpoint and response format
        if (showCallerIdCheck) {
            console.log('Using NEE API for Caller ID Check');
            
            axios.get(`https://api.blacklistalliance.net/nee?key=${apiKey}&phone=${encodeURIComponent(apiPhoneNumber)}`, {
                headers: {
                    'accept': 'application/json'
                }
            })
            .then(response => {
                const data = response.data;
                console.log('NEE API Response:', JSON.stringify(data, null, 2));
                
                // Check if there are FTC complaints or FCC (Cbg) reports
                const hasFtcComplaint = data.FtcComplaint !== null;
                const hasCbgReports = data.Cbg !== null && data.Cbg.length > 0;
                
                console.log('Has FTC complaint:', hasFtcComplaint);
                console.log('Has CBG reports:', hasCbgReports);
                
                // Create result object with all data needed for display
                const formattedResult = {
                    match: hasFtcComplaint || hasCbgReports,
                    formatted: cleanedNumber,
                    apiPhone: data.Phone,
                    rawResponse: data
                };
                
                setNumberResult(formattedResult);
                setNumberLoading(false);
            })
            .catch(error => {
                console.error('NEE API Call Error:', error);
                setNumberError(`Failed to check number: ${error.message || 'Unknown error'}`);
                setNumberLoading(false);
            });
        } else {
            // For the Litigation Firewall, use the original API
            const options = { method: 'GET', headers: { accept: 'application/json' } };
            fetch(`https://api.blacklistalliance.net/standard/api/v3/Lookup/key/${apiKey}/phone/${encodeURIComponent(apiPhoneNumber)}/response/json`, options)
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`Error: ${res.status} ${res.statusText}`);
                    }
                    return res.json();
                })
                .then(data => {
                    // Log the ENTIRE API response to console
                    console.log('Full API Response:', JSON.stringify(data, null, 2));

                    // Adapt the data structure to match the existing UI expectations
                    const formattedResult = {
                        // Check if the status indicates a successful lookup and no results means not blacklisted
                        match: data.status === 'success' && data.results > 0,
                        lists: [], // Add logic to populate lists if available
                        formatted: cleanedNumber, // Use the original full number
                        apiPhone: data.phone, // Store the API-returned phone number for reference
                        rawResponse: data
                    };

                    setNumberResult(formattedResult);
                    setNumberLoading(false);
                })
                .catch(err => {
                    // Log any errors to console
                    console.error('API Call Error:', err);

                    setNumberError(`Failed to lookup number: ${err.message}`);
                    setNumberLoading(false);
                });
        }
    };

    const handleEmailLookup = () => {
        // Trim and validate email
        const trimmedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        if (!trimmedEmail) {
            setEmailError("Please enter an email address");
            return;
        }
    
        if (!emailRegex.test(trimmedEmail)) {
            setEmailError("Please enter a valid email address");
            return;
        }
    
        setEmailResult(null);
        setEmailError(null);
        setEmailLoading(true);
    
        // Use the full URL to your server
        const serverUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        axios.post(`${serverUrl}/api/email-lookup`, {
            email: trimmedEmail,
            apiKey: apiKey
        })
        .then(response => {
            console.log('Email lookup response:', response.data);
            
            // Handle array response
            const data = response.data;
            const result = Array.isArray(data) ? data[0] : data;
            
            return {
                match: result.status === 0, // Assuming 0 means match, adjust based on API docs
                lists: result.lists || [],
                formatted: trimmedEmail,
                rawResponse: result
            };
        })
        .then(formattedResult => {
            setEmailResult(formattedResult);
            setEmailLoading(false);
        })
        .catch(err => {
            console.error('Email API Error:', err);
            let errorMessage = 'Service temporarily unavailable. Please try again later.';
            
            if (err.response && err.response.data) {
                errorMessage = err.response.data.message || errorMessage;
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setEmailError(errorMessage);
            setEmailLoading(false);
        });
    };
    
    // UPDATED: Clear phone function also resets caller ID details toggle
    const clearPhone = () => {
        setPhoneNumber('');
        setNumberResult(null);
        setNumberError(null);
        setCallerIdDetailsOpen(false);
    };

    const clearEmail = () => {
        setEmail('');
        setEmailResult(null);
        setEmailError(null);
    };
    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <button className="menu-toggle" onClick={toggleSidebar}>
                        <FaBars />
                    </button>
                    <div className="logo">
                        <h1>THE DNC<span>ALLIANCE</span></h1>
                        
                    </div>
                </div>
                <div className="header-right">
                    <div className="user-profile">
                        <FaUserCircle />
                        <span>{user?.email || "User"}</span>
                        <button
                            onClick={handleLogout}
                            className="logout-btn"
                            title="Logout"
                        >
                            <FaSignOutAlt />
                        </button>
                    </div>
                </div>
            </header>

            <div className="dashboard-content">
                {/* Sidebar */}
                <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                    <div className="sidebar-header">
                        <button className="close-sidebar" onClick={toggleSidebar}>
                            <FaTimes />
                        </button>
                    </div>
                    <nav className="sidebar-nav">
                        <ul>
                            <li className={`nav-item ${!showFirewall && !showCallerIdCheck ? 'active' : ''}`} onClick={goBackToDashboard}>
                                <FaHome />
                                <span>Dashboard</span>
                            </li>
                            <li className="nav-item has-submenu">
                                <div className="nav-item-header" onClick={toggleFunctions}>
                                    <div className="nav-item-content">
                                        <FaCog />
                                        <span>Functions</span>
                                    </div>
                                    {functionsOpen ? <FaChevronUp /> : <FaChevronDown />}
                                </div>
                                {functionsOpen && (
                                    <ul className="submenu">
                                        <li className={showFirewall ? 'active' : ''} onClick={() => toggleSection('litigation')}>Litigation Firewall</li>
                                        <li className={showCallerIdCheck ? 'active' : ''} onClick={() => toggleSection('callerid')}>Caller ID Check</li>
                                        <li onClick={toggleAccountDetails}>Account Details</li>
                                        <li onClick={handleAccessNumberVerifier}>Number Verifier</li>
                                        <li onClick={togglePricing}>Account & Billing</li>
                                    </ul>
                                )}
                            </li>
                            <li className="nav-item" onClick={openContactForm}>
                                <FaEnvelope />
                                <span>Contact Us</span>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="main-content">
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="loader"></div>
                            <p>Loading {showFirewall ? 'Litigation Firewall' : 'Caller ID Check'}...</p>
                        </div>
                    ) : showFirewall ? (
                        <div className="firewall-view">
                            <h2 className="page-title">Litigation Firewall</h2>

                            <div className="firewall-section">

                                <div className="accordion-sections">
                                    <div className="accordion-section">
                                        <div className="accordion-header" onClick={toggleNumberCheck}>
                                            <h4>Blacklisted Number Check</h4>
                                            {numberCheckOpen ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>

                                        {numberCheckOpen && (
                                            <div className="accordion-content">
                                                <p>Check a number to determine whether it is on any of the feeds selected in your account configuration.</p>
                                                <div className="input-group">
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        placeholder="Enter a 10-digit phone number"
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                                        maxLength={10}
                                                    />
                                                </div>
                                                <div className="button-group">
                                                    <button
                                                        className="primary-button"
                                                        onClick={handlePhoneLookup}
                                                        disabled={numberLoading}
                                                    >
                                                        {numberLoading ? 'CHECKING...' : 'DO LOOKUP'}
                                                    </button>
                                                    <button className="secondary-button" onClick={clearPhone}>CLEAR</button>
                                                </div>

                                                {numberError && (
                                                    <div className="error-message">
                                                        <p>{numberError}</p>
                                                    </div>
                                                )}

                                                {numberLoading && (
                                                    <div className="result-loading">
                                                        <div className="mini-loader"></div>
                                                        <p>Checking number...</p>
                                                    </div>
                                                )}
                                                {numberResult && (
                                                    <div className="result-container">
                                                        <h4>Results</h4>
                                                        <div className="result-content">
                                                            {numberResult.match === true ? (
                                                                <div className="result-match">
                                                                    <div className="result-icon danger">!</div>
                                                                    <div className="result-message">
                                                                        <p className="result-title">Number is blacklisted</p>
                                                                        <p className="result-detail">This number was found in blacklists.</p>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="result-no-match">
                                                                    <div className="result-icon success">😊</div>
                                                                    <div className="result-message">
                                                                        <p className="result-title">Number is not blacklisted</p>
                                                                        <p className="result-detail">This number was not found in any blacklists.</p>
                                                                      
                                                                      
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Other accordion sections remain the same */}
                                    <div className="accordion-section">
                                        <div className="accordion-header" onClick={toggleEmailCheck}>
                                            <h4>Blacklisted Email Check</h4>
                                            {emailCheckOpen ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>

                                        {emailCheckOpen && (
                                            <div className="accordion-content">
                                                <p>Check an email address against the DNC Database. You can enter an email or MD5 hashed address.</p>
                                                <div className="input-group">
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        placeholder="Email Address"
                                                        value={email}
                                                        onChange={(e) => setEmail(e.target.value)}
                                                    />
                                                </div>
                                                <div className="button-group">
                                                    <button
                                                        className="primary-button"
                                                        onClick={handleEmailLookup}
                                                        disabled={emailLoading}
                                                    >
                                                        {emailLoading ? 'CHECKING...' : 'DO LOOKUP'}
                                                    </button>
                                                    <button className="secondary-button" onClick={clearEmail}>CLEAR</button>
                                                </div>

                                                {emailError && (
                                                    <div className="error-message">
                                                        <p>🚫 {emailError}</p>
                                                        <details>
                                                            <summary>Troubleshooting Tips</summary>
                                                            <ul>
                                                                <li>Ensure the email address is correct</li>
                                                                <li>Check your internet connection</li>
                                                                <li>Try again later</li>
                                                                <li>Contact support if the issue persists</li>
                                                            </ul>
                                                        </details>
                                                    </div>
                                                )}

                                                {emailLoading && (
                                                    <div className="result-loading">
                                                        <div className="mini-loader"></div>
                                                        <p>Checking email...</p>
                                                    </div>
                                                )}

                                                {emailResult && (
                                                    <div className="result-container">
                                                        <h4>Results</h4>
                                                        <div className="result-content">
                                                            {emailResult.match ? (
                                                                <div className="result-match">
                                                                    <div className="result-icon danger">!</div>
                                                                    <div className="result-message">
                                                                        <p className="result-title">Email is blacklisted</p>
                                                                        <p className="result-detail">This email was found in the following lists:</p>
                                                                        <ul className="result-lists">
                                                                            {emailResult.lists.map((list, index) => (
                                                                                <li key={index}>{list}</li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="result-no-match">
                                                                    <div className="result-icon success">😊</div>
                                                                    <div className="result-message">
                                                                        <p className="result-title">Email is not blacklisted</p>
                                                                        <p className="result-detail">This email was not found in any blacklists.</p>
                                                                        
                                                                        {emailResult.domain && (
                                                                            <div className="result-detail-item">
                                                                                <span className="detail-label">Domain:</span>
                                                                                <span className="detail-value">{emailResult.domain}</span>
                                                                            </div>
                                                                        )}
                                                                        {emailResult.disposable !== undefined && (
                                                                            <div className="result-detail-item">
                                                                                <span className="detail-label">Disposable:</span>
                                                                                <span className="detail-value">{emailResult.disposable ? 'Yes' : 'No'}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="accordion-section">
                                        <div className="accordion-header" onClick={toggleScrubNumber}>
                                            <h4>Scrub Number File</h4>
                                            {scrubNumberOpen ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>

                                        {scrubNumberOpen && (
                                            <div className="accordion-content">
                                                <p>Upload a CSV file with phone numbers to scrub against all selected feeds.</p>
                                                <FileUploader
                                                    fileType="phone"
                                                    apiKey={apiKey}
                                                    onUploadComplete={handleNumberUploadComplete}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="accordion-section">
                                        <div className="accordion-header" onClick={toggleScrubEmail}>
                                            <h4>Scrub Email File</h4>
                                            {scrubEmailOpen ? <FaChevronUp /> : <FaChevronDown />}
                                        </div>

                                        {scrubEmailOpen && (
                                            <div className="accordion-content">
                                                <p>Upload a CSV file with email addresses to scrub against the DNC Database.</p>
                                                <FileUploader
                                                    fileType="email"
                                                    apiKey={apiKey}
                                                    onUploadComplete={handleEmailUploadComplete}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : showCallerIdCheck ? (
                        <div className="caller-id-view">
                            <h2 className="page-title">Caller ID Check</h2>
                            
                            <div className="caller-id-section">
                                <div className="info-box">
                                    <FaExclamationTriangle className="info-icon" />
                                    <p>
                                        This tool checks whether a number has been reported to the FTC or FCC 
                                        in connection with a telemarketing complaint. Enter a 10-digit phone 
                                        number to evaluate.
                                    </p>
                                </div>
                                
                                <div className="search-box">
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter 10-digit phone number"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' && !numberLoading) {
                                                    handlePhoneLookup();
                                                }
                                            }}
                                        />
                                        {phoneNumber && (
                                            <button 
                                                className="clear-button" 
                                                onClick={clearPhone} 
                                                disabled={numberLoading}
                                            >
                                                <FaTimes />
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="button-group">
                                        <button 
                                            className="primary-button" 
                                            onClick={handlePhoneLookup}
                                            disabled={numberLoading}
                                        >
                                            {numberLoading ? (
                                                <>
                                                    <FaSpinner className="spinning" /> Checking...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSearch /> Check Number
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            className="secondary-button"
                                            onClick={goBackToDashboard}
                                        >
                                            Back to Dashboard
                                        </button>
                                    </div>
                                </div>
                                
                                {numberError && (
                                    <div className="error-message">
                                        <p>{numberError}</p>
                                    </div>
                                )}
                                
                                {numberLoading && (
                                    <div className="result-loading">
                                        <div className="mini-loader"></div>
                                        <p>Checking number...</p>
                                    </div>
                                )}
                                
                                {numberResult && (
                                    <div className="result-container">
                                        <div className={`result-header ${numberResult.match ? 'reported' : 'not-reported'}`}>
                                            {numberResult.match ? (
                                                <>
                                                    <FaExclamationTriangle className="result-icon warning" />
                                                    <span>The number has been reported to the FTC or FCC</span>
                                                </>
                                            ) : (
                                                <>
                                                    <FaCheckCircle className="result-icon success" />
                                                    <span>The number has not been reported to the FTC or FCC</span>
                                                </>
                                            )}
                                            
                                            {/* Use callerIdDetailsOpen state for the details toggle */}
                                            {numberResult.match && (
                                                <button 
                                                    className="toggle-details-button"
                                                    onClick={() => setCallerIdDetailsOpen(!callerIdDetailsOpen)}
                                                    aria-label="Toggle details"
                                                >
                                                    {callerIdDetailsOpen ? <FaChevronUp /> : <FaChevronDown />}
                                                </button>
                                            )}
                                        </div>
                                        
                                        {/* Show details using callerIdDetailsOpen state */}
                                        {numberResult.match && callerIdDetailsOpen && (
                                            <div className="result-details">
                                                {numberResult.rawResponse && numberResult.rawResponse.FtcComplaint && (
                                                    <div className="detail-section">
                                                        <h3>FTC Complaint</h3>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Report Count:</span>
                                                            <span className="detail-value">{numberResult.rawResponse.FtcComplaint.count || "N/A"}</span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Subject:</span>
                                                            <span className="detail-value">{numberResult.rawResponse.FtcComplaint.subject || "N/A"}</span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Recorded Message Or Robocall:</span>
                                                            <span className="detail-value">{numberResult.rawResponse.FtcComplaint.recorded_message_or_robo || "N/A"}</span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Reported On FTC:</span>
                                                            <span className="detail-value">{numberResult.rawResponse.FtcComplaint.create_date || "N/A"}</span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Violation Date:</span>
                                                            <span className="detail-value">{numberResult.rawResponse.FtcComplaint.violation_date || "N/A"}</span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Consumer City:</span>
                                                            <span className="detail-value">{numberResult.rawResponse.FtcComplaint.consumer_city || "N/A"}</span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Consumer State:</span>
                                                            <span className="detail-value">{numberResult.rawResponse.FtcComplaint.consumer_state || "N/A"}</span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Consumer Area Code:</span>
                                                            <span className="detail-value">{numberResult.rawResponse.FtcComplaint.consumer_area_code || "N/A"}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {numberResult.rawResponse && numberResult.rawResponse.Cbg && numberResult.rawResponse.Cbg.length > 0 && (
                                                    <div className="detail-section">
                                                        <h3>FCC Reports</h3>
                                                        {numberResult.rawResponse.Cbg.map((report, index) => (
                                                            <div key={index} className="fcc-report">
                                                                <h4>Report #{index + 1}</h4>
                                                                <div className="detail-row">
                                                                    <span className="detail-label">Create Date:</span>
                                                                    <span className="detail-value">
                                                                        {new Date(report.ticket_created).toLocaleString() || "N/A"}
                                                                    </span>
                                                                </div>
                                                                <div className="detail-row">
                                                                    <span className="detail-label">Issue:</span>
                                                                    <span className="detail-value">{report.issue || "N/A"}</span>
                                                                </div>
                                                                <div className="detail-row">
                                                                    <span className="detail-label">Type of Call:</span>
                                                                    <span className="detail-value">{report.type_of_call_or_messge || "N/A"}</span>
                                                                </div>
                                                                <div className="detail-row">
                                                                    <span className="detail-label">Location:</span>
                                                                    <span className="detail-value">
                                                                        {`${report.city || ""}, ${report.state || ""} ${report.zip || ""}`.trim() || "N/A"}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                {(!numberResult.rawResponse || 
                                                  (!numberResult.rawResponse.FtcComplaint && 
                                                   (!numberResult.rawResponse.Cbg || numberResult.rawResponse.Cbg.length === 0))
                                                 ) && (
                                                    <div className="detail-section">
                                                        <p>No detailed complaint information available.</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="welcome-section">
                                <div className="welcome-header">
                                    <h2>Hello {user?.name}</h2>
                                    <button 
                                        className="action-button billing-button" 
                                        onClick={togglePricing}
                                    >
                                        {showPricing ? 'Hide Account & Billing' : 'View Account & Billing'}
                                    </button>
                                </div>
                                
                                {/* Display pricing section when showPricing is true */}
                                {showPricing && (
                                    <div className="pricing-section">
                                        <h2 className="section-title">Account &amp; Billing</h2>
                                        
                                        <div className="pricing-overview">
                                            <div className="pricing-card current-plan">
                                                <div className="pricing-header">
                                                    <h3>Current Blacklist Plan:</h3>
                                                    <div className="plan-name">Enterprise - $2,500 - 30 MM</div>
                                                    
                                                    <div className="plan-details">
                                                        <div className="detail-row">
                                                            <span className="detail-label">Current Scrub Limit:</span>
                                                            <span className="detail-value">35,000,000</span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Scrub Usage:</span>
                                                            <span className="detail-value highlight">100,383,237</span>
                                                        </div>
                                                        <div className="detail-row">
                                                            <span className="detail-label">Renew Date:</span>
                                                            <span className="detail-value">1st</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="pricing-footer">
                                                    <div className="current-cycle">
                                                        <h4>Current Cycle</h4>
                                                        <div className="price">$500.00</div>
                                                        <div className="prev-cycles">Prev Cycles</div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="pricing-card usage-summary">
                                                <div className="usage-row header">
                                                    <div className="usage-cell">Usage Cycle</div>
                                                    <div className="usage-cell">Scrub Usage</div>
                                                    <div className="usage-cell">Overage Amt</div>
                                                    <div className="usage-cell">Overage Cost:</div>
                                                </div>
                                                
                                                <div className="usage-row">
                                                    <div className="usage-cell"></div>
                                                    <div className="usage-cell highlight-blue">100,383,237</div>
                                                    <div className="usage-cell highlight-red">65,383,237</div>
                                                    <div className="usage-cell">
                                                        <div className="cost">$0.0010</div>
                                                        <div className="waiver-note">(This amount waived with approved upgrade below)</div>
                                                    </div>
                                                </div>
                                                
                                                <div className="usage-row total">
                                                    <div className="usage-cell">Total Usage</div>
                                                    <div className="usage-cell highlight-red">100,383,237</div>
                                                    <div className="usage-cell highlight-red">65,383,237</div>
                                                    <div className="usage-cell">
                                                        <div className="total-cost highlight-red">$65,383.24</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="upgrade-section">
                                            <div className="upgrade-header">
                                                <h3>Plan Needed:</h3>
                                                <div className="plan-tag">ENT+</div>
                                                <div className="plan-name">Enterprise Plus - $3,000 - 50MM</div>
                                                <div className="plan-price">$3,000</div>
                                            </div>
                                            
                                            <div className="special-offer">
                                                <div className="offer-label">Special Offer:</div>
                                                <div className="offer-value">125,000,000</div>
                                                <div className="offer-condition">*with ongoing upgrade approval</div>
                                            </div>
                                            
                                            <div className="plan-description">
                                                <h4>Upgraded Plan Description</h4>
                                                <ul className="feature-list">
                                                    <li><span className="bullet">•</span> Scrub 100mm numbers against the Litigation Firewall</li>
                                                    <li><span className="bullet">•</span> Litigation monitoring and alerts</li>
                                                    <li><span className="bullet">•</span> Unlimited attorney consultations</li>
                                                    <li><span className="bullet">•</span> Five prepaid settlements or compliance reviews per year</li>
                                                    <li><span className="bullet">•</span> 1000 phone number reputation queries per month</li>
                                                    <li><span className="bullet">•</span> Fifty logins to the <span className="highlight-feature"> DNC Academy </span> compliance training and legal resource platform</li>
                                                </ul>
                                            </div>
                                            
                                            <div className="savings-summary">
                                                <div className="detail-row">
                                                    <span className="detail-label">Overage Cost:</span>
                                                    <span className="detail-value highlight-red">$65,383.24</span>
                                                </div>
                                                <div className="detail-row savings">
                                                    <span className="detail-label">SAVINGS</span>
                                                    <span className="detail-value highlight-green">$64,883.24</span>
                                                </div>
                                            </div>
                                            
                                            <div className="payment-action">
                                                <div className="payment-box">
                                                    <h4>Pay Today:</h4>
                                                    <div className="price">$500.00</div>
                                                </div>
                                                
                                                <button className="upgrade-button" onClick={handleUpgradeClick}>
                                                    Upgrade Plan <FaArrowRight />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                
                                
                              
                            </div>

                            <div className="cards-grid">
                                {/* 1. LITIGATION FIREWALL Card */}
                                <div className="card">
                                    <div className="card-content">
                                        <div className="card-icon">
                                            <div className="icon-bg litigation">
                                                <FaBalanceScale />
                                            </div>
                                        </div>
                                        <div className="card-details">
                                            <h3>LITIGATION FIREWALL</h3>
                                            <p>Check blacklisted numbers and emails, scrub number and email files.</p>
                                        </div>
                                    </div>
                                    <button className="card-action" onClick={() => toggleSection('litigation')}>
                                        Access Litigation Firewall <FaArrowRight />
                                    </button>
                                </div>

                                {/* 2. CALLER ID CHECK Card */}
                                <CallerIdCheckCard onNavigate={toggleSection} />

                                {/* 3. NUMBER VERIFIER Card */}
                                <div className="card">
                                    <div className="card-content">
                                        <div className="card-icon">
                                            <div className="icon-bg verifier">
                                                <FaPhoneAlt />
                                            </div>
                                        </div>
                                        <div className="card-details">
                                            <h3>NUMBER VERIFIER</h3>
                                            <p>Identify Caller IDs wrongly tagged as spam by carrier algorithms, manage Caller IDs in real time, increase answer rates and boost conversions.</p>
                                        </div>
                                    </div>
                                    <button className="card-action" onClick={handleAccessNumberVerifier}>
                                        Access Number Verifier <FaArrowRight />
                                    </button>
                                </div>

                                {/* 4. CONTACT US Card */}
                                <div className="card">
                                    <div className="card-content">
                                        <div className="card-icon">
                                            <div className="icon-bg contact">
                                                <FaEnvelope />
                                            </div>
                                        </div>
                                        <div className="card-details">
                                            <h3>CONTACT US</h3>
                                            <p>Have questions or feedback? Reach out to our support team</p>
                                        </div>
                                    </div>
                                    <button className="card-action" onClick={openContactForm}>
                                        Contact Support <FaArrowRight />
                                    </button>
                                </div>

                                {/* 5. ACCOUNT Card */}
                                <div className="card">
                                    <div className="card-content">
                                        <div className="card-icon">
                                            <div className="icon-bg account">
                                                <FaCog />
                                            </div>
                                        </div>
                                        <div className="card-details">
                                            <h3>ACCOUNT</h3>
                                            <p>View account profile and edit your details</p>
                                        </div>
                                    </div>
                                    <button className="card-action" onClick={toggleAccountDetails}>
                                        View Account Details <FaArrowRight />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    <footer className="dashboard-footer">
                        <div className="footer-content">
                            <div className="footer-company">
                                <div className="footer-logo">
                                    <p><FaBuilding className="footer-icon" /> THE DNC<span>ALLIANCE</span></p>
                                    
                                </div>
                                <div className="footer-address">
                                    <p><FaMapMarkerAlt className="footer-icon" /> 1250 Broadway, 36th Floor</p>
                                    <p><FaMapMarked className="footer-icon" /> New York, NY 10001, United States</p>
                                </div>
                            </div>
                            
                            <div className="footer-contact">
                            <p><FaEnvelope className="footer-icon" /> support@dncalliance.com</p>
                                <p><FaClock className="footer-icon" /> Mon-Fri: 9:00 AM - 5:00 PM EST</p>
                                <div className="footer-social">
                                    <a href="#" className="social-icon"><FaTwitter /></a>
                                    <a href="#" className="social-icon"><FaFacebookF /></a>
                                    <a href="#" className="social-icon"><FaLinkedinIn /></a>
                                </div>
                            </div>
                        </div>
                        
                        <div className="footer-bottom">
                            <p className="footer-copyright">©2025 The DNC Alliance Ltd. All Rights Reserved. A US-based company.</p>
                        </div>
                    </footer>
                </main>
            </div>

            {/* Contact Form Modal */}
            {showContactForm && (
                <div className="modal-overlay" onClick={closeContactForm}>
                    <div className="modal-content contact-form-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Contact Support</h2>
                            <button className="modal-close" onClick={closeContactForm}>
                                <FaTimes />
                            </button>
                        </div>
                        
                        {contactSuccess ? (
                            <div className="modal-body">
                                <div className="success-container">
                                    <FaCheckCircle className="success-icon" />
                                    <h3>Message Sent!</h3>
                                    <p>Thank you for contacting us. We've received your message and will respond shortly.</p>
                                    <button className="primary-button" onClick={closeContactForm}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="modal-body">
                                {contactError && (
                                    <div className="error-message">
                                        <p>{contactError}</p>
                                    </div>
                                )}
                                
                                <form className="contact-form" onSubmit={handleContactSubmit}>
                                    <div className="form-group">
                                        <label htmlFor="contactName">Full Name</label>
                                        <input
                                            type="text"
                                            id="contactName"
                                            className="form-control"
                                            placeholder="Your Name"
                                            value={contactName}
                                            onChange={(e) => setContactName(e.target.value)}
                                            disabled={contactSubmitting}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="contactEmail">Email Address</label>
                                        <input
                                            type="email"
                                            id="contactEmail"
                                            className="form-control"
                                            placeholder="your@email.com"
                                            value={contactEmail}
                                            onChange={(e) => setContactEmail(e.target.value)}
                                            disabled={contactSubmitting}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="contactSubject">Subject</label>
                                        <input
                                            type="text"
                                            id="contactSubject"
                                            className="form-control"
                                            placeholder="What is this regarding?"
                                            value={contactSubject}
                                            onChange={(e) => setContactSubject(e.target.value)}
                                            disabled={contactSubmitting}
                                        />
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="contactMessage">Message</label>
                                        <textarea
                                            id="contactMessage"
                                            className="form-control"
                                            placeholder="Type your message here..."
                                            rows="5"
                                            value={contactMessage}
                                            onChange={(e) => setContactMessage(e.target.value)}
                                            disabled={contactSubmitting}
                                        ></textarea>
                                    </div>
                                    
                                    <div className="button-group">
                                        <button 
                                            type="submit" 
                                            className="primary-button"
                                            disabled={contactSubmitting}
                                        >
                                            {contactSubmitting ? (
                                                <>
                                                    <FaSync className="spinning" /> Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <FaPaperPlane /> Send Message
                                                </>
                                            )}
                                        </button>
                                        <button 
                                            type="button" 
                                            className="secondary-button"
                                            onClick={closeContactForm}
                                            disabled={contactSubmitting}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
            
            {/* Upgrade Confirmation Modal */}
            {showUpgradeConfirm && (
                <div className="modal-overlay">
                    <div className="modal-content upgrade-modal">
                        <div className="modal-header">
                            <h2>Confirm Plan Upgrade</h2>
                            <button className="modal-close" onClick={closeUpgradeModal}>×</button>
                        </div>
                        
                        <div className="modal-body">
                            <div className="confirmation-message">
                                <FaInfoCircle className="info-icon" />
                                <p>You are about to upgrade to the <strong>Enterprise Plus</strong> plan for <strong>$3,000</strong> with a one-time payment of <strong>$500.00</strong> today.</p>
                            </div>
                            
                            <div className="upgrade-details">
                                <h4>Your new plan includes:</h4>
                                <ul>
                                    <li><FaCheckCircle className="check-icon" /> 62,500,000 scrubs per month</li>
                                    <li><FaCheckCircle className="check-icon" /> Litigation monitoring and alerts</li>
                                    <li><FaCheckCircle className="check-icon" /> Unlimited attorney consultations</li>
                                    <li><FaCheckCircle className="check-icon" /> Five prepaid settlements/compliance reviews</li>
                                    <li><FaCheckCircle className="check-icon" /> 1000 monthly reputation queries</li>
                                    <li><FaCheckCircle className="check-icon" /> 50 Blacklist Academy logins</li>
                                </ul>
                            </div>
                            
                            <div className="confirmation-summary">
                                <div className="summary-row">
                                    <span>Current overage cost:</span>
                                    <span className="crossed-out">$65,383.24</span>
                                </div>
                                <div className="summary-row">
                                    <span>Today's payment:</span>
                                    <span>$500.00</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Total savings:</span>
                                    <span className="highlight-green">$64,883.24</span>
                                </div>
                            </div>
                            
                            <div className="button-group">
                                <button className="primary-button" onClick={confirmUpgrade}>
                                    Confirm Upgrade
                                </button>
                                <button className="secondary-button" onClick={closeUpgradeModal}>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Account Details Modal */}
            {showAccountDetails && (
                <div className="modal-overlay" onClick={() => setShowAccountDetails(false)}>
                    <div className="modal-content account-details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Account Details</h2>
                            <button className="modal-close" onClick={() => setShowAccountDetails(false)}>
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="modal-body">
                            {accountSuccess && (
                                <div className="success-message">
                                    <FaCheckCircle className="success-icon" />
                                    <p>{accountSuccess}</p>
                                </div>
                            )}
                            
                            {accountError && (
                                <div className="error-message">
                                    <p>{accountError}</p>
                                </div>
                            )}
                            
                            <form className="account-form" onSubmit={handleUpdateAccount}>
                                <div className="form-group">
                                    <label htmlFor="accountName">Full Name</label>
                                    <div className="input-icon-wrapper">
                                        <FaUserCircle className="input-icon" />
                                        <input
                                            type="text"
                                            id="accountName"
                                            className="form-control"
                                            placeholder="Your Name"
                                            value={accountName}
                                            onChange={(e) => setAccountName(e.target.value)}
                                            disabled={accountUpdating}
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="accountEmail">Email Address</label>
                                    <div className="input-icon-wrapper">
                                        <FaEnvelope className="input-icon" />
                                        <input
                                            type="email"
                                            id="accountEmail"
                                            className="form-control"
                                            placeholder="your@email.com"
                                            value={accountEmail}
                                            onChange={(e) => setAccountEmail(e.target.value)}
                                            disabled={accountUpdating}
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-divider">
                                    <h3>Change Password</h3>
                                    <p className="form-note">Leave blank if you don't want to change your password</p>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="currentPassword">Current Password</label>
                                    <div className="input-icon-wrapper">
                                        <FaLock className="input-icon" />
                                        <input
                                            type="password"
                                            id="currentPassword"
                                            className="form-control"
                                            placeholder="Enter current password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            disabled={accountUpdating}
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="newPassword">New Password</label>
                                    <div className="input-icon-wrapper">
                                        <FaLock className="input-icon" />
                                        <input
                                            type="password"
                                            id="newPassword"
                                            className="form-control"
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={accountUpdating}
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="confirmPassword">Confirm New Password</label>
                                    <div className="input-icon-wrapper">
                                        <FaLock className="input-icon" />
                                        <input
                                            type="password"
                                            id="confirmPassword"
                                            className="form-control"
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            disabled={accountUpdating}
                                        />
                                    </div>
                                </div>
                                
                                <div className="button-group">
                                    <button 
                                        type="submit" 
                                        className="primary-button"
                                        disabled={accountUpdating}
                                    >
                                        {accountUpdating ? (
                                            <>
                                                <FaSync className="spinning" /> Updating...
                                            </>
                                        ) : (
                                            <>
                                                <FaCheckCircle /> Save Changes
                                            </>
                                        )}
                                    </button>
                                    <button 
                                        type="button" 
                                        className="secondary-button"
                                        onClick={() => setShowAccountDetails(false)}
                                        disabled={accountUpdating}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;