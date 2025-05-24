import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import CustomerInfo from './CustomerInfo';
import Attachments from './Attachments';
import BiometricCapture from './BiometricCapture';
import CustomerKYCSection from './CustomerKYCSection';
import StagesProgress from './StagesProgress';
import { API_URL } from '../assets/config';
import { updateHolderSection, submitCustomerInfo, fetchCustomerById } from '../store/slices/customerSlice';
import { HOLDER_TYPES, HOLDER_SECTIONS, HOLDER_STAGES, STAGE_STATUS } from '../constants/holderConstants';
import '../styles/SecondaryHolder.css';

const SecondaryHolder = () => {
    const dispatch = useDispatch();
    const secondaryHolder = useSelector(state => state.customer.form.secondaryHolder);
    const location = useLocation();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentStage, setCurrentStage] = useState(HOLDER_STAGES.CUSTOMER_INFO);
    const [stageStatus, setStageStatus] = useState({
        [HOLDER_STAGES.CUSTOMER_INFO]: STAGE_STATUS.NOT_STARTED,
        [HOLDER_STAGES.ATTACHMENTS]: STAGE_STATUS.NOT_STARTED,
        [HOLDER_STAGES.BIOMETRIC]: STAGE_STATUS.NOT_STARTED
    });

    useEffect(() => {
        const fetchSecondaryHolderDetails = async () => {
            try {
                const secondaryHolderId = secondaryHolder?.customerInfo?.customerId;
                if (secondaryHolderId) {
                    await dispatch(fetchCustomerById({
                        customerId: secondaryHolderId,
                        holderType: HOLDER_TYPES.SECONDARY
                    })).unwrap();
                }
            } catch (error) {
                toast.error('Failed to fetch secondary holder details');
            }
        };

        fetchSecondaryHolderDetails();
    }, [dispatch, secondaryHolder?.customerInfo?.customerId]);

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

    const handleBiometricUpdate = (data) => {
        dispatch(updateHolderSection({
            holder: HOLDER_TYPES.SECONDARY,
            section: HOLDER_SECTIONS.BIOMETRIC,
            data
        }));
    };

    const handleSaveCustomerInfo = async () => {
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

            const result = await dispatch(submitCustomerInfo({
                customerData: submitData,
                holderType: HOLDER_TYPES.SECONDARY
            })).unwrap();

            // Log and verify the customerId was returned
            console.log('Secondary Holder created/updated with ID:', result.customerId);

            if (!result.customerId) {
                throw new Error('Failed to create secondary holder');
            }

            toast.success('Secondary holder info saved successfully!');
        } catch (error) {
            toast.error(error.message || 'Failed to save secondary holder info');
        } finally {
            setIsSubmitting(false);
        }
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
                    locker_center_id: 1,
                    parent_customer_id: primaryCustomerId,
                };

                const result = await dispatch(submitCustomerInfo({
                    customerData: submitData,
                    holderType: HOLDER_TYPES.SECONDARY
                })).unwrap();

                if (!result.customerId) {
                    throw new Error('Failed to create secondary holder');
                } else {
                    toast.success('Secondary holder info saved successfully!');
                    setStageStatus(prev => ({
                        ...prev,
                        [currentStage]: STAGE_STATUS.COMPLETED
                    }));
                    handleStageTransition(HOLDER_STAGES.ATTACHMENTS);
                    return;
                }
            }

            if (!secondaryHolder.customerInfo.customerId) {
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
                return secondaryHolder.customerInfo;
            case HOLDER_STAGES.BIOMETRIC:
                return secondaryHolder.biometric;
            case HOLDER_STAGES.ATTACHMENTS:
                return secondaryHolder.attachments;
            default:
                return {};
        }
    };

    const validateAndSubmitStage = () => {
        submitCurrentStage();
    };

    const canNavigateToStage = (stage) => {
        if (stage === HOLDER_STAGES.CUSTOMER_INFO) return true;
        return secondaryHolder?.customerInfo?.customerId;
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
                body: JSON.stringify(secondaryHolder)
            });

            toast.success('Secondary holder added successfully!');
            navigate(-1); // Go back to previous page
        } catch (error) {
            toast.error('Failed to add secondary holder');
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
                            initialData={secondaryHolder.customerInfo}
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
                                    disabled={!secondaryHolder.customerInfo.customerId}
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
                                holderType="secondaryHolder"
                                onUpdate={handleAttachmentsUpdate}
                                initialData={secondaryHolder.attachments}
                                customerId={secondaryHolder.customerInfo.customerId}
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
                        <CustomerKYCSection customerId={secondaryHolder.customerInfo.customerId} />
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

export default SecondaryHolder;
