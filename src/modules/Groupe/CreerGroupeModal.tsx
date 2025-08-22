import React, { useEffect, useState } from 'react';
import {
  Box, Button, Checkbox, FormControlLabel, Modal, Paper,
  TextField, Typography
} from '@mui/material';
import { searchUser } from '../Utilisateur/UtilisateurService'; // 👈 adapter le chemin si besoin
// import { baseUrl } from '../../config'; // 👈 à adapter aussi

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

  // Rechercher utilisateur
  useEffect(() => {
    if (!searchTerm.trim()) return;

    const timeout = setTimeout(async () => {
      try {
        const res = await searchUser(token, searchTerm);
        setUserResults(res);
      } catch (err) {
        console.error("Erreur recherche utilisateurs :", err);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchTerm, token]);

  const toggleSelect = (user: any) => {
    setSelectedUsers(prev =>
      prev.find(u => u.id === user.id)
        ? prev.filter(u => u.id !== user.id)
        : [...prev, user]
    );
  };

  const handleCreateGroup = async () => {
    /*try {
      const payload = {
        nom: groupName,
        description: groupDesc,
        utilisateurs: selectedUsers.map(u => u.id)
      };

      const response = await fetch(`${baseUrl}/api/GroupeDiscussion`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Erreur création groupe');

      if (onGroupCreated) onGroupCreated(); // recharger liste discussions

      handleClose();
    } catch (error) {
      console.error('Erreur lors de la création du groupe :', error);
    }*/
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
              {userResults.map(user => (
                <FormControlLabel
                  key={user.id}
                  control={
                    <Checkbox
                      checked={selectedUsers.some(u => u.id === user.id)}
                      onChange={() => toggleSelect(user)}
                    />
                  }
                  label={`${user.nom} ${user.prenom ?? ''} (${user.matricule})`}
                />
              ))}
            </Box>
            <Box sx={{ textAlign: 'right', mt: 2 }}>
              <Button variant="contained" onClick={() => setStep(2)} disabled={selectedUsers.length === 0}>
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
    </Modal>
  );
};

export default CreerGroupeModal;
