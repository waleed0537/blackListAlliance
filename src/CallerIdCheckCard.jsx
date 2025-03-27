import React from 'react';
import { FaPhoneAlt, FaArrowRight } from 'react-icons/fa';

const CallerIdCheckCard = ({ onNavigate }) => {
  const handleAccessCallerIdCheck = () => {
    // Call the toggleSection function from the Dashboard component
    if (onNavigate) {
      onNavigate('callerid');
    } else {
      // fallback if onNavigate is not provided
      console.warn('Navigation handler not provided to CallerIdCheckCard');
    }
  };
  
  // Return just the card for the dashboard
  return (
    <div className="card">
      <div className="card-content">
        <div className="card-icon">
          <div className="icon-bg caller-id">
            <FaPhoneAlt />
          </div>
        </div>
        <div className="card-details">
          <h3>CALLER ID CHECK</h3>
          <p>Included monthly lookups: 1000</p>
          <p>Use the Number Evaluation Engine to check whether outbound DIDs have been reported to the FTC or FCC.</p>
        </div>
      </div>
      <button className="card-action" onClick={handleAccessCallerIdCheck}>
        Access Engine <FaArrowRight />
      </button>
    </div>
  );
};

export default CallerIdCheckCard;