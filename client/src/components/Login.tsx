// import { useState } from 'react';
// import Avatar from '@mui/material/Avatar';
// import Button from '@mui/material/Button';
// import CssBaseline from '@mui/material/CssBaseline';
// import TextField from '@mui/material/TextField';
// import Link from '@mui/material/Link';
// import Grid from '@mui/material/Grid';
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';
// import Container from '@mui/material/Container';
// import { createTheme, ThemeProvider } from '@mui/material/styles';
// import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
// import { useNavigate } from 'react-router-dom';
// import '../App.css';
// import { response } from 'express';

// const theme = createTheme();

// //custom react hook to manage state of an input field
// // const useInput = (init: any) => {
// //   const [value, setValue] = useState(init);
// //   const onChange = (e: any) => {
// //     setValue(e.target.value);
// //   };
// //   // return the value with the onChange event handler instead of setValue function
// //   return [value, onChange];
// // };

// export default function Login({ setIsAuthenticated }) {
//   const [emptyError, setEmptyError] = useState(false);
//   // const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [error, setError] = useState('');
//   const [loginAttempted, setLoginAttempted] = useState(false);

//   //ability to navigate to other endpoint
//   const navigate = useNavigate();

//   //navigate to forgot password
//   const toForgotPWClick = () => {
//     navigate('/Forgot-PW');
//   };

//   //navigate back to dashboard
//   const goToDashboard = () => {
//     navigate('/Dashboard');
//   };

//   //function that is called when input is submitted, event param is the submission event
//   const handleSubmit = async (event: any) => {
//     //prevent page from reloading
//     event.preventDefault();

//     // console.log(event.target.elements.email.value);
//     // console.log(event.target.elements.password.value);

//     //hold onto email and password values
//     const email = event.target.elements.email.value;
//     const password = event.target.elements.password.value;

//     //if email or password dont exist setEmptyError to true
//     if (!email || !password) {
//       setEmptyError(true);
//     }

//     const body = {
//       email,
//       password,
//     };

//     //login fetch request
//     try {
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'Application/JSON',
//         },
//         body: JSON.stringify(body),
//       });
//       const data = await response.json();
//       console.log(data);
//       //check if status on the body of the response we receive from the backend is "Login successful"
//       if (response.ok) {
//         console.log('Login successful', data.message);
//         //change state to setIsAuthenticated to true?
//         setIsAuthenticated(true);
//         //if it is successful then login button goes to dashboard
//         navigate('/Dashboard');
//       } else {
//         console.log('Login failed', data.message);
//         setIsAuthenticated(false);
//         setLoginAttempted(true);
//         setError(data.message || 'Invalid credentials');
//         //where should it navigate to if credentials invalid?
//       }
//     } catch (err) {
//       console.error('Login fetch /: ERROR:', err);
//       setError('Something went wrong, please try again');
//     }
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <Container component='main' maxWidth='xs'>
//         <CssBaseline />
//         <Box
//           sx={{
//             marginTop: 30,
//             marginBottom: 30,
//             display: 'flex',
//             flexDirection: 'column',
//             alignItems: 'center',
//             bgcolor: 'white', // Set background color to white
//             padding: 3, // Add some padding
//             borderRadius: 2, // Optional: Rounded corners
//             boxShadow: 3, // Optional: Adds a slight shadow for contrast
//           }}
//         >
//           <Avatar sx={{ m: 1, bgcolor: '#535bf2' }}>
//             <LockOutlinedIcon />
//           </Avatar>
//           <Typography component='h1' variant='h5' color='black'>
//             Login
//           </Typography>
//           <Box
//             component='form'
//             noValidate
//             onSubmit={handleSubmit}
//             sx={{ mt: 3 }}
//           >
//             <Grid item xs={12}>
//               <TextField
//                 required
//                 fullWidth
//                 id='email'
//                 label='Email Address'
//                 name='email'
//                 autoComplete='email'
//               />
//               {!email && emptyError ? (
//                 <Typography color='darkRed'>Required</Typography>
//               ) : null}
//             </Grid>
//             <Grid item xs={12} sx={{ margin: 2 }}>
//               <TextField
//                 required
//                 fullWidth
//                 name='password'
//                 label='Password'
//                 type='password'
//                 id='password'
//                 autoComplete='new-password'
//               />
//               {!password && emptyError ? (
//                 <Typography color='darkRed'>Required</Typography>
//               ) : null}
//               {loginAttempted && !isAuthenticated ? (
//                 <Typography color='darkRed'>Invalid credentials</Typography>
//               ) : null}
//             </Grid>
//             <Button
//               type='submit'
//               fullWidth
//               variant='contained'
//               sx={{ mt: 3, mb: 2 }}
//             >
//               Login
//             </Button>
//             <Grid container justifyContent='flex-end'>
//               <Grid item>
//                 <Link onClick={toForgotPWClick} href='#' variant='body2'>
//                   Forgot password? Click here
//                 </Link>
//               </Grid>
//             </Grid>
//           </Box>
//         </Box>
//       </Container>
//     </ThemeProvider>
//   );
// }

import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';
import '../App.css';

//initializes theme object in MUI
const theme = createTheme();

export default function Login({ setIsAuthenticated }) {
  const [emptyError, setEmptyError] = useState(false);
  const [error, setError] = useState('');
  const [loginAttempted, setLoginAttempted] = useState(false);
  const navigate = useNavigate();

  //navigate to forgotPW component on click
  const toForgotPWClick = () => {
    navigate('/Forgot-PW');
  };

  //func called when form submitted, collects form data
  const handleSubmit = async (event) => {
    //prevent default behavior of form submission
    event.preventDefault();

    //create new FormData object to hold email and password
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
      setEmptyError(true);
      return;
    }

    const body = {
      email,
      password,
    };

    //console.log(body);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'Application/JSON',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful', data.message);
        // Store auth token
        localStorage.setItem('authToken', data.token || 'dummy-token');
        // Update auth state
        setIsAuthenticated(true);
        // Redirect to dashboard
        navigate('/Dashboard');
      } else {
        console.log('Login failed', data.message);
        setLoginAttempted(true);
        setError(data.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login fetch /: ERROR:', err);
      setError('Something went wrong, please try again');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component='main' maxWidth='xs'>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 30,
            marginBottom: 30,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            bgcolor: 'white',
            padding: 3,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: '#535bf2' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component='h1' variant='h5' color='black'>
            Login
          </Typography>
          <Box
            component='form'
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id='email'
                  label='Email Address'
                  name='email'
                  autoComplete='email'
                />
                {emptyError && !document.getElementById('email').value ? (
                  <Typography color='error'>Required</Typography>
                ) : null}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name='password'
                  label='Password'
                  type='password'
                  id='password'
                  autoComplete='current-password'
                />
                {emptyError && !document.getElementById('password').value ? (
                  <Typography color='error'>Required</Typography>
                ) : null}
              </Grid>
            </Grid>
            {loginAttempted && error ? (
              <Typography color='error' sx={{ mt: 2, textAlign: 'center' }}>
                {error}
              </Typography>
            ) : null}
            <Button
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
            >
              Login
            </Button>
            <Grid container justifyContent='flex-end'>
              <Grid item>
                <Link onClick={toForgotPWClick} variant='body2'>
                  Forgot password? Click here
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
