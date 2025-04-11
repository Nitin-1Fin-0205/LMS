import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import CustomerInfo from './CustomerInfo';
import LockerInfo from './LockerInfo';
import RentDetails from './RentDetails';
import Attachments from './Attachments';
import '../styles/AddCustomer.css';
import { formDataStructure } from '../models/customerModel';
import { API_URL } from '../assets/config';

// Convert to regular component since memo isn't providing significant benefits here
const TabContent = ({ holderType, currentData, updateHolderData, centers, isLoadingCenters }) => {
    // Remove useMemo for these simple callbacks
    const customerInfoCallback = (data) => updateHolderData('customerInfo', holderType, data);
    const lockerInfoCallback = (data) => updateHolderData('lockerInfo', holderType, data);
    const rentDetailsCallback = (data) => updateHolderData('rentDetails', holderType, data);

    return (
        <div className="form-sections animated-tab">
            <CustomerInfo
                onUpdate={customerInfoCallback}
                initialData={currentData.customerInfo}
                key={`customer-info-${holderType}`}
            />
            <LockerInfo
                onUpdate={lockerInfoCallback}
                initialData={currentData.lockerInfo}
                holderType={holderType}
                centers={centers}
                isLoadingCenters={isLoadingCenters}
                key={`locker-info-${holderType}`}
            />
            {holderType === 'primaryHolder' && (
                <RentDetails
                    onUpdate={rentDetailsCallback}
                    initialData={currentData.rentDetails}
                    key="rent-details"
                />
            )}
        </div>
    );
};

// Keep the main component memoized since it could be part of a larger app
const AddCustomer = () => {
    const [activeTab, setActiveTab] = useState(0);
    const indicatorRef = useRef(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [centers, setCenters] = useState([]);
    const [isLoadingCenters, setIsLoadingCenters] = useState(false);

    // Create memoized state setters
    const [holders, setHolders] = useState({
        primaryHolder: formDataStructure.primaryHolder,
        secondHolder: formDataStructure.secondHolder,
        thirdHolder: formDataStructure.thirdHolder
    });

    // Memoize update function
    const updateHolderData = useCallback((section, holderType, data) => {
        setHolders(prev => ({
            ...prev,
            [holderType]: {
                ...prev[holderType],
                [section]: {
                    ...prev[holderType][section],
                    ...data
                }
            }
        }));
    }, []);

    // Memoize tab change handler
    const handleTabChange = useCallback((index) => {
        setActiveTab(index);
    }, []);

    // Memoize submit handler
    const handleSubmit = useCallback(async () => {
        try {
            console.log('Submitting form with data:', holders);
            const { primaryHolder, secondHolder, thirdHolder } = holders;


            setIsSubmitting(true);
            const token = localStorage.getItem('authToken');

            const response = await axios.post(`${API_URL}`, holders, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.status === 201 || response.status === 200) {
                toast.success('Customer added successfully!');
                setHolders({
                    primaryHolder: formDataStructure.primaryHolder,
                    secondHolder: formDataStructure.secondHolder,
                    thirdHolder: formDataStructure.thirdHolder
                });
                setActiveTab(0);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            toast.error(error.response?.data?.message || 'Failed to add customer');
        } finally {
            setIsSubmitting(false);
        }
    }, [holders]);

    const fetchCenters = async () => {
        try {
            setIsLoadingCenters(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/api/centers`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (response.data && Array.isArray(response.data)) {
                setCenters(response.data);
            }
        } catch (error) {
            console.error('Error fetching centers:', error);
        } finally {
            setIsLoadingCenters(false);
        }
    };

    useEffect(() => {
        fetchCenters();
    }, []);

    // Memoize current holder type and data
    const currentHolderType = ['primaryHolder', 'secondHolder', 'thirdHolder'][activeTab];
    const currentData = holders[currentHolderType];

    return (
        <div className="add-customer-container">
            <h6 className="add-customer-title">Add Customer</h6>
            <div className="tabs-container">
                <div className="tabs">
                    {['Add Primary Holder', 'Add Second Holder', 'Add Third Holder'].map((tab, index) => (
                        <button
                            key={index}
                            className={activeTab === index ? 'active' : ''}
                            onClick={() => handleTabChange(index)}
                        >
                            {tab}
                        </button>
                    ))}
                    <div className="tab-indicator" ref={indicatorRef}></div>
                </div>
            </div>
            <div className="tab-content-container">
                <TabContent
                    holderType={currentHolderType}
                    currentData={currentData}
                    updateHolderData={updateHolderData}
                    centers={centers}
                    isLoadingCenters={isLoadingCenters}
                />
            </div>
            <div className="form-submit-container">
                <button
                    className="submit-button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? 'Adding Customer...' : 'Add Customer'}
                </button>
            </div>
        </div>
    );
};

// Keep memo here since AddCustomer might be used in a parent component
export default memo(AddCustomer);