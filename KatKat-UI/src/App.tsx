import { BrowserRouter } from 'react-router-dom';
import { GlobalHubNotifications } from './components/GlobalHubNotifications';
import { ActiveComplexProvider } from './context/ActiveComplexContext';
import { AuthProvider } from './context/AuthContext';
import { PermissionProvider } from './context/PermissionContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <PermissionProvider>
              <ActiveComplexProvider>
                <GlobalHubNotifications />
                <AppRoutes />
              </ActiveComplexProvider>
            </PermissionProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
