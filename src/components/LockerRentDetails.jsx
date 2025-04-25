import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { API_URL } from '../assets/config';
import { updateLockerDetails, updateRentDetails, fetchLockerDetails } from '../store/slices/lockerSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AssignLocker from './AssignLocker';
import AddNominee from './AddNominee';
import '../styles/LockerRentDetails.css';
import axios from 'axios';
const LockerRentDetails = ({ onUpdate, initialData, centers, isLoadingCenters, holderType }) => {
    const dispatch = useDispatch();
    const { lockerDetails } = useSelector(state => state.locker);
    const [lockerPlans, setLockerPlans] = useState([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);

    const isSecondaryHolder = holderType === 'secondHolder' || holderType === 'thirdHolder';

    const handleInputChange = (field, value) => {
        dispatch(updateLockerDetails({ [field]: value }));
    };

    const fetchPlansForLocker = async (lockerId) => {
        try {
            setIsLoadingPlans(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.post(`${API_URL}/lockers/lockers/rent?lockerId=${lockerId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
            const data = await response.data;
            if (response.status === 201) {
                console.log('Plans fetched successfully:', data);
                setLockerPlans(data.plans || []);
                toast.success('Plans fetched successfully');
            }
        } catch (error) {
            console.log('Error fetching plans:', error);
            toast.error('Failed to fetch plans');
        } finally {
            setIsLoadingPlans(false);
        }
    };

    const handleLockerAssign = async (locker) => {
        dispatch(updateLockerDetails({
            assignedLocker: locker?.locker_number || "",
            lockerId: locker?.locker_id || null,
            lockerSize: locker?.size || "",
            isModalOpen: false
        }));

        if (locker?.locker_id) {
            try {
                await dispatch(fetchLockerDetails(locker.locker_id)).unwrap();
                await fetchPlansForLocker(locker.locker_id);
            } catch (error) {
                console.error('Error fetching locker details:', error);
            }
        }
    };

    const handlePlanSelect = (planId) => {
        const selectedPlan = lockerPlans.find(plan => plan.planId === planId);
        if (selectedPlan) {
            // Update lockerDetails with plan information
            dispatch(updateLockerDetails({
                selectedPlan: planId,
                rentDetails: {
                    deposit: selectedPlan.deposit,
                    rent: selectedPlan.baseRent,
                    admissionFees: selectedPlan.admissionFees,
                    total: selectedPlan.grandTotalAmount
                }
            }));
        }
    };

    useEffect(() => {
        console.log("Initial Data in LockerRentDetails:", initialData);
    }, [initialData]);

    return (
        <div className="form-section">
            <h2>Locker & Rent Details</h2>

            <div className="locker-rent-container">
                <div className="locker-details">
                    <div className="form-group">
                        <label>Center<span className='required'>*</span></label>
                        <select
                            value={lockerDetails.center}
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
                                value={`${lockerDetails.assignedLocker}${lockerDetails.lockerSize ? ` (${lockerDetails.lockerSize})` : ''}`}
                                placeholder="Assign locker"
                                readOnly
                            />
                            {!isSecondaryHolder && (
                                <button
                                    className="add-center-button"
                                    onClick={() => dispatch(updateLockerDetails({ isModalOpen: true }))}
                                    disabled={!lockerDetails.center}
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
                            value={lockerDetails.lockerKeyNo || ''}
                            onChange={(e) => handleInputChange('lockerKeyNo', e.target.value)}
                        />
                    </div>
                </div>

                <div className="rent-details">
                    {lockerPlans.length > 0 && (
                        <div className="form-group">
                            <label>Select Plan<span className='required'>*</span></label>
                            <select
                                value={lockerDetails.selectedPlan || ''}
                                onChange={(e) => handlePlanSelect(e.target.value)}
                                disabled={isLoadingPlans}
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
                        <input type="text" value={lockerDetails.rentDetails?.deposit || ''} readOnly />
                    </div>

                    <div className="form-group">
                        <label>Rent<span className='required'>*</span></label>
                        <input type="text" value={lockerDetails.rentDetails?.rent || ''} readOnly />
                    </div>

                    <div className="form-group">
                        <label>Admission Fees<span className='required'>*</span></label>
                        <input type="text" value={lockerDetails.rentDetails?.admissionFees || ''} readOnly />
                    </div>

                    <div className="form-group">
                        <label>Total<span className='required'>*</span></label>
                        <input type="text" value={lockerDetails.rentDetails?.total || ''} readOnly />
                    </div>
                </div>
            </div>

            {holderType === 'primaryHolder' && (
                <div className="nominee-section">
                    <div className="nominee-button-container">
                        <button
                            className="nominee-button"
                            onClick={() => dispatch(updateLockerDetails({ isNomineeModalOpen: true }))}
                        >
                            {lockerDetails.nominees?.length > 0 ? 'Update Nominees' : 'Add Nominee Details'}
                        </button>
                    </div>

                    {lockerDetails.nominees?.length > 0 && (
                        <div className="nominee-cards">
                            {lockerDetails.nominees.map((nominee, index) => (
                                <div key={index} className="nominee-card">
                                    <h4>Name: {nominee.name}</h4>
                                    <p>Relation: {nominee.relation}</p>
                                    <p>DOB: {nominee.dob}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <AssignLocker
                isOpen={lockerDetails.isModalOpen}
                onLockerAssign={handleLockerAssign}
                onClose={() => dispatch(updateLockerDetails({ isModalOpen: false }))}
                centerId={lockerDetails.center}
            />
            <AddNominee
                isOpen={lockerDetails.isNomineeModalOpen}
                onClose={() => dispatch(updateLockerDetails({ isNomineeModalOpen: false }))}
                onSave={(nominees) => dispatch(updateLockerDetails({ nominees }))}
            />
        </div>
    );
};

export default LockerRentDetails;
