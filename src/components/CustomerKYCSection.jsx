import React, { useState } from 'react';
import PhotoCapture from './PhotoCapture';
import BiometricCapture from './BiometricCapture';
import { toast } from 'react-toastify';

const CustomerKYCSection = ({ customerId, holderType, onSuccess, onBack }) => {
    const [fingerprints, setFingerprints] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            // Validate biometric data
            if (!fingerprints || fingerprints.length === 0) {
                toast.error('Please capture fingerprints');
                return;
            }

            // Add any biometric submission logic here
            // await submitBiometricData();

            toast.success('Biometric data captured successfully');

            // Call success callback if provided
            if (onSuccess) {
                onSuccess();
            }

        } catch (error) {
            console.error('Biometric submission error:', error);
            toast.error('Failed to save biometric data');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-sm">
            <div className="flex flex-col lg:flex-row gap-8 min-h-[450px]">
                {/* Photo Capture Section */}
                <div className="flex-1 min-w-0">
                    <PhotoCapture customerId={customerId} />
                </div>

                {/* Divider */}
                <div className="hidden lg:block w-px bg-gray-300"></div>
                <div className="lg:hidden h-px bg-gray-300"></div>

                {/* Biometric Section */}
                <div className="flex-1 min-w-0">

                    <BiometricCapture
                        customerId={customerId}
                    // onFingerprintsCaptured={setFingerprints}
                    />
                </div>
            </div>

            {/* Stage Actions */}
            <div className="stage-actions">
                {onBack && (
                    <button
                        type="button"
                        className="back-button"
                        onClick={onBack}
                        disabled={isSubmitting}
                    >
                        Back
                    </button>
                )}
                <button
                    type="button"
                    className="next-button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Processing...' : 'Home'}
                </button>
            </div>
        </div>
    );
};

export default CustomerKYCSection;
