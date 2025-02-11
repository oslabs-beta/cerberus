import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Container from './components/Container';
import SignUp from './components/Sign-up';
import Login from './components/Login';
import ForgotPW from './components/Forgot-PW';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* give the route a react component instance */}
        <Route path='/' element={<Container />} />
        <Route path='/Login' element={<Login />} />
        <Route path='/sign-up' element={<SignUp />} />
        <Route path='/Forgot-PW' element={<ForgotPW />} />
      </Routes>
    </Router>
  );
};

export default App;

// const App = () => {
//   return (
//     <Router>
//       <DropdownMenu />
// {
/* <Container>
//       <Routes>
//         <Route path="/Login" element={<Login />} />
//         <Route path="/Sign-up" element={<Sign-up/>} />
//         <Route path="/Forgot-PW" element={<Forgot-PW />} />
//       </Routes>
</Container> */
// }
//     </Router>
//   );
// };
