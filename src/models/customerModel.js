export const CustomerInfoModel = {
    customerId: '',
    customerName: '',
    fatherOrHusbandName: '',
    dateOfBirth: '',
    gender: '',
    mobileNo: '',
    emailId: '',
    panNo: '',
    documentNo: '',
    address: '',
    photo: null,
    documents: {}
};

export const BiometricModel = {
    fingerprints: []
};

export const CustomerFormModel = {
    primaryHolder: {
        customerInfo: { ...CustomerInfoModel },
        biometric: { ...BiometricModel }
    },
    secondaryHolder: {
        customerInfo: { ...CustomerInfoModel }
    },
    thirdHolder: {
        customerInfo: { ...CustomerInfoModel }
    }
};
