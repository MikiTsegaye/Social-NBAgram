import React, { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(true); // Start on register

  if (user) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Welcome to the {user.team} Locker Room, {user.username}!</h1>
        <button onClick={() => { setUser(null); localStorage.clear(); }}>Logout</button>
      </div>
    );
  }

  return showRegister ? (
    <Register onSwitchToLogin={() => setShowRegister(false)} />
  ) : (
    <Login onLoginSuccess={(u) => setUser(u)} onSwitchToRegister={() => setShowRegister(true)} />
  );
}

export default App;