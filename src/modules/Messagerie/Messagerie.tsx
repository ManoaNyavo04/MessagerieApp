import React, { useEffect, useState } from 'react';
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
// import * as signalR from '@microsoft/signalr';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState
} from '@microsoft/signalr';


type GroupeDiscussion = {
  id: number;
  nom: string;
};

type Message = {
  auteur: string;
  texte: string;
};

const groupesSimules: GroupeDiscussion[] = [
  { id: 1, nom: 'Equipe SIG' },
  { id: 2, nom: 'Développement Web' },
  { id: 3, nom: 'Général' },
];

const currentUser = "User1"; // Simule l'utilisateur connecté

const Messagerie = () => {
  const [groupeActif, setGroupeActif] = useState<GroupeDiscussion | null>(null);
  const [message, setMessage] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  // 🔌 Initialiser la connexion SignalR
  useEffect(() => {
    const newConnection = new HubConnectionBuilder()
        .withUrl('http://localhost:5032/chathub')
        .withAutomaticReconnect()
        .build();


    setConnection(newConnection);
  }, []);

  // 🎧 Démarrer la connexion et écouter les messages
  useEffect(() => {
    if (connection) {
      connection.start()
        .then(() => {
          console.log("✅ Connecté à SignalR");

          connection.on("ReceiveMessage", (user: string, message: string) => {
            setMessages(prev => [...prev, { auteur: user, texte: message }]);

            // 🔔 Notification native si activée
            if (Notification.permission === "granted") {
              new Notification(`💬 ${user}`, { body: message });
            }
          });
        })
        .catch(error => console.error("❌ Erreur SignalR:", error));
    }

    // 📢 Demande la permission pour notifications
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, [connection]);

  const handleSelectGroupe = (groupe: GroupeDiscussion) => {
    setGroupeActif(groupe);
  };


  const addEmoji = (emoji: any) => {
    setMessage((prev) => prev + (emoji.native || emoji?.emoji));
  };

  // ✉️ Envoyer le message via SignalR
  const envoyerMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!connection) {
      console.warn("🟡 Connexion SignalR non initialisée.");
      return;
    }

    if (connection.state !== HubConnectionState.Connected) {
      console.warn("🔴 Connexion non encore établie :", connection.state);
      return;
    }

    if (message.trim() === '') {
      return;
    }

    try {
      await connection.invoke("SendMessage", currentUser, message.trim());
      setMessage('');
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi du message :", error);
    }
  };

  return (
    <Grid container spacing={2}>
      {/* Colonne gauche */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2, height: '80vh', overflowY: 'auto' }}>
          <Typography variant="h6" gutterBottom>Discussions</Typography>
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

      {/* Colonne droite */}
      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" gutterBottom>
            {groupeActif ? `Discussion : ${groupeActif.nom}` : 'Aucune discussion sélectionnée'}
          </Typography>

          <Typography variant="caption" sx={{ mt: 1 }}>
            ✅ Connexion : {connection?.state}
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
            {messages.map((msg, idx) => (
              <Box
                key={idx}
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

          {/* Zone de saisie */}
          <Box
            component="form"
            sx={{ display: 'flex', gap: 1 }}
            onSubmit={envoyerMessage}
          >
            <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
              <InsertEmoticonIcon />
            </IconButton>

            {showEmojiPicker && (
              <Box sx={{ position: 'absolute', bottom: '100px', zIndex: 10 }}>
                <Picker data={data} onEmojiSelect={addEmoji} theme="light" />
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
