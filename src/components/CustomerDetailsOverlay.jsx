import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faUser, faFile, faDownload, faEye } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { API_URL } from '../assets/config';
import '../styles/CustomerDetailsOverlay.css';

// Mock data for temporary development
const MOCK_CUSTOMER_DATA = {
    primaryHolder: {
        customerId: "12345",
        firstName: "John",
        middleName: "Michael",
        lastName: "Doe",
        panNo: "ABCDE1234F",
        aadharNo: "123456789012",
        gender: "Male",
        address: "123 Main Street, Downtown, Mumbai, Maharashtra",
        city: "Mumbai",
        state: "Maharashtra",
        fatherOrHusbandName: "Robert Doe",
        dateOfBirth: "1985-06-15",
        mobileNo: "9876543210",
        emailId: "john.doe@example.com",
        photo: "https://randomuser.me/api/portraits/men/44.jpg",
        status: true,
        biometricData: {
            fingerprints: ["right-thumb", "left-thumb"]
        },
        documents: [
            { id: 1, type: "Address Proof", name: "Aadhar Card.pdf", url: "#", size: 1024000, uploadDate: "2023-01-10" },
            { id: 2, type: "Identity Proof", name: "PAN Card.pdf", url: "#", size: 512000, uploadDate: "2023-01-10" },
        ]
    },
    secondaryHolder: {
        customerId: "67890",
        firstName: "Jane",
        middleName: "Alice",
        lastName: "Doe",
        panNo: "FGHIJ5678K",
        aadharNo: "987654321098",
        gender: "Female",
        address: "123 Main Street, Downtown, Mumbai, Maharashtra",
        city: "Mumbai",
        state: "Maharashtra",
        fatherOrHusbandName: "David Smith",
        dateOfBirth: "1988-09-23",
        mobileNo: "8765432109",
        emailId: "jane.doe@example.com",
        photo: "https://randomuser.me/api/portraits/women/33.jpg",
        biometricData: {
            fingerprints: []
        },
        documents: [
            { id: 1, type: "Address Proof", name: "Aadhar Card.pdf", url: "#", size: 1024000, uploadDate: "2023-01-10" },
            { id: 2, type: "Identity Proof", name: "PAN Card.pdf", url: "#", size: 512000, uploadDate: "2023-01-10" },
            { id: 3, type: "Photo", name: "Recent Photo.jpg", url: "#", size: 204800, uploadDate: "2023-01-10" }
        ]
    },
    thirdHolder: {
        customerId: "24680",
        firstName: "Robert",
        middleName: "James",
        lastName: "Smith",
        panNo: "LMNOP9876Q",
        aadharNo: "456789012345",
        gender: "Male",
        address: "456 Park Avenue, Uptown, Delhi, Delhi",
        city: "Mumbai",
        state: "Maharashtra",
        fatherOrHusbandName: "William Smith",
        dateOfBirth: "1990-12-10",
        mobileNo: "7654321098",
        emailId: "robert.smith@example.com",
        photo: "https://randomuser.me/api/portraits/men/22.jpg",
        biometricData: {
            fingerprints: ["right-thumb"]
        },
        documents: [
            { id: 1, type: "Address Proof", name: "Aadhar Card.pdf", url: "#", size: 1024000, uploadDate: "2023-01-10" },
            { id: 2, type: "Identity Proof", name: "PAN Card.pdf", url: "#", size: 512000, uploadDate: "2023-01-10" },
            { id: 3, type: "Photo", name: "Recent Photo.jpg", url: "#", size: 204800, uploadDate: "2023-01-10" }
        ]
    },
    lockerDetails: {
        center: "Mumbai Main Branch",
        roomNo: "R-101",
        cabinetNo: "Cabinet A",
        lockerSize: "Small",
        lockerNumber: "L-203",
        LockerKey: "LK-456",
        monthlyRent: "750",
        deposit: "5000",
        startDate: "2023-01-15",
        endDate: "2024-01-14",
        status: true,
    },
};

// Flag to toggle between mock data and API data
const USE_MOCK_DATA = true;

