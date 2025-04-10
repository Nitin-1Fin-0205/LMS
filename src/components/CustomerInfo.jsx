import React, { useState, useRef } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomerInfo = () => {
    const [cameraActive, setCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

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
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
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

            // Set canvas dimensions to match the video stream
            if (context && video.videoWidth && video.videoHeight) {
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;

                // Draw the current video frame onto the canvas
                context.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Get the image data URL from the canvas
                const imageDataUrl = canvas.toDataURL('image/png');
                setCapturedImage(imageDataUrl);

                // Stop the webcam
                stopCamera();
            }
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
                        src="src/assets/icons/dragprofile.png" // Replace with your drag and drop image path
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
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            border: '2px solid #ccc',
                            borderRadius: '10px',
                            backgroundColor: '#000',
                        }}
                    ></video>
                    <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginTop: '10px',
                            marginBottom: '10px',
                        }}
                    >
                        <button onClick={captureImage} style={{ marginRight: '10px' }}>
                            Capture Image
                        </button>
                        <button onClick={stopCamera}>Stop Camera</button>
                    </div>
                </div>
            )}

            {capturedImage && (
                <div className="captured-image-container">
                    <h3>Captured Image:</h3>
                    <img
                        src={capturedImage}
                        alt="Captured"
                        style={{
                            width: '100%',
                            maxWidth: '400px',
                            border: '1px solid #ccc',
                            borderRadius: '10px',
                        }}
                    />
                    <button onClick={resetCapturedImage}>Reset</button>
                </div>
            )}

            <div className="form-group">
                <label>Customer ID</label>
                <input type="text" placeholder="Enter customer id" />
            </div>
            <div className="form-group">
                <label>Customer Name</label>
                <input type="text" placeholder="Enter customer name" />
            </div>
            <div className="form-group">
                <label>Father's / Husband's Name</label>
                <input type="text" placeholder="Enter father/husband name" />
            </div>
            <div className="form-group">
                <label>Address</label>
                <textarea placeholder="Enter address"></textarea>
            </div>
            <div className="form-group">
                <label>D.O.B</label>
                <input type="date" />
            </div>
            <div className="form-group">
                <label>Mobile No</label>
                <input type="text" placeholder="Enter primary mobile" />
            </div>
            <div className="form-group">
                <label>Aadhar/PAN No</label>
                <input type="text" placeholder="Enter PAN no" />
            </div>
            <div className="form-group">
                <label>Gender</label>
                <input type="text" placeholder="Enter gender" />
            </div>
            <div className="form-group">
                <label>Email ID</label>
                <input type="email" placeholder="Enter email" />
            </div>
            <div className="form-group">
                <label>Document No</label>
                <input type="text" placeholder="Enter Document No" />
            </div>
        </div>
    );
};

export default CustomerInfo;