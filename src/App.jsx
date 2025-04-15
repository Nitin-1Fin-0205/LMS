import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import SideNav from './components/SideNav';
import AddCustomer from './components/AddCustomer';
import Forbidden from './components/pages/Forbidden';
import PrivateRoute from './components/auth/PrivateRoute';
import './styles/App.css';
import { ROUTES } from './constants/routes';
import { ROLES } from './constants/roles';
import Access from './components/Access';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  // Helper function to determine required roles
  const getRequiredRoles = (defaultRoles) => {
    return [ROLES.CUSTOMER_EXECUTIVE, ...defaultRoles];
  };

  return (
    <AuthProvider>
      <Router>
        <CssBaseline />
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          <SideNav />
          <Box sx={{ flexGrow: 1, paddingLeft: 5 }}>
            <Routes>
              <Route path={ROUTES.FORBIDDEN} element={<Forbidden />} />

              <Route path="/*" element={
                <Routes>
                  {/* Add Customer Route */}
                  <Route path={ROUTES.ADD_CUSTOMER} element={
                    <PrivateRoute requiredRoles={getRequiredRoles([ROLES.ADMIN])}>
                      <AddCustomer />
                    </PrivateRoute>
                  } />

                  <Route path={ROUTES.ACCESS} element={
                    <PrivateRoute requiredRoles={getRequiredRoles([])}>
                      <Access />
                    </PrivateRoute>
                  } />


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
    </AuthProvider>
  );
}

export default App;
