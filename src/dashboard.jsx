import React, { useState, useContext, useEffect } from 'react';
import './styles/dashboard.css';
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
    FaMapMarked
} from 'react-icons/fa';
import FileUploader from './FileUploader';
import AuthContext from './AuthContext';
import { useBlacklistData } from './BlacklistContext';

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
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showFirewall, setShowFirewall] = useState(false);
    const [numberResult, setNumberResult] = useState(null);
    const [emailResult, setEmailResult] = useState(null);
    const [numberError, setNumberError] = useState(null);
    const [emailError, setEmailError] = useState(null);
    const [numberLoading, setNumberLoading] = useState(false);
    const [emailLoading, setEmailLoading] = useState(false);
    const [isRefreshingStats, setIsRefreshingStats] = useState(false);
    const apiKey = "Pkcka4f2BbdHh2FhzJtx";

    // Contact form states
    const [showContactForm, setShowContactForm] = useState(false);
    const [contactName, setContactName] = useState('');
    const [contactEmail, setContactEmail] = useState('');
    const [contactSubject, setContactSubject] = useState('');
    const [contactMessage, setContactMessage] = useState('');
    const [contactSubmitting, setContactSubmitting] = useState(false);
    const [contactSuccess, setContactSuccess] = useState(false);
    const [contactError, setContactError] = useState(null);

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

    // Function to handle contact form submission
    // Function to handle contact form submission
