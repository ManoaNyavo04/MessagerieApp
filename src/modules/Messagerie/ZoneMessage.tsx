import { Box, IconButton, Paper, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { toast } from 'react-toastify';
// import * as signalR from '@microsoft/signalr';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState
} from '@microsoft/signalr';
import { getMessages } from './MesDiscussion';
import { useSignalR } from '../../contexts/SignalRContext';

interface Discussion {
  id: number;
  nom: string;
  type: string;
}

interface ZoneMessagesProps {
  currentDiscussion: Discussion | null;
  currentUser: { id: number; nom: string };
  token: string;
}

const ZoneMessage: React.FC<ZoneMessagesProps> = ({ currentDiscussion, currentUser, token }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);



  const fetchMessages = async () => {
    if (currentDiscussion?.id == null) {
      return;
    }
    try {
      const data = await getMessages(token, currentDiscussion.id, currentDiscussion.type);
      setMessages(data);
    } catch (err) {
      console.error("❌ Erreur chargement messages :", err);
    }
  };



  useEffect(() => {
    if (currentDiscussion?.type == null || currentDiscussion.id == null) {
      return;
    }
    fetchMessages()
  }, [currentDiscussion])



  if (messages.length > 0) {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  /*const addEmoji = (emoji: any) => {
    setMessages((prev) => [...prev, {
      isMine: true,
      texte: emoji.native || emoji?.emoji,
      date: new Date().toISOString()
    }]);
  };*/

  const addEmoji = (emoji: any) => {
    setMessage(prev => prev + (emoji.native || emoji?.emoji));
    setShowEmojiPicker(false); // fermer après sélection
  };


  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().then((perm) => {
        console.log("Permission notifications :", perm);
      });
    }
  }, []);



  const connection = useSignalR();
  useEffect(() => {
    if (!connection || connection.state !== HubConnectionState.Connected) {
      return;
    }

    const handler = (msg: any) => {
      setMessages(prev => [...prev, msg]);

      const isPrivate = msg.id_destinataire === currentUser.id;
      const isGroupMsg = msg.id_groupe_discussion && msg.id_expediteur !== currentUser.id;

      if (Notification.permission === "granted") {
        const notif = new Notification(`💬 Message de ${msg.expediteur_nom}`, {
          body: msg.contenu,
          icon: undefined
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };

        // Optionnel : jouer un son
        // const audio = new Audio("/sounds/notification.mp3");
        // audio.play();
      }
    };



    connection.on("ReceiveMessage", handler);

    return () => {
      connection.off("ReceiveMessage", handler);
    };
  }, [connection, currentDiscussion, currentUser]);


  const envoyerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !connection) return;

    const isPrive = currentDiscussion?.type === 'prive';
    const isGroupe = currentDiscussion?.type === 'groupe';
    const idDest = isPrive ? currentDiscussion?.id : null;
    const idGroupe = isGroupe ? currentDiscussion?.id : null;
    const groupName = currentDiscussion?.nom || "";
    console.log("nom : " + groupName);

    // ✅ Affiche directement côté client
    const tempMsg = {
      id_expediteur: currentUser.id,
      contenu: message,
      date_envoie: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMsg]);

    setMessage("");

    try {
      await connection.invoke(
        "SendMessageToDiscussion",
        currentUser.id,
        idDest,
        idGroupe,
        tempMsg.contenu,
        groupName
      );
      if (Notification.permission === "granted") {
        const notif = new Notification(`💬 ${groupName}`, {
          body: tempMsg.contenu,
          icon: "/logo2.png",
          requireInteraction: true, 
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };

        // Optionnel : jouer un son
        // const audio = new Audio("/sounds/notification.mp3");
        // audio.play();
      }

    } catch (err) {
      console.error("❌ Erreur envoi message", err);
    }
  };



  if (!token || !currentUser?.id) {
    return <Typography>Chargement utilisateur...</Typography>;
  }


  // if (!currentDiscussion) {
  //   return <Typography>Aucune discussion sélectionnée</Typography>;
  // }





  return (
    <Paper sx={{
      p: 2,
      height: '80vh',
      display: 'flex',
      flexDirection: 'column',
      // backgroundColor: '#f0f2f5', // clair, comme Messenger
    }}
    >
      <Typography variant="h6">
        {currentDiscussion ? `Discussion : ${currentDiscussion.nom}` : 'Aucune discussion sélectionnée'}
      </Typography>



      <Box
        sx={{
          flexGrow: 1,
          border: '1px solid #ccc',
          borderRadius: 2,
          pt: 2,
          px: 1,
          mt: 1,
          mb: 2,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {messages.map((msg, idx) => {
          const isMine = msg.id_expediteur === currentUser.id; // ✅ dynamique ici

          return (
            <Box key={idx} sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
              <Box
                sx={{
                  alignSelf: isMine ? 'flex-end' : 'flex-start',
                  backgroundColor: isMine ? '#0B93F6' : '#E5E5EA',
                  color: isMine ? 'white' : 'black',
                  px: 2,
                  py: 1.5,
                  borderRadius: 4,
                  borderTopLeftRadius: isMine ? 12 : 0,
                  borderTopRightRadius: isMine ? 0 : 12,
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                  maxWidth: '70%',
                  wordBreak: 'break-word',
                  boxShadow: 2,
                }}
              >
                <Typography variant="body2" sx={{ fontSize: '0.95rem' }}>
                  {msg.contenu || msg.texte}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontSize: '0.7rem', opacity: 0.6, textAlign: 'right', mt: 0.5 }}
                >
                  {new Date(msg.date_envoie || msg.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </Typography>
              </Box>
            </Box>
          );
        })}

      </Box>
      <div ref={messagesEndRef} />



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
