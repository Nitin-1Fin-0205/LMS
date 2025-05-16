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
        const panRegex = /^[A-Z]{4}[A-Z][0-9]{4}[A-Z]$/;
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

    // Age Validation (Calculate from DOB)
    isValidAge: (dob, minAge = 18) => {
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        return age >= minAge;
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

            case 'dob':
                return ValidationService.isValidAge(value)
                    ? { isValid: true }
                    : { isValid: false, error: 'Age should be 18 or above' };

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
    }
};
