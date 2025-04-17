import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import SideNav from './components/SideNav';
import AddCustomer from './components/AddCustomer';
import EditCustomer from './components/EditCustomer';
import Forbidden from './components/pages/Forbidden';
import PrivateRoute from './components/auth/PrivateRoute';
import './styles/App.css';
import { ROUTES } from './constants/routes';
import { ROLES } from './constants/roles';
import Access from './components/Access';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomerList from './components/CustomerList';

function App() {
  // Helper function to determine required roles
  const getRequiredRoles = (defaultRoles) => {
    return [ROLES.ADMIN, ...defaultRoles];
  };

  return (
    <AuthProvider>
      <Router>
        <CssBaseline />
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <SideNav />
          <Box sx={{
            flexGrow: 1,
            paddingLeft: '60px', // Adjust this value based on your SideNav width
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <Routes>
              <Route path={ROUTES.FORBIDDEN} element={<Forbidden />} />

              <Route path="/*" element={
                <Routes>
                  {/* Add Customer Route */}
                  <Route path={ROUTES.ADD_CUSTOMER} element={
                    <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                      <AddCustomer />
                    </PrivateRoute>
                  } />

                  <Route path={ROUTES.CUSTOMER} element={
                    <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                      <CustomerList />
                    </PrivateRoute>
                  } />

                  <Route path={`${ROUTES.EDIT_CUSTOMER}/:id`} element={
                    <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                      <EditCustomer />
                    </PrivateRoute>
                  } />

                  <Route path={ROUTES.ACCESS} element={
                    <PrivateRoute requiredRoles={getRequiredRoles([])}>
                      <Access />
                    </PrivateRoute>
                  } />

                  <Route path={`${ROUTES.EDIT_CUSTOMER}/:customerId`} element={<EditCustomer />} />

                  <Route path="*" element={<Navigate to={ROUTES.FORBIDDEN} replace />} />
                </Routes>
              } />
            </Routes>
          </Box>
        </Box>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider >
  );
}

export default App;
