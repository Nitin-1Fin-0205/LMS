import React, { useState } from 'react';
import { toast } from 'react-toastify';
import BiometricCapture from './BiometricCapture';

const BiometricRegistration = ({ customerId, onComplete }) => {
    const [biometricData, setBiometricData] = useState({});
    const [loading, setLoading] = useState(false);

    // Define required fingers
    const requiredFingers = ['right-index', 'right-thumb'];

    const handleBiometricUpdate = (data) => {
        setBiometricData(data);
    };

    const handleSubmit = async () => {
        // Check if all required fingerprints are captured
        const missingFingers = requiredFingers.filter(finger => !biometricData[finger]);

        if (missingFingers.length > 0) {
            toast.error(`Missing required fingerprints: ${missingFingers.map(f => f.replace('-', ' ')).join(', ')}`);
            return;
        }

        setLoading(true);

        try {
            // Format data for API submission
            const formattedData = Object.entries(biometricData).map(([finger, data]) => ({
                customerId,
                fingerPosition: finger,
                template: data.template,
                wsqImage: data.wsq,
                quality: data.quality
            }));

            // Example API call - replace with your actual API
            // const response = await axios.post('/api/biometrics/register', formattedData);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            toast.success('Biometric registration completed successfully');

            if (onComplete) {
                onComplete(formattedData);
            }
        } catch (error) {
            console.error('Biometric registration failed:', error);
            toast.error('Failed to register biometrics. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="biometric-registration">
            <BiometricCapture
                onUpdate={handleBiometricUpdate}
                required={requiredFingers}
            />

            <div className="form-actions">
                <button
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={loading || requiredFingers.some(finger => !biometricData[finger])}
                >
                    {loading ? 'Processing...' : 'Submit Biometrics'}
                </button>
            </div>
        </div>
    );
};

export default BiometricRegistration;
