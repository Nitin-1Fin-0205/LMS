import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import SideNav from './components/SideNav';
import Customer from './components/Customer';
// import AddCustomer from './components/AddCustomer';
// import EditCustomer from './components/EditCustomer';
import Forbidden from './components/pages/Forbidden';
import PrivateRoute from './components/auth/PrivateRoute';
import './styles/App.css';
import { ROUTES } from './constants/routes';
import { ROLES } from './constants/roles';
import Access from './components/Access';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomerList from './components/CustomerList';
import PrimaryHolder from './components/PrimaryHolder';
import NotFound from './components/pages/NotFound';
import SecondaryHolder from './components/SecondaryHolder';
import ThirdHolder from './components/ThirdHolder';
import LockerDetails from './components/LockerDetails';
import Welcome from './components/Welcome';
import CustomerVisit from './components/CustomerVisit';

// Create a wrapper component that uses useLocation
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const { validateToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('access_token');

    if (token) {
      localStorage.setItem('authToken', token);
      validateToken(); // Only call here, not on every render
      navigate(ROUTES.CUSTOMER, { replace: true });
    }
  }, [location.search, navigate]);

  // Helper function to determine required roles
  const getRequiredRoles = (defaultRoles) => {
    return [ROLES.ADMIN, ...defaultRoles];
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* <SideNav /> */}
      {token && <SideNav />}
      <Box sx={{
        flexGrow: 1,
        paddingLeft: '60px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <Routes>
          <Route path="/" element={<Welcome />} />
          {/* <Route path={ROUTES.FORBIDDEN} element={<Forbidden />} /> */}

          <Route path="/*" element={
            <Routes>
              {/* Add Customer Route */}

              <Route path={ROUTES.CUSTOMER} element={
                <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                  <Customer />
                </PrivateRoute>
              } />

              <Route path={ROUTES.PRIMARY_HOLDER} element={
                <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                  <PrimaryHolder />
                </PrivateRoute>
              } />

              {/* <Route path={ROUTES.ADD_CUSTOMER} element={
                <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                  <AddCustomer />
                </PrivateRoute>
              } /> */}

              <Route path={ROUTES.CUSTOMERS} element={
                <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                  <CustomerList />
                </PrivateRoute>
              } />

              {/* <Route path={`${ROUTES.EDIT_CUSTOMER}/:id`} element={
                <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                  <EditCustomer />
                </PrivateRoute>
              } /> */}

              <Route path={ROUTES.ACCESS} element={
                <PrivateRoute requiredRoles={getRequiredRoles([])}>
                  <Access />
                </PrivateRoute>
              } />

              <Route path={ROUTES.SECONDARY_HOLDER} element={
                <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                  <SecondaryHolder />
                </PrivateRoute>
              } />

              <Route path={ROUTES.THIRD_HOLDER} element={
                <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                  <ThirdHolder />
                </PrivateRoute>
              } />

              <Route path={ROUTES.LOCKER_DETAILS} element={
                <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                  <LockerDetails />
                </PrivateRoute>
              } />

              <Route path={ROUTES.CUSTOMER_VISIT} element={
                <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                  <CustomerVisit />
                </PrivateRoute>
              } />

              {/* <Route path={`${ROUTES.EDIT_CUSTOMER}/:customerId`} element={<EditCustomer />} /> */}

              <Route path="*" element={<NotFound />} />
            </Routes>
          } />
        </Routes>
      </Box>
    </Box>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <CssBaseline />
        <AppContent />
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
          limit={3}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
