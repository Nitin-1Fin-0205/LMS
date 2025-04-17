import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid, GridToolbar, useGridApiRef } from '@mui/x-data-grid';
import { Box, Button, TextField, Stack, InputAdornment } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../assets/config';
import { ROUTES } from '../constants/routes';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();
    const apiRef = useGridApiRef();

    const columns = [
        {
            field: 'customerId',
            headerName: 'Customer ID',
            width: 130,
            filterable: true
        },
        {
            field: 'customerName',
            headerName: 'Name',
            width: 180,
            filterable: true
        },
        {
            field: 'mobileNo',
            headerName: 'Mobile',
            width: 130,
            filterable: true
        },
        {
            field: 'emailId',
            headerName: 'Email',
            width: 200
        },
        {
            field: 'center',
            headerName: 'Center',
            width: 130
        },
        {
            field: 'lockerNo',
            headerName: 'Locker No',
            width: 130,
            filterable: true
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 120,
            renderCell: (params) => (
                <Box
                    sx={{
                        padding: '4px 2px',
                        borderRadius: '4px',
                        backgroundColor: params.value === 'Active' ? '#4caf50' : '#ff9800',
                        color: 'white'
                    }}
                >
                    {params.value}
                </Box>
            )
        },
        {
            field: 'premium',
            headerName: 'Premium',
            width: 120,
            renderCell: (params) => {
                const premium = params.row.premium;
                return <span>{premium ? `₹${premium}` : '-'}</span>;
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log('Edit button clicked for customer:', params.row);
                        handleEdit(params.row.id);
                    }}
                    sx={{
                        backgroundColor: '#000',
                        '&:hover': {
                            backgroundColor: '#333'
                        }
                    }}
                >
                    Edit
                </Button>
            ),
        },
    ];

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const token = localStorage.getItem('authToken');
            // Mock data for testing
            const response = {
                status: 200,
                data: [
                    {
                        id: 1,
                        primaryHolder: {
                            customerInfo: {
                                customerId: 'CUST001',
                                customerName: 'John Doe',
                                mobileNo: '1234567890',
                                emailId: 'john@example.com',
                            },
                            lockerInfo: {
                                center: 'Main Center',
                                assignedLocker: 'L001',
                            },
                            rentDetails: {
                                status: 'Active',
                                premium: '5000',
                            }
                        },
                    },
                ]
            };

            if (response.status === 200) {
                const formattedData = response.data.map(customer => ({
                    id: customer.id,
                    customerId: customer.primaryHolder.customerInfo.customerId,
                    customerName: customer.primaryHolder.customerInfo.customerName,
                    mobileNo: customer.primaryHolder.customerInfo.mobileNo,
                    emailId: customer.primaryHolder.customerInfo.emailId,
                    center: customer.primaryHolder.lockerInfo.center,
                    lockerNo: customer.primaryHolder.lockerInfo.assignedLocker,
                    status: customer.primaryHolder.rentDetails?.status || 'Inactive',
                    premium: customer.primaryHolder.rentDetails?.premium || ''
                }));
                setCustomers(formattedData);
            }
        } catch (error) {
            toast.error('Failed to fetch customers');
            console.error('Error fetching customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (customerId) => {
        try {
            console.log('Editing customer:', customerId);
            navigate(`${ROUTES.EDIT_CUSTOMER}/${customerId}`);
        } catch (error) {
            console.error('Navigation error:', error);
            toast.error('Failed to navigate to edit page');
        }
    };

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchText(value);

        if (!value.trim()) {
            apiRef.current.setFilterModel({ items: [] });
            return;
        }

        const searchFilter = {
            items: [
                {
                    field: 'customerName',
                    operator: 'contains',
                    value: value
                },
                {
                    field: 'lockerNo',
                    operator: 'contains',
                    value: value
                }
            ],
            linkOperator: 'or'
        };

        apiRef.current.setFilterModel(searchFilter);
    };

    const clearSearch = () => {
        setSearchText('');
        apiRef.current.setFilterModel({ items: [] });
    };

    return (
        <Box sx={{
            height: '100%',
            width: '100%',
            p: 2,
            boxSizing: 'border-box',
            overflowX: 'auto'
        }}>
            <Stack spacing={2} sx={{ minWidth: '1000px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>Customer List</h2>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search by name or locker number"
                        value={searchText}
                        onChange={handleSearch}
                        sx={{ width: 300 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FontAwesomeIcon icon={faSearch} />
                                </InputAdornment>
                            ),
                            endAdornment: searchText && (
                                <InputAdornment position="end">
                                    <Button
                                        size="small"
                                        onClick={clearSearch}
                                        sx={{ minWidth: 'auto', p: 0.5 }}
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </Button>
                                </InputAdornment>
                            )
                        }}
                    />
                </Box>
                <DataGrid
                    rows={customers}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10, 25, 50]}
                    components={{
                        Toolbar: GridToolbar
                    }}
                    apiRef={apiRef}
                    loading={loading}
                    disableSelectionOnClick
                    sx={{
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: '#f5f5f5'
                        }
                    }}
                />
            </Stack>
        </Box>
    );
};

export default CustomerList;
