import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import LockerRentDetails from './LockerRentDetails';
import { updateLockerDetails, updateRentDetails, fetchLockerDetails } from '../store/slices/lockerSlice';
import { API_URL } from '../assets/config';
import '../styles/LockerDetails.css';

const LockerDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const lockerData = useSelector(state => state.locker);
    const primaryHolder = useSelector(state => state.customer.form.primaryHolder);
    const [centers, setCenters] = useState([]);
    const [isLoadingCenters, setIsLoadingCenters] = useState(false);

    const fetchCenters = async () => {
        try {
            setIsLoadingCenters(true);
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/lockers/locker-centers`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setCenters(response.data);
        } catch (error) {
            toast.error('Failed to fetch centers');
        } finally {
            setIsLoadingCenters(false);
        }
    };

    useEffect(() => {
        fetchCenters();
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                if (primaryHolder?.customerInfo?.customerId) {
                    const response = await dispatch(fetchLockerDetails(primaryHolder.customerInfo.customerId)).unwrap();

                    // If plan exists, fetch the plans and set the details
                    if (response.data.lockers[0]?.plan_id) {
                        const planId = response.data.lockers[0].plan_id;
                        const lockerId = response.data.lockers[0].lockerId;

                        // Fetch plans for the locker
                        const token = localStorage.getItem('authToken');
                        const plansResponse = await axios.post(
                            `${API_URL}/lockers/lockers/rent?lockerId=${lockerId}`,
                            {},
                            {
                                headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        // Find the selected plan and update rent details
                        const selectedPlan = plansResponse.data.plans.find(
                            plan => Number(plan.planId) === Number(planId)
                        );

                        if (selectedPlan) {
                            dispatch(updateLockerDetails({
                                rentDetails: {
                                    deposit: selectedPlan.deposit,
                                    rent: selectedPlan.baseRent,
                                    admissionFees: selectedPlan.admissionFees,
                                    total: selectedPlan.grandTotalAmount
                                }
                            }));
                        }
                    }
                }
            } catch (error) {
                toast.error('Failed to fetch locker details');
            }
        };

        fetchInitialData();
    }, [dispatch, primaryHolder?.customerInfo?.customerId]);

    const handleSubmit = () => {
        // Add API call for submitting locker and rent details
        navigate(-1);
    };

    return (
        <div className="locker-details-wrapper">
            <LockerRentDetails
                centers={centers}
                isLoadingCenters={isLoadingCenters}
                holderType="primaryHolder"
            />
            <div className="action-buttons">
                <button className="back-button" onClick={() => navigate(-1)}>
                    Back
                </button>
                <button className="submit-button" onClick={handleSubmit}>
                    Save Changes
                </button>
            </div>
        </div>
    );
};

export default LockerDetails;
