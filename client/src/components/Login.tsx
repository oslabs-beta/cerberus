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
//some kind of logic that receives something from backend possibly that verifies that the email and password from front end match the back end and then user can successfully be routed to the dashboard only if login is "successful"

const theme = createTheme();

const useInput = (init: any) => {
  const [value, setValue] = useState(init);
  const onChange = (e: any) => {
    setValue(e.target.value);
  };
  // return the value with the onChange function instead of setValue function
  return [value, onChange];
};

export default function Login() {
  const [email, emailOnChange] = useInput('');
  const [password, passwordOnChange] = useInput('');
  const [emptyError, setEmptyError] = useState(false);
  //ability to navigate to other endpoint
  const navigate = useNavigate();

  const toForgotPWClick = () => {
    navigate('/Forgot-PW');
  };

  //navigate back to dashboard

  const goToDashboard = () => {
    navigate('/Dashboard');
  };
  const body = {
    email,
    password,
  };
  //login fetch request
  fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'Application/JSON',
    },
    body: JSON.stringify(body),
  })
    .then((resp) => resp.json())
    .then((data) => {
      console.log(data);
    })
    .catch((err) => console.log('Login fetch /: ERROR:', err));

  //function that is called when form submitted, event param is the form submission event
  const handleSubmit = (event: any) => {
    //prevent page from reloading
    event.preventDefault();

    if (!email || !password) {
      setEmptyError(true);
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
            bgcolor: 'white', // Set background color to white
            padding: 3, // Add some padding
            borderRadius: 2, // Optional: Rounded corners
            boxShadow: 3, // Optional: Adds a slight shadow for contrast
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
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id='email'
                label='Email Address'
                onChange={emailOnChange}
                name='email'
                autoComplete='email'
              />
              {!email && emptyError ? (
                <Typography color='darkRed'>Required</Typography>
              ) : null}
            </Grid>
            <Grid item xs={12} sx={{ margin: 2 }}>
              <TextField
                required
                fullWidth
                name='password'
                label='Password'
                onChange={passwordOnChange}
                type='password'
                id='password'
                autoComplete='new-password'
              />
              {!password && emptyError ? (
                <Typography color='darkRed'>Required</Typography>
              ) : null}
            </Grid>
            <Button
              onClick={goToDashboard}
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
            >
              Login
            </Button>
            <Grid container justifyContent='flex-end'>
              <Grid item>
                <Link onClick={toForgotPWClick} href='#' variant='body2'>
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
