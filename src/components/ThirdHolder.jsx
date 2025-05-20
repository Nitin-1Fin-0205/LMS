import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Box, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faUserAlt, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import CustomerInfo from './CustomerInfo';
import Attachments from './Attachments';
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
        [HOLDER_STAGES.ATTACHMENTS]: STAGE_STATUS.NOT_STARTED
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

    const handleSaveCustomerInfo = async () => {
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
        } catch (error) {
            toast.error(error.message || 'Failed to save third holder info');
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
        return thirdHolder?.customerInfo?.customerId;
    };

    const handleNext = () => {
        if (!thirdHolder.customerInfo.customerId) {
            toast.error('Please save customer information first');
            return;
        }
        setStageStatus(prev => ({
            ...prev,
            [HOLDER_STAGES.CUSTOMER_INFO]: STAGE_STATUS.COMPLETED
        }));
        setCurrentStage(HOLDER_STAGES.ATTACHMENTS);
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
                            initialData={thirdHolder.customerInfo}
                            onUpdate={handleCustomerInfoUpdate}
                        />
                        <div className="stage-actions">
                            <div className="action-buttons">
                                <button className="back-button" onClick={() => navigate(-1)}>
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
                                    disabled={!thirdHolder.customerInfo.customerId}
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
                                holderType="thirdHolder"
                                onUpdate={handleAttachmentsUpdate}
                                initialData={thirdHolder.attachments}
                                customerId={thirdHolder.customerInfo.customerId}
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
