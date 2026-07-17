import { BrowserRouter } from 'react-router-dom';
import { ActiveComplexProvider } from './context/ActiveComplexContext';
import { AuthProvider } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PermissionProvider>
          <ActiveComplexProvider>
            <AppRoutes />
          </ActiveComplexProvider>
        </PermissionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
