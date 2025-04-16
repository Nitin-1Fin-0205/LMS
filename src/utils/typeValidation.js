export const validateFormData = (data) => {
    if (!data || typeof data !== 'object') {
        throw new Error('Invalid form data structure');
    }

    const requiredHolders = ['primaryHolder', 'secondHolder', 'thirdHolder'];
    const requiredSections = {
        primaryHolder: ['customerInfo', 'lockerInfo', 'rentDetails', 'attachments'],
        secondHolder: ['customerInfo', 'lockerInfo', 'attachments'],
        thirdHolder: ['customerInfo', 'lockerInfo', 'attachments']
    };

    requiredHolders.forEach(holder => {
        if (!data[holder] || typeof data[holder] !== 'object') {
            throw new Error(`Invalid or missing holder: ${holder}`);
        }

        requiredSections[holder].forEach(section => {
            if (!data[holder][section] || typeof data[holder][section] !== 'object') {
                throw new Error(`Invalid or missing section: ${section} for ${holder}`);
            }
        });
    });

    return true;
};

export const validateHolderData = (holderType, section, data) => {
    if (!holderType || typeof holderType !== 'string') {
        throw new Error('Invalid holder type');
    }

    if (!section || typeof section !== 'string') {
        throw new Error('Invalid section');
    }

    if (!data || typeof data !== 'object') {
        throw new Error('Invalid data object');
    }

    return true;
};
