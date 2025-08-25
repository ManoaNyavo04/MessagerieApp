import React, { useEffect, useState } from 'react';
import {
  Box, Button, Checkbox, FormControlLabel, Modal, Paper,
  TextField, Typography
} from '@mui/material';
import { searchUser } from '../Utilisateur/UtilisateurService';
import { createGroupDiscu } from './GroupeDiscussionService';
interface Props {
  open: boolean;
  onClose: () => void;
  token: string;
  onGroupCreated?: () => void; // facultatif : pour actualiser les discussions après création
}

const CreerGroupeModal: React.FC<Props> = ({ open, onClose, token, onGroupCreated }) => {
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [userResults, setUserResults] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);




  // Rechercher utilisateur
  useEffect(() => {
    if (!searchTerm.trim()) return;

    const timeout = setTimeout(async () => {
      try {
        const res = await searchUser(token, searchTerm);
        console.log('Résultat de recherche :', res);

        setUserResults(res);
      } catch (err) {
        console.error("Erreur recherche utilisateurs :", err);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchTerm, token]);


  const toggleSelect = (user: any) => {
    setSelectedUserIds(prev =>
      prev.includes(user.id_utilisateur)
        ? prev.filter(id => id !== user.id_utilisateur)
        : [...prev, user.id_utilisateur]
    );
  };



  const handleCreateGroup = async () => {
    console.log("Création du groupe avec les utilisateurs :", selectedUserIds);
    console.log("Nom du groupe :", groupName);
    console.log("Description du groupe :", groupDesc);
    try {
      const payload = {
        nom: groupName,
        description: groupDesc,
        utilisateurs: selectedUserIds // ⚠️ ne pas inclure l’utilisateur connecté ici
      };

      const result = await createGroupDiscu(token, payload);

      console.log("Résultat création groupe :", result);

      alert(`Le groupe "${groupName}" a été créé avec succès.`);

      if (onGroupCreated) onGroupCreated(); // recharger liste discussions

      handleClose();
    } catch (error) {
      console.error('Erreur lors de la création du groupe :', error);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSearchTerm('');
    setSelectedUsers([]);
    setGroupName('');
    setGroupDesc('');
    setUserResults([]);
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box>
        <Paper sx={{ p: 4, width: 500, mx: 'auto', mt: 10 }}>
          {step === 1 && (
            <>
              <Typography variant="h6" gutterBottom>Ajouter des membres</Typography>
              <TextField
                fullWidth
                label="Rechercher utilisateur"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                {userResults.map((user, index) => (
                  <FormControlLabel
                    key={user.id_utilisateur}
                    control={
                      <Checkbox
                        checked={selectedUserIds.includes(user.id_utilisateur)}
                        onChange={() => toggleSelect(user)}
                      />
                    }
                    label={`${user.nom} ${user.prenom ?? ''} (${user.matricule})`}
                  />
                ))}

                {userResults.length === 0 && <Typography>Aucun utilisateur trouvé.</Typography>}
              </Box>
              <Box sx={{ textAlign: 'right', mt: 2 }}>
                <Button variant="contained" onClick={() => setStep(2)} disabled={selectedUserIds.length === 0}>
                  Suivant
                </Button>

              </Box>
            </>
          )}

          {step === 2 && (
            <>
              <Typography variant="h6" gutterBottom>Informations du groupe</Typography>
              <TextField
                fullWidth
                label="Nom du groupe"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                value={groupDesc}
                onChange={(e) => setGroupDesc(e.target.value)}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Button onClick={() => setStep(1)}>Retour</Button>
                <Button variant="contained" onClick={handleCreateGroup} disabled={!groupName}>
                  Créer
                </Button>
              </Box>
            </>
          )}
        </Paper>

      </Box>
    </Modal>
  );
};

export default CreerGroupeModal;
