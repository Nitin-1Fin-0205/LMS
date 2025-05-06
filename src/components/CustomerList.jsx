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
                        borderRadius: '12px',
                        backgroundColor: params.value === 'Active' ? 'rgba(46, 204, 113, 0.15)' : 'rgba(255, 152, 0, 0.15)',
                        color: params.value === 'Active' ? '#2ecc71' : '#f39c12',
                        fontSize: '0.65rem',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '80px',
                        border: `1px solid ${params.value === 'Active' ? '#2ecc71' : '#f39c12'}`,
                        height: '25px',
                        marginBottom: '100px',
                        textTransform: 'uppercase',

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
                                pan: 'ABCDE1234F',
                                mobileNo: '1234567890',
                                emailId: 'john@example.com',
                            },
                            lockerInfo: {
                                center: '1',
                                assignedLocker: 'L001',
                            },
                            rentDetails: {
                                status: 'Active',
                                premium: '5000',
                            }
                        },
                    },
                    {
                        id: 2,
                        primaryHolder: {
                            customerInfo: {
                                customerId: 'CUST002',
                                customerName: 'Jane Smith',
                                pan: 'FGHIJ5678K',
                                mobileNo: '0987654321',
                                emailId: 'janesmit@gmail.com',
                            },
                            lockerInfo: {
                                center: '2',
                                assignedLocker: 'L002',
                            },
                            rentDetails: {
                                status: 'Active',
                                premium: '3000',
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
                    customerPAN: customer.primaryHolder.customerInfo.pan,
                    mobileNo: customer.primaryHolder.customerInfo.mobileNo,
                    emailId: customer.primaryHolder.customerInfo.emailId,
                    center: customer.primaryHolder.lockerInfo.center,
                    lockerNo: customer.primaryHolder.lockerInfo.assignedLocker,
                    status: customer.primaryHolder.rentDetails?.status || 'Inactive',
                    premium: customer.primaryHolder.rentDetails?.premium || ''
                }));

                // Log the formatted data to verify it has the required fields
                console.log('Formatted customer data:', formattedData);

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
            const customer = customers.find(c => c.id === customerId);
            if (customer) {
                // Make sure we have both PAN and center before navigating
                if (!customer.customerPAN || !customer.center) {
                    console.error('Missing required data:', customer);
                    toast.error('Missing required customer data for editing');
                    return;
                }

                // Store the data in sessionStorage
                sessionStorage.setItem('editCustomerData', JSON.stringify({
                    pan: customer.customerPAN,
                    center: customer.center
                }));

                console.log('Navigating to edit with data:', JSON.parse(sessionStorage.getItem('editCustomerData')));
                navigate(ROUTES.CUSTOMER);
            } else {
                toast.error('Customer not found');
            }
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
            height: 'calc(100vh - 80px)',
            width: '100%',
            p: 3,
            boxSizing: 'border-box',
            overflowX: 'auto',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Stack
                spacing={3}
                sx={{
                    minWidth: '1000px',
                    height: '100%',
                    '& .MuiDataGrid-root': {
                        backgroundColor: 'white',
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        // overflow: 'hidden'
                    }
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        // py: 2 
                    }}
                >
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
                        height: 'calc(100vh - 180px)',
                        '& .MuiDataGrid-row:hover': {
                            backgroundColor: '#f5f5f5'
                        },
                        '& .MuiDataGrid-cell': {
                            py: 1.5
                        },
                        '& .MuiDataGrid-columnHeaders': {
                            backgroundColor: '#f5f5f5',
                            borderBottom: '2px solid #e0e0e0'
                        }
                    }}
                />
            </Stack>
        </Box>
    );
};

export default CustomerList;
