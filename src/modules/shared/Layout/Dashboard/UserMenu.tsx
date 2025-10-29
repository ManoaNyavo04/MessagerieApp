import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // ou votre StyledLink personnalisé
// import SelectBox from '@/components/SelectBox'; // adapter selon votre structure
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import DevicesIcon from '@mui/icons-material/Devices';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import ChatIcon from '@mui/icons-material/Chat';
import { styled } from '@mui/material';
import SelectBox from './SelectBox';
import { addNavigation } from '../../Slices/listeNavigationSlice';
import { useAppSelector } from '../../hooks/redux-hooks';
import { EspaceTravailDto, getEspacesUtilisateur } from '../../../EspaceTravail/EspaceTravailService';

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: 'inherit',
  ":hover": {
    background: '#acb2d5',
    fontFamily: 'Rubik',
  },
  fontFamily: 'Rubik',

}))
type PathToActiveBox = {
  [key: string]: number;
};
const UserMenu = () => {
  const { profilUtilisateur, token } = useAppSelector((state) => state.auth);
  const [espaces, setEspaces] = useState<EspaceTravailDto[]>([]);


  useEffect(() => {
      if (profilUtilisateur?.id_utilisateur && token) {
        getEspacesUtilisateur(token)
          .then(setEspaces)
          .catch(console.error);
      }
    }, [profilUtilisateur, token]);

  const handleSwitch = (espace: any) => {
    localStorage.setItem("currentEspace", JSON.stringify(espace));
    window.location.reload(); // ou navigation si tu veux changer le contexte
  };
  return (
    <>
        <StyledLink to={"/messagerie"}>
        <SelectBox onClick={() => { addNavigation({ title: "Discussion", link: "/messagerie", isActive: true }); }}>
            <ListItemButton>
            <ListItemIcon sx={{ marginRight: -2.5 }}>
                <ChatIcon  sx={{color: 'white'}}/>
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}  primary="Discussion" />
            </ListItemButton>
        </SelectBox> 
        </StyledLink>

        {/* <StyledLink to={""}>
        <SelectBox onClick={() => { addNavigation({ title: "Discussion", link: "/messagerie", isActive: true }); }}>
            <ListItemButton>
            <ListItemIcon sx={{ marginRight: -2.5 }}>
                <WorkspacesIcon  sx={{color: 'white'}}/>
            </ListItemIcon>
            <ListItemText primaryTypographyProps={{ sx: { fontWeight: 'bold' } }}  primary="Espace de travail" />
            </ListItemButton>
        </SelectBox>
        </StyledLink> */}

        {espaces.map((e) => (
        <ListItemButton key={e.idEspaceTravail} onClick={() => handleSwitch(e)}>
          <ListItemIcon sx={{ marginRight: -2.5 }}>
            <WorkspacesIcon sx={{ color: 'white' }} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ sx: { fontWeight: 'bold' } }} primary={e.espaceTravail} />
        </ListItemButton>
      ))}
    </>
  )
}

export default UserMenu