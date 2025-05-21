import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Button, Paper, CircularProgress, Grid, TextField, Card, CardContent } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFingerprint, faCamera, faUser, faCheck, faTimes, faIdCard } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import BiometricService from '../services/BiometricService';
import axios from 'axios';
import { API_URL } from '../assets/config';
import CustomerPhotoCapture from '../components/CustomerPhotoCapture';

const CustomerVisit = () => {
    // State management
    const [step, setStep] = useState(1); // 1: Biometric Scan, 2: Customer Preview, 3: Photo Capture, 4: Complete
    const [loading, setLoading] = useState(false);
    const [scanningFingerprint, setScanningFingerprint] = useState(false);
    const [customerData, setCustomerData] = useState(null);
    const [visitPhoto, setVisitPhoto] = useState(null);
    const [visitReason, setVisitReason] = useState('');
    const [visitNotes, setVisitNotes] = useState('');
    const [identificationResult, setIdentificationResult] = useState(null);

    // Handle fingerprint scanning
    const handleScanFingerprint = async () => {
        try {
            setScanningFingerprint(true);

            // // Step 1: Capture the fingerprint
            // const fingerprintResult = await BiometricService.captureFingerprint();

            // if (!fingerprintResult.success) {
            //     toast.error("Failed to capture fingerprint");
            //     return;
            // }

            // // Step 2: Send the template to backend for identification
            // const token = localStorage.getItem('authToken');
            // const response = await axios.post(
            //     `${API_URL}/biometrics/identify`,
            //     {
            //         template: fingerprintResult.template
            //     },
            //     {
            //         headers: {
            //             'Authorization': `Bearer ${token}`,
            //             'Content-Type': 'application/json'
            //         }
            //     }
            // );

            // setIdentificationResult(response.data);

            // if (response.data.matched) {
            //     // If matched, fetch customer details
            //     const customerResponse = await axios.get(
            //         `${API_URL}/customers/${response.data.customerId}`,
            //         {
            //             headers: {
            //                 'Authorization': `Bearer ${token}`
            //             }
            //         }
            //     );

            //     setCustomerData(customerResponse.data.data);
            toast.success("Customer identified successfully");
            setStep(2);
            // } else {
            //     toast.error("No matching customer found");
            // }
        } catch (error) {
            console.error('Error during fingerprint identification:', error);
            toast.error(`Identification failed: ${error.message || 'Unknown error'}`);
        } finally {
            setScanningFingerprint(false);
        }
    };

    // Handle photo capture
    const handlePhotoCapture = (photoData) => {
        setVisitPhoto(photoData);
    };

    // Save visit record
    const handleSaveVisit = async () => {
        try {
            setLoading(true);

            // if (!customerData || !visitPhoto) {
            //     toast.error("Customer data and photo are required");
            //     return;
            // }

            // const token = localStorage.getItem('authToken');
            // const visitData = {
            //     customerId: customerData.customerId,
            //     verificationMethod: 'biometric',
            //     verificationStatus: true, 
            //     visitPhoto: visitPhoto,
            //     visitReason: visitReason,
            //     notes: visitNotes,
            //     timestamp: new Date().toISOString()
            // };

            // await axios.post(
            //     `${API_URL}/visits/record`,
            //     visitData,
            //     {
            //         headers: {
            //             'Authorization': `Bearer ${token}`,
            //             'Content-Type': 'application/json'
            //         }
            //     }
            // );

            toast.success("Visit recorded successfully");
            setStep(4); // Move to completion step
        } catch (error) {
            console.error('Error recording visit:', error);
            toast.error(`Failed to record visit: ${error.message || 'Unknown error'}`);
        } finally {
            setLoading(false);
        }
    };

    // Reset the process
    const handleReset = () => {
        setStep(1);
        setCustomerData(null);
        setVisitPhoto(null);
        setVisitReason('');
        setVisitNotes('');
        setIdentificationResult(null);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    Customer Visit Verification
                </Typography>

                {/* Progress indicator */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                    <Box sx={{ display: 'flex', width: '80%', justifyContent: 'space-between', position: 'relative' }}>
                        {/* Progress bar */}
                        <Box sx={{
                            position: 'absolute',
                            top: '10px',
                            left: 0,
                            right: 0,
                            height: '4px',
                            bgcolor: '#e0e0e0',
                            zIndex: 0
                        }} />
                        <Box sx={{
                            position: 'absolute',
                            top: '10px',
                            left: 0,
                            width: `${(step - 1) * 33.3}%`,
                            height: '4px',
                            bgcolor: 'primary.main',
                            zIndex: 1,
                            transition: 'width 0.5s ease-in-out'
                        }} />

                        {/* Step indicators */}
                        {[1, 2, 3].map((s) => (
                            <Box key={s} sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: step >= s ? 'primary.main' : '#e0e0e0',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 'bold',
                                zIndex: 2
                            }}>
                                {s}
                            </Box>
                        ))}
                    </Box>
                </Box>

                {/* Step 1: Biometric Scan */}
                {step === 1 && (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Box sx={{ maxWidth: 400, mx: 'auto' }}>
                            <Card sx={{ mb: 4, bgcolor: '#f5f5f5', position: 'relative', overflow: 'hidden' }}>
                                <Box sx={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    bgcolor: 'rgba(3, 169, 244, 0.1)',
                                    display: scanningFingerprint ? 'flex' : 'none',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    zIndex: 2
                                }}>
                                    <CircularProgress />
                                </Box>
                                <CardContent sx={{ p: 4 }}>
                                    <FontAwesomeIcon
                                        icon={faFingerprint}
                                        size="5x"
                                        color={scanningFingerprint ? "#2196f3" : "#757575"}
                                        pulse={scanningFingerprint}
                                    />
                                    <Typography variant="h6" sx={{ mt: 2 }}>
                                        Fingerprint Identification
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 3 }}>
                                        Place customer's finger on scanner to identify
                                    </Typography>

                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleScanFingerprint}
                                        disabled={scanningFingerprint}
                                        startIcon={<FontAwesomeIcon icon={faFingerprint} />}
                                        size="large"
                                    >
                                        {scanningFingerprint ? "Scanning..." : "Scan Fingerprint"}
                                    </Button>
                                </CardContent>
                            </Card>

                            {identificationResult && !identificationResult.matched && (
                                <Paper sx={{ p: 2, bgcolor: '#ffebee', color: '#c62828', mt: 2 }}>
                                    <Typography variant="subtitle2">
                                        <FontAwesomeIcon icon={faTimes} style={{ marginRight: '8px' }} />
                                        No matching customer found
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    </Box>
                )}

                {/* Step 2: Customer Preview */}
                {step === 2 && customerData && (
                    <Box sx={{ py: 3 }}>
                        <Paper elevation={1} sx={{ p: 3, mb: 4, bgcolor: '#f0f7ff', border: '1px solid #bbdefb' }}>
                            <Typography variant="h6" gutterBottom sx={{ color: '#0d47a1', display: 'flex', alignItems: 'center' }}>
                                <FontAwesomeIcon icon={faCheck} style={{ marginRight: '10px', color: '#2e7d32' }} />
                                Customer Identified Successfully
                            </Typography>

                            <Grid container spacing={3} sx={{ mt: 2 }}>
                                <Grid item xs={12} md={4}>
                                    <Box sx={{ textAlign: 'center' }}>
                                        {customerData.photo ? (
                                            <img
                                                src={customerData.photo}
                                                alt={`${customerData.firstName} ${customerData.lastName}`}
                                                style={{
                                                    width: '180px',
                                                    height: '220px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                    border: '1px solid #e0e0e0'
                                                }}
                                            />
                                        ) : (
                                            <Box sx={{
                                                width: 180,
                                                height: 220,
                                                bgcolor: '#e0e0e0',
                                                borderRadius: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                mx: 'auto'
                                            }}>
                                                <FontAwesomeIcon icon={faUser} size="4x" color="#9e9e9e" />
                                            </Box>
                                        )}
                                    </Box>
                                </Grid>
                                <Grid item xs={12} md={8}>
                                    <Typography variant="h5" gutterBottom>
                                        {customerData.firstName} {customerData.middleName} {customerData.lastName}
                                    </Typography>

                                    <Grid container spacing={2} sx={{ mt: 1 }}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography><strong>Customer ID:</strong> {customerData.customerId}</Typography>
                                            <Typography><strong>Mobile:</strong> {customerData.mobileNo}</Typography>
                                            <Typography><strong>Email:</strong> {customerData.email || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography><strong>PAN:</strong> {customerData.panNo}</Typography>
                                            {customerData.lockerNo && (
                                                <Typography><strong>Locker:</strong> {customerData.lockerNo}</Typography>
                                            )}
                                            <Typography>
                                                <strong>Last Visit:</strong> {customerData.lastVisit ? new Date(customerData.lastVisit).toLocaleDateString() : 'First Visit'}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>

                            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setStep(3)}
                                >
                                    Continue to Photo Capture
                                </Button>
                            </Box>
                        </Paper>
                    </Box>
                )}

                {/* Step 3: Photo Capture */}
                {step === 3 && (
                    <Box sx={{ py: 3 }}>
                        <Typography variant="h6" gutterBottom>Capture Visit Photo</Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                                <CustomerPhotoCapture
                                    onPhotoCapture={handlePhotoCapture}
                                    initialPhoto={visitPhoto}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle1" gutterBottom>Visit Details</Typography>
                                <TextField
                                    select
                                    fullWidth
                                    label="Visit Reason"
                                    value={visitReason}
                                    onChange={(e) => setVisitReason(e.target.value)}
                                    SelectProps={{
                                        native: true,
                                    }}
                                    sx={{ mb: 2 }}
                                >
                                    <option value="">Select reason</option>
                                    <option value="locker_access">Locker Access</option>
                                    <option value="document_submission">Document Submission</option>
                                    <option value="consultation">Consultation</option>
                                    <option value="other">Other</option>
                                </TextField>

                                <TextField
                                    fullWidth
                                    multiline
                                    rows={4}
                                    label="Notes"
                                    value={visitNotes}
                                    onChange={(e) => setVisitNotes(e.target.value)}
                                />

                                <Box sx={{ mt: 3 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={!visitPhoto || !visitReason || loading}
                                        onClick={handleSaveVisit}
                                        sx={{ mr: 2 }}
                                    >
                                        {loading ? <CircularProgress size={24} /> : 'Record Visit'}
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => setStep(2)}
                                    >
                                        Back
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* Step 4: Complete */}
                {step === 4 && (
                    <Box sx={{ textAlign: 'center', py: 5 }}>
                        <FontAwesomeIcon icon={faCheck} style={{ fontSize: '48px', color: '#2e7d32' }} />
                        <Typography variant="h5" sx={{ my: 2 }}>Visit Recorded Successfully</Typography>

                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                            {customerData && (
                                <Box>
                                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                                        {customerData.firstName} {customerData.lastName}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Visit Purpose: {visitReason.replace('_', ' ')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Date: {new Date().toLocaleString()}
                                    </Typography>
                                </Box>
                            )}
                        </Box>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleReset}
                            sx={{ mt: 3 }}
                        >
                            Record Another Visit
                        </Button>
                    </Box>
                )}

                {/* Back button for step navigation, excluding step 1 and 4 */}
                {step > 1 && step < 4 && !loading && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Button
                            onClick={handleReset}
                            startIcon={<FontAwesomeIcon icon={faTimes} />}
                            color="inherit"
                        >
                            Cancel
                        </Button>
                    </Box>
                )}
            </Paper>
        </Container>
    );
};

export default CustomerVisit;
