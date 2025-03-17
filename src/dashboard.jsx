// Dashboard.jsx
import React, { useState } from 'react';
import './styles/dashboard.css';
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
    FaEnvelope
} from 'react-icons/fa';

const Dashboard = () => {
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
    const apiKey = "Pkcka4f2BbdHh2FhzJtx";

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
                        <span>rainomanraza@gmail.com</span>
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
                                                <div className="file-upload">
                                                    <input type="file" id="number-file" className="file-input" />
                                                    <label htmlFor="number-file" className="file-label">Choose File</label>
                                                    <span className="file-name">No file chosen</span>
                                                </div>
                                                <button className="primary-button mt-10">UPLOAD & SCRUB</button>
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
                                                <div className="file-upload">
                                                    <input type="file" id="email-file" className="file-input" />
                                                    <label htmlFor="email-file" className="file-label">Choose File</label>
                                                    <span className="file-name">No file chosen</span>
                                                </div>
                                                <button className="primary-button mt-10">UPLOAD & SCRUB</button>
                                            </div>
                                        )}
                                    </div>

                                    <div className="accordion-section upload-section">
                                        <div className="upload-header">
                                            <h4>Upload Internal Suppression/DNC File</h4>
                                            <span className="upload-note">(single-column csv or txt files only)</span>
                                        </div>
                                        <div className="file-upload">
                                            <input type="file" id="suppression-file" className="file-input" />
                                            <label htmlFor="suppression-file" className="file-label">Choose File</label>
                                            <span className="file-name">No file chosen</span>
                                        </div>
                                        <button className="primary-button mt-10">UPLOAD</button>
                                    </div>


                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="welcome-section">
                                <h2>Hello MARS Advertising LLC,</h2>
                                <div className="stats-container">
                                    <div className="stat-item">
                                        <span className="stat-label">New Blacklisted Numbers Today</span>
                                        <span className="stat-value">869</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-label">Remaining Scrubs</span>
                                        <span className="stat-value">47,995,198</span>
                                    </div>
                                </div>
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
                        <p>©2025 The Blacklist Alliance Ltd. All Rights Reserved.</p>
                    </footer>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;