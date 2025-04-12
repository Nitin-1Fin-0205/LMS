import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, Box } from '@mui/material';
import SideNav from './components/SideNav';
import AddCustomer from './components/AddCustomer';
import Forbidden from './components/pages/Forbidden';
import './styles/App.css';

function App() {
  return (
    <Router>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <SideNav />
        <Box sx={{ flexGrow: 1, paddingLeft: 5 }}>
          <Routes>
            <Route path="/add-customer" element={<AddCustomer />} />
            <Route path="/forbidden" element={<Forbidden />} />
            <Route path="*" element={<Forbidden />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
