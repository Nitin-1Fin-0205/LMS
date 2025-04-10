import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AddCustomer from './components/AddCustomer';
import Forbidden from './components/pages/Forbidden';
import PrivateRoute from './components/auth/PrivateRoute';
import './styles/App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/forbidden" element={<Forbidden />} />

            <Route path="/*" element={
              <PrivateRoute>
                <Routes>
                  <Route path="/add-customer" element={<AddCustomer />} />
                  <Route path="*" element={<Navigate to="/forbidden" replace />} />
                </Routes>
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
