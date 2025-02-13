
import React, { useState, useEffect, useContext } from 'react';
import Container from './components/Container';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<Container />} />
      </Routes>
    </Router>
  )
};


export default App;
