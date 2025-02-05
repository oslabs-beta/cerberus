import React, { useState, useEffect, useContext } from 'react';
import Container from './components/Container';

const App = () => {
  return <Container></Container>;
};
// import Box from '@mui/material/Box';
// import BottomNavigation from '@mui/material/BottomNavigation';
// import BottomNavigationAction from '@mui/material/BottomNavigationAction';
// import FolderIcon from '@mui/icons-material/Folder';
// import RestoreIcon from '@mui/icons-material/Restore';
// import FavoriteIcon from '@mui/icons-material/Favorite';
// import LocationOnIcon from '@mui/icons-material/LocationOn';
// import Button from '@mui/material/Button';
// import Menu from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemButton from '@mui/material/ListItemButton';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';
// import Divider from '@mui/material/Divider';
// import InboxIcon from '@mui/icons-material/Inbox';
// import DraftsIcon from '@mui/icons-material/Drafts';
// import Checkbox from '@mui/material/Checkbox';
// import CssBaseline from '@mui/material/CssBaseline';
// import Container from '@mui/material/Container';

// const App = (props) => {
//   const [value, setValue] = React.useState(0);

//   const [anchorEl, setAnchorEl] = React.useState(null);
//   const open = Boolean(anchorEl);
//   const handleClick = (event) => setAnchorEl(event.currentTarget);
//   const handleClose = () => setAnchorEl(null);

//   return (
//     <>
//       <div
//         style={{ position: 'absolute', top: 0, left: 0, padding: 0, margin: 0 }}
//       >
//         <Button
//           id='basic-button'
//           aria-controls={open ? 'basic-menu' : undefined}
//           aria-haspopup='true'
//           aria-expanded={open ? 'true' : undefined}
//           onClick={handleClick}
//           sx={{ m: 0, p: 0 }}
//         >
//           Dashboard
//         </Button>
//         <Menu
//           id='8'
//           anchorEl={anchorEl}
//           open={open}
//           onClose={handleClose}
//           MenuListProps={{ 'aria-labelledby': 'basic-button' }}
//           id='basic-menu'
//         >
//           <MenuItem onClick={handleClose}>Documentation</MenuItem>
//           <MenuItem onClick={handleClose}>Meet the team</MenuItem>
//         </Menu>
//       </div>
//       <React.Fragment>
//         <CssBaseline />
//         <Container id='2'>
//           {/* <Box sx={{ bgcolor: '#cfe8fc', height: '100vh', width: '100vw' }} /> */}

//           <Box
//             sx={{
//               width: '100%',
//               maxWidth: 360,
//               bgcolor: 'background.paper',
//               border: '1px #e0e0e0 solid',
//             }}
//           >
//             <div>
//               <Checkbox
//                 id='5'
//                 defaultChecked
//                 inputProps={{ 'aria-label': 'Checkbox demo' }}
//               />{' '}
//               Form-based login
//             </div>
//             <div>
//               <Checkbox
//                 id='5'
//                 defaultChecked
//                 inputProps={{ 'aria-label': 'Checkbox demo' }}
//               />{' '}
//               OAuth
//             </div>
//             <div>
//               <Checkbox
//                 id='5'
//                 defaultChecked
//                 inputProps={{ 'aria-label': 'Checkbox demo' }}
//               />{' '}
//               Passkey
//             </div>
//           </Box>
//         </Container>
//         <Button id='6' variant='contained'>
//           Download
//         </Button>
//       </React.Fragment>
//     </>
//   );
// };

export default App;
