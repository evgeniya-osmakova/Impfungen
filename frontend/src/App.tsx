import { Navigate, Route, Routes } from 'react-router-dom';

import { APP_ROUTE } from './constants/app-route';
import { Main } from './pages/Main/Main';

const App = () => {
  return (
    <Routes>
      <Route path={APP_ROUTE.home} element={<Main />} />
      <Route
        path="*"
        element={<Navigate replace to={APP_ROUTE.home} />}
      />
    </Routes>
  );
};

export default App;
