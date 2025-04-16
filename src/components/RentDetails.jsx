import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL } from '../assets/config'

const RentDetails = ({ onUpdate, initialData }) => {
    const [rentData, setRentData] = useState(initialData || {
        lockerNo: "",
        deposit: "",
        rent: "",
        admissionFees: "",
        total: "",
        lockerKeyNo: "",
        contactNumber: "",
        selectedPlan: ""
    });

    const [isLockerFetching, setIsLockerFetching] = useState(false);
    const [lockerPlans, setLockerPlans] = useState([]);

    // Add effect to sync with initialData changes
    useEffect(() => {
        if (initialData) {
            setRentData(prev => ({
                ...prev,
                ...initialData
            }));
        }
    }, [initialData]);

    const handleInputChange = (field, value) => {
        // Prevent changes to lockerNo
        if (field === 'lockerNo') return;

        const updatedData = {
            ...rentData,
            [field]: value
        };
        setRentData(updatedData);
        onUpdate(updatedData);
    };

    const handlePlanChange = (planId) => {
        const selectedPlan = lockerPlans.find(plan => plan.planId === planId);
        if (selectedPlan) {
            const updatedData = {
                ...rentData,
                selectedPlan: planId,
                deposit: selectedPlan.deposit,
                rent: selectedPlan.baseRent,
                admissionFees: selectedPlan.admissionFees,
                total: selectedPlan.grandTotalAmount
            };
            setRentData(updatedData);
            onUpdate(updatedData);
        }
    };

    const handleFetchLockerDetails = async () => {
        try {
            if (!rentData.lockerId) {
                toast.error('Failed to Fetch the Locker details');
                return;
            }

            setIsLockerFetching(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/lockers/lockers/rent?lockerId=${rentData.lockerId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
            });

            const data = await response.json();
            if (response.ok) {
                setLockerPlans(data.plans || []);
                setRentData(prev => ({
                    ...prev,
                    lockerKeyNo: ''
                }));
                toast.success('Locker details fetched successfully');
            } else {
                toast.error(`Failed to fetch locker details: ${data.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error fetching locker details:', error);
            toast.error('Failed to fetch locker details');
        } finally {
            setIsLockerFetching(false);
        }
    };

    const handleSaveLockerDetails = () => {
        console.log('Locker details saved!');
        toast.success('Locker details saved successfully!');
    };

    return (
        <div className="form-section">
            <h2>Rent Details</h2>
            <div className="form-group">
                <label>Locker No<span className='required'>*</span></label>
                <div className="input-button-group">
                    <input
                        type="text"
                        value={rentData.lockerNo || ''}
                        readOnly
                        className="form-control readonly-input"
                        style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                    />
                    <button
                        className="fetch-details-button"
                        onClick={handleFetchLockerDetails}
                        disabled={isLockerFetching || !rentData.lockerNo}
                    >
                        {isLockerFetching ? 'Fetching Plans...' : 'Get Locker Plans'}
                    </button>
                </div>
            </div>

            {lockerPlans.length > 0 && (
                <div className="form-group">
                    <label>Select Plan<span className='required'>*</span></label>
                    <select
                        value={rentData.selectedPlan}
                        onChange={(e) => handlePlanChange(e.target.value)}
                        className="plan-select"
                    >
                        <option value="">Select a plan</option>
                        {lockerPlans.map(plan => (
                            <option key={plan.planId} value={plan.planId}>
                                {plan.name} - ₹{plan.grandTotalAmount}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="form-group">
                <label>Deposit<span className='required'>*</span></label>
                <input
                    type="text"
                    placeholder="Enter deposit"
                    value={rentData.deposit}
                    onChange={(e) => handleInputChange('deposit', e.target.value)}
                    readOnly
                />
            </div>
            <div className="form-group">
                <label>Rent<span className='required'>*</span></label>
                <input
                    type="text"
                    placeholder="Enter rent"
                    value={rentData.rent}
                    onChange={(e) => handleInputChange('rent', e.target.value)}
                    readOnly
                />
            </div>
            <div className="form-group">
                <label>Admission Fees<span className='required'>*</span></label>
                <input
                    type="text"
                    placeholder="Enter admission fees"
                    value={rentData.admissionFees}
                    onChange={(e) => handleInputChange('admissionFees', e.target.value)}
                    readOnly
                />
            </div>
            <div className="form-group">
                <label>Total<span className='required'>*</span></label>
                <input
                    type="text"
                    placeholder="Enter total"
                    value={rentData.total}
                    onChange={(e) => handleInputChange('total', e.target.value)}
                    readOnly
                />
            </div>
            <div className="form-group">
                <label>Locker Key No<span className='required'>*</span></label>
                <input type="text" placeholder="Enter locker key no" value={rentData.lockerKeyNo} onChange={(e) => handleInputChange('lockerKeyNo', e.target.value)} />
            </div>
            <div className="form-group">
                <label>Contact Number<span className='required'>*</span></label>
                <input type="text" placeholder="Enter contact no" value={rentData.contactNumber} onChange={(e) => handleInputChange('contactNumber', e.target.value)} />
            </div>
            <div className="form-actions">
                <button className="save-button" onClick={handleSaveLockerDetails}>
                    Save Locker Details
                </button>
                <button className="view-button">View Detailed Rent</button>
            </div>
        </div>
    );
};

export default RentDetails;
