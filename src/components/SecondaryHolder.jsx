import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Box, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faUserAlt, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import CustomerInfo from './CustomerInfo';
import Attachments from './Attachments';
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
        [HOLDER_STAGES.ATTACHMENTS]: STAGE_STATUS.NOT_STARTED
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

            const result = await dispatch(submitCustomerInfo(submitData)).unwrap();

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
        setStageStatus(prev => ({
            ...prev,
            [HOLDER_STAGES.CUSTOMER_INFO]: STAGE_STATUS.COMPLETED
        }));
        setCurrentStage(HOLDER_STAGES.ATTACHMENTS);
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

                    {/* Progress bar fill */}
                    <Box sx={{
                        position: 'absolute',
                        top: '10px',
                        left: 0,
                        width: currentStage === HOLDER_STAGES.CUSTOMER_INFO ? '0%' : '100%',
                        height: '4px',
                        bgcolor: 'primary.main',
                        zIndex: 1,
                        transition: 'width 0.5s ease-in-out'
                    }} />

                    {/* Stage indicators */}
                    {[HOLDER_STAGES.CUSTOMER_INFO, HOLDER_STAGES.ATTACHMENTS].map((stage, index) => (
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
                                color: 'white',
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
                ) : (
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
