export const CustomerInfoModel = {
    customerId: null,
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
};

export const BiometricModel = {
    fingerprints: []
};

export const AttachmentsModel = {
    identityProof: [],
    addressProof: [],
    contactDocument: [],
    otherDocument: []
};


export const CustomerFormModel = {
    primaryHolder: {
        customerInfo: { ...CustomerInfoModel },
        biometric: { ...BiometricModel },
        attachments: { ...AttachmentsModel }

    },
    secondaryHolder: {
        customerInfo: { ...CustomerInfoModel },
        attachments: { ...AttachmentsModel }
    },
    thirdHolder: {
        customerInfo: { ...CustomerInfoModel },
        attachments: { ...AttachmentsModel }

    }
};
