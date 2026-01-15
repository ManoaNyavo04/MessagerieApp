import * as React from 'react';
import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/redux-hooks';
import { logout } from '../../Slices/authSlice';

// import '../style.css';
import UserMenu from './UserMenu';
import AdminMenu from './AdminMenu';
import BtnLogout from './BtnLogout';
import BasicBreadcrumbs from './BasicBreadcrumbs';
import BreadcrumbManager from './BreadcrumbManager';
import EspaceSelect from '../../../EspaceTravail/EspaceSelect';
import { useState } from 'react';


function Copyright(props: any) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        PARERA Madagascar
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const drawerWidth: number = 240;

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: '#1d2f54',
  transition: theme.transitions.create(['width', 'margin'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      backgroundColor: '#000000c9', //'#1d2f54', #000000c9, #04630770
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
      ...(!open && {
        [`@media (min-width: 500px)`]: {
          width: 50,
        },
      }),

    },
  }),
);

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme({
  typography: {
    fontFamily: 'Rubik', // Remplacez par votre police
    fontSize: 12,
    // fontWeightBold: 'bold',
  },

  palette: {
    primary: {
      main: '#060a12', // #060a12, #3a3c3fff
    },
    warning: {
      main: '#f2000f'
    },
    secondary: {
      main: '#960701'
    },
  },
  components: {
    MuiToolbar: {
      styleOverrides: {
        root: {
          backgroundColor: '#000000c9',
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          backgroundColor: 'green',
          color: '#961108'
        }
      }
    },

    MuiLink: {
      styleOverrides: {
        root: {
          textDecoration: 'none',
          color: 'inherit'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          ":hover": {
            transition: '.5s',
            transform: 'scale(1.1)',
          },
          color: 'white'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        root: {
          backgroundColor: '#1d2f54',
          color: '#961108'
        }
      }
    },

    // MuiListItemIcon-root.css-cveggr-MuiListItemIcon-root {
    //   margin-right: -20px;
    // }
  },
});

export default function Dashboard() {
  // const [open, setOpen] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const { profilUtilisateur } = useAppSelector((state) => state.auth);
  const isAdmin = profilUtilisateur?.id_role === 1; // ou "admin" si string
  const [espaceActif, setEspaceActif] = useState<any | null>(null);
  const token: string = localStorage.getItem("token") ?? "";


  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar position="absolute" open={open} >
          <Toolbar
            sx={{
              pr: '24px', // keep right padding when drawer closed
            }}
          >
            <IconButton
              edge="start"
              color="inherit"
              background-color="black"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                // marginRight: '36px',
                marginLeft: '-55px',
                ...(open && { display: 'none' }),
              }}
            >

            </IconButton>
            <IconButton onClick={toggleDrawer} sx={{ color: '#1d2f53', ml: 2 }}>
              <MenuIcon sx={{ color: '#cad2da', fontSize: '40px' }} />
            </IconButton>


            <Typography
              component="h1"
              variant="h6"
              // color="inherit"
              color="#1d2f53"
              noWrap
              sx={{
                flexGrow: 1,
                fontFamily: "Russo one", marginLeft: 3, marginTop: 1
              }}
            >
              {/* LALAMBY : messagerie */}
              <EspaceSelect token={token} onEspaceChange={setEspaceActif} />
            </Typography>
            {/* <NotifIcon /> */}
            <BtnLogout />

          </Toolbar>
        </AppBar>


        <Drawer variant="permanent" open={open}>
          <Toolbar
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              px: [1],
              backgroundColor: 'white',

            }}
          >
            <img
              src="/logo1.png"
              alt="Logo"
              style={{ height: '50px', marginRight: '65px', marginTop: '-8px', textAlign: 'center' }}
            />
          </Toolbar>
          {/* <Divider /> */}
          <List component="nav">
            <UserMenu />
            {/* <Divider sx={{ my: 1 }} /> */}
            {isAdmin && (
              <>
                {/* Menus visibles seulement par l'admin */}
                <AdminMenu />
              </>
            )}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            backgroundColor: (theme) =>
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[900],
            flexGrow: 1,
            height: '100vh',
            overflow: 'auto',

          }}
        >

          <Toolbar />


          <Box sx={{ mt: 1, mb: 3, p: 1 }}>
            <Box mb={1}>
            </Box>
            <Outlet />
            <Copyright sx={{ pt: 4 }} />

          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
