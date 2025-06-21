export const ROLE_IDS = {
    ADMIN: 1,
    CUSTOMER_EXECUTIVE: 2
};

export const ROLES = {
    ADMIN: 'admin',
    CUSTOMER_EXECUTIVE: 'customer_executive',
    // CENTER_EXECUTIVE: 'center_executive'
}

export const ROLES_TITLES = {
    [ROLES.ADMIN]: 'Admin',
    [ROLES.CUSTOMER_EXECUTIVE]: 'Customer Executive',
    // [ROLES.CENTER_EXECUTIVE]: 'Center Executive'
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

export const getRoleTitleFromId = (roleId) => {
    switch (roleId) {
        case ROLE_IDS.ADMIN:
            return 'Admin';
        case ROLE_IDS.CUSTOMER_EXECUTIVE:
            return 'Customer Executive';
        default:
            return 'Unknown Role';
    }
};