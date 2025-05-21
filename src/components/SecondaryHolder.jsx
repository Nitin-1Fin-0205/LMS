import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Box, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faUserAlt, faFileAlt, faFingerprint } from '@fortawesome/free-solid-svg-icons';
import CustomerInfo from './CustomerInfo';
import Attachments from './Attachments';
import BiometricCapture from './BiometricCapture';
import { API_URL } from '../assets/config';
import { updateHolderSection, submitCustomerInfo, fetchCustomerById } from '../store/slices/customerSlice';
import { HOLDER_TYPES, HOLDER_SECTIONS, HOLDER_STAGES, STAGE_STATUS } from '../constants/holderConstants';
import '../styles/SecondaryHolder.css';

const SecondaryHolder = () => {
    const dispatch = useDispatch();
    const secondaryHolder = useSelector(state => state.customer.form.secondaryHolder);
    const location = useLocation();
    const navigate = useNavigate();
    const customerData = location.state?.customer;
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

    const getStageIcon = (stage) => {
        switch (stage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                return faUserAlt;
            case HOLDER_STAGES.ATTACHMENTS:
                return faFileAlt;
            case HOLDER_STAGES.BIOMETRIC:
                return faFingerprint;
            default:
                return faUserAlt;
        }
    };

    const getStageName = (stage) => {
        switch (stage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                return "Customer Info";
            case HOLDER_STAGES.ATTACHMENTS:
                return "Documents";
            case HOLDER_STAGES.BIOMETRIC:
                return "Biometric Data";
            default:
                return "";
        }
    };

    const canNavigateToStage = (stage) => {
        if (stage === HOLDER_STAGES.CUSTOMER_INFO) return true;
        return secondaryHolder?.customerInfo?.customerId;
    };

    const handleNext = () => {
        if (!secondaryHolder.customerInfo.customerId) {
            toast.error('Please save customer information first');
            return;
        }

        // Set current stage as complete
        setStageStatus(prev => ({
            ...prev,
            [currentStage]: STAGE_STATUS.COMPLETED
        }));

        // Move to next stage based on current stage
        if (currentStage === HOLDER_STAGES.CUSTOMER_INFO) {
            setCurrentStage(HOLDER_STAGES.ATTACHMENTS);
        } else if (currentStage === HOLDER_STAGES.ATTACHMENTS) {
            setCurrentStage(HOLDER_STAGES.BIOMETRIC);
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
            {/* Modern progress bar UI */}
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

                    {/* Progress bar fill - updated for 3 stages */}
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

                    {/* Stage indicators - updated to include biometric */}
                    {[HOLDER_STAGES.CUSTOMER_INFO, HOLDER_STAGES.ATTACHMENTS, HOLDER_STAGES.BIOMETRIC].map((stage, index) => (
                        <Box
                            key={stage}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: canNavigateToStage(stage) ? 'pointer' : 'not-allowed',
                                opacity: canNavigateToStage(stage) ? 1 : 0.6,
                            }}
                            onClick={() => canNavigateToStage(stage) && setCurrentStage(stage)}
                        >
                            <Box sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: currentStage === stage ? 'primary.main' :
                                    stageStatus[stage] === STAGE_STATUS.COMPLETED ? '#4caf50' : '#e0e0e0',
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

            <div className="stage-container">
                {currentStage === HOLDER_STAGES.CUSTOMER_INFO ? (
                    <>
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
                                    onClick={handleSaveCustomerInfo}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Saving...' : 'Save'}
                                </button>
                                <button
                                    className="next-button"
                                    onClick={handleNext}
                                    disabled={!secondaryHolder.customerInfo.customerId}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </>
                ) : currentStage === HOLDER_STAGES.ATTACHMENTS ? (
                    <>
                        <div className="attachments-container">
                            <Attachments
                                holderType="secondaryHolder"
                                onUpdate={handleAttachmentsUpdate}
                                initialData={secondaryHolder.attachments}
                                customerId={secondaryHolder.customerInfo.customerId}
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
                                className="next-button"
                                onClick={handleNext}
                                disabled={!secondaryHolder.customerInfo.customerId}
                            >
                                Next
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <BiometricCapture
                            onUpdate={handleBiometricUpdate}
                            initialData={secondaryHolder.biometric}
                            customerId={secondaryHolder.customerInfo.customerId}
                        />
                        <div className="stage-actions">
                            <button
                                className="back-button"
                                onClick={() => setCurrentStage(HOLDER_STAGES.ATTACHMENTS)}
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
