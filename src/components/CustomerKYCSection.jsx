import React from 'react';
import '../styles/CustomerKYCSection.css';
import PhotoCapture from './PhotoCapture';
import BiometricCapture from './BiometricCapture';

const CustomerKYCSection = ({ customerId }) => {
    return (
        <div className="kyc-section-flex">
            <PhotoCapture
                customerId={customerId}
            />
            <div className="kyc-divider" />
            <BiometricCapture
                customerId={customerId}
            />
        </div>
    );
};

export default CustomerKYCSection;
