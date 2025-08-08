import { Grid } from '@mui/material';
import React, { useMemo, useState } from 'react'
import ListeDiscussion from './ListeDiscussion';
import ZoneMessage from './ZoneMessage';
import { useSelector } from 'react-redux';
import { RootState } from '../shared/Store/store';

const MessageriePage: React.FC<{ token: string }> = ({ token }) => {
  const [currentDiscussion, setCurrentDiscussion] = useState<any | null>(null);

  const profil = useSelector((state: RootState) => state.auth.profilUtilisateur);

  const currentUser = useMemo(() => ({
    id: profil?.id_utilisateur || profil?.id,
    nom: `${profil?.prenom || ''} ${profil?.nom || ''}`
  }), [profil]);

  if (!profil) return <div>Chargement du profil...</div>;

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <ListeDiscussion token={token} onSelectDiscussion={setCurrentDiscussion} />
      </Grid>
      <Grid item xs={8}>
        <ZoneMessage currentDiscussion={currentDiscussion} currentUser={currentUser} token={token} />
      </Grid>
    </Grid>
  );
}


export default MessageriePage