import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Container from './components/Container';
import SignUp from './components/Sign-up';
import Login from './components/Login';
import ForgotPW from './components/Forgot-PW';
import Dashboard from './components/Dashboard';

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
      </Routes>
    </Router>
  );
};

export default App;
