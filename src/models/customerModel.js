export const CustomerInfoModel = {
    customerId: null,
    firstName: '',
    middleName: '',
    lastName: '',
    fatherOrHusbandName: '',
    dateOfBirth: '',
    gender: '',
    mobileNo: '',
    emailId: '',
    panNo: '',
    aadharNo: '',
    address: '',
    photo: null,
    aadharNo: null,
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
