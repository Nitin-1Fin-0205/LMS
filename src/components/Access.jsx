import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Select,
    MenuItem,
    Typography,
    CircularProgress,
    Chip,
    TextField,
    InputAdornment,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    Pagination,
    Alert,
    Snackbar,
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faSync,
    faUser,
    faUserShield,
    faUserTie
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { ROLE_IDS, ROLES, ROLES_TITLES, getRoleTitleFromId } from '../constants/roles';
import { fetchUsers as fetchUsersAPI, updateUserRole, getUserStats } from '../services/userService';

const Access = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true); // Start with loading true
    const [updating, setUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [limit] = useState(10);
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState(null);
    const [showError, setShowError] = useState(false); const [stats, setStats] = useState({
        total: 0,
        admin: 0,
        customer_executive: 0
    });

    // Helper functions to convert between role strings and IDs
    const getRoleIdFromString = (roleString) => {
        switch (roleString) {
            case 'admin':
                return ROLE_IDS.ADMIN;
            case 'customer_executive':
            case 'center_executive':
                return ROLE_IDS.CUSTOMER_EXECUTIVE;
            default:
                return null;
        }
    };

    const getRoleStringFromId = (roleId) => {
        switch (roleId) {
            case ROLE_IDS.ADMIN:
                return ROLES.ADMIN;
            case ROLE_IDS.CUSTOMER_EXECUTIVE:
                return ROLES.CUSTOMER_EXECUTIVE;
            default:
                return null;
        }
    }; const getRoleColor = (roleId) => {
        switch (roleId) {
            case ROLE_IDS.ADMIN:
                return { bg: 'tomato', color: 'white' };
            case ROLE_IDS.CUSTOMER_EXECUTIVE:
                return { bg: '#10b981', color: 'white' };
            default:
                return { bg: '#64748b', color: 'white' };
        }
    };

    const getRoleIcon = (roleId) => {
        switch (roleId) {
            case ROLE_IDS.ADMIN:
                return <FontAwesomeIcon icon={faUserShield} />;
            case ROLE_IDS.CUSTOMER_EXECUTIVE:
                return <FontAwesomeIcon icon={faUserTie} />;
            default:
                return <FontAwesomeIcon icon={faUser} />;
        }
    };

    const fetchStats = async () => {
        try {
            const response = await getUserStats();
            if (response && response.success && response.data) {
                setStats(response.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    }; const fetchUsers = async (pageNum = 1, search = '') => {
        try {
            // Only show loading for initial load or when explicitly requested
            if (users.length === 0 || !search) {
                setLoading(true);
            }
            setError(null);

            const response = await fetchUsersAPI(pageNum, limit, search);

            if (response) {
                let userData = [];
                let total = 0; if (response.success && response.data) {
                    userData = response.data.map(user => ({
                        ...user,
                        role: getRoleIdFromString(user.role) || user.role
                    }));
                    total = response.totalUsers || response.pagination?.total || userData.length;
                } else if (response.data) {
                    userData = response.data.map(user => ({
                        ...user,
                        role: getRoleIdFromString(user.role) || user.role
                    }));
                    total = response.totalUsers || userData.length;
                } else if (Array.isArray(response)) {
                    userData = response.map(user => ({
                        ...user,
                        role: getRoleIdFromString(user.role) || user.role
                    }));
                    total = userData.length;
                } else {
                    userData = [];
                    total = 0;
                } setUsers(userData);
                setTotalUsers(total);
                setPage(pageNum);
            } else {
                setUsers([]);
                setTotalUsers(0);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch users';
            setError(errorMessage);
            setShowError(true);
            setUsers([]);
            setTotalUsers(0);
        } finally {
            setLoading(false);
            setSearching(false);
        }
    }; const handleRoleChange = async (userId, newRoleId) => {
        try {
            setUpdating(true);

            // Convert role ID to string for API call
            const roleString = getRoleStringFromId(newRoleId);
            await updateUserRole(userId, roleString);

            setUsers(prevUsers =>
                prevUsers.map(user =>
                    user.id === userId ? { ...user, role: newRoleId } : user
                )
            );
            toast.success('Role updated successfully');
        } catch (error) {
            console.error('Error updating role:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to update role';
            toast.error(errorMessage);

            fetchUsers(page, searchTerm);
        } finally {
            setUpdating(false);
        }
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
        fetchUsers(newPage, searchTerm);
    }; useEffect(() => {
        fetchStats(); // Fetch overall stats on initial load only once
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (searchTerm) {
                setSearching(true);
                fetchUsers(1, searchTerm);
            } else {
                fetchUsers(1);
            }
        }, searchTerm ? 500 : 0); // No delay for initial load

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const handleRefresh = () => {
        setPage(1);
        setSearchTerm('');
        fetchUsers(1);
        fetchStats(); // Refresh stats too
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(1);
    };

    const filteredUsers = users; if (loading) {
        return (
            <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: '#f8fafc',
                gap: 3
            }}>
                <CircularProgress
                    size={60}
                    thickness={4}
                    sx={{ color: '#3b82f6' }}
                />
                <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 500 }}>
                    Loading user data...
                </Typography>
            </Box>
        );
    } return (
        <Box sx={{
            p: { xs: 2, sm: 3, md: 4 },
            bgcolor: '#f8fafc',
            minHeight: '100vh'
        }}>
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: 700,
                        color: '#1e293b',
                        mb: 1,
                        fontSize: { xs: '1.75rem', md: '2.125rem' }
                    }}
                >
                    Manage User Role
                </Typography>
                <Typography
                    variant="subtitle1"
                    sx={{
                        color: '#64748b',
                        fontWeight: 400
                    }}
                >
                    Manage user roles and permissions across your organization
                </Typography>            </Box>            <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(3, 1fr)'
                    },
                    gap: 2,
                    mb: 3
                }}>
                <Card sx={{
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 2,
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.12)'
                    }
                }}>
                    <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                                Total Users
                            </Typography>
                            <Box sx={{
                                bgcolor: 'rgba(100, 116, 139, 0.1)',
                                p: 1,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <FontAwesomeIcon icon={faUser} size="sm" style={{ color: '#64748b' }} />
                            </Box>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1e293b' }}>
                            {stats.total}
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{
                    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                    border: '1px solid #fecaca',
                    borderRadius: 2,
                    boxShadow: '0 1px 3px rgba(220, 38, 38, 0.1)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 3px 8px rgba(220, 38, 38, 0.12)'
                    }
                }}>
                    <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                                Administrators
                            </Typography>
                            <Box sx={{
                                bgcolor: 'rgba(220, 38, 38, 0.1)',
                                p: 1,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <FontAwesomeIcon icon={faUserShield} size="sm" style={{ color: '#dc2626' }} />
                            </Box>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#dc2626' }}>
                            {stats.admin}
                        </Typography>
                    </CardContent>
                </Card>

                <Card sx={{
                    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                    border: '1px solid #a7f3d0',
                    borderRadius: 2,
                    boxShadow: '0 1px 3px rgba(16, 185, 129, 0.1)',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 3px 8px rgba(16, 185, 129, 0.12)'
                    }
                }}>
                    <CardContent sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1e293b', fontSize: '0.9rem' }}>
                                Customer Executives
                            </Typography>
                            <Box sx={{
                                bgcolor: 'rgba(16, 185, 129, 0.1)',
                                p: 1,
                                borderRadius: 1.5,
                                display: 'flex',
                                alignItems: 'center'
                            }}>
                                <FontAwesomeIcon icon={faUserTie} size="sm" style={{ color: '#10b981' }} />
                            </Box>
                        </Box>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981' }}>
                            {stats.customer_executive}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
            <Paper sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                bgcolor: 'white'
            }}>                <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: 1.5
            }}>                    <TextField
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        variant="outlined"
                        size="small"
                        sx={{
                            flexGrow: 1,
                            maxWidth: { xs: '100%', sm: 400 },
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: '#f8fafc',
                                borderColor: '#e2e8f0',
                                '&:hover': {
                                    backgroundColor: '#f1f5f9',
                                    borderColor: '#cbd5e1'
                                },
                                '&.Mui-focused': {
                                    backgroundColor: 'white',
                                    borderColor: '#3b82f6'
                                }
                            }
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FontAwesomeIcon icon={faSearch} style={{ color: '#64748b' }} />
                                </InputAdornment>
                            ),
                        }} />
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Chip
                            label={searching ? 'Searching...' : `${filteredUsers.length} users found`}
                            variant="outlined"
                            sx={{
                                fontWeight: 600,
                                borderColor: '#e2e8f0',
                                color: '#64748b',
                                bgcolor: '#f8fafc'
                            }}
                        />
                        <Tooltip title="Refresh Data">
                            <IconButton
                                onClick={handleRefresh}
                                disabled={loading}
                                sx={{
                                    fontSize: '0.875rem',
                                    bgcolor: '#3b82f6',
                                    color: 'white',
                                    borderRadius: 2,
                                    '&:hover': {
                                        bgcolor: '#2563eb',
                                        color: 'white',
                                        scale: 1.05,
                                        transition: 'all 0.2s ease-in-out',
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: '#e2e8f0',
                                        color: '#94a3b8'
                                    }
                                }}
                            >
                                <FontAwesomeIcon icon={faSync} spin={loading} />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>            </Paper>
            <Paper sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                bgcolor: 'white'
            }} elevation={0}>                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{
                                bgcolor: '#f8fafc',
                                '& .MuiTableCell-head': {
                                    color: '#374151',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.05em',
                                    borderBottom: '1px solid #e5e7eb',
                                    py: 2
                                }
                            }}>
                                <TableCell>User ID</TableCell>
                                <TableCell>User Details</TableCell>
                                <TableCell>Center</TableCell>
                                <TableCell>Current Role</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6 }}>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                                            <FontAwesomeIcon icon={faUser} size="3x" style={{ color: '#cbd5e1' }} />
                                            <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 500 }}>
                                                {searchTerm ? 'No users found' : 'No users available'}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                                {searchTerm
                                                    ? `No users match "${searchTerm}". Try a different search term.`
                                                    : 'No users have been added to the system yet.'
                                                }
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user, index) => (
                                    <TableRow
                                        key={user.id}
                                        sx={{
                                            '&:hover': {
                                                bgcolor: '#f8fafc'
                                            },
                                            '&:last-child td': { borderBottom: 0 },
                                            borderBottom: '1px solid #f1f5f9'
                                        }}
                                    >
                                        <TableCell sx={{ fontWeight: 600, color: '#3b82f6' }}>
                                            #{user.id.toString().padStart(3, '0')}
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                                                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1f2937' }}>
                                                    {user.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                                    {user.email}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={user.center}
                                                variant="outlined"
                                                size="small"
                                                sx={{
                                                    fontWeight: 500,
                                                    borderColor: '#d1d5db',
                                                    color: '#374151',
                                                    bgcolor: '#f9fafb'
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell>                                            <Chip
                                            icon={getRoleIcon(user.role)}
                                            label={getRoleTitleFromId(user.role)}
                                            sx={{
                                                bgcolor: getRoleColor(user.role).bg,
                                                color: getRoleColor(user.role).color,
                                                fontWeight: 600,
                                                fontSize: '0.75rem',
                                                px: 1.5,
                                                borderRadius: '20px',
                                                '& .MuiChip-icon': {
                                                    color: 'inherit'
                                                }
                                            }}
                                            size="xsmall"
                                        />
                                        </TableCell>
                                        <TableCell>
                                            <Box sx={{ position: 'relative' }}>
                                                <Select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                    size="small"
                                                    disabled={updating}
                                                    sx={{
                                                        minWidth: 180,
                                                        borderRadius: 2,
                                                        opacity: updating ? 0.6 : 1,
                                                        '& .MuiSelect-select': {
                                                            py: 1,
                                                            px: 1.5
                                                        },
                                                        '& .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#e5e7eb'
                                                        },
                                                        '&:hover .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#3b82f6'
                                                        },
                                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                                            borderColor: '#3b82f6'
                                                        }
                                                    }}
                                                >                                                    {Object.entries(ROLE_IDS).map(([key, roleId]) => (
                                                    <MenuItem
                                                        key={roleId}
                                                        value={roleId}
                                                        sx={{
                                                            '&:hover': {
                                                                bgcolor: '#f8fafc'
                                                            }
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {getRoleIcon(roleId)}
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {getRoleTitleFromId(roleId)}
                                                            </Typography>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                                </Select>
                                                {updating && (
                                                    <CircularProgress
                                                        size={20}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: '50%',
                                                            left: '50%',
                                                            marginTop: '-10px',
                                                            marginLeft: '-10px',
                                                            color: '#3b82f6'
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>                </TableContainer>
            </Paper>

            {/* Pagination Controls */}
            {!searchTerm && totalUsers > limit && (
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 3,
                    p: 2
                }}>
                    <Pagination
                        count={Math.ceil(totalUsers / limit)}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                        disabled={loading}
                        sx={{
                            '& .MuiPaginationItem-root': {
                                borderRadius: 2,
                                fontWeight: 500,
                                '&.Mui-selected': {
                                    bgcolor: '#3b82f6',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: '#2563eb'
                                    }
                                }
                            }
                        }}
                    />
                </Box>
            )}

            {/* Error Snackbar */}
            <Snackbar
                open={showError}
                autoHideDuration={6000}
                onClose={() => setShowError(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setShowError(false)}
                    severity="error"
                    sx={{ width: '100%' }}
                >
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Access;