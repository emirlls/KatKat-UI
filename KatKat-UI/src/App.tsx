import { BrowserRouter } from 'react-router-dom';
import { ActiveComplexProvider } from './context/ActiveComplexContext';
import { AuthProvider } from './context/AuthContext';
import { AppRoutes } from './routes/AppRoutes';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ActiveComplexProvider>
          <AppRoutes />
        </ActiveComplexProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
