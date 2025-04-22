import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../assets/config';
import '../styles/Customer.css';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../constants/routes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserPlus, faVault, faFileAlt, faEye } from '@fortawesome/free-solid-svg-icons';

const Customer = () => {
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        pan: '',
        center: '',
    });
    const [centers, setCenters] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentCustomer, setCurrentCustomer] = useState(null);
    const [primaryHolder, setPrimaryHolder] = useState(true);
    const [secondaryHolder, setSecondaryHolder] = useState(null);
    const [lockerDetails, setLockerDetails] = useState(null);
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
        navigate(ROUTES.PRIMARY_HOLDER, { state: { customer: currentCustomer } });
    };

    const handleSecondaryHolder = () => {
        navigate(ROUTES.SECONDARY_HOLDER, { state: { customer: currentCustomer } });
    };

    const handleThirdHolder = () => {
        navigate(ROUTES.THIRD_HOLDER, { state: { customer: currentCustomer } });
    };

    useEffect(() => {
        fetchCenters();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // TODO: Uncomment when API is ready
            // const token = localStorage.getItem('authToken');
            // const response = await axios.post(`${API_URL}/customers/pan-details`,
            //     { panNo: formData.pan },
            //     { headers: { 'Authorization': `Bearer ${token}` } }
            // );
            // setCurrentCustomer(response.data);

            // Temporary mock response with documents
            const mockedResponse = {
                status: 200,
                data: {
                    name: "John Doe",
                    pan: formData.pan,
                    phoneNumber: "9876543210",
                    email: "john.doe@example.com",
                    dob: "1990-01-01",
                    gender: "MALE",
                    address: "123 Main St, Mumbai",
                    lockerNo: "LOCKER123",
                    customerId: "CUST001",
                    status: "ACTIVE",
                    documents: {
                        panCard: {
                            name: "PAN_Card.pdf",
                            url: "https://example.com/dummy/pan.pdf",
                            type: "application/pdf"
                        },
                        aadharCard: {
                            name: "Aadhar_Card.pdf",
                            url: "https://example.com/dummy/aadhar.pdf",
                            type: "application/pdf"
                        }
                    }
                }
            };
            setCurrentCustomer(mockedResponse.data);
            toast.success('Details fetched successfully');
        } catch (error) {
            toast.error('Failed to fetch details');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDocument = (doc) => {
        // In real implementation, this would open the document URL
        // For now, just show a toast
        toast.info(`Viewing ${doc.name}`);
        window.open(doc.url, '_blank');
    };

    return (
        <div className="new-customer-container">
            <form onSubmit={handleSubmit} className="initial-form">
                <div className="form-group">
                    <label>PAN Number</label>
                    <input
                        type="text"
                        value={formData.pan}
                        onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Locker Center</label>
                    <select
                        value={formData.center}
                        onChange={(e) => setFormData({ ...formData, center: e.target.value })}
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
                <button type="submit" className="fetch-button" disabled={isLoading}>
                    {isLoading ? 'Fetching...' : 'Fetch Details'}
                </button>
            </form>

            <div className="action-cards">
                <button
                    className={`card-button ${activeCard === 'primary' ? 'active' : ''}`}
                    onClick={handlePrimaryHolder}
                    disabled={!primaryHolder}
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
                    onClick={() => setActiveCard('locker')}
                    disabled={!lockerDetails}
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

            {currentCustomer && (
                <div className="customer-preview">
                    <div className="preview-header">
                        <h3>Customer Details</h3>
                        <span className="customer-status">{currentCustomer.status}</span>
                    </div>

                    <div className="preview-content">
                        <div className="preview-left">
                            <div className="customer-photo">
                                {currentCustomer.photo ? (
                                    <img src={currentCustomer.photo} alt="Customer" />
                                ) : (
                                    <div className="photo-placeholder">
                                        <FontAwesomeIcon icon={faUser} />
                                    </div>
                                )}
                            </div>
                            <div className="customer-id">#{currentCustomer.customerId}</div>
                        </div>

                        <div className="preview-info">
                            <div className="preview-row">
                                <h4>{currentCustomer.name}</h4>
                                <span className="badge">{currentCustomer.gender}</span>
                            </div>
                            <div className="contact-info">
                                <span><FontAwesomeIcon icon="phone" /> {currentCustomer.phoneNumber}</span>
                                <span><FontAwesomeIcon icon="envelope" /> {currentCustomer.email}</span>
                            </div>
                            <div className="document-info">
                                <span><strong>PAN:</strong> {currentCustomer.pan}</span>
                                <span><strong>Locker No:</strong> {currentCustomer.lockerNo}</span>
                            </div>
                        </div>

                        <div className="preview-docs">
                            <h5>Uploaded Documents</h5>
                            <div className="doc-list">
                                {currentCustomer?.documents && Object.entries(currentCustomer.documents).map(([key, doc]) => (
                                    <div key={key} className="doc-item" onClick={() => handleViewDocument(doc)}>
                                        <FontAwesomeIcon icon={faFileAlt} />
                                        <span>{doc.name}</span>
                                        <button className="view-doc-btn">
                                            <FontAwesomeIcon icon={faEye} />
                                        </button>
                                    </div>
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