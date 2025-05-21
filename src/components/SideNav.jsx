import * as React from 'react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChevronLeft,
    faChevronRight,
    faUserPlus,
    faLock,
    faUsers,
    faSignOutAlt,
    faFingerprint,
    faPersonWalking
} from '@fortawesome/free-solid-svg-icons';
import {
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Box
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES, TAB_NAMES } from '../constants/routes';
import { APP_LOGOUT_REDIRECT } from '../assets/config';

const SideNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [activeTab, setActiveTab] = useState(TAB_NAMES.CUSTOMERS);

    // Update activeTab based on current route
    React.useEffect(() => {
        if (location.pathname.includes(ROUTES.ADD_CUSTOMER)) {
            setActiveTab(TAB_NAMES.CUSTOMERS);
        } else if (location.pathname.includes(ROUTES.ACCESS)) {
            setActiveTab(TAB_NAMES.ACCESS);
        }
    }, [location]);

    const handleTabChange = (tab, path) => {
        setActiveTab(tab);
        navigate(path);
    };

    const toggleNav = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        window.location.href = `${APP_LOGOUT_REDIRECT}`;
    };

    const listItemSx = {
        margin: '4px 8px',
        padding: '12px 16px',
        borderRadius: '4px',
        cursor: 'pointer',
        color: isCollapsed ? '#bdc3c7' : '#333333',
        backgroundColor: 'transparent',
        transition: 'all 0.3s ease',
        '&:hover': {
            backgroundColor: isCollapsed ? '#34495E' : '#f5f5f5',
            color: isCollapsed ? '#ffffff' : '#000000',
        },
        '&.Mui-selected': {
            backgroundColor: '#3498db',
            color: '#ffffff',
            '&:hover': {
                backgroundColor: '#2980b9',
            }
        }
    };

    return (
        <>
            <Drawer
                variant="permanent"
                sx={{
                    width: isCollapsed ? 60 : 240,
                    position: 'fixed',
                    height: '100vh',
                    zIndex: 1300,
                    '& .MuiDrawer-paper': {
                        width: isCollapsed ? 60 : 240,
                        backgroundColor: isCollapsed ? '#000000' : '#ffffff',
                        color: isCollapsed ? '#ffffff' : '#000000',
                        transition: 'all 0.3s ease',
                        position: 'fixed',
                        height: '100vh',
                        zIndex: 1300,
                        padding: '0',
                        borderRight: '1px solid #e0e0e0',
                        overflow: 'hidden', // Hide scrollbars
                    }
                }}
            >
                <Box
                    onClick={toggleNav}
                    sx={{
                        height: isCollapsed ? '60px' : '90px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderBottom: '1px solid #e0e0e0',
                        mb: 2,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            backgroundColor: isCollapsed ? '#333' : '#f5f5f5',
                        }

                    }}
                >
                    <img
                        src="/1FBlack.svg"
                        alt="1Finance Logo"
                        style={{
                            height: isCollapsed ? '30px' : '50px',
                            width: isCollapsed ? '30px' : 'auto',
                            filter: isCollapsed ? 'invert(1)' : 'none',
                            transition: 'filter 0.3s ease'
                        }}
                    />
                </Box>
                <List sx={{ padding: 0 }}>
                    <ListItem
                        selected={activeTab === TAB_NAMES.CUSTOMERS}
                        onClick={() => handleTabChange(TAB_NAMES.CUSTOMERS, ROUTES.CUSTOMER)}
                        sx={listItemSx}
                    >
                        <ListItemIcon sx={{
                            color: 'inherit',
                            minWidth: 35,
                            marginRight: isCollapsed ? 0 : 2
                        }}>
                            <FontAwesomeIcon icon={faUserPlus} />
                        </ListItemIcon>
                        {!isCollapsed && <ListItemText primary="Add Customer" />}
                    </ListItem>
                    <ListItem
                        selected={activeTab === TAB_NAMES.ACCESS}
                        onClick={() => handleTabChange(TAB_NAMES.ACCESS, ROUTES.ACCESS)}
                        sx={listItemSx}
                    >
                        <ListItemIcon sx={{
                            color: 'inherit',
                            minWidth: 35,
                            marginRight: isCollapsed ? 0 : 2
                        }}>
                            <FontAwesomeIcon icon={faLock} />
                        </ListItemIcon>
                        {!isCollapsed && <ListItemText primary="Access" />}
                    </ListItem>
                    <ListItem
                        selected={activeTab === TAB_NAMES.CUSTOMER}
                        onClick={() => handleTabChange(TAB_NAMES.CUSTOMER, ROUTES.CUSTOMERS)}
                        sx={listItemSx}
                    >
                        <ListItemIcon sx={{
                            color: 'inherit',
                            minWidth: 35,
                            marginRight: isCollapsed ? 0 : 2
                        }}>
                            <FontAwesomeIcon icon={faUsers} />
                        </ListItemIcon>
                        {!isCollapsed && <ListItemText primary="Customers" />}
                    </ListItem>
                    {/* Customer Visit Navigation Item */}
                    <ListItem
                        selected={activeTab === 'CUSTOMER_VISIT'}
                        onClick={() => handleTabChange('CUSTOMER_VISIT', ROUTES.CUSTOMER_VISIT)}
                        sx={listItemSx}
                    >
                        <ListItemIcon sx={{
                            color: 'inherit',
                            minWidth: 35,
                            marginRight: isCollapsed ? 0 : 2
                        }}>
                            <FontAwesomeIcon icon={faPersonWalking} />
                        </ListItemIcon>
                        {!isCollapsed && <ListItemText primary="Customer Visit" />}
                    </ListItem>
                </List>
                <Box sx={{
                    position: 'absolute',
                    bottom: 0,
                    width: '100%',
                    borderTop: '1px solid #e0e0e0',
                }}>
                    <ListItem
                        onClick={handleLogout}
                        sx={{
                            ...listItemSx,
                            margin: '8px',
                            '&:hover': {
                                backgroundColor: '#e74c3c',
                                color: '#ffffff',
                            }
                        }}
                    >
                        <ListItemIcon sx={{
                            color: 'inherit',
                            minWidth: 35,
                            marginRight: isCollapsed ? 0 : 2
                        }}>
                            <FontAwesomeIcon icon={faSignOutAlt} />
                        </ListItemIcon>
                        {!isCollapsed && <ListItemText primary="Logout" />}
                    </ListItem>
                </Box>
            </Drawer>
        </>
    );
};

export default SideNav;
