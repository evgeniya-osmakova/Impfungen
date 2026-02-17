import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { APP_ROUTE } from './constants/app-route';
import { InternalHomePage } from './pages/InternalHomePage';
import { LoginPage } from './pages/LoginPage';
import { useAuthStore } from './store/authStore';

const App = () => {
  const { initialize, isAuthenticated, isInitializing, loginStub, user } = useAuthStore();

  useEffect(() => {
    void initialize();
  }, [initialize]);

  return (
    <Routes>
      <Route
        path={APP_ROUTE.login}
        element={
          isAuthenticated ? (
            <Navigate replace to={APP_ROUTE.app} />
          ) : (
            <LoginPage isInitializing={isInitializing} onLoginClick={loginStub} />
          )
        }
      />
      <Route
        path={APP_ROUTE.app}
        element={
          isAuthenticated && user ? (
            <InternalHomePage user={user} />
          ) : (
            <Navigate replace to={APP_ROUTE.login} />
          )
        }
      />
      <Route
        path="*"
        element={<Navigate replace to={isAuthenticated ? APP_ROUTE.app : APP_ROUTE.login} />}
      />
    </Routes>
  );
};

export default App;
