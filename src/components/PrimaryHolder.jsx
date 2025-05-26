import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import CustomerInfo from './CustomerInfo';
import Attachments from './Attachments';
import CustomerKYCSection from './CustomerKYCSection';
import StagesProgress from './StagesProgress';
import { API_URL } from '../assets/config';
import '../styles/PrimaryHolder.css';
import { useNavigate } from 'react-router-dom';
import { updateHolderSection, submitCustomerInfo, fetchCustomerById } from '../store/slices/customerSlice';
import { HOLDER_TYPES, HOLDER_SECTIONS, HOLDER_STAGES, STAGE_STATUS } from '../constants/holderConstants';
import { ValidationService } from '../services/ValidationService';

const PrimaryHolder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const formData = useSelector(state => state.customer.form.primaryHolder);
    const isSubmitting = useSelector(state => state.customer.isSubmitting);
    const { customerId, isCustomerCreated } = useSelector(state => state.customer);
    const [currentStage, setCurrentStage] = useState(HOLDER_STAGES.CUSTOMER_INFO);
    const [loading, setLoading] = useState(false);
    const [stageStatus, setStageStatus] = useState({
        [HOLDER_STAGES.CUSTOMER_INFO]: STAGE_STATUS.NOT_STARTED,
        [HOLDER_STAGES.ATTACHMENTS]: STAGE_STATUS.NOT_STARTED,
        [HOLDER_STAGES.BIOMETRIC]: STAGE_STATUS.NOT_STARTED
    });

    // Fetch primary holder details when component mounts or customerId changes
    useEffect(() => {
        const fetchPrimaryHolderDetails = async () => {
            try {
                if (customerId) {
                    setLoading(true);
                    await dispatch(fetchCustomerById({
                        customerId,
                        holderType: HOLDER_TYPES.PRIMARY
                    })).unwrap();

                    // Update stage status to completed for customer info if we have a customer ID
                    setStageStatus(prev => ({
                        ...prev,
                        [HOLDER_STAGES.CUSTOMER_INFO]: STAGE_STATUS.COMPLETED
                    }));
                }
            } catch (error) {
                console.error('Error fetching primary holder details:', error);
                toast.error('Failed to fetch customer details');
            } finally {
                setLoading(false);
            }
        };

        fetchPrimaryHolderDetails();
    }, [dispatch, customerId]);

    useEffect(() => {
        // Log form data when it changes
        console.log('Form Data Updated:', formData);
    }, [formData]);

    const handleCustomerInfoUpdate = (data) => {
        dispatch(updateHolderSection({
            holder: HOLDER_TYPES.PRIMARY,
            section: HOLDER_SECTIONS.CUSTOMER_INFO,
            data
        }));
    };

    const handleBiometricUpdate = (data) => {
        dispatch(updateHolderSection({
            holder: HOLDER_TYPES.PRIMARY,
            section: HOLDER_SECTIONS.BIOMETRIC,
            data
        }));
    };

    const handleStageTransition = async (newStage) => {
        // // Fetch attachments when moving to attachments stage
        // if (newStage === HOLDER_STAGES.ATTACHMENTS && customerId) {
        //     try {
        //         await dispatch(fetchCustomerAttachments(customerId)).unwrap();
        //     } catch (error) {
        //         toast.error('Failed to fetch customer documents');
        //         console.error('Error fetching attachments:', error);
        //     }
        // }
        setCurrentStage(newStage);
    };

    const getStageData = (stage) => {
        switch (stage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                return formData.customerInfo;
            case HOLDER_STAGES.BIOMETRIC:
                return formData.biometric;
            case HOLDER_STAGES.ATTACHMENTS:
                return formData.attachments;
            default:
                return {};
        }
    };

    const submitCurrentStage = async () => {
        try {
            const stageData = getStageData(currentStage);
            const validation = ValidationService.validateStageData(currentStage, stageData);

            if (!validation.isValid) {
                toast.error(validation.error);
                return;
            }

            if (currentStage === HOLDER_STAGES.CUSTOMER_INFO) {
                const submitData = {
                    customer_id: formData.customerInfo.customerId,
                    first_name: `${formData.customerInfo.firstName}`,
                    middle_name: `${formData.customerInfo.middleName}`,
                    last_name: `${formData.customerInfo.lastName}`,
                    pan: formData.customerInfo.panNo,
                    aadhar: formData.customerInfo.aadharNo,
                    gender: formData.customerInfo.gender,
                    address: formData.customerInfo.address,
                    guardian_name: formData.customerInfo.fatherOrHusbandName,
                    dob: formData.customerInfo.dateOfBirth,
                    mobile_number: formData.customerInfo.mobileNo,
                    email: formData.customerInfo.emailId,
                    locker_center_id: formData.customerInfo.lockerCenterId || 1,
                    city: formData.customerInfo.city,
                    state: formData.customerInfo.state,
                    state_code: formData.customerInfo.statecode,
                };
                const result = await dispatch(submitCustomerInfo({ customerData: submitData, holderType: HOLDER_TYPES.PRIMARY })).unwrap();

                console.log('Customer Info Submission Result:', result);
                if (!result.customerId) {
                    throw new Error('Failed to create customer');
                } else {
                    toast.success('Customer details saved successfully!');
                    setStageStatus(prev => ({
                        ...prev,
                        [currentStage]: STAGE_STATUS.COMPLETED
                    }));
                    handleStageTransition(HOLDER_STAGES.ATTACHMENTS);
                    return;
                }
            }
            if (!customerId) {
                toast.error('Please complete customer information first');
                setCurrentStage(HOLDER_STAGES.CUSTOMER_INFO);
                return;
            }

            setStageStatus(prev => ({
                ...prev,
                [currentStage]: STAGE_STATUS.COMPLETED
            }));

            handleStageTransition(currentStage === HOLDER_STAGES.ATTACHMENTS ? HOLDER_STAGES.BIOMETRIC : HOLDER_STAGES.CUSTOMER_INFO);
        } catch (error) {
            setStageStatus(prev => ({
                ...prev,
                [currentStage]: STAGE_STATUS.ERROR
            }));
            toast.error(error.message || `Failed to save ${currentStage} data`);
        }
    };

    const validateAndSubmitStage = () => {
        submitCurrentStage();
    };

    const canNavigateToStage = (stage) => {
        if (stage === HOLDER_STAGES.CUSTOMER_INFO) return true;
        return isCustomerCreated && customerId;
    };

    const renderStage = () => {
        // console.log('Rendering stage:', currentStage);
        switch (currentStage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                return (
                    <div className="stage-container">
                        <CustomerInfo
                            initialData={formData.customerInfo}
                            onUpdate={handleCustomerInfoUpdate}
                        />
                        <div className="stage-actions">
                            <div className="action-buttons">
                                <button className="back-button" onClick={() => navigate(-1)}>
                                    Back
                                </button>
                                <button
                                    className="save-button"
                                    onClick={validateAndSubmitStage}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    className="next-button"
                                    onClick={() => handleStageTransition(HOLDER_STAGES.ATTACHMENTS)}
                                    disabled={!customerId}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case HOLDER_STAGES.ATTACHMENTS:
                return (
                    <div className="stage-container">
                        <div className="attachments-container">
                            <Attachments
                                initialData={formData.attachments}
                                customerId={customerId}
                            />
                        </div>
                        <div className="stage-actions">
                            <div className="action-buttons">
                                <button className="back-button" onClick={() => setCurrentStage(HOLDER_STAGES.CUSTOMER_INFO)}>
                                    Back
                                </button>
                                <button
                                    className="next-button"
                                    onClick={() => handleStageTransition(HOLDER_STAGES.BIOMETRIC)}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case HOLDER_STAGES.BIOMETRIC:
                return (
                    <div className="stage-container">
                        <CustomerKYCSection customerId={customerId} />
                        <div className="stage-actions">
                            <button className="back-button" onClick={() => setCurrentStage(HOLDER_STAGES.ATTACHMENTS)}>
                                Back
                            </button>
                            <button
                                className="submit-button"
                                onClick={validateAndSubmitStage}
                                disabled={isSubmitting || !canNavigateToStage(currentStage)}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="primary-holder-container">
            <StagesProgress
                currentStage={currentStage}
                stageStatus={stageStatus}
                onStageClick={handleStageTransition}
                canNavigateToStage={canNavigateToStage}
            />

            {loading ? (
                <div className="loading-container">
                    <p>Loading customer details...</p>
                </div>
            ) : (
                renderStage()
            )}
        </div>
    );
};

export default PrimaryHolder;
