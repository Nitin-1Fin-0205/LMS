import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../assets/config';
import '../styles/Customer.css';
import { useNavigate } from 'react-router-dom';
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
    const { form, isSubmitting } = useSelector(state => state.customer);
    const primaryHolder = form.primaryHolder;
    const secondaryHolder = form.secondaryHolder;
    const thirdHolder = form.thirdHolder;
    const lockerData = useSelector(state => state.locker);
    const [formData, setFormData] = useState(() => {
        const savedForm = sessionStorage.getItem('customerSearchForm');
        return {
            pan: '',
            ...(savedForm ? JSON.parse(savedForm) : {})
        };
    });
    const navigate = useNavigate();
    const [activeCard, setActiveCard] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showDetailOverlay, setShowDetailOverlay] = useState(false);

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
    };

    useEffect(() => {
        const editData = sessionStorage.getItem('editCustomerData');
        if (editData) {
            const { pan } = JSON.parse(editData);
            setFormData({ pan });
            setIsEditMode(true);
            sessionStorage.removeItem('editCustomerData');
        }
    }, []);

    useEffect(() => {
        if (isEditMode && formData.pan) {
            handleSubmit();
            setIsEditMode(false);
        }
    }, [formData.pan, isEditMode]);

    const handlePanChange = (e) => {
        const pan = e.target.value.toUpperCase();
        const validation = ValidationService.isValidPAN(pan);

        if (pan.length === 10 && !validation.isValid) {
            toast.error(validation.error);
        }

        setFormData(prev => ({
            ...prev,
            pan
        }));
    };

    const handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        if (!formData.pan) {
            if (e) toast.error('Please enter PAN number');
            return;
        }

        const panValidated = ValidationService.validateField('pan', formData.pan);

        if (!panValidated.isValid) {
            if (e) toast.error(panValidated.error);
            return;
        }

        dispatch(resetForm());
        dispatch(clearAllLockerData());
        setActiveCard(null);

        try {
            const result = await dispatch(fetchCustomerByPan({
                pan: formData.pan.trim().toUpperCase()
            })).unwrap();

            sessionStorage.setItem('customerSearchForm', JSON.stringify(formData));

        } catch (error) {
            toast.dismiss()
            console.error('Error fetching customer details:', error);
            if (e) toast.error(error || 'Failed to fetch customer details');
        }
    };

    const handleReset = () => {
        setFormData({ pan: '' });
        dispatch(resetForm());
        dispatch(clearAllLockerData());
        sessionStorage.removeItem('customerSearchForm');
    };

    const toggleDetailOverlay = () => {
        setShowDetailOverlay(!showDetailOverlay);
    };

    return (
        <div className="new-customer-container">
            <form onSubmit={handleSubmit} className="initial-form">
                <div className="form-group">
                    <label>PAN Number</label>
                    <input
                        type="text"
                        value={formData.pan || ''}
                        onChange={handlePanChange}
                        maxLength={10}
                        required
                    />
                </div>
                <div className="fetch-cust-actions">
                    <button type="submit" className="fetch-button" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <span>Fetching... &nbsp; <FontAwesomeIcon icon={faSpinner} spin /></span>
                        ) : (
                            <span>
                                Fetch Customer &nbsp; <FontAwesomeIcon icon={faDownload} />
                            </span>
                        )}
                    </button>
                    <button
                        type="button"
                        className="reset-button"
                        onClick={handleReset}
                    >
                        Reset <FontAwesomeIcon icon={faArrowsRotate} />
                    </button>
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
                    <div className="preview-header">
                        <h3>Customer Details</h3>
                        <div className="preview-actions">
                            <button
                                className="view-details-btn"
                                onClick={toggleDetailOverlay}
                                title="View Full Details"
                            >
                                <FontAwesomeIcon icon={faEye} />
                            </button>
                            <span className="customer-status">
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