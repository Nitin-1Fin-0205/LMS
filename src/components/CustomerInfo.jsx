import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomerInfo = ({ onUpdate, initialData }) => {
    const [cameraActive, setCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(initialData?.photo || null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isPanFetching, setIsPanFetching] = useState(false);

    const [customerData, setCustomerData] = useState(initialData || {
        photo: null,
        customerId: "",
        customerName: "",
        fatherOrHusbandName: "",
        address: "",
        dateOfBirth: "",
        mobileNo: "",
        panNo: "",
        gender: "",
        emailId: "",
        documentNo: ""
    });

    useEffect(() => {
        if (initialData?.photo) {
            setCapturedImage(initialData.photo);
        }
    }, [initialData]);

    const handleInputChange = (field, value) => {
        const updatedData = {
            ...customerData,
            [field]: value
        };
        setCustomerData(updatedData);
        onUpdate(updatedData);
    };

    const handleFetchPan = async () => {
        try {
            if (!customerData.panNo) {
                toast.error('Please enter PAN number');
                return;
            }

            setIsPanFetching(true);

            // Mock API call to fetch PAN details
            const response = {
                ok: true,
                status: 200,
                json: async () => {
                    // Simulate API delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return {
                        status: 'success',
                        data: {
                            customerId: '12345',
                            customerName: 'John Doe',
                            fatherOrHusbandName: 'Mr. Doe',
                            address: '123 Main St, City, State, ZIP',
                            dateOfBirth: '1990-01-01',
                            mobileNo: '9876543210'
                        }
                    };
                }
            };

            // const token = localStorage.getItem('authToken');
            // const response = await fetch(`${API_URL}/api/pan-details`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${token}`,
            //         'Accept': 'application/json'
            //     },
            //     body: JSON.stringify({ panNo: customerData.panNo })
            // });

            const data = await response.json();
            if (data.status === 'success') {
                setCustomerData(prev => {
                    const updatedData = {
                        ...prev,
                        customerId: data.data.customerId,
                        customerName: data.data.customerName,
                        fatherOrHusbandName: data.data.fatherOrHusbandName,
                        address: data.data.address,
                        dateOfBirth: data.data.dateOfBirth,
                        mobileNo: data.data.mobileNo
                    };
                    onUpdate(updatedData);
                    return updatedData;
                });

                toast.success('PAN details fetched successfully');
            } else {
                toast.error('PAN details not found');
            }
        } catch (error) {
            console.error('Error fetching PAN details:', error);
            toast.error('Failed to fetch PAN details');
        } finally {
            setIsPanFetching(false); // Reset loading state
        }
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
                handleInputChange('photo', imageDataUrl); // Add this line to update parent state
                setSelectedFile(null);
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
        handleInputChange('photo', null); // Add this line to update parent state
    };

    const handleFileUpload = async (event) => {
        await stopCamera(); // Stop the camera if it's active
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setCapturedImage(null);
            const reader = new FileReader();
            reader.onload = (e) => {
                handleInputChange('photo', e.target.result);
            };
            reader.readAsDataURL(file);
            toast.success('Image uploaded successfully');
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setCapturedImage(null);
            const reader = new FileReader();
            reader.onload = (e) => {
                handleInputChange('photo', e.target.result);
            };
            reader.readAsDataURL(file);
            toast.success('Image uploaded successfully');
        } else {
            toast.error('Please drop an image file');
        }
    };

    // Add this validation function near your other handlers
    const handleMobileInput = (e) => {
        const value = e.target.value;
        // Only allow numbers
        if (value === '' || /^[0-9\b]+$/.test(value)) {
            // Limit to 10 digits
            if (value.length <= 10) {
                handleInputChange('mobileNo', value);
            }
        }
    };

    return (
        <div className="form-section">
            <h2>Customer Information</h2>
            <div className="photo-webcam-card">
                <div
                    className={`photo-upload-area ${isDragging ? 'dragging' : ''}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
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
                                onChange={handleFileUpload}
                                style={{ display: 'none' }}
                            />
                        </label>
                    </p>
                    {selectedFile && (
                        <div className="selected-file">
                            <span>{selectedFile.name}</span>
                            <button
                                onClick={() => {
                                    setSelectedFile(null);
                                    setCapturedImage(null);
                                    handleInputChange('photo', null);
                                }}
                                className="remove-file"
                            >
                                ✕
                            </button>
                        </div>
                    )}
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
                    <h3>Captured Image:</h3>
                    <img
                        src={capturedImage}
                        alt="Captured"
                        className="captured-image"
                    />
                    <button onClick={resetCapturedImage} className="camera-button">Reset</button>
                </div>
            )}

            <div className="form-group pan-group">
                <label>PAN No<span className='required'>*</span></label>
                <div className="input-button-group">
                    <input
                        type="text"
                        value={customerData.panNo}
                        onChange={(e) => handleInputChange('panNo', e.target.value)}
                        placeholder="Enter PAN no"
                        required
                    />
                    <button
                        className="fetch-pan-button"
                        onClick={handleFetchPan}
                        disabled={isPanFetching} // Disable button when fetching
                    >
                        {isPanFetching ? 'Fetching...' : 'Fetch Details'} {/* Show loading text */}
                    </button>
                </div>
            </div>

            <div className="form-group">
                <label>Customer ID<span className='required'>*</span></label>
                <input
                    type="text"
                    value={customerData.customerId}
                    onChange={(e) => handleInputChange('customerId', e.target.value)}
                    placeholder="Enter customer id"
                    required
                />
            </div>
            <div className="form-group">
                <label>Customer Name<span className='required'>*</span></label>
                <input
                    type="text"
                    value={customerData.customerName}
                    onChange={(e) => handleInputChange('customerName', e.target.value)}
                    placeholder="Enter customer name"
                    required
                />
            </div>
            <div className="form-group">
                <label>Father's / Husband's Name<span className='required'>*</span></label>
                <input
                    type="text"
                    value={customerData.fatherOrHusbandName}
                    onChange={(e) => handleInputChange('fatherOrHusbandName', e.target.value)}
                    placeholder="Enter father/husband name"
                    required
                />
            </div>
            <div className="form-group">
                <label>Address<span className='required'>*</span></label>
                <textarea
                    value={customerData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter address"
                    required
                ></textarea>
            </div>
            <div className="form-group">
                <label>D.O.B<span className='required'>*</span></label>
                <input
                    type="date"
                    value={customerData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label>Mobile No<span className='required'>*</span></label>
                <input
                    type="tel"
                    pattern="[0-9]*"
                    maxLength="10"
                    value={customerData.mobileNo}
                    onChange={handleMobileInput}
                    placeholder="Enter primary mobile"
                    required
                    onKeyPress={(e) => {
                        if (!/[0-9]/.test(e.key)) {
                            e.preventDefault();
                        }
                    }}
                />
            </div>

            <div className="form-group">
                <label>Gender<span className='required'>*</span></label>
                <select
                    value={customerData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="gender-select"
                    required
                >
                    <option value="">Select Gender</option>
                    <option value="MALE">MALE</option>
                    <option value="FEMALE">FEMALE</option>
                    <option value="OTHER">OTHER</option>
                </select>
            </div>
            <div className="form-group">
                <label>Email ID<span className='required'>*</span></label>
                <input
                    type="email"
                    value={customerData.emailId}
                    onChange={(e) => handleInputChange('emailId', e.target.value)}
                    placeholder="Enter email"
                    required
                />
            </div>
            <div className="form-group">
                <label>Document No<span className='required'>*</span></label>
                <input
                    type="text"
                    value={customerData.documentNo}
                    onChange={(e) => handleInputChange('documentNo', e.target.value)}
                    placeholder="Enter Document No"
                    required
                />
            </div>
        </div>
    );
};

export default CustomerInfo;