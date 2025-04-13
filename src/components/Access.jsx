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
    });

    // Add function to get role color
    const getRoleColor = (role) => {
        switch (role) {
            case ROLES.ADMIN:
                return { bg: '#ff4444', color: 'white' };
            case ROLES.CUSTOMER_EXECUTIVE:
                return { bg: '#00C851', color: 'white' };
            case ROLES.MANAGER:
                return { bg: '#33b5e5', color: 'white' };
            default:
                return { bg: '#grey', color: 'white' };
        }
    };

    // Update getRoleIcon to use Font Awesome icons
    const getRoleIcon = (role) => {
        switch (role) {
            case ROLES.ADMIN:
                return <FontAwesomeIcon icon={faUserShield} />;
            case ROLES.CUSTOMER_EXECUTIVE:
                return <FontAwesomeIcon icon={faUserTie} />;
            case ROLES.MANAGER:
                return <FontAwesomeIcon icon={faUserCog} />;
            default:
                return <FontAwesomeIcon icon={faUser} />;
        }
    };

    const calculateStats = (userList) => {
        const newStats = {
            total: userList.length,
            admin: userList.filter(u => u.role === ROLES.ADMIN).length,
            executive: userList.filter(u => u.role === ROLES.CUSTOMER_EXECUTIVE).length,
            manager: userList.filter(u => u.role === ROLES.MANAGER).length
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
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 5 }}>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1a237e' }}>
                User Role Management
            </Typography>

            {/* Stats Cards */}
            <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                <Card sx={{ flexGrow: 1, bgcolor: '#f5f5f5' }}>
                    <CardContent>
                        <Typography color="textSecondary">Total Users</Typography>
                        <Typography variant="h4">{stats.total}</Typography>
                    </CardContent>
                </Card>
                <Card sx={{ flexGrow: 1, bgcolor: '#fff3e0' }}>
                    <CardContent>
                        <Typography color="textSecondary">{ROLES_TITLES[ROLES.ADMIN]}s</Typography>
                        <Typography variant="h4">{stats.admin}</Typography>
                    </CardContent>
                </Card>
                <Card sx={{ flexGrow: 1, bgcolor: '#e8f5e9' }}>
                    <CardContent>
                        <Typography color="textSecondary">{ROLES_TITLES[ROLES.CUSTOMER_EXECUTIVE]}s</Typography>
                        <Typography variant="h4">{stats.executive}</Typography>
                    </CardContent>
                </Card>
            </Box>

            {/* Search and Refresh */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <TextField
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ width: 300 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FontAwesomeIcon icon={faSearch} />
                            </InputAdornment>
                        ),
                    }}
                />
                <Tooltip title="Refresh">
                    <IconButton onClick={fetchUsers} disabled={loading}>
                        <FontAwesomeIcon icon={faSync} spin={loading} />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Users Table */}
            <Paper sx={{ mt: 3, borderRadius: 2, overflow: 'hidden' }} elevation={3}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                                <TableCell>User ID</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell>Center</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Current Role</TableCell>
                                <TableCell>Change Role</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredUsers.map((user) => (
                                <TableRow key={user.id} hover>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                                    <TableCell>{user.center}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            // icon={getRoleIcon(user.role)}
                                            label={ROLES_TITLES[user.role]}
                                            sx={{
                                                bgcolor: getRoleColor(user.role).bg,
                                                color: getRoleColor(user.role).color,
                                                fontWeight: 700,
                                                fontSize: '0.8rem',
                                                padding: '0.5rem 0.5rem',
                                                borderRadius: '4px',
                                            }}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Select
                                            value={user.role}
                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                            size="small"
                                            sx={{
                                                minWidth: 150,
                                                '& .MuiSelect-select': {
                                                    py: 1
                                                }
                                            }}
                                        >
                                            {Object.entries(ROLES).map(([key, value]) => (
                                                <MenuItem key={value} value={value}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {getRoleIcon(value)}
                                                        {ROLES_TITLES[value]}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default Access;