import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import AssignLocker from './AssignLocker';
import AddNominee from './AddNominee';
import { API_URL } from '../assets/config';
import '../styles/LockerRentDetails.css';

const LockerRentDetails = ({ onUpdate, initialData, holderType, centers, isLoadingCenters }) => {
    const [formData, setFormData] = useState({
        center: initialData?.center || "",
        assignedLocker: initialData?.assignedLocker || "",
        lockerId: initialData?.lockerId || null,
        lockerSize: initialData?.lockerSize || "",
        deposit: initialData?.deposit || "",
        rent: initialData?.rent || "",
        admissionFees: initialData?.admissionFees || "",
        total: initialData?.total || "",
        lockerKeyNo: initialData?.lockerKeyNo || "",
        selectedPlan: initialData?.selectedPlan || ""
    });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNomineeModalOpen, setIsNomineeModalOpen] = useState(false);
    const [nominees, setNominees] = useState([]);
    const [isLockerFetching, setIsLockerFetching] = useState(false);
    const [lockerPlans, setLockerPlans] = useState([]);

    const isSecondaryHolder = holderType === 'secondHolder' || holderType === 'thirdHolder';

    const handleInputChange = (field, value) => {
        const updatedData = { ...formData, [field]: value };
        setFormData(updatedData);
        onUpdate(updatedData);
    };

    const handleLockerAssign = async (locker) => {
        const updatedData = {
            ...formData,
            assignedLocker: locker?.locker_number || "",
            lockerId: locker?.locker_id || null,
            lockerSize: locker?.size || ""
        };
        setFormData(updatedData);
        onUpdate(updatedData);
        setIsModalOpen(false);

        // Fetch plans after locker assignment
        if (locker?.locker_id) {
            await handleFetchLockerDetails(locker.locker_id);
        }
    };

    const handlePlanChange = (planId) => {
        const selectedPlan = lockerPlans.find(plan => plan.planId === planId);
        if (selectedPlan) {
            const updatedData = {
                ...formData,
                selectedPlan: planId,
                deposit: selectedPlan.deposit,
                rent: selectedPlan.baseRent,
                admissionFees: selectedPlan.admissionFees,
                total: selectedPlan.grandTotalAmount
            };
            setFormData(updatedData);
            onUpdate(updatedData);
        }
    };

    const handleFetchLockerDetails = async (lockerId) => {
        try {
            setIsLockerFetching(true);
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/lockers/lockers/rent?lockerId=${lockerId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            const data = await response.json();
            if (response.ok) {
                setLockerPlans(data.plans || []);
                toast.success('Locker plans fetched successfully');
            } else {
                toast.error('Failed to fetch locker plans');
            }
        } catch (error) {
            toast.error('Error fetching locker plans');
        } finally {
            setIsLockerFetching(false);
        }
    };

    return (
        <div className="form-section">
            <h2>Locker & Rent Details</h2>

            <div className="locker-rent-container">
                <div className="locker-details">
                    <div className="form-group">
                        <label>Center<span className='required'>*</span></label>
                        <select
                            value={formData.center}
                            onChange={(e) => handleInputChange('center', e.target.value)}
                            required
                            disabled={isLoadingCenters || isSecondaryHolder}
                        >
                            <option value="">Select Center</option>
                            {centers.map((center) => (
                                <option key={center.id} value={center.id}>{center.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group ">
                        <label>Assign Locker<span className='required'>*</span></label>
                        <div className="input-with-button">
                            <input
                                type="text"
                                className="locker-input"
                                value={`${formData.assignedLocker}${formData.lockerSize ? ` (${formData.lockerSize})` : ''}`}
                                placeholder="Assign locker"
                                readOnly
                            />
                            {!isSecondaryHolder && (
                                <button
                                    className="add-center-button"
                                    onClick={() => setIsModalOpen(true)}
                                    disabled={!formData.center}
                                >
                                    <FontAwesomeIcon icon={faPlus} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Locker Key No<span className='required'>*</span></label>
                        <input
                            type="text"
                            placeholder="Enter locker key no"
                            value={formData.lockerKeyNo}
                            onChange={(e) => handleInputChange('lockerKeyNo', e.target.value)}
                        />
                    </div>
                </div>

                <div className="rent-details">
                    {lockerPlans.length > 0 && (
                        <div className="form-group">
                            <label>Select Plan<span className='required'>*</span></label>
                            <select
                                value={formData.selectedPlan}
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

                    <div className="amount-grid">
                        <div className="form-group">
                            <label>Deposit<span className='required'>*</span></label>
                            <input type="text" value={formData.deposit} readOnly />
                        </div>

                        <div className="form-group">
                            <label>Rent<span className='required'>*</span></label>
                            <input type="text" value={formData.rent} readOnly />
                        </div>

                        <div className="form-group">
                            <label>Admission Fees<span className='required'>*</span></label>
                            <input type="text" value={formData.admissionFees} readOnly />
                        </div>

                        <div className="form-group">
                            <label>Total<span className='required'>*</span></label>
                            <input type="text" value={formData.total} readOnly />
                        </div>
                    </div>
                </div>
            </div>

            {/* Nominee section for primary holder */}
            {holderType === 'primaryHolder' && (
                <div className="nominee-section">
                    <div className="nominee-button-container">
                        <button className="nominee-button" onClick={() => setIsNomineeModalOpen(true)}>
                            Add Nominee Details
                        </button>
                    </div>

                    <div className="nominee-cards">
                        {nominees.map((nominee, index) => (
                            <div key={index} className="nominee-card">
                                <h4>Name: {nominee.name}</h4>
                                <p>Relation: {nominee.relation}</p>
                                <p>DOB: {nominee.dob}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modals */}
            <AssignLocker
                isOpen={isModalOpen}
                onLockerAssign={handleLockerAssign}
                onClose={() => setIsModalOpen(false)}
                centerId={formData.center}
            />
            <AddNominee
                isOpen={isNomineeModalOpen}
                onClose={() => setIsNomineeModalOpen(false)}
                onSave={setNominees}
            />
        </div>
    );
};

export default LockerRentDetails;
