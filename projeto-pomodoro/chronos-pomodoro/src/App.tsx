import './App.css';
import { useState } from 'react';
import CronosPage from './pages/cronos/CronosPage';
import LoginPage from './pages/login/LoginPage';

function App() {
  const [loggedUser, setLoggedUser] = useState('');

  return (
    <div className='app-shell'>
      {loggedUser ? (
        <CronosPage username={loggedUser} onLogout={() => setLoggedUser('')} />
      ) : (
        <LoginPage onLoginSuccess={setLoggedUser} />
      )}
    </div>
  );
}

export default App;