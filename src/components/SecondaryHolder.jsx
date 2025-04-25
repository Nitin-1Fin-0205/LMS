import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomerInfo from './CustomerInfo';
import Attachments from './Attachments';
import { API_URL } from '../assets/config';
import { updateHolderSection } from '../store/slices/customerSlice';
import { HOLDER_TYPES, HOLDER_SECTIONS, HOLDER_STAGES } from '../constants/holderConstants';
import '../styles/SecondaryHolder.css';

const SecondaryHolder = () => {
    const dispatch = useDispatch();
    const secondaryHolder = useSelector(state => state.customer.form.secondaryHolder);
    const location = useLocation();
    const navigate = useNavigate();
    const customerData = location.state?.customer;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStage, setCurrentStage] = useState(HOLDER_STAGES.CUSTOMER_INFO);

    const handleCustomerInfoUpdate = (data) => {
        dispatch(updateHolderSection({
            holder: HOLDER_TYPES.SECONDARY,
            section: HOLDER_SECTIONS.CUSTOMER_INFO,
            data
        }));
    };

    const handleAttachmentsUpdate = (data) => {
        dispatch(updateHolderSection({
            holder: HOLDER_TYPES.SECONDARY,
            section: HOLDER_SECTIONS.ATTACHMENTS,
            data
        }));
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('authToken');

            await fetch(`${API_URL}/customers/secondary-holder/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(secondaryHolder)
            });

            toast.success('Secondary holder added successfully!');
            navigate(-1); // Go back to previous page
        } catch (error) {
            toast.error('Failed to add secondary holder');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="secondary-holder-container">
            <div className="stages-progress">
                <div className={`stage ${currentStage === HOLDER_STAGES.CUSTOMER_INFO ? 'active' : ''}`}>
                    Customer Info
                </div>
                <div className={`stage ${currentStage === HOLDER_STAGES.ATTACHMENTS ? 'active' : ''}`}>
                    Documents
                </div>
            </div>
            <div className="stage-container">
                {currentStage === HOLDER_STAGES.CUSTOMER_INFO ? (
                    <>
                        <CustomerInfo
                            initialData={secondaryHolder.customerInfo}
                            onUpdate={handleCustomerInfoUpdate}
                        />
                        <div className="stage-actions">
                            <button
                                className="back-button"
                                onClick={() => navigate(-1)}
                            >
                                Back
                            </button>
                            <button
                                className="next-button"
                                onClick={() => setCurrentStage(HOLDER_STAGES.ATTACHMENTS)}
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="attachments-container">
                            <Attachments
                                holderType="secondaryHolder"
                                onUpdate={handleAttachmentsUpdate}
                                initialData={secondaryHolder.attachments}
                            />
                        </div>
                        <div className="stage-actions">
                            <button
                                className="back-button"
                                onClick={() => setCurrentStage(HOLDER_STAGES.CUSTOMER_INFO)}
                            >
                                Back
                            </button>
                            <button
                                className="submit-button"
                                onClick={handleSubmit}
                            >
                                Submit
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SecondaryHolder;
