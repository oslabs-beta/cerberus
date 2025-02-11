import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { on } from 'events';
//import { useNavigate } from "react-router-dom";

const theme = createTheme();

const useInput = (init: any) => {
  const [value, setValue] = useState(init);
  const onChange = (e: any) => {
    setValue(e.target.value);
  };
  // return the value with the onChange function instead of setValue function
  return [value, onChange];
};

export default function SignUp({ onSignUpSuccess }) {
  const [firstName, firstNameOnChange] = useInput('');
  const [lastName, lastNameOnChange] = useInput('');
  const [email, emailOnChange] = useInput('');
  const [password, passwordOnChange] = useInput('');
  const [emptyError, setEmptyError] = useState(false);
  // const [isSignedUp, setIsSignedUp] = useState(false);

  //function that is called when form submitted, event param is the form submission event
  const handleSubmit = (event: any) => {
    //prevent page from reloading
    event.preventDefault();
    //logs extracted values
    console.log(firstName);
    console.log(lastName);
    console.log(email);
    console.log(password);

    if (!firstName || !lastName || !email || !password) {
      setEmptyError(true);
      return;
    }

    const body = {
      firstName,
      lastName,
      email,
      password,
    };

    console.log('body', body);

    fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'Application/JSON',
      },
      body: JSON.stringify(body),
    })
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        //calls the function from container when successful signup
        onSignUpSuccess();
      })
      .catch((err) => console.log('Signup fetch /: ERROR:', err));

    //// After successful sign-up, redirect to Login page
    // navigate("/login");
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component='main' maxWidth='xs'>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            marginBottom: 10,
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
            Sign up
          </Typography>
          <Box
            component='form'
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              {/* <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete='given-name'
                  name='firstName'
                  required
                  fullWidth
                  id='firstName'
                  label='First Name'
                  onChange={firstNameOnChange}
                  autoFocus
                />
                {!firstName && emptyError ? (
                  <Typography color='darkRed'>Required</Typography>
                ) : null}
              </Grid> */}
              {/* <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id='lastName'
                  label='Last Name'
                  onChange={lastNameOnChange}
                  name='lastName'
                  autoComplete='family-name'
                />
                {!lastName && emptyError ? (
                  <Typography color='darkRed'>Required</Typography>
                ) : null}
              </Grid> */}
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
              <Grid item xs={12}>
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
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox value='allowExtraEmails' color='primary' />
                  }
                  label={
                    <Typography sx={{ color: 'black' }}>
                      I want to receive marketing promotions and updates via
                      email.
                    </Typography>
                  }
                />
              </Grid>
            </Grid>
            <Button
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent='flex-end'>
              <Grid item>
                <Link href='#' variant='body2'>
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
