import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomerInfo from './CustomerInfo';
import Attachments from './Attachments';
import { API_URL } from '../assets/config';
import { updateHolderSection, submitCustomerInfo, fetchCustomerById } from '../store/slices/customerSlice';
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

    useEffect(() => {
        const fetchSecondaryHolderDetails = async () => {
            try {
                const secondaryHolderId = secondaryHolder?.customerInfo?.customerId;
                console.log('Secondary Holder:',);

                if (secondaryHolderId) {
                    await dispatch(fetchCustomerById(secondaryHolderId)).unwrap();
                }
            } catch (error) {
                toast.error('Failed to fetch secondary holder details');
                console.error('Error:', error);
            }
        };

        fetchSecondaryHolderDetails();
    }, [dispatch, location.state]);

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

    const handleCustomerInfoSubmit = async () => {
        try {
            setIsSubmitting(true);
            const primaryCustomerId = location.state?.customer?.customerInfo?.customerId;

            const submitData = {
                customer_id: secondaryHolder.customerInfo.customerId,
                first_name: secondaryHolder.customerInfo.firstName,
                middle_name: secondaryHolder.customerInfo.middleName,
                last_name: secondaryHolder.customerInfo.lastName,
                pan: secondaryHolder.customerInfo.panNo,
                aadhar: secondaryHolder.customerInfo.aadharNo,
                gender: secondaryHolder.customerInfo.gender,
                address: secondaryHolder.customerInfo.address,
                guardian_name: secondaryHolder.customerInfo.fatherOrHusbandName,
                dob: secondaryHolder.customerInfo.dateOfBirth,
                mobile_number: secondaryHolder.customerInfo.mobileNo,
                email: secondaryHolder.customerInfo.emailId,
                image_base64: secondaryHolder.customerInfo.photo,
                locker_center_id: primaryCustomerId,
                parent_customer_id: primaryCustomerId,
            };

            const result = await dispatch(submitCustomerInfo(submitData)).unwrap();

            if (!result.customerId) {
                throw new Error('Failed to create secondary holder');
            }

            toast.success('Secondary holder info saved successfully!');
            setCurrentStage(HOLDER_STAGES.ATTACHMENTS);
        } catch (error) {
            toast.error(error.message || 'Failed to save secondary holder info');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAttachmentsSubmit = async () => {
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
                                onClick={handleAttachmentsSubmit}
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
