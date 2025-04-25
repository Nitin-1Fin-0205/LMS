import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import LockerRentDetails from './LockerRentDetails';
import { updateLockerDetails, updateRentDetails } from '../store/slices/lockerSlice';
import { API_URL } from '../assets/config';
import '../styles/LockerDetails.css';

const LockerDetails = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const lockerData = useSelector(state => state.locker);
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

    const handleUpdate = (data) => {
        dispatch(updateLockerDetails(data));
        dispatch(updateRentDetails(data));
    };

    const handleSubmit = () => {
        // Add API call for submitting locker and rent details
        navigate(-1);
    };

    return (
        <div className="locker-details-wrapper">
            <h2>Locker Configuration</h2>
            <LockerRentDetails
                onUpdate={handleUpdate}
                initialData={{
                    ...lockerData.lockerDetails,
                    ...lockerData.rentDetails
                }}
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
