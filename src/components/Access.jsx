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
} from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faSync,
    faUser,
    faUserShield,
    faUserCog,
    faUserTie
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { ROLES, ROLES_TITLES } from '../constants/roles';
import { API_URL } from '../assets/config';

// Add mock data
const MOCK_USERS = [
    {
        id: 1,
        name: 'John Doe',
        center: 'Thane',
        email: 'john@example.com',
        role: ROLES.ADMIN
    },
    {
        id: 2,
        name: 'Jane Smith',
        center: 'Mumbai',
        email: 'jane@example.com',
        role: ROLES.CUSTOMER_EXECUTIVE
    },
    {
        id: 3,
        name: 'Bob Wilson',
        center: 'Pune',
        email: 'bob@example.com',
        role: ROLES.CUSTOMER_EXECUTIVE
    }
];

const Access = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        admin: 0,
        executive: 0,
        manager: 0
    });    // Professional function to get role color that complements existing design
    const getRoleColor = (role) => {
        switch (role) {
            case ROLES.ADMIN:
                return { bg: '#dc2626', color: 'white' }; // Professional red
            case ROLES.CUSTOMER_EXECUTIVE:
                return { bg: '#10b981', color: 'white' }; // Professional green
            case ROLES.MANAGER:
                return { bg: '#3b82f6', color: 'white' }; // Professional blue
            default:
                return { bg: '#64748b', color: 'white' }; // Professional gray
        }
    };

    // Update getRoleIcon to use Font Awesome icons
    const getRoleIcon = (role) => {
        switch (role) {
            case ROLES.ADMIN:
                return <FontAwesomeIcon icon={faUserShield} />;
            case ROLES.CUSTOMER_EXECUTIVE:
                return <FontAwesomeIcon icon={faUserTie} />;
            default:
                return <FontAwesomeIcon icon={faUser} />;
        }
    };

    const calculateStats = (userList) => {
        const newStats = {
            total: userList.length,
            admin: userList.filter(u => u.role === ROLES.ADMIN).length,
            executive: userList.filter(u => u.role === ROLES.CUSTOMER_EXECUTIVE).length,
        };
        setStats(newStats);
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Comment out actual API call
            // const token = localStorage.getItem('authToken');
            // const response = await axios.get(`${API_URL}/api/users`, {
            //     headers: {
            //         'Authorization': `Bearer ${token}`
            //     }
            // });

            // Mock API response
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
            const mockResponse = {
                data: MOCK_USERS
            };
            setUsers(mockResponse.data);
        } catch (error) {
            toast.error('Failed to fetch users');
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        setUpdating(true);
        try {
            // Comment out actual API call
            // const token = localStorage.getItem('authToken');
            // await axios.patch(`${API_URL}/api/users/${userId}/role`,
            //     { role: newRole },
            //     {
            //         headers: {
            //             'Authorization': `Bearer ${token}`
            //         }
            //     }
            // );

            // Mock API response
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

            // Update local state
            setUsers(users.map(user =>
                user.id === userId ? { ...user, role: newRole } : user
            ));

            toast.success('Role updated successfully');
        } catch (error) {
            toast.error('Failed to update role');
            console.error('Error updating role:', error);
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        calculateStats(users);
    }, [users]);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    ); if (loading) {
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
            {/* Header Section */}
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
                    User Role Management
                </Typography>
                <Typography
                    variant="subtitle1"
                    sx={{
                        color: '#64748b',
                        fontWeight: 400
                    }}
                >
                    Manage user roles and permissions across your organization
                </Typography>
            </Box>            {/* Professional Stats Cards with Light Gradients */}
            <Box sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(4, 1fr)'
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
                                Executives
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
                            {stats.executive}
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
            }}>
                    <TextField
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
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
                        }}
                    />
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                        <Chip
                            label={`${filteredUsers.length} users found`}
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
                                onClick={fetchUsers}
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
                </Box>
            </Paper>            {/* Professional Users Table */}
            <Paper sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
                bgcolor: 'white'
            }} elevation={0}>
                <TableContainer>
                    <Table>
                        <TableHead>                            <TableRow sx={{
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
                            {filteredUsers.length === 0 ? (<TableRow>
                                <TableCell colSpan={5} sx={{ textAlign: 'center', py: 6 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
                                        <FontAwesomeIcon icon={faUser} size="3x" style={{ color: '#cbd5e1' }} />
                                        <Typography variant="h6" sx={{ color: '#64748b', fontWeight: 500 }}>
                                            No users found
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
                                            Try adjusting your search criteria
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
                                        <TableCell>
                                            <Chip
                                                icon={getRoleIcon(user.role)}
                                                label={ROLES_TITLES[user.role]}
                                                sx={{
                                                    bgcolor: getRoleColor(user.role).bg,
                                                    color: getRoleColor(user.role).color,
                                                    fontWeight: 600,
                                                    fontSize: '0.75rem',
                                                    borderRadius: '6px',
                                                    '& .MuiChip-icon': {
                                                        color: 'inherit'
                                                    }
                                                }}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                size="small"
                                                disabled={updating}
                                                sx={{
                                                    minWidth: 180,
                                                    borderRadius: 2, '& .MuiSelect-select': {
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
                                            >
                                                {Object.entries(ROLES).map(([key, value]) => (
                                                    <MenuItem
                                                        key={value}
                                                        value={value}
                                                        sx={{
                                                            '&:hover': {
                                                                bgcolor: '#f8fafc'
                                                            }
                                                        }}
                                                    >
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            {getRoleIcon(value)}
                                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                                {ROLES_TITLES[value]}
                                                            </Typography>
                                                        </Box>
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default Access;