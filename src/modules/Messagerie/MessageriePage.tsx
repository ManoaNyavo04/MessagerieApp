import { Grid } from '@mui/material';
import React, { useEffect, useMemo, useState } from 'react'
import ListeDiscussion from './ListeDiscussion';
import ZoneMessage from './ZoneMessage';
import { useSelector } from 'react-redux';
import { RootState } from '../shared/Store/store';
import { useAppDispatch } from '../shared/hooks/redux-hooks';
import { addNavigation } from '../shared/Slices/listeNavigationSlice';

const MessageriePage: React.FC<{ token: string }> = ({ token }) => {
  const [currentDiscussion, setCurrentDiscussion] = useState<any | null>(null);

  const profil = useSelector((state: RootState) => state.auth.profilUtilisateur);

  /*useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((perm) => {
        console.log("🔔 Permission notifications :", perm);
        new Notification("Test de notification", {
          body: "Ceci est un test",
          icon: undefined
        });
      });
    }
  }, []);*/




  const currentUser = useMemo(() => ({
    id: profil?.id_utilisateur || profil?.id,
    nom: `${profil?.prenom || ''} ${profil?.nom || ''}`
  }), [profil]);

  if (!profil || !token) return null; // ou un spinner de chargement


  return (
    <Grid container spacing={2}>

      <Grid item xs={4}>
        <ListeDiscussion token={token} onSelectDiscussion={setCurrentDiscussion} currentDiscussion={currentDiscussion} />
      </Grid>
      <Grid item xs={8}>
        <ZoneMessage currentDiscussion={currentDiscussion} currentUser={currentUser} token={token} />
      </Grid>
    </Grid>
  );
}


export default MessageriePage