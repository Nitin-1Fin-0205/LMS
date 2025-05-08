import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import { API_URL } from '../assets/config';
import '../styles/CustomerInfo.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUpload, faCheck, faMessage, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { ValidationService } from '../services/ValidationService';
import { otpService } from '../services/otpService';

const CustomerInfo = ({ onUpdate, initialData }) => {
    const [cameraActive, setCameraActive] = useState(false);
    const [capturedImage, setCapturedImage] = useState(initialData?.photo || null);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isPanFetching, setIsPanFetching] = useState(false);
    const [isPanImageFetching, setIsPanImageFetching] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpType, setOtpType] = useState(null);
    const [resendTimer, setResendTimer] = useState({
        email: 0,
        mobile: 0
    });
    const [request_id, setRequestId] = useState(null);

    const [customerData, setCustomerData] = useState({
        photo: '',  // Initialize with empty string instead of null
        customerId: '',
        firstName: '',
        middleName: '',
        lastName: '',
        fatherOrHusbandName: '',
        address: '',
        dateOfBirth: '',
        mobileNo: '',
        panNo: '',
        gender: '',
        emailId: '',
        aadharNo: '',
        ...initialData  // Spread initialData after default values
    });

    const [otpVerification, setOtpVerification] = useState({
        emailOtp: '',
        mobileOtp: '',
        isEmailVerified: false,
        isMobileVerified: false,
        isEmailOtpSent: false,
        isMobileOtpSent: false
    });

    const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

    const validateFile = (file) => {
        if (!file) return false;

        if (file.size > MAX_FILE_SIZE) {
            toast.error('File size should not exceed 2MB');
            return false;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed');
            return false;
        }

        return true;
    };

    useEffect(() => {
        if (initialData) {
            setCustomerData(prev => ({
                ...prev,
                ...initialData,
                // Ensure these are never undefined
                photo: initialData.photo || '',
                customerId: initialData.customerId || '',
                firstName: initialData.firstName || '',
                middleName: initialData.middleName || '',
                lastName: initialData.lastName || '',
                fatherOrHusbandName: initialData.fatherOrHusbandName || '',
                address: initialData.address || '',
                dateOfBirth: initialData.dateOfBirth || '',
                mobileNo: initialData.mobileNo || '',
                panNo: initialData.panNo || '',
                gender: initialData.gender || '',
                emailId: initialData.emailId || '',
                aadharNo: initialData.aadharNo || ''
            }));
        }
    }, [initialData]);

    const handleInputChange = (field, value) => {
        const updatedData = {
            ...customerData,
            [field]: value || '' // Ensure value is never undefined
        };
        setCustomerData(updatedData);
        onUpdate(updatedData);
    };

    const handlePanInput = (e) => {
        const pan = e.target.value.toUpperCase();
        handleInputChange('panNo', pan);

        // Validate only if PAN has full length
        if (pan.length === 10) {
            const validation = ValidationService.isValidPAN(pan);
            if (!validation.isValid) {
                toast.error(validation.error);
            }
        }
    };

    const formatAadhar = (value) => {
        // Remove any non-digits
        const cleaned = value?.replace(/\D/g, '');
        // Add spaces after every 4 digits instead of dashes
        const formatted = cleaned?.replace(/(\d{4})(?=\d)/g, '$1 ');
        return formatted;
    };

    const handleAadharInput = (e) => {
        const input = e.target.value;
        // Remove any non-digits for validation and storage
        const numbersOnly = input.replace(/\D/g, '');

        if (numbersOnly === '' || (/^[0-9]+$/.test(numbersOnly) && numbersOnly.length <= 12)) {
            handleInputChange('aadharNo', numbersOnly);

            // Format with spaces
            e.target.value = formatAadhar(numbersOnly);

            if (numbersOnly.length === 12) {
                const validation = ValidationService.validateField('aadhar', numbersOnly);
                if (!validation.isValid) {
                    toast.error(validation.error);
                }
            }
        }
    };

    const handleFetchPan = async () => {
        try {
            if (!customerData.panNo || !customerData.dateOfBirth) {
                toast.error('Please enter PAN No and D.O.B to fetch details');
                return;
            }

            setIsPanFetching(true);

            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/customers/pan-details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ panNo: customerData.panNo, dob: customerData?.dateOfBirth?.toString() || '' })
            });

            const data = await response.json();
            if (response?.status === 201) {
                setCustomerData(prev => {
                    const names = data?.name?.split(' ') || ['', '', ''];
                    const updatedData = {
                        ...prev,
                        customerId: data?.customerId || '',
                        firstName: names[0] || '',
                        middleName: names[1] || '',
                        lastName: names[2] || '',
                        address: data?.address || '',
                        mobileNo: data?.mobileNumber || ''
                    };
                    onUpdate(updatedData);
                    return updatedData;
                });
                toast.success('PAN details fetched successfully');
            } else {
                toast.error(`PAN details not found`);
            }
        } catch (error) {
            console.error('Error fetching PAN details:', error);
            toast.error('Failed to fetch PAN details');
        } finally {
            setIsPanFetching(false); // Reset loading state
        }
    };

    const handlePanImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            setIsPanImageFetching(true);
            const formData = new FormData();
            formData.append('panImage', file);

            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/customers/pan-ocr`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                setCustomerData(prev => {
                    const updatedData = {
                        ...prev,
                        panNo: data?.panNo || '',
                        firstName: data?.name?.split(' ')[0] || '',
                        middleName: data?.name?.split(' ')[1] || '',
                        lastName: data?.name?.split(' ')[2] || '',
                        dateOfBirth: data?.dob || '',
                    };
                    onUpdate(updatedData);
                    return updatedData;
                });
                toast.success('PAN details extracted successfully');
            } else {
                toast.error('Failed to extract PAN details');
            }
        } catch (error) {
            console.error('Error uploading PAN image:', error);
            toast.error('Failed to process PAN image');
        } finally {
            setIsPanImageFetching(false);
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
        handleInputChange('photo', null);
        setSelectedFile(null);
    };

    const handleFileUpload = async (event) => {
        await stopCamera(); // Stop the camera if it's active
        const file = event.target.files[0];

        if (file && validateFile(file)) {
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
        if (file && validateFile(file)) {
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

    const startResendTimer = (type) => {
        setResendTimer(prev => ({ ...prev, [type]: 10 }));
        const timer = setInterval(() => {
            setResendTimer(prev => {
                const newTime = prev[type] - 1;
                if (newTime <= 0) {
                    clearInterval(timer);
                }
                return { ...prev, [type]: Math.max(0, newTime) };
            });
        }, 1000);
    };

    const handleVerifyOtp = async (type) => {
        try {
            // const value = type === 'email' ? customerData.emailId : customerData.mobileNo;
            const otp = type === 'email' ? otpVerification.emailOtp : otpVerification.mobileOtp;

            if (!otp) {
                toast.error('Please enter OTP');
                return;
            }

            await otpService.verifyOtp(request_id, otp);
            setOtpVerification(prev => ({
                ...prev,
                [type === 'email' ? 'isEmailVerified' : 'isMobileVerified']: true
            }));
            toast.success(`${type} verified successfully`);
            setShowOtpModal(false);
        } catch (error) {
            toast.error('Invalid OTP');
        }
    };

    const handleOtpClick = async (type) => {
        try {
            setOtpType(type);
            const value = type === 'email' ? customerData.emailId : customerData.mobileNo;

            if (type === 'mobile' && (!value || value.length !== 10)) {
                toast.error('Please enter valid 10-digit mobile number');
                return;
            }

            if (type === 'email' && !value) {
                toast.error('Please enter valid email');
                return;
            }

            const response = await (type === 'email'
                ? otpService.sendEmailOtp(value)
                : otpService.sendMobileOtp(value)
            );

            console.log('OTP Response:', response);
            setRequestId(response?.request_id || null);
            if (!response?.request_id) {
                throw new Error('Failed to send OTP');
            }

            startResendTimer(type);
            setOtpVerification(prev => ({
                ...prev,
                [`is${type === 'email' ? 'Email' : 'Mobile'}OtpSent`]: true
            }));
            setShowOtpModal(true);
            toast.success(`OTP sent to ${type === 'email' ? 'email' : 'mobile'}`);
        } catch (error) {
            toast.error(error.message || `Failed to send ${type} OTP`);
            console.error(`${type} OTP Error:`, error);
        }
    };

    const OtpInput = React.memo(({ value, onChange, onEnter }) => {
        const inputRef = useRef(null);

        useEffect(() => {
            inputRef.current?.focus();
        }, []);

        const handleChange = (e) => {
            const sanitizedValue = e.target.value.replace(/\D/g, '').slice(0, 6);
            onChange(sanitizedValue);
        };

        const handleKeyPress = (e) => {
            if (e.key === 'Enter') {
                onEnter();
            }
        };

        return (
            <input
                ref={inputRef}
                type="text"
                maxLength={6}
                placeholder="Enter OTP"
                value={value}
                onChange={handleChange}
                onKeyPress={handleKeyPress}
                className="otp-input"
                autoComplete="off"
            />
        );
    });

    const OtpModal = () => (
        <div className="otp-modal-overlay">
            <div className="otp-modal">
                <button
                    className="modal-close-btn"
                    onClick={() => setShowOtpModal(false)}
                >
                    <FontAwesomeIcon icon={faXmark} />
                </button>
                <h3>Verify {otpType === 'email' ? 'Email' : 'Mobile'}</h3>
                <p>Enter OTP sent to {otpType === 'email' ? customerData.emailId : customerData.mobileNo}</p>
                <OtpInput
                    value={otpVerification[`${otpType}Otp`]}
                    onChange={(value) => setOtpVerification(prev => ({
                        ...prev,
                        [`${otpType}Otp`]: value
                    }))}
                    onEnter={() => handleVerifyOtp(otpType)}
                />
                <div className="otp-actions">
                    <button
                        onClick={() => handleVerifyOtp(otpType)}
                        className="verify-otp-btn"
                    >
                        Verify OTP
                    </button>
                    <button
                        onClick={() => handleOtpClick(otpType)}
                        disabled={resendTimer[otpType] > 0}
                        className="resend-otp-btn"
                    >
                        {resendTimer[otpType] > 0
                            ? `Resend OTP (${resendTimer[otpType]}s)`
                            : 'Resend OTP'}
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="form-section">
            <h2>Customer Information</h2>

            {/* Wrap photo related sections in photo-section div */}
            <div className="photo-section">
                {/* Photo upload section */}
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
                                    <FontAwesomeIcon icon={faXmark} />
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

                {/* Camera and captured image section */}
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
                            <h5>Captured Image</h5>
                            <img
                                src={capturedImage}
                                alt="Captured"
                                className="captured-image"
                            />
                            <button onClick={resetCapturedImage} className="camera-button">Reset</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="customer-info-grid">
                <div className="form-group pan-group">
                    <label>PAN No<span className='required'>*</span></label>
                    <div className="input-button-group">
                        <input
                            type="text"
                            value={customerData.panNo}
                            onChange={handlePanInput}
                            placeholder="Enter PAN no here"
                            maxLength={10}
                            required
                        />
                        <div className="pan-actions">
                            <button
                                className="fetch-pan-button"
                                onClick={handleFetchPan}
                                disabled={isPanFetching}
                            >
                                {isPanFetching ? 'Fetching...' : 'Fetch Details'}
                            </button>
                            <label className="pan-upload-button">
                                <FontAwesomeIcon icon={faUpload} />
                                {isPanImageFetching ? 'Processing...' : 'PAN OCR'}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePanImageUpload}
                                    disabled={isPanImageFetching}
                                />
                            </label>
                        </div>
                    </div>
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
                    <label>First Name<span className='required'>*</span></label>
                    <input
                        type="text"
                        value={customerData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Enter first name"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Middle Name</label>
                    <input
                        type="text"
                        value={customerData.middleName}
                        onChange={(e) => handleInputChange('middleName', e.target.value)}
                        placeholder="Enter middle name"
                    />
                </div>

                <div className="form-group">
                    <label>Last Name<span className='required'>*</span></label>
                    <input
                        type="text"
                        value={customerData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Enter last name"
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
                    <label>Gender<span className='required'>*</span></label>
                    <select
                        value={customerData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        required
                    >
                        <option value="">Select Gender</option>
                        <option value="MALE">MALE</option>
                        <option value="FEMALE">FEMALE</option>
                        <option value="OTHER">OTHER</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Mobile No<span className='required'>*</span></label>
                    <div className="input-verify-group">
                        <input
                            type="tel"
                            value={customerData.mobileNo}
                            onChange={handleMobileInput}
                            placeholder="Enter mobile number"
                            required
                            disabled={otpVerification.isMobileVerified}
                        />
                        {otpVerification.isMobileVerified ? (
                            <span className="verified-badge">
                                <FontAwesomeIcon className='fontIcon' icon={faCheck} bounce={true} style={{ paddingTop: '4px' }} /> Verified
                            </span>
                        ) : (
                            <button
                                type="button"
                                className="verify-button"
                                onClick={() => handleOtpClick('mobile')}
                            >
                                <FontAwesomeIcon icon={faMessage} /> Verify
                            </button>
                        )}
                    </div>
                </div>


                <div className="form-group">
                    <label>Email ID<span className='required'>*</span></label>
                    <div className="input-verify-group">
                        <input
                            type="email"
                            value={customerData.emailId}
                            onChange={(e) => handleInputChange('emailId', e.target.value)}
                            placeholder="Enter email"
                            required
                            disabled={otpVerification.isEmailVerified}
                        />
                        {otpVerification.isEmailVerified ? (
                            <span className="verified-badge">
                                <FontAwesomeIcon className='fontIcon' icon={faCheck} bounce={true} style={{ paddingTop: '4px' }} /> Verified
                            </span>
                        ) : (
                            <button
                                type="button"
                                className="verify-button"
                                onClick={() => handleOtpClick('email')}
                            >
                                <FontAwesomeIcon icon={faEnvelope} /> Verify
                            </button>
                        )}
                    </div>
                </div>

                <div className="form-group">
                    <label>Aadhar No<span className='required'>*</span></label>
                    <input
                        type="text"
                        value={formatAadhar(customerData?.aadharNo)}
                        onChange={handleAadharInput}
                        placeholder="Enter Aadhar (e.g., 1234 5678 9012)"
                        maxLength={14}
                        required
                    />
                </div>

                <div className="form-group full-width">
                    <label>Address<span className='required'>*</span></label>
                    <textarea
                        value={customerData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter address"
                        required
                    ></textarea>
                </div>
            </div>

            {showOtpModal && <OtpModal />}
        </div>
    );
};

export default CustomerInfo;