const CustomerDetailsOverlay = ({
    show,
    onClose,
    customerId
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [customerData, setCustomerData] = useState(null);
    const [error, setError] = useState(null);

    const fetchCustomerDetails = useCallback(async () => {
        if (!show) return;

        setIsLoading(true);
        setError(null);

        // Use setTimeout to simulate network delay with mock data
        if (USE_MOCK_DATA) {
            setTimeout(() => {
                // Simulate success scenario
                setCustomerData(MOCK_CUSTOMER_DATA);
                setIsLoading(false);

                // Uncomment to simulate error scenario
                // setError('Simulated error for testing UI');
                // setIsLoading(false);
            }, 1500); // 1.5 second delay
            return;
        }

        // Real API call if not using mock data
        try {
            if (!customerId) {
                throw new Error('Customer ID is required');
            }

            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/customers/details/${customerId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setCustomerData(response.data);
        } catch (err) {
            console.error('Error fetching customer details:', err);
            setError('Failed to load customer details. Please try again.');
            toast.error('Failed to load customer details');
        } finally {
            setIsLoading(false);
        }
    }, [show, customerId]);

    const handleRetry = () => {
        fetchCustomerDetails();
    };

    useEffect(() => {
        fetchCustomerDetails();
    }, [fetchCustomerDetails]);

    const renderHolderSection = (holder, title, documents, biometricData) => {
        if (!holder) return null;

        // Helper function to render fingerprint status with color
        const renderFingerprintStatus = (fingerType) => {
            const isPresent = biometricData?.fingerprints?.includes(fingerType);
            return (
                <span className={`fingerprint-status ${isPresent ? 'present' : 'missing'}`}>
                    {isPresent ? '✓' : '✗'}
                </span>
            );
        };

        return (
            <div className="detail-main-section">
                <h3 className="main-section-title">{title}</h3>

                <div className="holder-details-container">
                    <div className="holder-photo-container">
                        {holder.photo ? (
                            <img
                                src={holder.photo}
                                alt={`${holder.firstName} ${holder.lastName}`}
                                className="holder-photo"
                            />
                        ) : (
                            <div className="pre-photo-placeholder">
                                <FontAwesomeIcon icon={faUser} size="2x" />
                            </div>
                        )}
                        <div className="holder-id">ID: {holder.customerId}</div>
                    </div>

                    <div className="holder-details">
                        <div className="detail-section">
                            <h4>PERSONAL INFORMATION</h4>
                            <div className="detail-grid">
                                <div className="detail-row">
                                    <div className="detail-label">Full Name:</div>
                                    <div className="detail-value">{`${holder.firstName} ${holder.middleName} ${holder.lastName}`}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Mobile:</div>
                                    <div className="detail-value">{holder.mobileNo}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Gender:</div>
                                    <div className="detail-value">{holder.gender}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Email:</div>
                                    <div className="detail-value">{holder.emailId}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Guardian Name:</div>
                                    <div className="detail-value">{holder.fatherOrHusbandName}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Date of Birth:</div>
                                    <div className="detail-value">{holder.dateOfBirth}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Address:</div>
                                    <div className="detail-value">{holder.address}</div>
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h4>IDENTIFICATION DOCUMENTS</h4>
                            <div className="detail-grid">
                                <div className="detail-row">
                                    <div className="detail-label">PAN Number:</div>
                                    <div className="detail-value">{holder.panNo}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Aadhar Number:</div>
                                    <div className="detail-value">{holder.aadharNo}</div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced biometric information section */}
                        {biometricData && (
                            <div className="detail-section biometric-section">
                                <h4>BIOMETRIC INFORMATION</h4>
                                <div className="biometric-status-container">
                                    <div className="fingerprint-count">
                                        <span className="count-label">Fingerprints Captured:</span>
                                        <span className="count-value">{biometricData?.fingerprints?.length || 0}</span>
                                    </div>

                                    <div className="fingerprints-grid">
                                        <div className="fingerprint-item">
                                            <div className="fingerprint-label">Right Thumb</div>
                                            <div className="fingerprint-value">
                                                {renderFingerprintStatus('right-thumb')}
                                            </div>
                                        </div>

                                        <div className="fingerprint-item">
                                            <div className="fingerprint-label">Left Thumb</div>
                                            <div className="fingerprint-value">
                                                {renderFingerprintStatus('left-thumb')}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {documents && documents.length > 0 && (
                            <div className="detail-section">
                                <h4>UPLOADED DOCUMENTS</h4>
                                <div className="documents-grid">
                                    {documents.map(doc => (
                                        <div className="document-item" key={doc.id}>
                                            <div className="document-icon">
                                                <FontAwesomeIcon icon={faFile} />
                                            </div>
                                            <div className="document-details">
                                                <div className="document-name">{doc.name}</div>
                                                <div className="document-meta">
                                                    <span className="document-type">{doc.type}</span>
                                                    {/* File size removed */}
                                                </div>
                                            </div>
                                            <div className="document-actions">
                                                <button className="document-view-btn" title="View Document">
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                                <button className="document-download-btn" title="Download Document">
                                                    <FontAwesomeIcon icon={faDownload} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderLockerSection = (lockerDetails) => {
        if (!lockerDetails) return null;

        return (
            <div className="detail-main-section">
                <h3 className="main-section-title">LOCKER DETAILS</h3>
                <div className="locker-details-container">
                    <div className="detail-section">
                        <h4>LOCKER INFORMATION</h4>
                        <div className="detail-grid">
                            <div className="detail-row">
                                <div className="detail-label">Center:</div>
                                <div className="detail-value">{lockerDetails.center}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Room Number:</div>
                                <div className="detail-value">{lockerDetails.roomNo}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Cabinet Number:</div>
                                <div className="detail-value">{lockerDetails.cabinetNo}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Locker Number:</div>
                                <div className="detail-value">{lockerDetails.lockerNumber}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Locker Key:</div>
                                <div className="detail-value">{lockerDetails.LockerKey}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Locker Size:</div>
                                <div className="detail-value">{lockerDetails.lockerSize}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Status:</div>
                                <div className="detail-value">{lockerDetails.status ? 'Active' : 'Inactive'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h4>PAYMENT DETAILS</h4>
                        <div className="detail-grid">
                            <div className="detail-row">
                                <div className="detail-label">Monthly Rent:</div>
                                <div className="detail-value">₹{lockerDetails.monthlyRent}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Security Deposit:</div>
                                <div className="detail-value">₹{lockerDetails.deposit}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">Start Date:</div>
                                <div className="detail-value">{lockerDetails.startDate}</div>
                            </div>
                            <div className="detail-row">
                                <div className="detail-label">End Date:</div>
                                <div className="detail-value">{lockerDetails.endDate}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!show) {
        return null;
    }

    return (
        <div className="customer-detail-overlay">
            <div className="overlay-content">
                <div className="overlay-header">
                    <h2>Customer Registration Summary</h2>
                    <div className="overlay-actions">
                        <button className="print-btn" onClick={() => window.print()}>Print</button>
                        <button className="close-btn" onClick={onClose}>Close</button>
                    </div>
                </div>

                <div className="overlay-body">
                    {isLoading ? (
                        <div className="overlay-loading">
                            <FontAwesomeIcon icon={faSpinner} spin size="2x" />
                            <p>Loading customer details...</p>
                        </div>
                    ) : error ? (
                        <div className="overlay-error">
                            <p>{error}</p>
                            <button onClick={handleRetry}>Retry</button>
                        </div>
                    ) : customerData ? (
                        <>
                            <div className="registration-info">
                                <p>Customer ID: {customerData.primaryHolder.customerId}</p>
                                <p>Date: {new Date().toLocaleDateString()}</p>
                            </div>

                            <div className="details-container">
                                {renderHolderSection(
                                    customerData.primaryHolder,
                                    "PRIMARY HOLDER",
                                    customerData.primaryHolder.documents, // Get documents directly from holder
                                    customerData.primaryHolder.biometricData
                                )}

                                {renderLockerSection(customerData.lockerDetails)}

                                {customerData.secondaryHolder && renderHolderSection(
                                    customerData.secondaryHolder,
                                    "SECONDARY HOLDER",
                                    customerData.secondaryHolder.documents, // Get documents directly from holder
                                    customerData.secondaryHolder.biometricData
                                )}

                                {customerData.thirdHolder && renderHolderSection(
                                    customerData.thirdHolder,
                                    "THIRD HOLDER",
                                    customerData.thirdHolder.documents, // Get documents directly from holder
                                    customerData.thirdHolder.biometricData
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="overlay-no-data">
                            <p>No customer data available.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailsOverlay;
