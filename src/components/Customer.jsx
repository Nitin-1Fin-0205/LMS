import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../assets/config';
import '../styles/Customer.css';
import { useNavigate, useParams } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserPlus, faVault, faFileAlt, faEye, faPhone, faEnvelope, faSpinner, faUpLong, faDownload, faArrowsRotate } from '@fortawesome/free-solid-svg-icons';
import { fetchCustomerByPan, resetForm, updateHolderSection } from '../store/slices/customerSlice';
import { updateLockerDetails, updateRentDetails, clearAllLockerData } from '../store/slices/lockerSlice';
import { HOLDER_TYPES, HOLDER_SECTIONS } from '../constants/holderConstants';
import { ValidationService } from '../services/ValidationService';
import CustomerDetailsOverlay from './CustomerDetailsOverlay';

const Customer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { pan: urlPan } = useParams();
    console.log('URL PAN:', useParams());
    const { form, isSubmitting } = useSelector(state => state.customer);
    const primaryHolder = form.primaryHolder;
    const secondaryHolder = form.secondaryHolder;
    // const thirdHolder = form.thirdHolder;    // const lockerData = useSelector(state => state.locker);

    const [formData, setFormData] = useState({
        pan: urlPan || ''
    });

    const [panError, setPanError] = useState('');
    const [activeCard, setActiveCard] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showDetailOverlay, setShowDetailOverlay] = useState(false);
    const [isSendingAgreement, setIsSendingAgreement] = useState(false);

    const handlePrimaryHolder = () => {
        navigate(ROUTES.PRIMARY_HOLDER);
    };

    const handleSecondaryHolder = () => {
        navigate(ROUTES.SECONDARY_HOLDER, { state: { customer: primaryHolder } });
    };

    const handleThirdHolder = () => {
        navigate(ROUTES.THIRD_HOLDER, { state: { customer: primaryHolder } });
    };

    const handleLockerDetails = () => {
        if (primaryHolder?.customerInfo?.customerId) {
            navigate(ROUTES.LOCKER_DETAILS);
        }
    }; const handlePanChange = (e) => {
        const pan = e.target.value.toUpperCase();
        const validation = ValidationService.isValidPAN(pan);

        // Clear error when PAN is valid or empty
        if (pan.length === 0 || validation.isValid) {
            setPanError('');
        } else if (pan.length === 10 && !validation.isValid) {
            setPanError(validation.error);
        }

        setFormData(prev => ({
            ...prev,
            pan
        }));
    };

    useEffect(() => {
        if (urlPan) {
            setFormData({ pan: urlPan });
            handleSubmitWithPan(urlPan);
        }
    }, [urlPan]);

    // Redirect to customer page if PAN is available in primaryHolder
    useEffect(() => {
        if (primaryHolder?.customerInfo?.panNo) {
            navigate(`/customer/${primaryHolder?.customerInfo?.panNo?.toUpperCase()}`, { replace: true });

        }
    }, [primaryHolder?.customerInfo?.panNo]);

    const handleSubmitWithPan = async (panValue) => {
        if (!panValue) return;

        const panValidated = ValidationService.validateField('pan', panValue);
        if (!panValidated.isValid) {
            setPanError(panValidated.error);
            return;
        }

        // Clear error if validation passes
        setPanError('');

        dispatch(resetForm());
        dispatch(clearAllLockerData());
        setActiveCard(null);

        try {
            const result = await dispatch(fetchCustomerByPan({
                pan: panValue.trim().toUpperCase()
            })).unwrap();
        } catch (error) {
            toast.dismiss();
            console.error('Error fetching customer details:', error);
            toast.error(error || 'Failed to fetch customer details');
        }
    };

    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        if (!formData.pan) {
            if (e) setPanError('Please enter PAN number');
            return;
        }

        // Update URL when searching manually
        if (formData.pan !== urlPan) {
            navigate(`/customer/${formData.pan.toUpperCase()}`);
            return;
        }

        await handleSubmitWithPan(formData.pan);
    };

    const handleReset = () => {
        setFormData({ pan: '' });
        setPanError('');
        dispatch(resetForm());
        dispatch(clearAllLockerData());
        setActiveCard(null);
        // Navigate back to customer page without PAN
        navigate('/customer');
    };

    const toggleDetailOverlay = () => {
        setShowDetailOverlay(!showDetailOverlay);
    };

    const handleSendAgreement = async (customerId) => {
        try {
            setIsSendingAgreement(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/customers/generate-agreement`,
                {
                    customer_id: customerId
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'accept': '*/*',
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                toast.success('Agreement sent successfully');
            } else {
                throw new Error('Failed to send agreement');
            }
        } catch (error) {
            console.error('Error sending agreement:', error);
            toast.error(error.response?.data?.message || 'Failed to send agreement');
        } finally {
            setIsSendingAgreement(false);
        }
    };

    const handleSendPaymentLink = async (customerId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.post(
                `${API_URL}/customers/${customerId}/send-payment-link`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'accept': '*/*'
                    }
                }
            );

            if (response.status === 200) {
                toast.success('Payment link sent successfully');
            } else {
                throw new Error('Failed to send payment link');
            }
        } catch (error) {
            console.error('Error sending payment link:', error);
            toast.error(error.response?.data?.message || 'Failed to send payment link');
        }
    };

    return (
        <div className="new-customer-container">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4 mb-6 max-w-6xl mx-auto">            <div className="flex items-end gap-3">
                <div className="flex items-end gap-2 flex-1">
                    <div className="flex-1 max-w-lg">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            PAN Number
                        </label>
                        <input
                            type="text"
                            value={formData.pan || ''}
                            onChange={handlePanChange}
                            maxLength={10}
                            required
                            className={`w-full px-3 py-2 border rounded-md text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 transition-all duration-200 ${panError
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
                                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                                }`}
                            placeholder="Enter PAN number"
                        />
                    </div>
                    {panError && (
                        <div className="flex-1 min-w-0 pb-2">
                            <p className="text-xs text-red-600 flex items-center gap-1">
                                {panError}
                            </p>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <button
                        type="submit"
                        className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200 text-sm cursor-pointer"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <span>Fetching...</span>
                                <FontAwesomeIcon icon={faSpinner} spin className="text-xs" />
                            </>
                        ) : (
                            <>
                                <span>Fetch Customer</span>
                                <FontAwesomeIcon icon={faDownload} className="text-xs" />
                            </>
                        )}
                    </button>
                    <button
                        type="button"
                        className="flex items-center gap-1 px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors duration-200 text-sm cursor-pointer"
                        onClick={handleReset}
                    >
                        <span>Reset</span>
                        <FontAwesomeIcon icon={faArrowsRotate} className="text-xs" />
                    </button>
                </div>
            </div>
            </form>

            <div className="action-cards">
                <button
                    className={`card-button ${activeCard === 'primary' ? 'active' : ''}`}
                    onClick={handlePrimaryHolder}
                >
                    <div className="card-icon">
                        <FontAwesomeIcon icon={faUser} />
                    </div>
                    <div className="card-content">
                        <h3>Primary Holder</h3>
                        <p>Add primary holder details</p>
                    </div>
                </button>

                <button
                    className={`card-button ${activeCard === 'locker' ? 'active' : ''}`}
                    onClick={handleLockerDetails}
                    disabled={!primaryHolder?.customerInfo?.customerId}
                >
                    <div className="card-icon">
                        <FontAwesomeIcon icon={faVault} />
                    </div>
                    <div className="card-content">
                        <h3>Locker Details</h3>
                        <p>Configure locker settings</p>
                    </div>
                </button>

                <button
                    className={`card-button ${activeCard === 'secondary' ? 'active' : ''}`}
                    onClick={handleSecondaryHolder}
                    disabled={!primaryHolder?.customerInfo?.customerId}
                >
                    <div className="card-icon">
                        <FontAwesomeIcon icon={faUserPlus} />
                    </div>
                    <div className="card-content">
                        <h3>Secondary Holder</h3>
                        <p>Add secondary holder details</p>
                    </div>
                </button>

                <button
                    className={`card-button ${activeCard === 'third' ? 'active' : ''}`}
                    onClick={handleThirdHolder}
                    disabled={!secondaryHolder?.customerInfo?.customerId}
                >
                    <div className="card-icon">
                        <FontAwesomeIcon icon={faUserPlus} />
                    </div>
                    <div className="card-content">
                        <h3>Third Holder</h3>
                        <p>Add third holder details</p>
                    </div>
                </button>
            </div>

            {primaryHolder?.customerInfo?.customerId && (
                <div className="customer-preview">
                    <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Customer Details</h3>
                        <div className="flex items-center gap-4">
                            <button
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                onClick={toggleDetailOverlay}
                                title="View Full Details"
                            >
                                <FontAwesomeIcon icon={faEye} className="text-lg cursor-pointer" />
                            </button>
                            <button
                                className="flex items-center px-4 py-2 text-white rounded-md transition-all gap-2 text-sm font-medium cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                                style={{
                                    backgroundColor: 'var(--primary-green-background)',
                                    transition: 'all 0.3s ease',
                                    ':hover': {
                                        backgroundColor: '#38a169'
                                    }
                                }}
                                disabled={isSendingAgreement}
                                onMouseOver={(e) => {
                                    if (!isSendingAgreement) {
                                        e.currentTarget.style.backgroundColor = '#38a169';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    if (!isSendingAgreement) {
                                        e.currentTarget.style.backgroundColor = 'var(--primary-green-background)';
                                    }
                                }}
                                onClick={() => handleSendAgreement(primaryHolder.customerInfo.customerId)}
                            >
                                {isSendingAgreement ? (
                                    <>
                                        <FontAwesomeIcon icon={faSpinner} spin />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <FontAwesomeIcon icon={faFileAlt} />
                                        Send Agreement Link
                                    </>
                                )}
                            </button>
                            {/* <button
                            className="flex items-center px-4 py-2 text-white rounded-md transition-all gap-2 text-sm font-medium cursor-pointer"
                            style={{
                                backgroundColor: 'var(--primary-green-background)',
                                transition: 'all 0.3s ease',
                                ':hover': {
                                    backgroundColor: '#38a169'
                                }
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.backgroundColor = '#38a169';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.backgroundColor = 'var(--primary-green-background)';
                            }}
                            onClick={() => handleSendPaymentLink(primaryHolder.customerInfo.customerId)}
                        >
                            <FontAwesomeIcon icon={faUpLong} />
                            Send Payment Link
                        </button> */}
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                                {primaryHolder.customerInfo.status || 'Active'}
                            </span>
                        </div>
                    </div>

                    <div className="profile-preview-content">
                        <div className="preview-left">
                            <div className="customer-photo">
                                {primaryHolder.customerInfo.photo ? (
                                    <img src={primaryHolder.customerInfo.photo} alt="Customer" />
                                ) : (
                                    <div className="photo-placeholder">
                                        <FontAwesomeIcon icon={faUser} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="preview-info">
                            <div className="preview-row">
                                <h4>{primaryHolder.customerInfo.firstName} {primaryHolder.customerInfo.lastName}</h4>
                                <span className="badge">{primaryHolder.customerInfo.gender}</span>
                            </div>
                            <div className="contact-info">
                                <span><FontAwesomeIcon icon={faPhone} /> {primaryHolder.customerInfo.mobileNo}</span>
                                <span><FontAwesomeIcon icon={faEnvelope} /> {primaryHolder.customerInfo.emailId}</span>
                            </div>
                            <div className="document-info">
                                <span><strong>PAN:</strong> {primaryHolder.customerInfo.panNo}</span>
                                {/* <span><strong>Locker No:</strong> {lockerData.lockerDetails.assignedLocker}</span> */}
                            </div>
                        </div>

                        {/* Commented out preview-docs section
                        <div className="preview-docs">
                            <h5>Uploaded Documents</h5>
                            <div className="doc-list">
                                {primaryHolder.attachments && Object.entries(primaryHolder.attachments).map(([category, documents]) => (
                                    documents.length > 0 && documents.map((doc) => (
                                        <div key={doc.id} className="doc-item">
                                            <FontAwesomeIcon icon={faFileAlt} />
                                            <span className='doc-name' >{doc.name}</span>
                                            <div className="doc-info">
                                                <span className="doc-category">{category}</span>
                                                <span className="doc-size">
                                                    {(doc.size / (1024 * 1024)).toFixed(2)} MB
                                                </span>
                                            </div>
                                            <button
                                                className="view-doc-btn"
                                                onClick={() => handleViewDocument(doc)}
                                                title="View Document"
                                            >
                                                <FontAwesomeIcon icon={faEye} />
                                            </button>
                                        </div>
                                    ))
                                ))}
                            </div>
                        </div>
                        */}
                    </div>
                </div>
            )}

            {/* Using the updated CustomerDetailsOverlay component with API fetching */}
            <CustomerDetailsOverlay
                show={showDetailOverlay}
                onClose={toggleDetailOverlay}
                customerId={primaryHolder?.customerInfo?.customerId}
            />
        </div>
    );
};

export default Customer;