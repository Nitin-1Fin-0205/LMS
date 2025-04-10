import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomerInfo = ({ onUpdate, initialData }) => {
    const [cameraActive, setCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const [customerData, setCustomerData] = useState(initialData || {
        photo: null,
        customerId: "",
        customerName: "",
        fatherOrHusbandName: "",
        address: "",
        dateOfBirth: "",
        mobileNo: "",
        aadharOrPanNo: "",
        gender: "",
        emailId: "",
        documentNo: ""
    });

    const handleInputChange = (field, value) => {
        const updatedData = {
            ...customerData,
            [field]: value
        };
        setCustomerData(updatedData);
        onUpdate(updatedData);
    };

    const startCamera = async () => {
        try {
            // Set camera active first so the video element renders
            setCameraActive(true);

            // Wait for next render cycle to ensure video element exists
            await new Promise(resolve => setTimeout(resolve, 0));

            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Webcam not supported on this browser.');
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 880 },
                    height: { ideal: 1040 },
                },
            });

            if (!videoRef.current) {
                throw new Error('Video element not found');
            }

            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            toast.success('Camera started successfully');

        } catch (error) {
            console.error('Error accessing the webcam:', error);
            toast.error(`Camera error: ${error.message}`);
            setCameraActive(false);

            // Clean up if there was an error
            if (videoRef.current?.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                videoRef.current.srcObject = null;
            }
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

    // Capture the image from the video feed
    const captureImage = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Set canvas dimensions to match the video element dimensions
            canvas.width = 880;
            canvas.height = 1040;

            // // Flip horizontally for mirror effect
            // context.translate(canvas.width, 0);
            // context.scale(-1, 1);

            try {
                // Draw the current video frame
                context.drawImage(
                    video,
                    0, 0,
                    canvas.width, canvas.height
                );

                context.setTransform(1, 0, 0, 1, 0, 0);

                // Convert to data URL
                const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
                setCapturedImage(imageDataUrl);
                toast.success('Image captured successfully');

                // Stop the camera after successful capture
                stopCamera();
            } catch (error) {
                console.error('Error capturing image:', error);
                toast.error('Failed to capture image');
            }
        } else {
            toast.error('Camera not initialized properly');
        }
    };

    // Reset the captured image
    const resetCapturedImage = () => {
        setCapturedImage(null);
    };

    return (
        <div className="form-section">
            <h2>Customer Information</h2>
            <div className="photo-webcam-card">
                <div className="photo-upload-area">
                    <img
                        src="src/assets/icons/dragprofile.png"
                        alt="Upload Icon"
                        className="upload-icon"
                    />
                    <p>
                        Drag & drop photo or{' '}
                        <label className="browse-link">
                            Browse
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </label>
                    </p>
                </div>
                {!cameraActive && !capturedImage && (
                    <button onClick={startCamera} className="use-webcamera-button">
                        Use Webcam
                    </button>
                )}
            </div>

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
                        <button
                            onClick={captureImage}
                            className="camera-button"
                        >
                            Capture Image
                        </button>
                        <button
                            onClick={stopCamera}
                            className="camera-button stop"
                        >
                            Stop Camera
                        </button>
                    </div>
                </div>
            )}

            {capturedImage && (
                <div className="captured-image-container">
                    <h3>Captured Image:</h3>

                    <img
                        src={capturedImage}
                        alt="Captured"
                        className="captured-image"
                    />

                    <button onClick={resetCapturedImage}>Reset</button>
                </div>
            )}

            <div className="form-group">
                <label>Customer ID</label>
                <input
                    type="text"
                    value={customerData.customerId}
                    onChange={(e) => handleInputChange('customerId', e.target.value)}
                    placeholder="Enter customer id"
                />
            </div>
            <div className="form-group">
                <label>Customer Name</label>
                <input
                    type="text"
                    value={customerData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="Enter customer name"
                />
            </div>
            <div className="form-group">
                <label>Father's / Husband's Name</label>
                <input
                    type="text"
                    value={customerData.fatherOrHusbandName}
                    onChange={(e) => handleInputChange('fatherOrHusbandName', e.target.value)}
                    placeholder="Enter father/husband name"
                />
            </div>
            <div className="form-group">
                <label>Address</label>
                <textarea
                    value={customerData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter address"
                ></textarea>
            </div>
            <div className="form-group">
                <label>D.O.B</label>
                <input
                    type="date"
                    value={customerData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Mobile No</label>
                <input
                    type="text"
                    value={customerData.mobileNo}
                    onChange={(e) => handleInputChange('mobileNo', e.target.value)}
                    placeholder="Enter primary mobile"
                />
            </div>
            <div className="form-group">
                <label>Aadhar/PAN No</label>
                <input
                    type="text"
                    value={customerData.aadharOrPanNo}
                    onChange={(e) => handleInputChange('aadharOrPanNo', e.target.value)}
                    placeholder="Enter PAN no"
                />
            </div>
            <div className="form-group">
                <label>Gender</label>
                <input
                    type="text"
                    value={customerData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    placeholder="Enter gender"
                />
            </div>
            <div className="form-group">
                <label>Email ID</label>
                <input
                    type="email"
                    value={customerData.emailId}
                    onChange={(e) => handleInputChange('emailId', e.target.value)}
                    placeholder="Enter email"
                />
            </div>
            <div className="form-group">
                <label>Document No</label>
                <input
                    type="text"
                    value={customerData.documentNo}
                    onChange={(e) => handleInputChange('documentNo', e.target.value)}
                    placeholder="Enter Document No"
                />
            </div>
        </div>
    );
};

export default CustomerInfo;