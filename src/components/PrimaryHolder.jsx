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
import { updateHolderSection, submitStageData, submitCustomerInfo } from '../store/slices/customerSlice';
import { HOLDER_TYPES, HOLDER_SECTIONS, HOLDER_STAGES, STAGE_STATUS } from '../constants/holderConstants';

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

    const handleAttachmentsUpdate = (data) => {
        dispatch(updateHolderSection({
            holder: HOLDER_TYPES.PRIMARY,
            section: HOLDER_SECTIONS.ATTACHMENTS,
            data
        }));
    };

    const handleSubmit = async () => {
        try {
            const token = localStorage.getItem('authToken');

            const submitData = {
                customerInfo: formData.customerInfo,
                biometric: formData.biometric
            };

            const response = await axios.post(
                `${API_URL}/customers/add`,
                submitData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200) {
                toast.success('Primary holder added successfully!');
                navigate(-1);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Failed to add primary holder');
        }
    };

    const handleStageTransition = () => {
        switch (currentStage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                setCurrentStage(HOLDER_STAGES.ATTACHMENTS);
                break;
            case HOLDER_STAGES.ATTACHMENTS:
                setCurrentStage(HOLDER_STAGES.BIOMETRIC);
                break;
            case HOLDER_STAGES.BIOMETRIC:
                handleSubmit();
                break;
            default:
                break;
        }
    };

    const validateStageData = (stage) => {
        const data = getStageData(stage);
        switch (stage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                const requiredFields = [
                    'customerName',
                    'fatherOrHusbandName',
                    'dateOfBirth',
                    'gender',
                    'mobileNo',
                    'emailId',
                    'panNo',
                    'documentNo',
                    'address',
                    'photo'
                ];
                const missingFields = requiredFields.filter(field => !data[field]);
                if (missingFields.length > 0) {
                    toast.error(`Please fill in required fields: ${missingFields[0]}`);
                    return false;
                }
                break;

            case HOLDER_STAGES.ATTACHMENTS:
                // const requiredDocs = ['identityProof', 'addressProof'];
                // const missingDocs = requiredDocs.filter(docType =>
                //     !data[docType] || data[docType].length === 0
                // );
                // if (missingDocs.length > 0) {
                //     toast.error(`Please upload required documents: ${missingDocs.join(', ')}`);
                //     return false;
                // }
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
                const result = await dispatch(submitCustomerInfo(formData.customerInfo)).unwrap();
                if (!result.customerId) {
                    throw new Error('Failed to create customer');
                }
            } else if (!customerId) {
                toast.error('Please complete customer information first');
                setCurrentStage(HOLDER_STAGES.CUSTOMER_INFO);
                return;
            }

            // For other stages, include customerId in the payload
            const stageData = {
                customerId,
                ...getStageData(currentStage)
            };

            await dispatch(submitStageData({
                holder: HOLDER_TYPES.PRIMARY,
                stage: currentStage,
                data: stageData
            })).unwrap();

            setStageStatus(prev => ({
                ...prev,
                [currentStage]: STAGE_STATUS.COMPLETED
            }));

            handleStageTransition();
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
        // Add validation logic here if needed
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

    const renderStage = () => {
        switch (currentStage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                return (
                    <div className="stage-container">
                        <CustomerInfo
                            initialData={formData.customerInfo}
                            onUpdate={handleCustomerInfoUpdate}
                            holderType="primaryHolder"
                        />
                        <div className="stage-actions">
                            <button className="back-button" onClick={() => navigate(-1)}>
                                Back
                            </button>
                            <button
                                className="next-button"
                                onClick={validateAndSubmitStage}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save & Continue'}
                            </button>
                        </div>
                    </div>
                );

            case HOLDER_STAGES.ATTACHMENTS:
                return (
                    <div className="stage-container">
                        <div className="attachments-container">
                            <Attachments
                                holderType="primaryHolder"
                                onUpdate={handleAttachmentsUpdate}
                                initialData={formData.attachments}
                            />
                        </div>
                        <div className="stage-actions">
                            <button className="back-button" onClick={() => setCurrentStage(HOLDER_STAGES.CUSTOMER_INFO)}>
                                Back
                            </button>
                            <button
                                className="next-button"
                                onClick={validateAndSubmitStage}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Saving...' : 'Save & Continue'}
                            </button>
                        </div>
                    </div>
                );

            case HOLDER_STAGES.BIOMETRIC:
                return (
                    <div className="stage-container">
                        <BiometricCapture
                            onUpdate={handleBiometricUpdate}
                            initialData={formData.biometric}
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
            <div className="stages-progress">
                <div className={getStageClassName(HOLDER_STAGES.CUSTOMER_INFO)}>
                    Customer Info {stageStatus[HOLDER_STAGES.CUSTOMER_INFO] === STAGE_STATUS.COMPLETED && '✓'}
                </div>
                <div className={getStageClassName(HOLDER_STAGES.ATTACHMENTS)}>
                    Documents {stageStatus[HOLDER_STAGES.ATTACHMENTS] === STAGE_STATUS.COMPLETED && '✓'}
                </div>
                <div className={getStageClassName(HOLDER_STAGES.BIOMETRIC)}>
                    Biometric {stageStatus[HOLDER_STAGES.BIOMETRIC] === STAGE_STATUS.COMPLETED && '✓'}
                </div>
            </div>
            {renderStage()}
        </div>
    );
};

export default PrimaryHolder;
