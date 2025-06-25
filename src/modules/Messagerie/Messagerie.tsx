import React, { useState } from 'react';
import {
  Box,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';



type GroupeDiscussion = {
  id: number;
  nom: string;
};

const groupesSimules: GroupeDiscussion[] = [
  { id: 1, nom: 'Equipe SIG' },
  { id: 2, nom: 'Développement Web' },
  { id: 3, nom: 'Général' },
];

const currentUser = "User1"; // Simule l'utilisateur connecté

const messagesSimules = [
  { id: 1, auteur: "User1", texte: "Bonjour 😄" },
  { id: 2, auteur: "User2", texte: "Salut 👋" },
];


const Messagerie = () => {
  const [groupeActif, setGroupeActif] = useState<GroupeDiscussion | null>(null);
  const [message, setMessage] = useState<string>("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);


  const handleSelectGroupe = (groupe: GroupeDiscussion) => {
    setGroupeActif(groupe);
  };


  const addEmoji = (emoji: any) => {
  setMessage((prev) => prev + (emoji.native || emoji?.emoji));
};

  return (
    <Grid container spacing={2}>
      {/* Colonne gauche - Liste des discussions */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, height: '80vh', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Discussions
          </Typography>
          <List>
            {groupesSimules.map((groupe) => (
              <ListItem key={groupe.id} disablePadding>
                <ListItemButton
                  selected={groupeActif?.id === groupe.id}
                  onClick={() => handleSelectGroupe(groupe)}
                >
                  <ListItemText primary={groupe.nom} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      {/* Colonne droite - Zone de chat */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            {groupeActif
              ? `Discussion : ${groupeActif.nom}`
              : 'Aucune discussion sélectionnée'}
          </Typography>

          <Box
            sx={{
              flexGrow: 1,
              border: '1px solid #ccc',
              borderRadius: 2,
              p: 1,
              mt: 1,
              mb: 2,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
            }}
          >
            {messagesSimules.map((msg) => (
              <Box
                key={msg.id}
                sx={{
                  alignSelf: msg.auteur === currentUser ? 'flex-end' : 'flex-start',
                  backgroundColor: msg.auteur === currentUser ? '#1d2f5470' : '#F1F0F0',
                  color: '#000',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  maxWidth: '70%',
                  boxShadow: 1,
                }}
              >
                <Typography variant="body2">
                  <strong>{msg.auteur}</strong>: {msg.texte}
                </Typography>
              </Box>
            ))}
          </Box>


          <Box
            component="form"
            sx={{ display: 'flex', gap: 1 }}
            onSubmit={(e) => e.preventDefault()}
          >

            <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <InsertEmoticonIcon />
            </IconButton>

            {showEmojiPicker && (
  <Box sx={{ position: 'absolute', bottom: '100px', zIndex: 10 }}>
    <Picker
      data={data}
      onEmojiSelect={addEmoji}
      theme="light"
    />
  </Box>
)}
            <input
              type="text"
              placeholder="Écrire un message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 4,
                border: '1px solid #ccc',
              }}
            />

            <button type="submit" style={{ padding: '8px 16px' }}>
              Envoyer
            </button>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Messagerie;
