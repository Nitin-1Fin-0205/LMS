export const ROLE_IDS = {
    ADMIN: 2,
    CUSTOMER_EXECUTIVE: 1
};

export const ROLES = {
    ADMIN: 'admin',
    CUSTOMER_EXECUTIVE: 'customer_executive',
}

export const ROLES_TITLES = {
    [ROLES.ADMIN]: 'Admin',
    [ROLES.CUSTOMER_EXECUTIVE]: 'Center Executive'
};

export const getRoleFromId = (roleId) => {
    switch (roleId) {
        case ROLE_IDS.ADMIN:
            return ROLES.ADMIN;
        case ROLE_IDS.CUSTOMER_EXECUTIVE:
            return ROLES.CUSTOMER_EXECUTIVE;
        default:
            return null;
    }
};