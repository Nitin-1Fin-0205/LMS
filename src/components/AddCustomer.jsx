import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
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

const validateHolder = (holderData, isSecondaryHolder = false) => {
    const errors = [];

    // Required fields for customer info
    const customerInfoFields = {
        customerId: 'Customer ID',
        customerName: 'Customer Name',
        fatherOrHusbandName: "Father's/Husband's Name",
        address: 'Address',
        dateOfBirth: 'Date of Birth',
        mobileNo: 'Mobile Number',
        gender: 'Gender',
        emailId: 'Email ID',
        documentNo: 'Document Number'
    };

    // Required fields for locker info
    const lockerInfoFields = {
        center: 'Center'
    };

    // Required fields for rent details (primary holder only)
    const rentDetailsFields = {
        lockerNo: 'Locker Number',
        deposit: 'Deposit',
        rent: 'Rent',
        admissionFees: 'Admission Fees',
        total: 'Total Amount',
        lockerKeyNo: 'Locker Key Number'
    };


    // Validate customer info
    Object.entries(customerInfoFields).forEach(([field, label]) => {
        if (!holderData.customerInfo[field]) {
            errors.push(`${label} is required`);
        }
    });

    // Validate locker info
    Object.entries(lockerInfoFields).forEach(([field, label]) => {
        if (!holderData.lockerInfo[field]) {
            errors.push(`${label} is required`);
        }
    });

    // Only validate rent details for primary holder
    if (!isSecondaryHolder) {
        Object.entries(rentDetailsFields).forEach(([field, label]) => {
            if (!holderData.rentDetails[field]) {
                errors.push(`${label} is required`);
            }
        });
    }

    return errors;
};

const validateAllHolders = (holders, setActiveTab) => {
    const holderTypes = [
        { type: 'primaryHolder', isRequired: true, tabIndex: 0 },
        { type: 'secondHolder', isRequired: false, tabIndex: 1 },
        { type: 'thirdHolder', isRequired: false, tabIndex: 2 }
    ];

    for (const { type, isRequired, tabIndex } of holderTypes) {
        const holder = holders[type];

        // Skip validation for optional holders if they don't have a name
        if (!isRequired && !holder.customerInfo.customerName) {
            continue;
        }

        const errors = validateHolder(holder, !isRequired);
        if (errors.length > 0) {
            // Switch to the tab with the error
            setActiveTab(tabIndex);
            toast.error(`${type.charAt(0).toUpperCase() + type.slice(1)}: ${errors[0]}`);
            return false;
        }
    }

    return true;
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
        console.log(`Updating ${holderType} data for section: ${section}`, data);
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

    // Add new useEffect for initial tab indicator setup
    useEffect(() => {
        const indicator = indicatorRef.current;
        if (indicator && indicator.parentElement) {
            const firstTab = indicator.parentElement.children[0];
            const tabWidth = firstTab.offsetWidth;
            indicator.style.setProperty('--tab-width', `${tabWidth}px`);
            indicator.style.setProperty('--active-tab', '0');
        }
    }, []);

    // Memoize tab change handler
    const handleTabChange = useCallback((index) => {
        setActiveTab(index);
        const indicator = indicatorRef.current;
        if (indicator && indicator.parentElement) {
            const tab = indicator.parentElement.children[index];
            const tabWidth = tab.offsetWidth;
            indicator.style.setProperty('--tab-width', `${tabWidth}px`);
            indicator.style.setProperty('--active-tab', index);
        }
    }, []);

    // Update the handleSubmit function
    const handleSubmit = useCallback(async () => {
        // Pass setActiveTab to the validation function
        if (!validateAllHolders(holders, setActiveTab)) {
            return;
        }

        try {
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
    }, [holders, setActiveTab]); // Add setActiveTab to dependencies

    const fetchCenters = async () => {
        try {
            setIsLoadingCenters(true);
            // const token = localStorage.getItem('authToken');
            // const response = await axios.get(`${API_URL}/api/centers`, {
            //     headers: {
            //         'Authorization': `Bearer ${token}`,
            //         'Accept': 'application/json'
            //     }
            // });

            // if (response.data && Array.isArray(response.data)) {
            //     setCenters(response.data);
            // }

            // Mock data for Texting
            const mockCenters = [
                { id: 1, name: 'Center A' },
                { id: 2, name: 'Center B' },
                { id: 3, name: 'Center C' }
            ];

            setCenters(mockCenters);
        } catch (error) {
            console.error('Error fetching centers:', error);
        } finally {
            setIsLoadingCenters(false);
        }
    };

    useEffect(() => {
        fetchCenters();
    }, []);

    // Add this after other useEffects
    useEffect(() => {
        const primaryLockerInfo = holders.primaryHolder.lockerInfo;
        if (primaryLockerInfo.center || primaryLockerInfo.assignedLocker) {
            setHolders(prev => ({
                ...prev,
                secondHolder: {
                    ...prev.secondHolder,
                    lockerInfo: {
                        ...prev.secondHolder.lockerInfo,
                        center: primaryLockerInfo.center,
                        assignedLocker: primaryLockerInfo.assignedLocker
                    }
                },
                thirdHolder: {
                    ...prev.thirdHolder,
                    lockerInfo: {
                        ...prev.thirdHolder.lockerInfo,
                        center: primaryLockerInfo.center,
                        assignedLocker: primaryLockerInfo.assignedLocker
                    }
                }
            }));
        }
    }, [holders.primaryHolder.lockerInfo]);

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