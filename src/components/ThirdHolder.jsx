import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomerInfo from './CustomerInfo';
import Attachments from './Attachments';
import CustomerKYCSection from './CustomerKYCSection';
import StagesProgress from './StagesProgress';
import { API_URL } from '../assets/config';
import { updateHolderSection, submitCustomerInfo, fetchCustomerById } from '../store/slices/customerSlice';
import { HOLDER_TYPES, HOLDER_SECTIONS, HOLDER_STAGES, STAGE_STATUS } from '../constants/holderConstants';
import '../styles/SecondaryHolder.css';

const ThirdHolder = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const thirdHolder = useSelector(state => state.customer.form.thirdHolder);
    const [currentStage, setCurrentStage] = useState(HOLDER_STAGES.CUSTOMER_INFO);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [stageStatus, setStageStatus] = useState({
        [HOLDER_STAGES.CUSTOMER_INFO]: STAGE_STATUS.NOT_STARTED,
        [HOLDER_STAGES.ATTACHMENTS]: STAGE_STATUS.NOT_STARTED,
        [HOLDER_STAGES.BIOMETRIC]: STAGE_STATUS.NOT_STARTED
    });

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

    const handleBiometricUpdate = (data) => {
        dispatch(updateHolderSection({
            holder: HOLDER_TYPES.THIRD,
            section: HOLDER_SECTIONS.BIOMETRIC,
            data
        }));
    };

    const handleStageTransition = async (newStage) => {
        setCurrentStage(newStage);
    };

    const validateStageData = (stage) => {
        const data = getStageData(stage);
        console.log('Validating data for stage:', stage, data);
        switch (stage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                const requiredFields = [
                    'firstName',
                    'middleName',
                    'lastName',
                    'fatherOrHusbandName',
                    'dateOfBirth',
                    'gender',
                    'mobileNo',
                    'emailId',
                    'panNo',
                    'aadharNo',
                    'address',
                    'photo',
                ];
                const missingFields = requiredFields.filter(field => !data[field]);
                if (missingFields.length > 0) {
                    toast.error(`Please fill in required fields: ${missingFields[0]}`);
                    return false;
                }
                break;

            case HOLDER_STAGES.ATTACHMENTS:
                break;

            case HOLDER_STAGES.BIOMETRIC:
                if (!data.fingerprints || data.fingerprints.length === 0) {
                    toast.error('Please capture fingerprints');
                    return false;
                }
                break;
        }
        return true;
    };

    const submitCurrentStage = async () => {
        try {
            if (!validateStageData(currentStage)) {
                return;
            }

            if (currentStage === HOLDER_STAGES.CUSTOMER_INFO) {
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

                const result = await dispatch(submitCustomerInfo({
                    customerData: submitData,
                    holderType: HOLDER_TYPES.THIRD
                })).unwrap();

                if (!result.customerId) {
                    throw new Error('Failed to create third holder');
                } else {
                    toast.success('Third holder info saved successfully!');
                    setStageStatus(prev => ({
                        ...prev,
                        [currentStage]: STAGE_STATUS.COMPLETED
                    }));
                    handleStageTransition(HOLDER_STAGES.ATTACHMENTS);
                    return;
                }
            }

            if (!thirdHolder.customerInfo.customerId) {
                toast.error('Please complete customer information first');
                setCurrentStage(HOLDER_STAGES.CUSTOMER_INFO);
                return;
            }

            if (currentStage === HOLDER_STAGES.BIOMETRIC) {
                await handleSubmitFinal();
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

    const getStageData = (stage) => {
        switch (stage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                return thirdHolder.customerInfo;
            case HOLDER_STAGES.BIOMETRIC:
                return thirdHolder.biometric;
            case HOLDER_STAGES.ATTACHMENTS:
                return thirdHolder.attachments;
            default:
                return {};
        }
    };

    const validateAndSubmitStage = () => {
        submitCurrentStage();
    };

    const canNavigateToStage = (stage) => {
        if (stage === HOLDER_STAGES.CUSTOMER_INFO) return true;
        return thirdHolder?.customerInfo?.customerId;
    };

    const handleSubmitFinal = async () => {
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('authToken');

            await fetch(`${API_URL}/customers/secondary-holder/add`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(thirdHolder)
            });

            toast.success('Third holder added successfully!');
            navigate(-1); // Go back to previous page
        } catch (error) {
            toast.error('Failed to add third holder');
            throw error;
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStage = () => {
        switch (currentStage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                return (
                    <div className="stage-container">
                        <CustomerInfo
                            initialData={thirdHolder.customerInfo}
                            onUpdate={handleCustomerInfoUpdate}
                        />
                        <div className="stage-actions">
                            <div className="action-buttons">
                                <button
                                    className="back-button"
                                    onClick={() => navigate(-1)}
                                >
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
                                    disabled={!thirdHolder.customerInfo.customerId}
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
                                holderType="thirdHolder"
                                onUpdate={handleAttachmentsUpdate}
                                initialData={thirdHolder.attachments}
                                customerId={thirdHolder.customerInfo.customerId}
                            />
                        </div>
                        <div className="stage-actions">
                            <div className="action-buttons">
                                <button
                                    className="back-button"
                                    onClick={() => setCurrentStage(HOLDER_STAGES.CUSTOMER_INFO)}
                                >
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
                        <CustomerKYCSection customerId={thirdHolder.customerInfo.customerId} />
                        <div className="stage-actions">
                            <button
                                className="back-button"
                                onClick={() => setCurrentStage(HOLDER_STAGES.ATTACHMENTS)}
                            >
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
        <div className="secondary-holder-container">
            <StagesProgress
                currentStage={currentStage}
                stageStatus={stageStatus}
                onStageClick={handleStageTransition}
                canNavigateToStage={canNavigateToStage}
            />

            {renderStage()}
        </div>
    );
};

export default ThirdHolder;
