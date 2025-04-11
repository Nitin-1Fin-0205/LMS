import { useState, useCallback } from 'react';
import { formDataStructure } from '../models/customerModel';

export const useHolderForm = () => {
    const [holders, setHolders] = useState({
        primaryHolder: { ...formDataStructure.primaryHolder },
        secondHolder: { ...formDataStructure.secondHolder },
        thirdHolder: { ...formDataStructure.thirdHolder }
    });

    const updateHolder = useCallback((holderType, section, data) => {
        setHolders(prev => ({
            ...prev,
            [holderType]: {
                ...prev[holderType],
                [section]: {
                    ...prev[holderType][section],
                    ...data
                }
            }
        }));
    }, []);

    const resetHolders = useCallback(() => {
        setHolders({
            primaryHolder: { ...formDataStructure.primaryHolder },
            secondHolder: { ...formDataStructure.secondHolder },
            thirdHolder: { ...formDataStructure.thirdHolder }
        });
    }, []);

    return { holders, updateHolder, resetHolders };
};
