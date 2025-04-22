import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import CustomerInfo from './CustomerInfo';
import LockerInfo from './LockerInfo';
import RentDetails from './RentDetails';
// import '../styles/AddCustomer.css';
import axios from 'axios';
import { API_URL } from '../assets/config';
import { updateFormData } from '../store/slices/customerSlice';
import { Box, CircularProgress, Alert, AlertTitle } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faRotateRight, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const EditCustomer = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const [activeTab, setActiveTab] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [centers, setCenters] = useState([]);
    const [customerData, setCustomerData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('Customer ID:', id);
        if (!id) {
            setError('Customer ID is required');
            setIsLoading(false);
            return;
        }
        fetchCustomerData();
        fetchCenters();
    }, [id]);

    const fetchCustomerData = async () => {
        if (!id) return;

        try {
            setIsLoading(true);
            setError(null);
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/customers/customer-details`,
                { customerId: id },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                const apiData = response.data;

                // Create default empty objects
                const defaultCustomerInfo = {
                    customerName: '',
                    mobileNo: '',
                    emailId: '',
                    memberId: '',
                    dateOfBirth: '',
                    gender: '',
                    panNo: '',
                    aadharNo: '',
                    nominees: []
                };

                const defaultLockerInfo = {
                    assignedDate: '',
                    lastCheckinDate: '',
                    expiryDate: ''
                };

                const defaultRentDetails = {
                    plan: '',
                    deposit: '',
                    rent: '',
                    paymentFrequency: ''
                };

                // Transform API response with defaults
                const transformedData = {
                    primaryHolder: {
                        customerInfo: {
                            ...defaultCustomerInfo,
                            ...(apiData && {
                                customerName: apiData.name || '',
                                mobileNo: apiData.phoneNumber || '',
                                emailId: apiData.email || '',
                                memberId: apiData.memberId || '',
                                dateOfBirth: apiData.dob || '',
                                gender: apiData.gender || '',
                                panNo: apiData.pan || '',
                                aadharNo: apiData.aadhar || '',
                                nominees: apiData.nominees || []
                            })
                        },
                        lockerInfo: {
                            ...defaultLockerInfo,
                            ...(apiData.locker?.[0] && {
                                assignedDate: apiData.locker[0].assigned_at || '',
                                lastCheckinDate: apiData.locker[0].last_checkin_at || '',
                                expiryDate: apiData.locker[0].expiry_at || ''
                            })
                        },
                        rentDetails: {
                            ...defaultRentDetails,
                            ...(apiData.locker?.[0] && {
                                plan: apiData.locker[0].plan || '',
                                deposit: apiData.locker[0].deposit || '',
                                rent: apiData.locker[0].rent || '',
                                paymentFrequency: apiData.locker[0].pay_frequency || ''
                            })
                        }
                    }
                };
                console.log('Transformed Data:', transformedData);

                setCustomerData(transformedData);

                // Safely dispatch to Redux
                dispatch(updateFormData({
                    holderType: 'primaryHolder',
                    section: 'customerInfo',
                    data: transformedData.primaryHolder.customerInfo
                }));

                dispatch(updateFormData({
                    holderType: 'primaryHolder',
                    section: 'lockerInfo',
                    data: transformedData.primaryHolder.lockerInfo
                }));

                dispatch(updateFormData({
                    holderType: 'primaryHolder',
                    section: 'rentDetails',
                    data: transformedData.primaryHolder.rentDetails
                }));

                // Handle secondary holders if they exist
                if (apiData.secondarHolders?.length > 0) {
                    apiData.secondarHolders.forEach((holder, index) => {
                        if (holder) {
                            dispatch(updateFormData({
                                holderType: `secondaryHolder${index + 1}`,
                                section: 'customerInfo',
                                data: {
                                    ...defaultCustomerInfo,
                                    customerName: holder.name || '',
                                    mobileNo: holder.phoneNumber || '',
                                    emailId: holder.email || '',
                                    memberId: holder.memberId || '',
                                    dateOfBirth: holder.dob || '',
                                    gender: holder.gender || '',
                                    panNo: holder.pan || '',
                                    aadharNo: holder.aadhar || ''
                                }
                            }));
                        }
                    });
                }
            } else {
                throw new Error('Failed to fetch customer data');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch customer data';
            setError(errorMessage);
            toast.error(errorMessage);
            console.error('Error fetching customer data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCenters = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/lockers/locker-centers`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.status === 200) {
                setCenters(response.data);
            }
        } catch (error) {
            toast.error('Failed to fetch centers');
            console.error('Error fetching centers:', error);
        }
    };

    const handleSectionUpdate = (holderType, section, data) => {
        setCustomerData(prevData => ({
            ...prevData,
            [holderType]: {
                ...prevData[holderType],
                [section]: data
            }
        }));
    };

    const handleUpdate = async () => {
        if (!id || !customerData) {
            toast.error('Invalid customer data');
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.put(
                `${API_URL}/customers/update/${id}`,
                customerData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );

            if (response.status === 200) {
                toast.success('Customer updated successfully');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update customer';
            toast.error(errorMessage);
            console.error('Error updating customer:', error);
        }
    };

    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh'
                }}
            >
                <CircularProgress size={60} />
                <Box sx={{ mt: 2 }}>Loading customer data...</Box>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                backgroundColor: 'rgba(255, 0, 0, 0.03)',
                padding: '20px'
            }}>
                <Box sx={{
                    textAlign: 'center',
                    backgroundColor: 'white',
                    padding: '40px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    maxWidth: '500px',
                    width: '100%'
                }}>
                    <FontAwesomeIcon
                        icon={faExclamationTriangle}
                        style={{
                            fontSize: '48px',
                            color: '#dc3545',
                            marginBottom: '20px'
                        }}
                    />
                    <h2 style={{
                        color: '#dc3545',
                        marginBottom: '16px',
                        fontSize: '24px'
                    }}>
                        Error Loading Customer
                    </h2>
                    <p style={{
                        color: '#666',
                        marginBottom: '24px',
                        fontSize: '16px'
                    }}>
                        {error}
                    </p>
                    <Box sx={{
                        display: 'flex',
                        gap: '12px',
                        justifyContent: 'center'
                    }}>
                        <button
                            className="submit-button"
                            onClick={fetchCustomerData}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FontAwesomeIcon icon={faRotateRight} />
                            Retry
                        </button>
                        <button
                            className="submit-button"
                            onClick={() => window.history.back()}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <FontAwesomeIcon icon={faArrowLeft} />
                            Go Back
                        </button>
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <div className="add-customer-container">
            <div className="sticky-header">
                <h6 className="add-customer-title">Edit Customer</h6>
                <div className="tabs-container">
                    <div className="tabs">
                        {['Edit Primary Holder', 'Edit Second Holder', 'Edit Third Holder'].map((tab, index) => (
                            <button
                                key={index}
                                className={activeTab === index ? 'active' : ''}
                                onClick={() => setActiveTab(index)}
                            >
                                {tab}
                            </button>
                        ))}
                        <div className="tab-indicator"></div>
                    </div>
                </div>
            </div>

            <div className="tab-content-container">
                {activeTab === 0 && customerData?.primaryHolder && (
                    <div className="form-sections animated-tab">
                        <CustomerInfo
                            initialData={customerData.primaryHolder.customerInfo}
                            onUpdate={(data) => handleSectionUpdate('primaryHolder', 'customerInfo', data)}
                        />
                        <LockerInfo
                            initialData={customerData.primaryHolder.lockerInfo}
                            onUpdate={(data) => handleSectionUpdate('primaryHolder', 'lockerInfo', data)}
                            holderType="primaryHolder"
                            centers={centers}
                        />
                        <RentDetails
                            initialData={customerData.primaryHolder.rentDetails}
                            onUpdate={(data) => handleSectionUpdate('primaryHolder', 'rentDetails', data)}
                        />
                    </div>
                )}
                {/* Similar sections for second and third holders */}
            </div>

            <div className="form-submit-container">
                <button className="submit-button" onClick={handleUpdate}>
                    Update Customer
                </button>
            </div>
        </div>
    );
};

export default EditCustomer;
