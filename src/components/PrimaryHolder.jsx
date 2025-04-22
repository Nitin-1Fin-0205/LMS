import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import CustomerInfo from './CustomerInfo';
import LockerRentDetails from './LockerRentDetails';
import BiometricCapture from './BiometricCapture';
import { API_URL } from '../assets/config';
import '../styles/PrimaryHolder.css';
import { useNavigate } from 'react-router-dom';

const PrimaryHolder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const customerData = location.state?.customer;
    const [currentStage, setCurrentStage] = useState('customer-info');
    const [centers, setCenters] = useState([]);
    const [isLoadingCenters, setIsLoadingCenters] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        customerInfo: customerData || {},
        lockerInfo: {},
        rentDetails: {},
        biometric: {}
    });

    const fetchCenters = async () => {
        try {
            setIsLoadingCenters(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/lockers/locker-centers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCenters(response.data);
        } catch (error) {
            toast.error('Failed to fetch centers');
        } finally {
            setIsLoadingCenters(false);
        }
    };

    useEffect(() => {
        fetchCenters();
    }, []);

    const handleCustomerInfoUpdate = (data) => {
        setFormData(prev => ({
            ...prev,
            customerInfo: { ...prev.customerInfo, ...data }
        }));
    };

    const handleLockerInfoUpdate = (data) => {
        setFormData(prev => ({
            ...prev,
            lockerInfo: { ...prev.lockerInfo, ...data }
        }));

        if (data.assignedLocker) {
            setFormData(prev => ({
                ...prev,
                rentDetails: {
                    ...prev.rentDetails,
                    lockerNo: data.assignedLocker,
                    lockerId: data.lockerId
                }
            }));
        }
    };

    const handleRentDetailsUpdate = (data) => {
        setFormData(prev => ({
            ...prev,
            rentDetails: { ...prev.rentDetails, ...data }
        }));
    };

    const handleBiometricUpdate = (data) => {
        setFormData(prev => ({
            ...prev,
            biometric: { ...prev.biometric, ...data }
        }));
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('authToken');

            await axios.post(`${API_URL}/customers/add`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            toast.success('Primary holder added successfully!');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to add primary holder');
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateCurrentStage = () => {
        switch (currentStage) {
            case 'customer-info':
                setCurrentStage('locker-rent');
                break;
            case 'locker-rent':
                setCurrentStage('biometric');
                break;
            case 'biometric':
                handleSubmit();
                break;
            default:
                break;
        }
    };

    const renderStage = () => {
        switch (currentStage) {
            case 'customer-info':
                return (
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
                                className="next-button"
                                onClick={validateCurrentStage}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                );
            case 'locker-rent':
                return (
                    <div className="stage-container">
                        <LockerRentDetails
                            onUpdate={(data) => {
                                handleLockerInfoUpdate(data);
                                handleRentDetailsUpdate(data);
                            }}
                            initialData={{
                                ...formData.lockerInfo,
                                ...formData.rentDetails
                            }}
                            centers={centers}
                            isLoadingCenters={isLoadingCenters}
                            holderType="primaryHolder"
                        />
                        <div className="stage-actions">
                            <button
                                className="back-button"
                                onClick={() => setCurrentStage('customer-info')}
                            >
                                Back
                            </button>
                            <button
                                className="submit-button"
                                onClick={validateCurrentStage}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Adding...' : 'Next'}
                            </button>
                        </div>
                    </div>
                );
            case 'biometric':
                return (
                    <div className="stage-container">
                        <BiometricCapture
                            onUpdate={handleBiometricUpdate}
                            initialData={formData.biometric}
                        />
                        <div className="stage-actions">
                            <button
                                className="back-button"
                                onClick={() => setCurrentStage('locker-rent')}
                            >
                                Back
                            </button>
                            <button
                                className="submit-button"
                                onClick={validateCurrentStage}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="primary-holder-container">
            <div className="stages-progress">
                <div className={`stage ${currentStage === 'customer-info' ? 'active' : ''}`}>
                    Customer Info
                </div>
                <div className={`stage ${currentStage === 'locker-rent' ? 'active' : ''}`}>
                    Locker & Rent
                </div>
                <div className={`stage ${currentStage === 'biometric' ? 'active' : ''}`}>
                    Biometric
                </div>
            </div>
            {renderStage()}
        </div>
    );
};

export default PrimaryHolder;
