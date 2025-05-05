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

const Customer = () => {
    const dispatch = useDispatch();
    const { form, isSubmitting } = useSelector(state => state.customer);
    const primaryHolder = form.primaryHolder;
    const lockerData = useSelector(state => state.locker);
    const [formData, setFormData] = useState(() => {
        const savedForm = sessionStorage.getItem('customerSearchForm');
        // Ensure default values are never undefined
        return {
            pan: '',
            center: '',
            ...(savedForm ? JSON.parse(savedForm) : {})
        };
    });
    const [centers, setCenters] = useState([]);
    const navigate = useNavigate();
    const [activeCard, setActiveCard] = useState(null);

    const fetchCenters = async () => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/lockers/locker-centers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCenters(response.data);
        } catch (error) {
            toast.error('Failed to fetch centers');
        }
    };

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
            const { pan, center } = JSON.parse(editData);
            setFormData({ pan, center });
            handleSubmit(new Event('submit'));
            sessionStorage.removeItem('editCustomerData');
        }
        fetchCenters();
    }, []);

    useEffect(() => {
        sessionStorage.setItem('customerSearchForm', JSON.stringify(formData));
    }, [formData]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Validate form data before submission
        if (!formData.pan || !formData.center) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            const result = await dispatch(fetchCustomerByPan({
                pan: formData.pan,
                centerId: formData.center
            })).unwrap();

            if (result.primaryHolder) {
                dispatch(updateHolderSection({
                    holder: HOLDER_TYPES.PRIMARY,
                    section: HOLDER_SECTIONS.CUSTOMER_INFO,
                    data: result.primaryHolder.customerInfo
                }));

                // Update attachments if they exist
                if (result.primaryHolder.attachments) {
                    dispatch(updateHolderSection({
                        holder: HOLDER_TYPES.PRIMARY,
                        section: HOLDER_SECTIONS.ATTACHMENTS,
                        data: result.primaryHolder.attachments
                    }));
                }

                // First update locker details with center
                dispatch(updateLockerDetails({
                    center: formData.center,
                    ...result.lockerDetails,
                }));

                // Then update rent details if they exist
                if (result.lockerDetails?.rentDetails) {
                    dispatch(updateRentDetails(result.lockerDetails.rentDetails));
                }

                toast.success('Customer details fetched successfully');
            } else {
                dispatch(updateHolderSection({
                    holder: HOLDER_TYPES.PRIMARY,
                    section: HOLDER_SECTIONS.CUSTOMER_INFO,
                    data: { panNo: formData.pan }
                }));

                dispatch(updateLockerDetails({
                    center: formData.center,
                    assignedLocker: '',
                    lockerId: '',
                    lockerSize: '',
                    lockerKeyNo: '',
                    remarks: '',
                    isModalOpen: false,
                    isNomineeModalOpen: false,
                    nominees: []
                }));

                toast.info('No existing customer found. You can add a new customer.');
            }
        } catch (error) {
            console.error('Error fetching customer details:', error);
            toast.error('Failed to fetch customer details');
        }
    };

    const handleReset = () => {
        // Reset to initial empty values, not undefined
        setFormData({ pan: '', center: '' });
        dispatch(resetForm());
        dispatch(clearAllLockerData());
        sessionStorage.removeItem('customerSearchForm');
    };

    return (
        <div className="new-customer-container">
            <form onSubmit={handleSubmit} className="initial-form">
                <div className="form-group">
                    <label>PAN Number</label>
                    <input
                        type="text"
                        value={formData.pan || ''} // Ensure value is never undefined
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            pan: e.target.value
                        }))}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Locker Center</label>
                    <select
                        value={formData.center || ''} // Ensure value is never undefined
                        onChange={(e) => setFormData(prev => ({
                            ...prev,
                            center: e.target.value
                        }))}
                        required
                    >
                        <option value="">Select Center</option>
                        {centers.map((center) => (
                            <option key={center.id} value={center.id}>
                                {center.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="fetch-cust-actions">
                    <button type="submit" className="fetch-button" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <span>Fetching... <FontAwesomeIcon icon={faSpinner} /></span>
                        ) : (
                            <span>
                                Fetch Customer
                                <FontAwesomeIcon icon={faDownload} />
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
                    disabled={!primaryHolder?.customerInfo?.customerId}
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
                        <span className="customer-status">
                            {primaryHolder.customerInfo.status || 'Active'}
                        </span>
                    </div>

                    <div className="preview-content">
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
                            <div className="customer-id">#{primaryHolder.customerInfo.customerId}</div>
                        </div>

                        <div className="preview-info">
                            <div className="preview-row">
                                <h4>{primaryHolder.customerInfo.customerName}</h4>
                                <span className="badge">{primaryHolder.customerInfo.gender}</span>
                            </div>
                            <div className="contact-info">
                                <span><FontAwesomeIcon icon={faPhone} /> {primaryHolder.customerInfo.mobileNo}</span>
                                <span><FontAwesomeIcon icon={faEnvelope} /> {primaryHolder.customerInfo.emailId}</span>
                            </div>
                            <div className="document-info">
                                <span><strong>PAN:</strong> {primaryHolder.customerInfo.panNo}</span>
                                <span><strong>Locker No:</strong> {lockerData.lockerDetails.assignedLocker}</span>
                            </div>
                        </div>

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
                    </div>
                </div>
            )}
        </div>
    );
};

export default Customer;