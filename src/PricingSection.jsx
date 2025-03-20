import React, { useState } from 'react';
import { FaCheckCircle, FaInfoCircle, FaArrowRight } from 'react-icons/fa';
import './styles/pricing.css';

const PricingSection = () => {
    const [showUpgradeConfirm, setShowUpgradeConfirm] = useState(false);
    
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

    return (
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
                                <span className="detail-value">17,500,000</span>
                            </div>
                            <div className="detail-row">
                                <span className="detail-label">Scrub Usage:</span>
                                <span className="detail-value highlight">50,191,618</span>
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
                        <div className="usage-cell highlight-blue">50,191,618</div>
                        <div className="usage-cell highlight-red">32,691,618</div>
                        <div className="usage-cell">
                            <div className="cost">$0.0010</div>
                            <div className="waiver-note">(This amount waived with approved upgrade below)</div>
                        </div>
                    </div>
                    
                    <div className="usage-row total">
                        <div className="usage-cell">Total Usage</div>
                        <div className="usage-cell highlight-red">50,191,618</div>
                        <div className="usage-cell highlight-red">32,691,618</div>
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
                    <div className="offer-value">* 62,500,000</div>
                    <div className="offer-condition">*with ongoing upgrade approval</div>
                </div>
                
                <div className="plan-description">
                    <h4>Upgraded Plan Description</h4>
                    <ul className="feature-list">
                        <li><span className="bullet">•</span> Scrub 50mm numbers against the Litigation Firewall</li>
                        <li><span className="bullet">•</span> Litigation monitoring and alerts</li>
                        <li><span className="bullet">•</span> Unlimited attorney consultations</li>
                        <li><span className="bullet">•</span> Five prepaid settlements or compliance reviews per year</li>
                        <li><span className="bullet">•</span> 1000 phone number reputation queries per month</li>
                        <li><span className="bullet">•</span> Fifty logins to the <span className="highlight-feature">Blacklist Academy</span> compliance training and legal resource platform</li>
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
        </div>
    );
};

export default PricingSection;