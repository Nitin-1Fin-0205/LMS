import React from 'react';
import { Box, Typography } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faUserAlt, faFileAlt, faFingerprint, faPen } from '@fortawesome/free-solid-svg-icons';
import { HOLDER_STAGES, STAGE_STATUS } from '../constants/holderConstants';

const StagesProgress = ({
    currentStage,
    stageStatus,
    onStageClick,
    canNavigateToStage = () => true
}) => {
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

    // Get color based on stage status
    const getStageColor = (stage) => {
        if (currentStage === stage) {
            return {
                bg: '#3b82f6', // Primary blue
                text: 'white',
                border: '#2563eb'
            };
        } else if (stageStatus[stage] === STAGE_STATUS.COMPLETED) {
            return {
                bg: '#10b981', // Success green
                text: 'white',
                border: '#059669'
            };
        } else if (stageStatus[stage] === STAGE_STATUS.ERROR) {
            return {
                bg: '#ef4444', // Error red
                text: 'white',
                border: '#dc2626'
            };
        } else {
            return {
                bg: '#f3f4f6', // Light gray
                text: '#6b7280',
                border: '#d1d5db'
            };
        }
    };

    return (
        <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 4,
            mt: 2,
            pt: 1,
            pb: 3
        }}>
            <Box sx={{
                display: 'flex',
                width: '80%',
                justifyContent: 'space-between',
                position: 'relative'
            }}>
                {/* Progress bar container */}
                <Box sx={{
                    position: 'absolute',
                    top: '18px',
                    left: '0',  // Start from the very beginning
                    right: '0',  // End at the very end
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 0
                }}>
                    {/* Progress bar background - centered within container */}
                    <Box sx={{
                        position: 'relative',
                        height: '3px',
                        bgcolor: 'rgba(229, 231, 235, 0.5)',
                        zIndex: 0,
                        borderRadius: '2px',
                        width: 'calc(100% - 72px)', // Account for icon widths at start/end (36px each)
                        mx: 'auto' // Center the bar
                    }} />

                    {/* Progress bar fill - positioned over background */}
                    <Box sx={{
                        position: 'absolute',
                        height: '3px',
                        bgcolor: 'rgba(59, 130, 246, 0.6)',
                        zIndex: 1,
                        borderRadius: '2px',
                        boxShadow: '0 1px 2px rgba(59, 130, 246, 0.2)',
                        width: currentStage === HOLDER_STAGES.CUSTOMER_INFO ? '0%' :
                            currentStage === HOLDER_STAGES.ATTACHMENTS ?
                                'calc(50% - 36px)' : // Half width minus half icon
                                'calc(100% - 72px)', // Full width minus both icons
                        left: '36px' // Start at center of first icon
                    }} />
                </Box>

                {/* Stage indicators */}
                {[HOLDER_STAGES.CUSTOMER_INFO, HOLDER_STAGES.ATTACHMENTS, HOLDER_STAGES.BIOMETRIC].map((stage, index) => {
                    const colorSet = getStageColor(stage);
                    const isActive = currentStage === stage;
                    const isCompleted = stageStatus[stage] === STAGE_STATUS.COMPLETED;

                    return (
                        <Box
                            key={stage}
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                cursor: canNavigateToStage(stage) ? 'pointer' : 'not-allowed',
                                transition: 'transform 0.2s ease',
                                '&:hover': canNavigateToStage(stage) ? {
                                    transform: 'translateY(-2px)',
                                } : {},
                                zIndex: 10,
                                position: 'relative'
                            }}
                            onClick={() => canNavigateToStage(stage) && onStageClick(stage)}
                        >
                            <Box sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                bgcolor: colorSet.bg,
                                color: colorSet.text,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                zIndex: 10,
                                transition: 'all 0.3s ease',
                                border: `2px solid ${colorSet.border}`,
                                boxShadow: isActive ? '0 0 0 4px rgba(59, 130, 246, 0.25)' : 'none',
                                fontSize: '1rem',
                                position: 'relative'
                            }}>
                                {isCompleted ? (
                                    <FontAwesomeIcon icon={faCheck} />
                                ) : (
                                    <FontAwesomeIcon icon={getStageIcon(stage)} />
                                )}
                            </Box>
                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 1.5,
                                    fontWeight: isActive ? 600 : 500,
                                    fontSize: '0.875rem',
                                    color: isActive ? '#3b82f6' :
                                        isCompleted ? '#10b981' :
                                            '#6b7280',
                                    transition: 'color 0.3s ease',
                                    textAlign: 'center',
                                    maxWidth: 90
                                }}
                            >
                                {getStageName(stage)}
                            </Typography>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default StagesProgress;
