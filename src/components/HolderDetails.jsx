import React, { useState } from 'react';
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

    const [currentStage, setCurrentStage] = useState(HOLDER_STAGES.CUSTOMER_INFO);
    const [stageStatus, setStageStatus] = useState({
        [HOLDER_STAGES.CUSTOMER_INFO]: STAGE_STATUS.NOT_STARTED,
        [HOLDER_STAGES.ATTACHMENTS]: STAGE_STATUS.NOT_STARTED,
        [HOLDER_STAGES.BIOMETRIC]: STAGE_STATUS.NOT_STARTED
    });

    const handleCustomerInfoSuccess = (result) => {
        setStageStatus(prev => ({
            ...prev,
            [HOLDER_STAGES.CUSTOMER_INFO]: STAGE_STATUS.COMPLETED
        }));
        setCurrentStage(HOLDER_STAGES.ATTACHMENTS);
    };

    const handleAttachmentsSuccess = () => {
        setStageStatus(prev => ({
            ...prev,
            [HOLDER_STAGES.ATTACHMENTS]: STAGE_STATUS.COMPLETED
        }));
        setCurrentStage(HOLDER_STAGES.BIOMETRIC);
    };

    const handleBiometricSuccess = () => {
        setStageStatus(prev => ({
            ...prev,
            [HOLDER_STAGES.BIOMETRIC]: STAGE_STATUS.COMPLETED
        }));
        navigate(ROUTES.CUSTOMER);
    };

    const handleStageTransition = (newStage) => {
        if (canNavigateToStage(newStage)) {
            setCurrentStage(newStage);
        }
    };

    const canNavigateToStage = (stage) => {
        return stage === HOLDER_STAGES.CUSTOMER_INFO || holderData?.customerInfo?.customerId;
    };

    const renderStage = () => {
        switch (currentStage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                return (
                    <CustomerInfo
                        // initialData={holderData.customerInfo}
                        customerId={holderData?.customerInfo?.customerId}
                        holderType={holderType}
                        onSuccess={handleCustomerInfoSuccess}
                        onBack={() => navigate(-1)}
                    />
                );

            case HOLDER_STAGES.ATTACHMENTS:
                return (
                    <Attachments
                        holderType={holderType}
                        customerId={holderData.customerInfo.customerId}
                        onSuccess={handleAttachmentsSuccess}
                        onBack={() => setCurrentStage(HOLDER_STAGES.CUSTOMER_INFO)}
                    />
                );

            case HOLDER_STAGES.BIOMETRIC:
                return (
                    <CustomerKYCSection
                        customerId={holderData.customerInfo.customerId}
                        holderType={holderType}
                        onSuccess={handleBiometricSuccess}
                        onBack={() => setCurrentStage(HOLDER_STAGES.ATTACHMENTS)}
                    />
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
            {renderStage()}
        </div>
    );
};

export default HolderDetails;
