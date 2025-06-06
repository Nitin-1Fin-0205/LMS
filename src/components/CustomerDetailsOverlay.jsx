import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faUser, faFile, faDownload, faEye, faEdit } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { API_URL } from '../assets/config';
import '../styles/CustomerDetailsOverlay.css';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const CustomerDetailsOverlay = ({
    show,
    onClose,
    customerId
}) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [customerData, setCustomerData] = useState(null);
    const [error, setError] = useState(null);

    const fetchCustomerDetails = useCallback(async () => {
        if (!show || !customerId) return;

        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(
                `${API_URL}/customers/customer-preview/${customerId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'accept': '*/*'
                    }
                }
            );

            if (response.data?.data) {
                setCustomerData(response.data.data);
            } else {
                throw new Error('Invalid data format received');
            }
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

    const handleEditClick = (type) => {
        switch (type) {
            case "PRIMARY":
                navigate(ROUTES.PRIMARY_HOLDER);
                break;
            case "SECONDARY":
                navigate(ROUTES.SECONDARY_HOLDER);
                break;
            case "THIRD":
                navigate(ROUTES.THIRD_HOLDER);
                break;
            default:
                break;
        }
    };

    const handleDocumentAction = async (doc, action) => {
        if (!doc.url) return;

        try {
            if (action === 'view') {
                window.open(doc.url, '_blank');
            } else if (action === 'download') {
                const response = await fetch(doc.url);
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = doc.name;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            toast.error(`Failed to ${action} document`);
        }
    };

    const renderFingerprintStatus = (fingerType, biometricData) => {
        const isPresent = biometricData?.fingerprints?.includes(fingerType);
        return (
            <span className={`fingerprint-status ${isPresent ? 'present' : 'missing'}`}>
                {isPresent ? '✓' : '✗'}
            </span>
        );
    };

    const renderHolderSection = (holder, title, documents, biometricData) => {
        if (!holder) return null;

        return (
            <div className="detail-main-section">
                <div className="section-header">
                    <h3 className="main-section-title">{title}</h3>
                    <button
                        className="edit-button"
                        onClick={() => handleEditClick(title.split(' ')[0])}
                        title={`Edit ${title}`}
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </button>

                </div>

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
                        {/* <div className="holder-id">ID: {holder.customerId}</div> */}
                    </div>

                    <div className="holder-details">
                        <div className="detail-section">
                            <h4>PERSONAL INFORMATION</h4>
                            <div className="detail-grid">
                                <div className="detail-row">
                                    <div className="detail-label">Full Name:</div>
                                    <div className="detail-value">{`${holder.firstName} ${holder.middleName || ''} ${holder.lastName}`}</div>
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
                                    <div className="detail-label">Father/Husband Name:</div>
                                    <div className="detail-value">{holder.fatherOrHusbandName}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Date of Birth:</div>
                                    <div className="detail-value">{holder.dateOfBirth}</div>
                                </div>
                            </div>
                        </div>

                        {/* Permanent Address Section */}
                        <div className="detail-section">
                            <h4>PERMANENT ADDRESS</h4>
                            <div className="detail-grid">
                                <div className="detail-row">
                                    <div className="detail-label">Address Line 1:</div>
                                    <div className="detail-value">{holder.permanentAddress?.line1 || '-'}</div>
                                </div>
                                {holder.permanentAddress?.line2 && (
                                    <div className="detail-row">
                                        <div className="detail-label">Address Line 2:</div>
                                        <div className="detail-value">{holder.permanentAddress.line2}</div>
                                    </div>
                                )}
                                {holder.permanentAddress?.line3 && (
                                    <div className="detail-row">
                                        <div className="detail-label">Address Line 3:</div>
                                        <div className="detail-value">{holder.permanentAddress.line3}</div>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <div className="detail-label">City:</div>
                                    <div className="detail-value">{holder.permanentAddress?.city || '-'}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">State:</div>
                                    <div className="detail-value">{holder.permanentAddress?.state || '-'}</div>
                                </div>
                            </div>
                        </div>

                        {/* Correspondence Address Section */}
                        <div className="detail-section">
                            <h4>CORRESPONDENCE ADDRESS</h4>
                            <div className="detail-grid">
                                <div className="detail-row">
                                    <div className="detail-label">Address Line 1:</div>
                                    <div className="detail-value">{holder.correspondenceAddress?.line1 || '-'}</div>
                                </div>
                                {holder.correspondenceAddress?.line2 && (
                                    <div className="detail-row">
                                        <div className="detail-label">Address Line 2:</div>
                                        <div className="detail-value">{holder.correspondenceAddress.line2}</div>
                                    </div>
                                )}
                                {holder.correspondenceAddress?.line3 && (
                                    <div className="detail-row">
                                        <div className="detail-label">Address Line 3:</div>
                                        <div className="detail-value">{holder.correspondenceAddress.line3}</div>
                                    </div>
                                )}
                                <div className="detail-row">
                                    <div className="detail-label">City:</div>
                                    <div className="detail-value">{holder.correspondenceAddress?.city || '-'}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">State:</div>
                                    <div className="detail-value">{holder.correspondenceAddress?.state || '-'}</div>
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
                                    <div className="detail-label">Aadhaar Number:</div>
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
                                                {renderFingerprintStatus('right-thumb', biometricData)}
                                            </div>
                                        </div>

                                        <div className="fingerprint-item">
                                            <div className="fingerprint-label">Left Thumb</div>
                                            <div className="fingerprint-value">
                                                {renderFingerprintStatus('left-thumb', biometricData)}
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
                                                </div>
                                            </div>
                                            <div className="document-actions">
                                                <button
                                                    className="document-view-btn"
                                                    title="View Document"
                                                    onClick={() => handleDocumentAction(doc, 'view')}
                                                >
                                                    <FontAwesomeIcon icon={faEye} />
                                                </button>
                                                {/* <button
                                                    className="document-download-btn"
                                                    title="Download Document"
                                                    onClick={() => handleDocumentAction(doc, 'download')}
                                                >
                                                    <FontAwesomeIcon icon={faDownload} />
                                                </button> */}
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
                <div className="section-header">

                    <h3 className="main-section-title">LOCKER DETAILS </h3>
                    <button
                        className="edit-button"
                        onClick={() => navigate('/locker-details')}
                        title="Edit Locker Details"
                    >
                        <FontAwesomeIcon icon={faEdit} />
                    </button>
                </div>
                <div className="pre-locker-details-container">
                    <div className="detail-section">
                        <h4>LOCKER INFORMATION</h4>
                        <div className="detail-grid three-columns">
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
                        <div className="detail-grid three-columns">
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
                        {/* <button className="print-btn" onClick={() => window.print()}>Print</button> */}
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
                            {/* <div className="registration-info">
                                <p>Customer ID: {customerData.primaryHolder.customerId}</p>
                                <p>Date: {new Date().toLocaleDateString()}</p>
                            </div> */}

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
