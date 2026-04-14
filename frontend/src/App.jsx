import { Routes, Route, Navigate } from 'react-router-dom';
import { useUser } from './context/UserContext';
import UserSelection from './pages/UserSelection';
import Layout from './components/Layout';
import VendorPanel from './components/VendorPanel';
import BuyerPanel from './components/BuyerPanel';
import AdminPanel from './components/AdminPanel';
import AuditorPanel from './components/AuditorPanel';
import FraudTesting from './components/FraudTesting';

function App() {
  const { isAuthenticated } = useUser();

  if (!isAuthenticated) {
    return <UserSelection />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<RoleBasedDashboard />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function RoleBasedDashboard() {
  const { role } = useUser();

  switch (role) {
    case 'VENDOR':
      return <VendorPanel />;
    case 'BUYER':
      return <BuyerPanel />;
    case 'ADMIN':
      return <AdminPanel />;
    case 'AUDITOR':
      return <AuditorPanel />;
    default:
      return <div>Invalid role</div>;
  }
}

export default App;
