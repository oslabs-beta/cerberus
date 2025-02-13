import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Container from './components/Container';
import SignUp from './components/Sign-up';
import Login from './components/Login';
import ForgotPW from './components/Forgot-PW';
import Dashboard from './components/Dashboard';
import CreatePasskey from './components/CreatePasskey';
import PasskeyLogin from './components/PasskeyLogin';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* give the route a react component instance */}
        <Route path='/' element={<Container />} />
        <Route path='/Dashboard' element={<Dashboard />} />
        <Route path='/Login' element={<Login />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/Forgot-PW' element={<ForgotPW />} />
        <Route path='/create-passkey' element={<CreatePasskey />} />
        <Route path='/login-passkey' element={<PasskeyLogin />} />
      </Routes>
    </Router>
  );
};

export default App;
