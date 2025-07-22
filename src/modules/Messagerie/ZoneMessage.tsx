import { Box, IconButton, Paper, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
// import * as signalR from '@microsoft/signalr';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState
} from '@microsoft/signalr';

interface Discussion {
  id: number;
  nom: string;
  type: string;
}

interface ZoneMessagesProps {
  currentDiscussion: Discussion | null;
  currentUser: string;
}

const ZoneMessage: React.FC<ZoneMessagesProps> = ({ currentDiscussion, currentUser }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [message, setMessage] = useState<string>('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
                .withUrl('http://localhost:5032/chathub')
                .withAutomaticReconnect()
                .build();

        setConnection(newConnection);

        if (currentDiscussion) {
        setMessages([]); // à remplacer par l'appel API des messages
        }
    }, [currentDiscussion]);

    const addEmoji = (emoji: any) => {
        setMessages((prev) => [...prev, { auteur: currentUser, texte: emoji.native || emoji?.emoji }]   );
    };

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
    <Paper sx={{ p: 2, height: '80vh', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6">
        {currentDiscussion ? `Discussion : ${currentDiscussion.nom}` : 'Aucune discussion sélectionnée'}
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
  );
}

export default ZoneMessage