import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, TextField, Stack, InputAdornment } from '@mui/material';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { toast } from 'react-toastify';
import { API_URL } from '../assets/config';
import { ROUTES } from '../constants/routes';

const CustomerList = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [pagination, setPagination] = useState({
        pageNo: 1,
        pageSize: 10,
        totalCustomers: 0
    });
    const [filterModel, setFilterModel] = useState({ items: [] });
    const navigate = useNavigate();

    const columns = [
        { field: 'id', headerName: 'ID', flex: 0.3, minWidth: 40 },
        { field: 'name', headerName: 'Customer Name', flex: 1, minWidth: 180 },
        { field: 'mobileNo', headerName: 'Mobile', flex: 0.8, minWidth: 120 },
        { field: 'email', headerName: 'Email', flex: 1, minWidth: 180 },
        { field: 'pan', headerName: 'PAN', flex: 0.8, minWidth: 120 },
        { field: 'lockerNo', headerName: 'Locker No', flex: 1, minWidth: 150 },
        {
            field: 'rent',
            headerName: 'Rent',
            flex: 0.8,
            minWidth: 100,
            valueFormatter: (params) => {
                if (!params || typeof params.value === 'undefined' || params.value === null) return '-';
                return params.value ? `₹${params.value.toLocaleString()}` : '-';
            }
        },
        {
            field: 'actions',
            headerName: 'Actions',
            flex: 0.8,
            minWidth: 120,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(params.row.id);
                    }}
                    sx={{
                        backgroundColor: '#000',
                        '&:hover': {
                            backgroundColor: '#333'
                        }
                    }}
                >
                    View | Edit
                </Button>
            )
        }
    ];

    const fetchCustomerList = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await axios.get(`${API_URL}/customers/customers`, {
                params: {
                    page_no: pagination.pageNo,
                    page_size: pagination.pageSize
                },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': '*/*'
                }
            });

            if (response.data?.data) {
                // Map the API response to the format expected by DataGrid
                const mappedCustomers = response.data.data.customers.map(customer => ({
                    id: customer.customer_id,
                    name: [customer.first_name, customer.middle_name, customer.last_name].filter(Boolean).join(' '),
                    mobileNo: customer.mobile_number || '-',
                    email: customer.email || '-',
                    pan: customer.pan || '-',
                    lockerNo: customer.locker_number || '-',
                    rent: customer.rent ? parseFloat(customer.rent) : 0,
                }));

                setCustomers(mappedCustomers);
                setPagination(prev => ({
                    ...prev,
                    totalCustomers: response.data.data.total || 0
                }));
            }
        } catch (error) {
            console.error('Error fetching customers:', error);
            toast.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomerList();
    }, [pagination.pageNo, pagination.pageSize]);

    const handleEdit = (customerId) => {
        try {
            const customer = customers.find(c => c.id === customerId);
            if (customer) {
                console.log('Editing customer:', customer);
                if (!customer.pan) {
                    toast.error('Missing required customer data for editing');
                    return;
                }
                sessionStorage.setItem('editCustomerData', JSON.stringify({
                    pan: customer.pan,
                    center: 1 // Default center ID since it's not in the response
                }));
                navigate(ROUTES.CUSTOMER);
            } else {
                toast.error('Customer not found');
            }
        } catch (error) {
            toast.error('Failed to navigate to edit page');
            console.error('Navigation error:', error);
        }
    };

    const handleSearch = (event) => {
        const value = event.target.value;
        setSearchText(value);

        if (!value.trim()) {
            setFilterModel({ items: [] });
            return;
        }

        const searchFilter = {
            items: [
                {
                    id: 1,
                    field: 'name',
                    operator: 'contains',
                    value: value
                },
            ]
        };

        setFilterModel(searchFilter);
    };

    const clearSearch = () => {
        setSearchText('');
        setFilterModel({ items: [] });
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, pageNo: newPage + 1 }));
    };

    const handlePageSizeChange = (newPageSize) => {
        setPagination(prev => ({ ...prev, pageSize: newPageSize, pageNo: 1 }));
    };

    return (
        <Box sx={{
            height: '100%',
            width: '100%',
            backgroundColor: '#f5f7fa',
            p: 3
        }}>
            <Stack spacing={3}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2
                }}>
                    <h2 style={{ margin: 0 }}>Customer List</h2>
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
                <Box sx={{
                    height: 'calc(100vh - 200px)',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    <DataGrid
                        rows={customers}
                        columns={columns}
                        pageSize={pagination.pageSize}
                        rowCount={pagination.totalCustomers}
                        loading={loading}
                        paginationMode="server"
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        rowsPerPageOptions={[10, 25, 50]}
                        disableSelectionOnClick
                        autoHeight={false} // Changed from true to false to use container's height
                        filterModel={filterModel}
                        onFilterModelChange={(newModel) => setFilterModel(newModel)}
                        sx={{
                            border: 'none',
                            '.MuiDataGrid-columnHeaders': {
                                backgroundColor: '#f8fafc',
                                borderBottom: '2px solid #e2e8f0'
                            },
                            '.MuiDataGrid-cell': {
                                borderBottom: '1px solid #f1f5f9'
                            },
                            '& .MuiDataGrid-row:hover': {
                                backgroundColor: '#f8fafc'
                            },
                            '& .MuiDataGrid-main': {
                                width: '100%'
                            },
                            flex: 1, // Added to make DataGrid fill the container
                            width: '100%', // Ensure full width
                            height: '100%' // Ensure full height of container
                        }}
                    />
                </Box>
            </Stack>
        </Box>
    );
};

export default CustomerList;