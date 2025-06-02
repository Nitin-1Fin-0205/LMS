import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { API_URL } from '../assets/config';
import '../styles/CustomerInfo.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faUpload, faCheck, faMessage, faEnvelope, faSms } from '@fortawesome/free-solid-svg-icons';
import { ValidationService } from '../services/ValidationService';
import { otpService } from '../services/otpService';

const CustomerInfo = ({ onUpdate, initialData }) => {
    const [customerData, setCustomerData] = useState({
        customerId: null,
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
        city: '',
        state: '',
        statecode: '',
        ...initialData
    });
    const [stateList, setStateList] = useState([]);
    const [otpVerification, setOtpVerification] = useState({
        emailOtp: '',
        mobileOtp: '',
        isEmailVerified: false,
        isMobileVerified: false,
        isEmailOtpSent: false,
        isMobileOtpSent: false
    });
    const [isPanFetching, setIsPanFetching] = useState(false);
    const [isPanImageFetching, setIsPanImageFetching] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpType, setOtpType] = useState(null);
    const [resendTimer, setResendTimer] = useState({ email: 0, mobile: 0 });
    const [request_id, setRequestId] = useState(null);
    const [isLoadingStates, setIsLoadingStates] = useState(false);

    useEffect(() => {
        if (initialData) {
            setCustomerData(prev => ({
                ...prev,
                ...initialData,
                customerId: Number(initialData.customerId) || null,
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
                aadharNo: initialData.aadharNo || '',
                city: initialData.city || '',
                state: initialData.state || '',
                statecode: initialData.statecode || ''
            }));
        }
    }, [initialData]);

    // Fetch state list from API
    const fetchStateList = async () => {
        setIsLoadingStates(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${API_URL}/customers/state-code-list`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': '*/*'
                }
            });
            const result = await response.json();
            if (result.status_code === 200) {
                setStateList(result.data);
            } else {
                throw new Error('Failed to fetch state list');
            }
        } catch (error) {
            console.error('Error fetching state list:', error);
            toast.error('Failed to load state list');
        } finally {
            setIsLoadingStates(false);
        }
    };

    useEffect(() => {
        fetchStateList();
    }, []);

    // Validation handler
    const validateField = (name, value) => {
        if (!value || value.trim() === '') {
            toast.error(`${name} is required`);
            return false;
        }
        return true;
    };

    // Add name validation helper
    const validateNameInput = (value) => {
        return value.replace(/[^a-zA-Z\s.']/g, ''); // Only allow letters, spaces, dots and apostrophes
    };

    // Update handle input change
    const handleInputChange = (field, value) => {
        if (['firstName', 'middleName', 'lastName', 'fatherOrHusbandName', 'city', 'state'].includes(field)) {
            value = validateNameInput(value);
        }
        const updatedData = {
            ...customerData,
            [field]: value || ''
        };
        setCustomerData(updatedData);
        onUpdate(updatedData);
    };

    // Simplified blur handler to only validate the field
    const handleBlur = (field) => {
        validateField(field, customerData[field]);
    };

    // Update input class helper
    const getInputClassName = () => {
        return 'form-input';
    };

    // Add DOB validation handler
    const handleDobChange = (e) => {
        const value = e.target.value;

        if (value) {
            const year = value.split('-')[0];

            if (year.length > 4) {
                return;
            }

            // Additional validation: Ensure date is not in the future
            const selectedDate = new Date(value);
            const today = new Date();

            if (selectedDate > today) {
                toast.error('Date of birth cannot be in the future');
                return;
            }
        }

        handleInputChange('dateOfBirth', value);
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
                        customerId: Number(data?.customerId) || null,
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
    };    const handleMobileInput = (e) => {
        const value = e.target.value;
        // Only allow numbers
        if (value === '' || /^[0-9\b]+$/.test(value)) {
            // Limit to 10 digits
            if (value.length <= 10) {
                // If the number is changing and was previously verified, reset verification
                if (otpVerification.isMobileVerified && value !== customerData.mobileNo) {
                    setOtpVerification(prev => ({
                        ...prev,
                        isMobileVerified: false,
                        mobileOtp: ''
                    }));
                }
                handleInputChange('mobileNo', value);
            }
        }
    };

    const handleEmailInput = (e) => {
        const value = e.target.value;
        
        // If the email is changing and was previously verified, reset verification
        if (otpVerification.isEmailVerified && value !== customerData.emailId) {
            setOtpVerification(prev => ({
                ...prev,
                isEmailVerified: false,
                emailOtp: ''
            }));
        }
          handleInputChange('emailId', value);
    };

    const startResendTimer = (type) => {
        setResendTimer(prev => ({ ...prev, [type]: 30 }));
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

            // Validate mobile number
            if (type === 'mobile') {
                if (!value || value.length !== 10) {
                    toast.error('Please enter valid 10-digit mobile number');
                    return;
                }
            }

            // Validate email
            if (type === 'email') {
                const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                if (!value || !emailRegex.test(value)) {
                    toast.error('Please enter valid email address');
                    return;
                }
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

    const handleStateSelect = (e) => {
        const selectedState = stateList.find(state => state.state_code === parseInt(e.target.value));
        if (selectedState) {
            setCustomerData(prev => ({
                ...prev,
                state: selectedState.state_name,
                statecode: selectedState.state_code.toString()
            }));
            // Update parent component
            onUpdate({
                ...customerData,
                state: selectedState.state_name,
                statecode: selectedState.state_code.toString()
            });
        }
    };

    return (
        <div className="form-section">
            <h2>Customer Information</h2>
            <div className="customer-info-grid">
                <div className="form-group">
                    <label>PAN No<span className='required'>*</span></label>
                    <input
                        type="text"
                        value={customerData.panNo}
                        onChange={handlePanInput}
                        onBlur={() => handleBlur('panNo')}
                        className={getInputClassName('panNo')}
                        placeholder="Enter PAN no here"
                        maxLength={10}
                        required
                    />

                </div>

                <div className="form-group  pan-group">
                    <label>D.O.B<span className='required'>*</span></label>
                    <div className="input-button-group">

                        <input
                            type="date"
                            value={customerData.dateOfBirth}
                            onChange={(e) => handleDobChange(e)}
                            max={new Date().toISOString().split('T')[0]}
                            required
                        />
                        {/* <div className="pan-actions">
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
                        </div> */}
                    </div>
                </div>

                <div className="form-group first-name-group">
                    <label>First Name<span className='required'>*</span></label>
                    <input
                        type="text"
                        id="firstName"
                        className={getInputClassName()}
                        value={customerData.firstName || ''}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        onBlur={() => handleBlur('firstName')}
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
                        onBlur={() => handleBlur('lastName')}
                        className={getInputClassName('lastName')}
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
                    <label>Aadhaar No<span className='required'>*</span></label>
                    <input
                        type="text"
                        value={formatAadhar(customerData?.aadharNo)}
                        onChange={handleAadharInput}
                        placeholder="Enter Aadhaar (e.g., 1234 5678 9012)"
                        maxLength={14}
                        required
                    />
                </div>

                <div className="form-group mobile-group">
                    <label>Mobile No<span className='required'>*</span></label>
                    <div className="input-verify-group">
                        <input
                            type="tel"
                            value={customerData.mobileNo}
                            onChange={handleMobileInput}
                            onBlur={() => handleBlur('mobileNo')}
                            className={getInputClassName('mobileNo')}
                            placeholder="Enter mobile number"                            required
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
                                <FontAwesomeIcon icon={faSms} /> Verify
                            </button>
                        )}
                    </div>
                </div>


                <div className="form-group email-group">
                    <label>Email ID<span className='required'>*</span></label>
                    <div className="input-verify-group">
                        <input
                            type="email"
                            value={customerData.emailId}
                            onChange={handleEmailInput}
                            onBlur={() => handleBlur('emailId')}
                            className={getInputClassName('emailId')}
                            placeholder="Enter email"                            required
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



                <div className="form-group full-width">
                    <label>Address<span className='required'>*</span></label>
                    <textarea
                        value={customerData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter address"
                        required
                    ></textarea>
                </div>

                <div className="form-group">
                    <label>City<span className='required'>*</span></label>
                    <input
                        type="text"
                        value={customerData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter city"
                        required
                    />
                </div>

                <div className="form-group">
                    <label>State<span className='required'>*</span></label>
                    <select
                        value={customerData.statecode}
                        onChange={handleStateSelect}
                        disabled={isLoadingStates}
                        required
                    >
                        <option value="">Select State</option>
                        {stateList.map(state => (
                            <option
                                key={state.state_code}
                                value={state.state_code}
                            >
                                {state.state_name}
                            </option>
                        ))}
                    </select>
                    {isLoadingStates && <span className="loading-states">Loading states...</span>}
                </div>
            </div>

            {showOtpModal && <OtpModal />}
        </div >
    );
};

export default CustomerInfo;