// Updated handleContactSubmit function for dashboard.jsx
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
            await refreshData(true); // Force refresh data from server
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

            // Simulate loading delay
            setTimeout(() => {
                setIsLoading(false);
                setShowFirewall(true);
            }, 800);
        } else if (activeSection === section) {
            setActiveSection(null);
        } else {
            setActiveSection(section);
        }
    };

    const goBackToDashboard = () => {
        setShowFirewall(false);
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


    const handlePhoneLookup = () => {
        // Remove any non-digit characters except the plus sign at the start
        const cleanedNumber = phoneNumber.replace(/[^\+\d]/g, '');

        // Validate number format
        const phoneRegex = /^\+\d{10,15}$/; // Validates numbers starting with + and having 10-15 digits

        if (!cleanedNumber) {
            setNumberError("Please enter a phone number");
            return;
        }

        if (!phoneRegex.test(cleanedNumber)) {
            setNumberError("Please enter a valid phone number with country code (e.g., +1 for US)");
            return;
        }

        // Extract the last 10 digits for API call
        const apiPhoneNumber = cleanedNumber.slice(-10);

        setNumberResult(null);
        setNumberError(null);
        setNumberLoading(true);

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

                // Log additional details to help with debugging
                console.log('API Response Type:', typeof data);
                console.log('API Response Keys:', Object.keys(data));

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

        // Use Vite proxy configuration
        const apiUrl = `/api/emailbulk?key=${apiKey}`;

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                emails: [trimmedEmail]
            })
        };

        fetch(apiUrl, options)
            .then(async (res) => {
                const contentType = res.headers.get('content-type');

                // Handle non-JSON responses
                if (!contentType?.includes('application/json')) {
                    const text = await res.text();
                    console.error('Non-JSON response:', text);
                    throw new Error('Server returned unexpected format');
                }

                const data = await res.json();

                if (!res.ok) {
                    console.error('API error response:', data);
                    throw new Error(data.message || `HTTP error ${res.status}`);
                }

                // Handle array response
                const result = Array.isArray(data) ? data[0] : data;

                return {
                    match: result.status === 0,
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
                setEmailError(err.message.includes('unexpected format')
                    ? 'Service temporarily unavailable. Please try again later.'
                    : err.message);
                setEmailLoading(false);
            });
    };

    const clearPhone = () => {
        setPhoneNumber('');
        setNumberResult(null);
        setNumberError(null);
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
                        <h1>THE BLACKLIST<span>ALLIANCE</span></h1>
                        <p>- (MARS Advertising LLC)</p>
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
                            <li className={`nav-item ${!showFirewall ? 'active' : ''}`} onClick={goBackToDashboard}>
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
                                        <li>Edit Account</li>
                                        <li>Blacklist Academy</li>
                                        <li>Legal Support</li>
                                        <li className={showFirewall ? 'active' : ''}>Litigation Firewall</li>
                                        <li>Number Evaluation Engine</li>
                                        <li>Case Database</li>
                                        <li>Submit Number to Prelitigation</li>
                                    </ul>
                                )}
                            </li>
                            <li className="nav-item">
                                <FaBook />
                                <span>User Guide</span>
                            </li>
                            <li className="nav-item">
                                <FaCog />
                                <span>Standalone Application</span>
                            </li>
                            <li className="nav-item">
                                <FaCog />
                                <span>DNC Version Certification</span>
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
                            <p>Loading Litigation Firewall...</p>
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
                                                        placeholder="Enter phone number (e.g., +1 for US)"
                                                        value={phoneNumber}
                                                        onChange={(e) => setPhoneNumber(e.target.value)}
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
                                                                        <div className="result-detail-item">
                                                                            <span className="detail-label">Formatted Number:</span>
                                                                            <span className="detail-value">{numberResult.formatted}</span>
                                                                        </div>
                                                                        {/* Optional: Show API-returned phone number for debugging */}
                                                                        {numberResult.apiPhone && (
                                                                            <div className="result-detail-item">
                                                                                <span className="detail-label">API Phone:</span>
                                                                                <span className="detail-value">{numberResult.apiPhone}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Debug section */}
                                                            <details>
                                                                <summary>Debug: Raw API Response</summary>
                                                                <pre>{JSON.stringify(numberResult.rawResponse, null, 2)}</pre>
                                                            </details>
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
                                                <p>Check an email address against the Blacklist Database. You can enter an email or MD5 hashed address.</p>
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
                                                                        <div className="result-detail-item">
                                                                            <span className="detail-label">Formatted Email:</span>
                                                                            <span className="detail-value">{emailResult.formatted}</span>
                                                                        </div>
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

                                                            {/* Debug section */}
                                                            <details>
                                                                <summary>Debug: Raw API Response</summary>
                                                                <pre>{JSON.stringify(emailResult.rawResponse, null, 2)}</pre>
                                                            </details>
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
                                                <p>Upload a CSV file with email addresses to scrub against the Blacklist Database.</p>
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
                    ) : (
                        <>
                            <div className="welcome-section">
                                <h2>Hello {user?.name || 'MARS Advertising LLC'},</h2>
                                <div className="stats-container">
                                    <div className="stat-item">
                                        <div className="stat-header">
                                            <span className="stat-label">New Blacklisted Numbers Today</span>
                                            <button
                                                className="refresh-button"
                                                onClick={handleRefreshBlacklistData}
                                                disabled={isRefreshingStats}
                                                title="Refresh Stats"
                                            >
                                                <FaSync className={isRefreshingStats ? 'spinning' : ''} />
                                            </button>
                                        </div>
                                        {isLoadingBlacklistData ? (
                                            <div className="stat-loading">Loading...</div>
                                        ) : blacklistError ? (
                                            <div className="stat-error">Error loading data</div>
                                        ) : (
                                            <span className="stat-value">{newBlacklistedNumbers || '—'}</span>
                                        )}
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-header">
                                            <span className="stat-label">Remaining Scrubs</span>
                                        </div>
                                        {isLoadingBlacklistData ? (
                                            <div className="stat-loading">Loading...</div>
                                        ) : blacklistError ? (
                                            <div className="stat-error">Error loading data</div>
                                        ) : (
                                            <span className="stat-value">{remainingScrubs || '—'}</span>
                                        )}
                                    </div>
                                </div>
                                {lastUpdated && (
                                    <div className="last-updated">
                                        Last updated: {formatLastUpdated()}
                                    </div>
                                )}
                            </div>

                            <div className="cards-grid">
                                {/* Litigation Firewall Card */}
                                <div className="card">
                                    <div className="card-content">
                                        <div className="card-icon">
                                            <div className="icon-bg litigation">
                                                <FaBalanceScale />
                                            </div>
                                        </div>
                                        <div className="card-details">
                                            <h3>LITIGATION FIREWALL</h3>
                                            <p>View usage stats, scrub CSV files, upload internal DNC files, and access API docs</p>
                                        </div>
                                    </div>
                                    <button className="card-action" onClick={() => toggleSection('litigation')}>
                                        Access Litigation Firewall <FaArrowRight />
                                    </button>
                                </div>

                                {/* Access Case Database Card */}
                                <div className="card">
                                    <div className="card-content">
                                        <div className="card-icon">
                                            <div className="icon-bg database">
                                                <FaDatabase />
                                            </div>
                                        </div>
                                        <div className="card-details">
                                            <h3>ACCESS CASE DATABASE</h3>
                                            <p>Search cases, plaintiffs, attorneys, and defendants</p>
                                        </div>
                                    </div>
                                    <button className="card-action">
                                        Access Case Database <FaArrowRight />
                                    </button>
                                </div>

                                {/* Contact Legal Support Card */}
                                <div className="card">
                                    <div className="card-content">
                                        <div className="card-icon">
                                            <div className="icon-bg support">
                                                <FaBalanceScale />
                                            </div>
                                        </div>
                                        <div className="card-details">
                                            <h3>CONTACT LEGAL SUPPORT</h3>
                                            <p>Request assistance with a TCPA claim or compliance matter</p>
                                        </div>
                                    </div>
                                    <button className="card-action">
                                        Access Form <FaArrowRight />
                                    </button>
                                </div>

                                {/* Contact Us Card - NEW */}
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

                                {/* Account Card */}
                                <div className="card">
                                    <div className="card-content">
                                        <div className="card-icon">
                                            <div className="icon-bg account">
                                                <FaCog />
                                            </div>
                                        </div>
                                        <div className="card-details">
                                            <h3>ACCOUNT</h3>
                                            <p>MARS Advertising LLC</p>
                                            <p>View account details and configure your scrub preferences</p>
                                        </div>
                                    </div>
                                    <button className="card-action">
                                        View Account Details <FaArrowRight />
                                    </button>
                                </div>

                                {/* Caller ID Check Card */}
                                <div className="card">
                                    <div className="card-content">
                                        <div className="card-icon">
                                            <div className="icon-bg caller">
                                                <FaPhoneAlt />
                                            </div>
                                        </div>
                                        <div className="card-details">
                                            <h3>CALLER ID CHECK</h3>
                                            <p>Included monthly lookups: 1000</p>
                                            <p>Use the Number Evaluation Engine to check whether outbound DIDs have been reported to the FTC or FCC.</p>
                                        </div>
                                    </div>
                                    <button className="card-action">
                                        Access Engine <FaArrowRight />
                                    </button>
                                </div>

                                {/* Blacklist Academy Card */}
                                <div className="card">
                                    <div className="card-content">
                                        <div className="card-icon">
                                            <div className="icon-bg academy">
                                                <FaGraduationCap />
                                            </div>
                                        </div>
                                        <div className="card-details">
                                            <h3>BLACKLIST ACADEMY LOGIN</h3>
                                            <p>Take online classes and access legal and compliance resources</p>
                                        </div>
                                    </div>
                                    <button className="card-action">
                                        Login To Blacklist Academy <FaArrowRight />
                                    </button>
                                </div>

                                {/* Pre-litigation Feed Card */}
                                <div className="card">
                                    <div className="card-content">
                                        <div className="card-icon">
                                            <div className="icon-bg prelitigation">
                                                <FaBalanceScale />
                                            </div>
                                        </div>
                                        <div className="card-details">
                                            <h3>PRE-LITIGATION FEED REQUESTS</h3>
                                            <p>Submit high risk numbers to be added to the Pre-litigation Feed</p>
                                        </div>
                                    </div>
                                    <button className="card-action">
                                        Submit Request <FaArrowRight />
                                    </button>
                                </div>

                                {/* Number Verifier Card */}
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
                                            <button className="secondary-action">Create New Account</button>
                                        </div>
                                    </div>
                                    <button className="card-action">
                                        Access Number Verifier <FaArrowRight />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                    <footer className="dashboard-footer">
                        <div className="footer-content">
                            <div className="footer-company">
                                <div className="footer-logo">
                                    <p><FaBuilding className="footer-icon" /> THE BLACKLIST<span>ALLIANCE</span></p>
                                    <p><FaBriefcase className="footer-icon" /> A division of MARS Advertising LLC</p>
                                </div>
                                <div className="footer-address">
                                    <p><FaMapMarkerAlt className="footer-icon" /> 1250 Broadway, 36th Floor</p>
                                    <p><FaMapMarked className="footer-icon" /> New York, NY 10001, United States</p>
                                </div>
                            </div>
                            
                            <div className="footer-contact">
                                <p><FaPhoneAlt className="footer-icon" /> +1 (212) 555-8765</p>
                                <p><FaEnvelope className="footer-icon" /> support@blacklistalliance.com</p>
                                <p><FaClock className="footer-icon" /> Mon-Fri: 9:00 AM - 5:00 PM EST</p>
                                <div className="footer-social">
                                    <a href="#" className="social-icon"><FaTwitter /></a>
                                    <a href="#" className="social-icon"><FaFacebookF /></a>
                                    <a href="#" className="social-icon"><FaLinkedinIn /></a>
                                </div>
                            </div>
                        </div>
                        
                        <div className="footer-bottom">
                            <p className="footer-copyright">©2025 The Blacklist Alliance Ltd. All Rights Reserved. A US-based company.</p>
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
        </div>
    );
};

export default Dashboard;