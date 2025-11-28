import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import EmergencyAlertModal from './components/common/EmergencyAlertModal';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        {/* Global Emergency Alert Modal - appears on top of everything */}
        <EmergencyAlertModal />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;