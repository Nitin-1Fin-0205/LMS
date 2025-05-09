import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomerInfo from './CustomerInfo';
import Attachments from './Attachments';
import { updateHolderSection, submitCustomerInfo, fetchCustomerById } from '../store/slices/customerSlice';
import { HOLDER_TYPES, HOLDER_SECTIONS, HOLDER_STAGES } from '../constants/holderConstants';
import '../styles/SecondaryHolder.css';

const ThirdHolder = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const thirdHolder = useSelector(state => state.customer.form.thirdHolder);
    const [currentStage, setCurrentStage] = useState(HOLDER_STAGES.CUSTOMER_INFO);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchThirdHolderDetails = async () => {
            try {
                const thirdHolderId = thirdHolder?.customerInfo?.customerId;
                if (thirdHolderId) {
                    await dispatch(fetchCustomerById({
                        customerId: thirdHolderId,
                        holderType: HOLDER_TYPES.THIRD
                    })).unwrap();
                }
            } catch (error) {
                toast.error('Failed to fetch third holder details');
            }
        };

        fetchThirdHolderDetails();
    }, [dispatch, thirdHolder?.customerInfo?.customerId]);

    const handleCustomerInfoUpdate = (data) => {
        dispatch(updateHolderSection({
            holder: HOLDER_TYPES.THIRD,
            section: HOLDER_SECTIONS.CUSTOMER_INFO,
            data
        }));
    };

    const handleAttachmentsUpdate = (data) => {
        dispatch(updateHolderSection({
            holder: HOLDER_TYPES.THIRD,
            section: HOLDER_SECTIONS.ATTACHMENTS,
            data
        }));
    };

    const handleCustomerInfoSubmit = async () => {
        try {
            setIsSubmitting(true);
            const primaryCustomerId = location.state?.customer?.customerInfo?.customerId;

            const submitData = {
                customer_id: thirdHolder.customerInfo.customerId,
                first_name: thirdHolder.customerInfo.firstName,
                middle_name: thirdHolder.customerInfo.middleName,
                last_name: thirdHolder.customerInfo.lastName,
                pan: thirdHolder.customerInfo.panNo,
                aadhar: thirdHolder.customerInfo.aadharNo,
                gender: thirdHolder.customerInfo.gender,
                address: thirdHolder.customerInfo.address,
                guardian_name: thirdHolder.customerInfo.fatherOrHusbandName,
                dob: thirdHolder.customerInfo.dateOfBirth,
                mobile_number: thirdHolder.customerInfo.mobileNo,
                email: thirdHolder.customerInfo.emailId,
                image_base64: thirdHolder.customerInfo.photo,
                locker_center_id: 1,
                parent_customer_id: primaryCustomerId,
            };

            const result = await dispatch(submitCustomerInfo(submitData)).unwrap();

            if (!result.customerId) {
                throw new Error('Failed to create third holder');
            }

            toast.success('Third holder info saved successfully!');
            setCurrentStage(HOLDER_STAGES.ATTACHMENTS);
        } catch (error) {
            toast.error(error.message || 'Failed to save third holder info');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('authToken');

            await fetch(`${API_URL}/customers/secondary-holder/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(thirdHolder)
            });

            toast.success('Secondary holder added successfully!');
            navigate(-1); // Go back to previous page
        } catch (error) {
            toast.error('Failed to add secondary holder');
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
                            initialData={thirdHolder.customerInfo}
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
                                onClick={handleCustomerInfoSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save & Next'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="attachments-container">
                            <Attachments
                                holderType="thirdHolder"
                                onUpdate={handleAttachmentsUpdate}
                                initialData={thirdHolder.attachments}
                            />
                        </div>
                        <div className="stage-actions">
                            <button className="back-button" onClick={() => setCurrentStage(HOLDER_STAGES.CUSTOMER_INFO)}>
                                Back
                            </button>
                            <button className="submit-button" onClick={handleSubmit}>
                                Submit
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ThirdHolder;
