import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomerInfo from './CustomerInfo';
import Attachments from './Attachments';
import CustomerKYCSection from './CustomerKYCSection';
import StagesProgress from './StagesProgress';
import { API_URL } from '../assets/config';
import '../styles/HolderDetails.css';
// import '../styles/SecondaryHolder.css';
import { updateHolderSection, submitCustomerInfo, fetchCustomerById } from '../store/slices/customerSlice';
import { HOLDER_TYPES, HOLDER_SECTIONS, HOLDER_STAGES, STAGE_STATUS } from '../constants/holderConstants';
import { ValidationService } from '../services/ValidationService';
import { ROUTES } from '../constants/routes';

const HolderDetails = ({ holderType }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const holderData = useSelector(state => state.customer.form[holderType]);

    const primaryHolder = useSelector(state => state.customer.form.primaryHolder);
    const [currentStage, setCurrentStage] = useState(HOLDER_STAGES.CUSTOMER_INFO);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stageStatus, setStageStatus] = useState({
        [HOLDER_STAGES.CUSTOMER_INFO]: STAGE_STATUS.NOT_STARTED,
        [HOLDER_STAGES.ATTACHMENTS]: STAGE_STATUS.NOT_STARTED,
        [HOLDER_STAGES.BIOMETRIC]: STAGE_STATUS.NOT_STARTED
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchHolderDetails = async () => {
            try {
                setLoading(true);
                const holderId = holderData?.customerInfo?.customerId;
                if (holderId) {
                    await dispatch(fetchCustomerById({
                        customerId: holderId,
                        holderType
                    })).unwrap();
                }
            } catch (error) {
                toast.error(`Failed to fetch ${holderType} details`);
            } finally {
                setLoading(false);
            }
        };

        fetchHolderDetails();
    }, [dispatch, holderType, holderData?.customerInfo?.customerId]);

    const handleCustomerInfoUpdate = (data) => {
        dispatch(updateHolderSection({
            holder: holderType,
            section: HOLDER_SECTIONS.CUSTOMER_INFO,
            data
        }));
    };

    const handleStageTransition = (newStage) => setCurrentStage(newStage);

    const submitCurrentStage = async () => {
        try {
            setIsSubmitting(true);
            const stageData = getStageData(currentStage);

            if (currentStage === HOLDER_STAGES.CUSTOMER_INFO) {
                const panValidation = ValidationService.isValidPAN(stageData.panNo);
                if (!panValidation.isValid) {
                    toast.error(panValidation.error);
                    return;
                }

                const validation = ValidationService.validateStageData(currentStage, stageData);
                if (!validation.isValid) {
                    toast.error(validation.error);
                    return;
                }

                const submitData = {
                    customer_id: holderData.customerInfo.customerId || null,
                    first_name: holderData.customerInfo.firstName,
                    middle_name: holderData.customerInfo.middleName,
                    last_name: holderData.customerInfo.lastName,
                    pan: holderData.customerInfo.panNo,
                    aadhar: holderData.customerInfo.aadharNo,
                    gender: holderData.customerInfo.gender,
                    address: holderData.customerInfo.address,
                    guardian_name: holderData.customerInfo.fatherOrHusbandName,
                    dob: holderData.customerInfo.dateOfBirth,
                    mobile_number: holderData.customerInfo.mobileNo,
                    email: holderData.customerInfo.emailId,
                    locker_center_id: 1,
                    city: holderData.customerInfo.city,
                    state: holderData.customerInfo.state,
                    state_code: holderData.customerInfo.statecode
                };

                // Add parent customer ID for secondary and third holders
                if (holderType !== HOLDER_TYPES.PRIMARY) {
                    submitData.parent_customer_id = primaryHolder?.customerInfo?.customerId;
                }

                const result = await dispatch(submitCustomerInfo({
                    customerData: submitData,
                    holderType
                })).unwrap();

                if (!result.customerId) {
                    throw new Error(`Failed to create ${holderType}`);
                }

                toast.success(`${holderType} info saved successfully!`);
                setStageStatus(prev => ({
                    ...prev,
                    [currentStage]: STAGE_STATUS.COMPLETED
                }));
                handleStageTransition(HOLDER_STAGES.ATTACHMENTS);
                return;
            }

            if (!holderData.customerInfo.customerId) {
                toast.error('Please complete customer information first');
                setCurrentStage(HOLDER_STAGES.CUSTOMER_INFO);
                return;
            }

            setStageStatus(prev => ({
                ...prev,
                [currentStage]: STAGE_STATUS.COMPLETED
            }));

            if (currentStage === HOLDER_STAGES.BIOMETRIC) {
                navigate(ROUTES.CUSTOMER);
            }

            handleStageTransition(currentStage === HOLDER_STAGES.ATTACHMENTS ?
                HOLDER_STAGES.BIOMETRIC : HOLDER_STAGES.CUSTOMER_INFO);

        } catch (error) {
            toast.error(error.message || `Failed to save ${currentStage} data`);
            setStageStatus(prev => ({
                ...prev,
                [currentStage]: STAGE_STATUS.ERROR
            }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStageData = (stage) => {
        switch (stage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                return holderData.customerInfo;
            case HOLDER_STAGES.BIOMETRIC:
                return holderData.biometric;
            case HOLDER_STAGES.ATTACHMENTS:
                return holderData.attachments;
            default:
                return {};
        }
    };

    const canNavigateToStage = (stage) => {
        return stage === HOLDER_STAGES.CUSTOMER_INFO || holderData?.customerInfo?.customerId;
    };

    const renderStage = () => {
        switch (currentStage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                return (
                    <div className="stage-container">
                        <CustomerInfo
                            initialData={holderData.customerInfo}
                            onUpdate={handleCustomerInfoUpdate}
                        />
                        <div className="stage-actions">
                            <button className="back-button" onClick={() => navigate(-1)} >Back</button>
                            <button
                                className="save-button"
                                onClick={submitCurrentStage}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                className="next-button"
                                onClick={() => handleStageTransition(HOLDER_STAGES.ATTACHMENTS)}
                                disabled={!holderData.customerInfo.customerId}
                            >
                                Next
                            </button>
                        </div>
                    </div >
                );

            case HOLDER_STAGES.ATTACHMENTS:
                return (
                    <div className="stage-container">
                        <Attachments
                            holderType={holderType}
                            customerId={holderData.customerInfo.customerId}
                        />
                        <div className="stage-actions">
                            <button className="back-button" onClick={() => handleStageTransition(HOLDER_STAGES.CUSTOMER_INFO)}>
                                Back
                            </button>
                            <button
                                className="next-button"
                                onClick={() => {
                                    setStageStatus(prev => ({
                                        ...prev,
                                        [currentStage]: STAGE_STATUS.COMPLETED
                                    }));
                                    return handleStageTransition(HOLDER_STAGES.BIOMETRIC)
                                }}>
                                Next
                            </button>
                        </div>
                    </div>
                );

            case HOLDER_STAGES.BIOMETRIC:
                return (
                    <div className="stage-container">
                        <CustomerKYCSection customerId={holderData.customerInfo.customerId} />
                        <div className="stage-actions">
                            <button className="back-button" onClick={() => handleStageTransition(HOLDER_STAGES.ATTACHMENTS)}>
                                Back
                            </button>
                            <button
                                className="save-button"
                                onClick={submitCurrentStage}
                                disabled={isSubmitting}
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

export default HolderDetails;
