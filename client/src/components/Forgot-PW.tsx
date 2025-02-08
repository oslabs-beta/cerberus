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

const theme = createTheme();

const useInput = (init: any) => {
  const [ value, setValue ] = useState(init);
  const onChange = (e: any) => {
    setValue(e.target.value);
  };
  // return the value with the onChange function instead of setValue function
  return [ value, onChange ];
};

export default function ForgotPW() {
  const [email, emailOnChange] = useInput('');
  const [emptyError, setEmptyError] = useState(false);
  //function that is called when form submitted, event param is the form submission event
  const handleSubmit = (event: any) => {
    //prevent page from reloading
    event.preventDefault();
    
    if (!email) {
      setEmptyError(true);
    };
  };

  return (
    <ThemeProvider theme={theme}>
      <Container component='main' maxWidth='xs' disableGutters>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 15,
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
              {!email && emptyError ? (<Typography color='darkRed'>Required</Typography>) : null}
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
                <Link href='#' variant='body2'>
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
