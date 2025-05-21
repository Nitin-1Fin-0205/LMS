import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-toastify';
import CustomerInfo from './CustomerInfo';
import BiometricCapture from './BiometricCapture';
import Attachments from './Attachments';
import { API_URL } from '../assets/config';
import '../styles/PrimaryHolder.css';
import { useNavigate } from 'react-router-dom';
import { updateHolderSection, submitCustomerInfo } from '../store/slices/customerSlice';
import { HOLDER_TYPES, HOLDER_SECTIONS, HOLDER_STAGES, STAGE_STATUS } from '../constants/holderConstants';
import { Box, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faPen, faFileAlt, faFingerprint, faUser, faUserAlt } from '@fortawesome/free-solid-svg-icons';

const PrimaryHolder = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const formData = useSelector(state => state.customer.form.primaryHolder);
    const isSubmitting = useSelector(state => state.customer.isSubmitting);
    const { customerId, isCustomerCreated } = useSelector(state => state.customer);
    const [currentStage, setCurrentStage] = useState(HOLDER_STAGES.CUSTOMER_INFO);
    const [stageStatus, setStageStatus] = useState({
        [HOLDER_STAGES.CUSTOMER_INFO]: STAGE_STATUS.NOT_STARTED,
        [HOLDER_STAGES.ATTACHMENTS]: STAGE_STATUS.NOT_STARTED,
        [HOLDER_STAGES.BIOMETRIC]: STAGE_STATUS.NOT_STARTED
    });

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
                    'lockerCenterId'
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
                    image_base64: formData.customerInfo.photo,
                    locker_center_id: formData.customerInfo.lockerCenterId || 1, //TODO: remove this Hardcoded value
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

    const validateAndSubmitStage = () => {
        submitCurrentStage();
    };

    const canNavigateToStage = (stage) => {
        if (stage === HOLDER_STAGES.CUSTOMER_INFO) return true;
        return isCustomerCreated && customerId;
    };

    const getStageClassName = (stage) => {
        const baseClass = 'stage';
        const status = stageStatus[stage];
        const isActive = currentStage === stage;
        const isLocked = !canNavigateToStage(stage);

        return `${baseClass} ${isActive ? 'active' : ''} ${status === STAGE_STATUS.COMPLETED ? 'completed' : ''} ${isLocked ? 'locked' : ''}`;
    };

    const handleNextStage = () => {
        const nextStage = currentStage === HOLDER_STAGES.CUSTOMER_INFO
            ? HOLDER_STAGES.ATTACHMENTS
            : HOLDER_STAGES.BIOMETRIC;

        // Set current stage as completed before moving to next
        setStageStatus(prev => ({
            ...prev,
            [currentStage]: STAGE_STATUS.COMPLETED
        }));

        handleStageTransition(nextStage);
    };

    const getStageIcon = (stage) => {
        switch (stage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                return faUserAlt;
            case HOLDER_STAGES.ATTACHMENTS:
                return faFileAlt;
            case HOLDER_STAGES.BIOMETRIC:
                return faFingerprint;
            default:
                return faPen;
        }
    };

    const getStageName = (stage) => {
        switch (stage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                return "Customer Info";
            case HOLDER_STAGES.ATTACHMENTS:
                return "Documents";
            case HOLDER_STAGES.BIOMETRIC:
                return "Biometric";
            default:
                return "";
        }
    };

    const renderStage = () => {
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
                                    onClick={handleNextStage}
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
                                    className="save-button"
                                    onClick={validateAndSubmitStage}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    className="next-button"
                                    onClick={handleNextStage}
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
                        <BiometricCapture
                            onUpdate={handleBiometricUpdate}
                            initialData={formData.biometric}
                            customerId={customerId}
                        />
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
            <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 4,
                mt: 2
            }}>
                <Box sx={{
                    display: 'flex',
                    width: '80%',
                    justifyContent: 'space-between',
                    position: 'relative'
                }}>
                    {/* Progress bar background */}
                    <Box sx={{
                        position: 'absolute',
                        top: '10px',
                        left: 0,
                        right: 0,
                        height: '4px',
                        bgcolor: '#e0e0e0',
                        zIndex: 0
                    }} />

                    {/* Progress bar fill */}
                    <Box sx={{
                        position: 'absolute',
                        top: '10px',
                        left: 0,
                        width: currentStage === HOLDER_STAGES.CUSTOMER_INFO ? '0%' :
                            currentStage === HOLDER_STAGES.ATTACHMENTS ? '50%' : '100%',
                        height: '4px',
                        bgcolor: 'primary.main',
                        zIndex: 1,
                        transition: 'width 0.5s ease-in-out'
                    }} />

                    {/* Stage indicators */}
                    {[HOLDER_STAGES.CUSTOMER_INFO, HOLDER_STAGES.ATTACHMENTS, HOLDER_STAGES.BIOMETRIC].map((stage, index) => (
                        <Box
                            key={stage}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: canNavigateToStage(stage) ? 'pointer' : 'not-allowed',
                                // opacity: canNavigateToStage(stage) ? 1 : 0.6,
                            }}
                            onClick={() => canNavigateToStage(stage) && handleStageTransition(stage)}
                        >
                            <Box sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: currentStage === stage ? 'primary.main' :
                                    stageStatus[stage] === STAGE_STATUS.COMPLETED ? '#d1fae5' : '#e0e0e0',
                                color: stageStatus[stage] === STAGE_STATUS.COMPLETED ? '#10b981' : 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                zIndex: 2,
                                transition: 'background-color 0.3s ease'
                            }}>
                                {stageStatus[stage] === STAGE_STATUS.COMPLETED ? (
                                    <FontAwesomeIcon icon={faCheck} size="xs" />
                                ) : (
                                    <FontAwesomeIcon icon={getStageIcon(stage)} size="xs" />
                                )}
                            </Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 1,
                                    fontWeight: currentStage === stage ? 'bold' : 'normal',
                                    color: currentStage === stage ? 'primary.main' :
                                        stageStatus[stage] === STAGE_STATUS.COMPLETED ? '#4caf50' : 'text.secondary'
                                }}
                            >
                                {getStageName(stage)}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>

            {renderStage()}
        </div>
    );
};

export default PrimaryHolder;
