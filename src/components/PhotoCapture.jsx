import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faXmark, faUpload, faCamera, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import axios from 'axios';
import { API_URL } from '../assets/config';
import '../styles/PhotoCapture.css';

const PhotoCapture = ({ customerId }) => {
    const [cameraActive, setCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    // Fetch existing profile image on component mount
    useEffect(() => {
        const fetchProfileImage = async () => {
            if (!customerId) {
                setInitialLoading(false);
                return;
            }

            try {
                setInitialLoading(true);
                const response = await axios.get(
                    `${API_URL}/customers/profile-image/${customerId}`,
                    {
                        headers: {
                            'Accept': '*/*'
                        }
                    }
                );

                // Process the JSON response with image link
                if (response.data?.data?.profileImage?.link) {
                    const imageUrl = response.data.data.profileImage.link;
                    setCapturedImage(imageUrl);
                    console.log('Fetched existing profile image:', imageUrl);
                } else {
                    console.log('No profile image found in response');
                }
            } catch (error) {
                console.log('No existing profile image found or error fetching:', error);
                // Don't show error toast as this might be a normal case
            } finally {
                setInitialLoading(false);
            }
        };

        fetchProfileImage();
    }, [customerId]);

    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    const validateFile = (file) => {
        if (!file) return false;
        if (file.size > MAX_FILE_SIZE) {
            return false;
        }
        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed');
            return false;
        }
        return true;
    };
    const startCamera = async () => {
        setCameraActive(true);
        await new Promise(resolve => setTimeout(resolve, 0));
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast.error('Webcam not supported on this browser.');
            setCameraActive(false);
            return;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 880 }, height: { ideal: 1040 } } });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        toast.success('Camera started successfully');
    };
    const stopCamera = () => {
        const stream = videoRef.current?.srcObject;
        if (stream) {
            const tracks = stream.getTracks();
            tracks.forEach((track) => track.stop());
        }
        if (videoRef.current) videoRef.current.srcObject = null;
        setCameraActive(false);
    };
    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            canvas.width = 880;
            canvas.height = 1040;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            context.setTransform(1, 0, 0, 1, 0, 0);
            const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            setCapturedImage(imageDataUrl);
            setSelectedFile(null);
            toast.success('Image captured successfully');
            stopCamera();
        } else {
            toast.error('Camera not initialized properly');
        }
    };
    const resetCapturedImage = () => {
        setCapturedImage(null);
        setSelectedFile(null);
    };
    const handleFileUpload = async (event) => {
        await stopCamera();
        const file = event.target.files[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageDataUrl = e.target.result;
                setCapturedImage(imageDataUrl);
            };
            reader.readAsDataURL(file);
            toast.success('Image uploaded successfully');
        }
    };
    const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && validateFile(file)) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageDataUrl = e.target.result;
                setCapturedImage(imageDataUrl);
            };
            reader.readAsDataURL(file);
            toast.success('Image uploaded successfully');
        }
    };

    const handleSubmit = async () => {
        if (!capturedImage) {
            toast.error('Please capture or upload a photo first.');
            return;
        }

        if (!customerId) {
            toast.error('Customer ID is required to upload photo.');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');

            // Convert to base64 string if it's a URL
            let imageBase64;
            if (capturedImage.startsWith('http')) {
                // If it's a URL (from the API), fetch it and convert to base64
                const response = await fetch(capturedImage);
                const blob = await response.blob();
                imageBase64 = await new Promise(resolve => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.readAsDataURL(blob);
                });
            } else if (capturedImage.startsWith('data:')) {
                // If it's already a data URL (from capture or upload), extract the base64 part
                imageBase64 = capturedImage.split(',')[1];
            } else {
                throw new Error('Unsupported image format');
            }

            // Use the correct API request format with JSON
            const response = await axios.post(
                `${API_URL}/customers/profile-image/${customerId}`,
                {
                    imageBase64: imageBase64
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': '*/*',
                        'Content-Type': 'application/json'
                    }
                }
            );

            toast.success('Profile photo updated successfully!');
        } catch (error) {
            console.error('Error uploading photo:', error);
            toast.error('Failed to upload photo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="profile-photo-section">
            <div className="section-title">
                <FontAwesomeIcon icon={faUser} className="section-title-icon" />
                Profile Photo
            </div>

            {initialLoading ? (
                <div className="loading-container">
                    <span>Loading profile image...</span>
                </div>
            ) : (
                <div className="photo-section">
                    <div className="photo-webcam-card">
                        {!cameraActive && !capturedImage && (
                            <div
                                className={`photo-upload-area ${isDragging ? 'dragging' : ''}`}
                                onDragEnter={handleDragEnter}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <FontAwesomeIcon icon={faUpload} className="upload-icon" />
                                <p className="photo-helper-text">Drag & drop photo here</p>
                                <p className="browse-text">or click to browse</p>
                                <small className="file-restrictions">
                                    Image files only (Max size: 2MB)
                                </small>
                            </div>
                        )}

                        {!cameraActive && !capturedImage && (
                            <div className="action-buttons">
                                <label className="browse-button">
                                    <FontAwesomeIcon icon={faFileAlt} />
                                    Browse Files
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileUpload}
                                        style={{ display: 'none' }}
                                    />
                                </label>
                                <button onClick={startCamera} className="use-webcamera-button">
                                    <FontAwesomeIcon icon={faCamera} />Use Webcam
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        {cameraActive && (
                            <div className="camera-container">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="camera-video"
                                />
                                <canvas
                                    ref={canvasRef}
                                    style={{ display: 'none' }}
                                />
                                <div className="camera-controls">
                                    <button onClick={captureImage} className="camera-button">
                                        Capture Image
                                    </button>
                                    <button onClick={stopCamera} className="camera-button stop">
                                        Stop Camera
                                    </button>
                                </div>
                            </div>
                        )}

                        {capturedImage && (
                            <div className="captured-image-container">
                                <h5>
                                    {selectedFile ? "Uploaded Image" : "Captured Image"}
                                </h5>
                                <img
                                    src={capturedImage}
                                    alt={selectedFile ? "Uploaded" : "Captured"}
                                    className="captured-image"
                                />
                                <button
                                    onClick={resetCapturedImage}
                                    className="camera-button"
                                >
                                    Reset
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <button
                className="camera-button submit-photo-btn"
                onClick={handleSubmit}
                disabled={loading || !capturedImage || initialLoading}
            >
                <span className="submit-photo-text">
                    {loading ? 'Uploading...' : 'Save Profile Photo'}
                </span>
            </button>
        </div>
    );
};

export default PhotoCapture;
