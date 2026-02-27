import { Navigate, Route, Routes } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';

import { APP_ROUTE } from './constants/app-route';
import { Account } from './pages/Account/Account';
import { Main } from './pages/Main/Main';
import {
  isProfileAccountComplete,
  resolvePrimaryAccount,
  resolveSelectedAccount,
  useAccountsStore,
} from './state/accounts';

const App = () => {
  const { accounts, selectedAccountId } = useAccountsStore(
    useShallow((state) => ({
      accounts: state.accounts,
      selectedAccountId: state.selectedAccountId,
    })),
  );
  const primaryAccount = resolvePrimaryAccount(accounts);
  const selectedAccount = resolveSelectedAccount(accounts, selectedAccountId);
  const isPrimaryIncomplete = primaryAccount !== null && !isProfileAccountComplete(primaryAccount);
  const isSelectedCountryMissing =
    !isPrimaryIncomplete && selectedAccount !== null && selectedAccount.country === null;

  return (
    <Routes>
      <Route
        path={APP_ROUTE.home}
        element={
          isPrimaryIncomplete || isSelectedCountryMissing ? (
            <Navigate replace to={APP_ROUTE.account} />
          ) : (
            <Main />
          )
        }
      />
      <Route path={APP_ROUTE.account} element={<Account />} />
      <Route path="*" element={<Navigate replace to={APP_ROUTE.home} />} />
    </Routes>
  );
};

export default App;
