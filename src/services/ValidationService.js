import { HOLDER_STAGES } from '../constants/holderConstants';

export const ValidationService = {
    // PAN Card Validation for Individual Category
    isValidPAN: (pan) => {
        if (!pan) return { isValid: false, error: 'PAN number is required' };
        if (pan.length < 10) return { isValid: false, error: 'PAN must be 10 characters' };

        // Format: AAAPL1234A
        // First 3 chars: Letters
        // 5th char: Letter
        // Next 4 chars: Numbers
        // Last char: Letter
        const panRegex = /^[A-Z]{3}P[A-Z][0-9]{4}[A-Z]$/;
        const isValid = panRegex.test(pan.toUpperCase());

        if (!isValid) {
            return {
                isValid: false,
                error: 'Invalid PAN format. Must be like AAAPL1234A'
            };
        }

        return { isValid: true, error: null };
    },

    // Aadhar Card Validation
    isValidAadhar: (aadhar) => {
        // 12 digits
        const aadharRegex = /^[0-9]{12}$/;
        return aadharRegex.test(aadhar);
    },

    // Mobile Number Validation (Indian)
    isValidMobile: (mobile) => {
        // 10 digits, starting with 6-9
        const mobileRegex = /^[6-9][0-9]{9}$/;
        return mobileRegex.test(mobile);
    },

    // Email Validation
    isValidEmail: (email) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    },

    // Name Validation (Alphabets, spaces, and some special chars)
    isValidName: (name) => {
        const nameRegex = /^[a-zA-Z\s.']{2,50}$/;
        return nameRegex.test(name);
    },

    // Pin Code Validation (Indian)
    isValidPinCode: (pincode) => {
        const pincodeRegex = /^[1-9][0-9]{5}$/;
        return pincodeRegex.test(pincode);
    },

    // Form Field Validation
    validateField: (fieldName, value) => {
        switch (fieldName) {
            case 'pan':
                return ValidationService.isValidPAN(value);

            case 'aadhar':
                return ValidationService.isValidAadhar(value)
                    ? { isValid: true }
                    : { isValid: false, error: 'Aadhar should be 12 digits' };

            case 'mobile':
                return ValidationService.isValidMobile(value)
                    ? { isValid: true }
                    : { isValid: false, error: 'Invalid mobile number' };

            case 'email':
                return ValidationService.isValidEmail(value)
                    ? { isValid: true }
                    : { isValid: false, error: 'Invalid email format' };

            case 'name':
                return ValidationService.isValidName(value)
                    ? { isValid: true }
                    : { isValid: false, error: 'Name should only contain letters' };
            default:
                return { isValid: true };
        }
    },

    // Form Validation
    validateForm: (formData) => {
        const errors = {};
        let isValid = true;

        // Validate each field
        Object.keys(formData).forEach(field => {
            const result = ValidationService.validateField(field, formData[field]);
            if (!result.isValid) {
                errors[field] = result.error;
                isValid = false;
            }
        });

        return { isValid, errors };
    },

    // Stage Data Validation
    validateStageData: (stage, data) => {
        if (!data) return { isValid: false, error: 'No data provided' };

        switch (stage) {
            case HOLDER_STAGES.CUSTOMER_INFO:
                // First validate PAN format
                const panValidation = ValidationService.isValidPAN(data.panNo);
                if (!panValidation.isValid) {
                    return {
                        isValid: false,
                        error: panValidation.error
                    };
                }

                const requiredFields = [
                    'firstName',
                    'lastName',
                    'fatherOrHusbandName',
                    'dateOfBirth',
                    'gender',
                    'mobileNo',
                    'emailId',
                    'panNo',
                    'aadharNo',
                    'address',
                    'city',
                    'state',
                    'statecode'
                ];

                const missingFields = requiredFields.filter(field => !data[field]);
                if (missingFields.length > 0) {
                    return {
                        isValid: false,
                        error: `Please fill in required field: ${missingFields[0]}`
                    };
                }
                return { isValid: true };

            case HOLDER_STAGES.ATTACHMENTS:
                return { isValid: true };

            case HOLDER_STAGES.BIOMETRIC:
                if (!data.fingerprints || data.fingerprints.length === 0) {
                    return {
                        isValid: false,
                        error: 'Please capture fingerprints'
                    };
                }
                return { isValid: true };

            default:
                return { isValid: false, error: 'Invalid stage' };
        }
    }
};
