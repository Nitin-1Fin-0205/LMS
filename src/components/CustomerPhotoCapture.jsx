import React, { useState, useRef, useEffect } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera, faXmark, faUpload } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

const CustomerPhotoCapture = ({ onPhotoCapture, initialPhoto = null }) => {
    const [cameraActive, setCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(initialPhoto);
    const [loading, setLoading] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    // Use initial photo if provided
    useEffect(() => {
        if (initialPhoto) {
            setCapturedImage(initialPhoto);
        }
    }, [initialPhoto]);

    const startCamera = async () => {
        try {
            setLoading(true);
            setCameraActive(true);

            // Wait for next render cycle to ensure video element exists
            await new Promise(resolve => setTimeout(resolve, 0));

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Webcam not supported on this browser.');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                },
            });

            if (!videoRef.current) {
                throw new Error('Video element not found');
            }

            videoRef.current.srcObject = stream;
            await videoRef.current.play();
        } catch (error) {
            toast.error(`Camera error: ${error.message}`);
            setCameraActive(false);
        } finally {
            setLoading(false);
        }
    };

    const stopCamera = () => {
        const stream = videoRef.current?.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setCameraActive(false);
    };

    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            try {
                // Draw the current video frame
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Convert to data URL
                const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setCapturedImage(imageDataUrl);
                if (onPhotoCapture) onPhotoCapture(imageDataUrl);

                // Stop the camera after successful capture
                stopCamera();
            } catch (error) {
                toast.error('Failed to capture image');
                console.error('Error capturing image:', error);
            }
        } else {
            toast.error('Camera not initialized properly');
        }
    };

    const resetCapturedImage = () => {
        setCapturedImage(null);
        if (onPhotoCapture) onPhotoCapture(null);
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size should not exceed 5MB');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setCapturedImage(e.target.result);
            if (onPhotoCapture) onPhotoCapture(e.target.result);
        };
        reader.readAsDataURL(file);
    };

    return (
        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
                Visit Photo
            </Typography>

            {!cameraActive && !capturedImage && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={startCamera}
                        disabled={loading}
                        startIcon={<FontAwesomeIcon icon={faCamera} />}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Use Camera'}
                    </Button>

                    <Typography variant="body2" sx={{ my: 1 }}>Or</Typography>

                    <Button
                        variant="outlined"
                        component="label"
                        startIcon={<FontAwesomeIcon icon={faUpload} />}
                    >
                        Upload Photo
                        <input
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={handleFileUpload}
                        />
                    </Button>
                </Box>
            )}

            {cameraActive && (
                <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', mb: 2 }}>
                        <video
                            ref={videoRef}
                            style={{ width: '100%', height: 'auto', borderRadius: '4px' }}
                        />
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={stopCamera}
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                            startIcon={<FontAwesomeIcon icon={faXmark} />}
                        >
                            Cancel
                        </Button>
                    </Box>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={captureImage}
                        startIcon={<FontAwesomeIcon icon={faCamera} />}
                    >
                        Capture Photo
                    </Button>
                    <canvas ref={canvasRef} style={{ display: 'none' }} />
                </Box>
            )}

            {capturedImage && (
                <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ position: 'relative', mb: 2 }}>
                        <img
                            src={capturedImage}
                            alt="Captured"
                            style={{
                                width: '100%',
                                maxHeight: '300px',
                                objectFit: 'contain',
                                borderRadius: '4px'
                            }}
                        />
                        <Button
                            variant="contained"
                            color="error"
                            size="small"
                            onClick={resetCapturedImage}
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                            startIcon={<FontAwesomeIcon icon={faXmark} />}
                        >
                            Reset
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default CustomerPhotoCapture;
