import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import CustomerInfo from './CustomerInfo';
import { API_URL } from '../assets/config';
import '../styles/SecondaryHolder.css';

const SecondaryHolder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const customerData = location.state?.customer;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        customerInfo: customerData || {}
    });

    const handleCustomerInfoUpdate = (data) => {
        setFormData(prev => ({
            ...prev,
            customerInfo: { ...prev.customerInfo, ...data }
        }));
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('authToken');

            await fetch(`${API_URL}/customers/secondary-holder/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            toast.success('Secondary holder added successfully!');
            navigate(-1); // Go back to previous page
        } catch (error) {
            toast.error('Failed to add secondary holder');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="secondary-holder-container">
            <div className="stages-progress">
                <div className="stage active">
                    Secondary Holder Info
                </div>
            </div>
            <div className="stage-container">
                <CustomerInfo
                    initialData={formData.customerInfo}
                    onUpdate={handleCustomerInfoUpdate}
                />
                <div className="stage-actions">
                    <button
                        className="back-button"
                        onClick={() => navigate(-1)}
                    >
                        Back
                    </button>
                    <button
                        className="submit-button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecondaryHolder;
