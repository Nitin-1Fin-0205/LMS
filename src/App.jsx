import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import SideNav from './components/SideNav';
import Customer from './components/Customer';
import Forbidden from './components/pages/Forbidden';
import UnauthorizedAccess from './components/pages/UnauthorizedAccess';
import PrivateRoute from './components/auth/PrivateRoute';
import './styles/App.css';
import { ROUTES } from './constants/routes';
import { ROLES } from './constants/roles';
import Access from './components/Access';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomerList from './components/CustomerList';
import NotFound from './components/pages/NotFound';
import LockerDetails from './components/LockerDetails';
import HomePage from './components/HomePage';
import CustomerVisit from './components/CustomerVisit';
import HolderDetails from './components/HolderDetails';
import { HOLDER_TYPES } from './constants/holderConstants';

// Create a wrapper component that uses useLocation
const AppContent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('authToken');
  const { validateToken } = useAuth();
  const [sideNavCollapsed, setSideNavCollapsed] = React.useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('access_token');

    if (token) {
      localStorage.setItem('authToken', token);
      validateToken().then(isValid => {
        if (isValid) {
          navigate(ROUTES.HomePage, { replace: true });
        } else {
          navigate(ROUTES.UNAUTHORIZED, { replace: true });
        }
      });
    }
  }, [location.search, navigate]);

  const handleSideNavToggle = (collapsed) => {
    setSideNavCollapsed(collapsed);
  };

  // Helper function to determine required roles
  const getRequiredRoles = (defaultRoles) => {
    return [ROLES.ADMIN, ...defaultRoles];
  };
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {token && <SideNav onToggle={handleSideNavToggle} />}
      <Box sx={{
        flexGrow: 1,
        marginLeft: token ? (sideNavCollapsed ? '60px' : '240px') : '0px',
        width: token ? (sideNavCollapsed ? 'calc(100% - 60px)' : 'calc(100% - 240px)') : '100%',
        transition: 'margin-left 0.3s ease, width 0.3s ease',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <Routes>
          <Route path="/" element={
            <PrivateRoute>
              <HomePage />
            </PrivateRoute>
          } />
          <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedAccess />} />

          <Route path="/*" element={
            <Routes>
              {/* Add Customer Route */}

              <Route path={ROUTES.CUSTOMER} element={
                <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                  <Customer />
                </PrivateRoute>
              } />

              <Route path={ROUTES.CUSTOMER_WITH_PAN} element={
                <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                  <Customer />
                </PrivateRoute>
              } />

              <Route path={ROUTES.PRIMARY_HOLDER} element={
                <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                  <HolderDetails holderType={HOLDER_TYPES.PRIMARY} />
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
                  <HolderDetails holderType={HOLDER_TYPES.SECONDARY} />
                </PrivateRoute>
              } />

              <Route path={ROUTES.THIRD_HOLDER} element={
                <PrivateRoute requiredRoles={getRequiredRoles([ROLES.CUSTOMER_EXECUTIVE])}>
                  <HolderDetails holderType={HOLDER_TYPES.THIRD} />
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

              <Route path={ROUTES.FORBIDDEN} element={<Forbidden />} />
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
