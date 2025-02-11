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
import {
  CenterFocusStrong,
  NavigateBefore,
} from '../../../node_modules/@mui/icons-material/index';
import '../App.css';

const theme = createTheme();

const useInput = (init: any) => {
  const [value, setValue] = useState(init);
  const onChange = (e: any) => {
    setValue(e.target.value);
  };
  // return the value with the onChange function instead of setValue function
  return [value, onChange];
};

export default function ForgotPW() {
  const [email, emailOnChange] = useInput('');
  const [emptyError, setEmptyError] = useState(false);
  //ability to navigate to other endpoint
  const navigate = useNavigate();
  const backToSignUpClick = () => {
    navigate('/Sign-up');
  };
  //function that is called when form submitted, event param is the form submission event
  const handleSubmit = (event: any) => {
    //prevent page from reloading
    event.preventDefault();

    if (!email) {
      setEmptyError(true);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component='main' maxWidth='xs' sx={{ bgcolor: 'transparent' }}>
        <CssBaseline />
        <Box
          sx={{
            width: '100%',
            marginTop: 35,
            marginBottom: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
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
            Forgot your password?
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
            <Button
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, mb: 2 }}
            >
              Submit
            </Button>
            <Grid container justifyContent='flex-end'>
              <Grid item>
                <Link onClick={backToSignUpClick} href='#' variant='body2'>
                  Need an account? Sign-up here
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
