import { Box, IconButton, Paper, Typography } from '@mui/material';
import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { getMessages, markMessagesAsRead } from './MesDiscussion';
import { useSignalR } from '../../contexts/SignalRContext';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListeMembre from '../Groupe/ListeMembre';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { baseUrl } from '../../URL/Url';
import { envoyerPieceJointe } from '../PieceJoint/PieceJointService';



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
  const [pendingFile, setPendingFile] = useState<File | null>(null);


  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [openModal, setOpenModal] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleOpenModal = () => {
    handleMenuClose();
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  // Trouver l'index du premier message non lu (envoyé par les autres)
  const firstUnreadIndex = useMemo(() => {
    return messages.findIndex(
      msg =>
        !msg.est_lu &&
        msg.id_expediteur !== currentUser.id // reçu et non lu
    );
  }, [messages, currentUser.id]);


  function mapMessage(msg: any) {
    return {
      ...msg,
      piece_jointe: msg.chemin_fichier || msg.chemin || msg.piece_jointe,
      nom_piece_jointe: msg.nom_fichier || msg.nom_original || msg.nom_piece_jointe
    };
  }








  const lastMyMessageId = useMemo(() => {
    return messages
      .filter(m => m.id_expediteur === currentUser.id)
      .map(m => m.id_message)
      .pop();
  }, [messages, currentUser.id]);


  const fetchMessages = async () => {
    if (currentDiscussion?.id == null) {
      return;
    }
    try {
      const data = await getMessages(token, currentDiscussion.id, currentDiscussion.type);

      const dataWithPieceJointe = data.map((msg: any) => ({
        ...msg,
        piece_jointe: msg.chemin
      }));

      setMessages(data.map(mapMessage));

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



  useEffect(() => {
    if (!messagesEndRef.current) return;

    const scrollableDiv = messagesEndRef.current;
    scrollableDiv.scrollTop = scrollableDiv.scrollHeight; // 🔹 scroll au dernier message
  }, [messages]);

  useEffect(() => {
    console.log("📨 Messages affichés :");
    console.table(messages.map(m => ({
      id: m.id_message,
      contenu: m.contenu,
      piece_jointe: m.piece_jointe,
      chemin: m.chemin
    })));
  }, [messages]);




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
  /*useEffect(() => {
    if (!connection || connection.state !== HubConnectionState.Connected || !currentDiscussion) {
      return;
    }

    const markAsRead = async () => {
      if (!currentDiscussion) return;

      try {
        await markMessagesAsRead(token, currentDiscussion.id, currentDiscussion.type);
        console.log("📬 Messages marqués comme lus (depuis ZoneMessage)");
      } catch (error) {
        console.error("❌ Erreur marquage messages lus :", error);
      }
    };

    const discussionGroupName = `discussion_${currentDiscussion.id}`;
    connection.invoke("JoinGroup", discussionGroupName)
      .then(() => console.log(`✅ Rejoint ${discussionGroupName}`))
      .catch(err => console.error("❌ Erreur JoinGroup :", err));

    // 📩 Messages entrants
    const handler = (msg: any) => {
      setMessages(prev => {
        if (prev.some(m => m.id_message === msg.id_message)) return prev;
        return [...prev, msg];
      });
    };

    // 👁️ Notification de lecture
    const handleMessagesRead = ({ discussionId, userId }: { discussionId: number, userId: number }) => {
      if (discussionId !== currentDiscussion.id) return;

      console.log("🔁 Lecture reçue via SignalR", discussionId, userId);

      setMessages(prev =>
        prev.map(msg => {
          if (
            msg.id_expediteur === currentUser.id &&
            msg.id_discussion === currentDiscussion.id
          ) {
            return { ...msg, est_lu: true };
          }
          return msg;
        })
      );

    };


    markAsRead();

    connection.on("ReceiveMessage", handler);
    connection.on("MessagesRead", handleMessagesRead);

    return () => {
      connection.off("ReceiveMessage", handler);
      connection.off("MessagesRead", handleMessagesRead);
    };
  }, [connection, currentDiscussion, currentUser]);*/

  useEffect(() => {
    if (!connection || connection.state !== HubConnectionState.Connected || !currentDiscussion) {
      return;
    }

    if (currentDiscussion.type === 'groupe') {
      const groupName = currentDiscussion.nom;
      console.log(`✅ Rejoint le groupe : ${groupName}`);
      connection.invoke("JoinGroup", groupName)
        .then(() => console.log(`✅ Rejoint le groupe : ${groupName}`))
        .catch(err => console.error("❌ Erreur joinGroup :", err));
    }

    const handler = (msg: any) => {
      // Ne pas afficher deux fois
      const mappedMsg = mapMessage(msg);

      setMessages(prev => {
        const exists = prev.find(m => m.id_message === mappedMsg.id_message);
        if (exists) {
          // Fusionne les nouvelles infos (utile pour UpdateMessage déguisé en ReceiveMessage)
          return prev.map(m =>
            m.id_message === mappedMsg.id_message
              ? { ...m, ...mappedMsg }
              : m
          );
        }
        return [...prev, mappedMsg];
      });

      // Affiche la notification si le message est reçu par CE client
      const isForThisUser = mappedMsg.id_destinataire === currentUser.id ||
        (mappedMsg.liste_destinataires?.includes?.(currentUser.id));
      const isGroupMsg = mappedMsg.id_groupe_discussion && mappedMsg.id_expediteur !== currentUser.id;


      const isFromSomeoneElse = msg.id_expediteur !== currentUser.id;

      console.log("🔔 Handler déclenché");
      console.log("msg.id_destinataire", msg.id_destinataire);
      console.log("currentUser.id", currentUser.id);
      console.log("liste_destinataires", msg.liste_destinataires);
      console.log("isForThisUser:", isForThisUser);
      console.log("isGroupMsg:", isGroupMsg);
      console.log("isFromSomeoneElse:", isFromSomeoneElse);

      if (isForThisUser && isFromSomeoneElse && Notification.permission === "granted") {
        const notif = new Notification(`💬 ${msg.nom_expediteur}`, {
          body: msg.contenu,
          icon: "/logo2.png",
          requireInteraction: true,
        });

        notif.onclick = () => {
          window.focus();
          notif.close();
        };
      }
    };


    const markAsRead = async () => {
      if (currentDiscussion) {
        await markMessagesAsRead(token, currentDiscussion.id, currentDiscussion.type);
      }
    };

    markAsRead();

    connection.on("ReceiveMessage", handler);
    connection.on("MessagesRead", handler);

    return () => {
      connection.off("ReceiveMessage", handler);
    };
  }, [connection, currentDiscussion, currentUser]);


  useEffect(() => {
    if (!connection) return;

    const handleUpdate = (data: any) => {
      const { id_message, nom_fichier, chemin_fichier } = data;

      setMessages(prev =>
        prev.map(m =>
          m.id_message === id_message
            ? {
              ...m,
              piece_jointe: chemin_fichier,
              nom_piece_jointe: nom_fichier
            }
            : m
        )
      );
    };

    connection.on("UpdateMessage", handleUpdate);

    return () => {
      connection.off("UpdateMessage", handleUpdate);
    };
  }, [connection]);




  /*const envoyerMessage = async (e: React.FormEvent) => {
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
      expediteur_nom: currentUser.nom,
      contenu: message,
      date_envoie: new Date().toISOString()
    };
    // setMessages(prev => [...prev, tempMsg]);

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
      /*if (Notification.permission === "granted") {
        const notif = new Notification(`💬 ${tempMsg.expediteur_nom}`, {
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
  };*/

  /*const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !connection) return;

    const isPrive = currentDiscussion?.type === 'prive';
    const isGroupe = currentDiscussion?.type === 'groupe';
    const idDest = isPrive ? currentDiscussion?.id : null;
    const idGroupe = isGroupe ? currentDiscussion?.id : null;
    const groupName = currentDiscussion?.nom || "";

    // 1. Créer un message vide
    const res = await connection.invoke(
      "SendMessageToDiscussion",
      currentUser.id,
      idDest,
      idGroupe,
      "", // contenu vide
      groupName
    );

    if (!res || !res.id_message) {
      toast.error("Erreur : réponse invalide du serveur.");
      return;
    }

    // 2. Upload du fichier
    const { chemin, nom } = await envoyerPieceJointe(file, res.id_message, token);

    console.log("✅ Pièce jointe envoyée :", chemin, nom);

    // 3. 🔁 Appelle SignalR pour mettre à jour
    await connection.invoke(
      "UpdateMessageWithFile",
      res.id_message,
      nom,
      chemin,
      idDest,
      idGroupe,
      groupName
    );
  };*/


  const envoyerMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !pendingFile) return; // empêcher message vide
    if (!connection) return;

    const isPrive = currentDiscussion?.type === 'prive';
    const isGroupe = currentDiscussion?.type === 'groupe';
    const idDest = isPrive ? currentDiscussion?.id : null;
    const idGroupe = isGroupe ? currentDiscussion?.id : null;
    const groupName = currentDiscussion?.nom || "";

    try {
      // ✅ 1. Envoyer le message
      const response = await connection.invoke(
        "SendMessageToDiscussion",
        currentUser.id,
        idDest,
        idGroupe,
        message,
        groupName,
        false
      );

      let finalPayload = response;

      // ✅ 2. Upload du fichier s’il y en a un
      if (response?.id_message) {
        if (pendingFile) {
          const { chemin, nom } = await envoyerPieceJointe(pendingFile, response.id_message, token);

          finalPayload = {
            ...response,
            chemin_fichier: chemin,
            nom_fichier: nom
          };

          await connection.invoke(
            "UpdateMessageWithFile",
            response.id_message,
            nom,
            chemin,
            idDest,
            idGroupe,
            groupName
          );
        }

        // ✅ 3. Affiche le message dans la liste
        setMessages(prev => [...prev, mapMessage(finalPayload)]);
      }

      // ✅ 4. Réinitialiser les champs après envoi
      setMessage("");
      setPendingFile(null); // 🔹 Efface l’aperçu du fichier envoyé

    } catch (err) {
      console.error("❌ Erreur envoi message", err);
    }
  };


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file); // juste stocker pour aperçu
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return <PictureAsPdfIcon color="error" />;
      case 'doc':
      case 'docx':
        return <DescriptionIcon color="primary" />;
      case 'xls':
      case 'xlsx':
        return <TableChartIcon color="success" />;
      default:
        return <InsertDriveFileIcon />;
    }
  };


  return (
    <Paper sx={{
      p: 2,

      height: '80vh',
      display: 'flex',

      flexDirection: 'column',
      // backgroundColor: '#f0f2f5', // clair, comme Messenger
    }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">
          {currentDiscussion ? `Discussion : ${currentDiscussion.nom}` : 'Aucune discussion sélectionnée'}
        </Typography>

        {currentDiscussion?.type === 'groupe' && (
          <>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >

              <MenuItem onClick={handleOpenModal}>Membres</MenuItem>
            </Menu>

            {/* Modal des membres */}
            <ListeMembre
              open={openModal}
              handleClose={handleCloseModal}
              idGroupe={currentDiscussion.id}
              token={token}
            />
          </>
        )}
      </Box>




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
        ref={messagesEndRef} // 🔹 déplacer le ref ici
      >


        {messages.map((msg, idx) => {
          const isMine = msg.id_expediteur === currentUser.id;
          const isLastMine = isMine && msg.id_message === lastMyMessageId;

          const isFirstUnread = idx === firstUnreadIndex;

          return (
            <React.Fragment key={msg.id_message || idx}>
              {/* Ligne de séparation "Nouveau" */}
              {isFirstUnread && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    my: 2,
                  }}
                >
                  <Box sx={{ flex: 1, height: '1px', backgroundColor: '#ccc' }} />
                  <Typography
                    variant="caption"
                    sx={{
                      mx: 2,
                      backgroundColor: '#fff',
                      padding: '0 8px',
                      color: '#555',
                      fontWeight: 600,
                    }}
                  >
                    Nouveau
                  </Typography>
                  <Box sx={{ flex: 1, height: '1px', backgroundColor: '#ccc' }} />
                </Box>
              )}

              {/* Message normal */}
              <Box sx={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                    maxWidth: '70%',
                  }}
                >
                  {/* Nom de l'expéditeur (groupe) */}
                  {currentDiscussion?.type === 'groupe' && !isMine && (
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.5, ml: 1 }}
                    >
                      {msg.nom_expediteur}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      backgroundColor: isMine ? '#1d2f54e8' : '#E5E5EA',
                      color: isMine ? 'white' : 'black',
                      px: 2,
                      py: 1.5,
                      borderRadius: 4,
                      borderTopLeftRadius: isMine ? 12 : 0,
                      borderTopRightRadius: isMine ? 0 : 12,
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                      wordBreak: 'break-word',
                      boxShadow: 2,
                      width: '100%',
                    }}
                  >
                    {/* Contenu ou pièce jointe */}
                    {msg.piece_jointe ? (
                      /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(msg.piece_jointe) ? (
                        <img
                          src={`http://localhost:5032/Uploads/${msg.piece_jointe}`}
                          alt="Pièce jointe"
                          style={{
                            maxWidth: "100%",
                            borderRadius: 8,
                            cursor: "pointer",
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          }}
                          onClick={() => window.open(`http://localhost:5032/Uploads/${msg.piece_jointe}`, "_blank")}
                        />
                      ) : (
                        <a
                          href={`http://localhost:5032/Uploads/${msg.piece_jointe}`}
                          // target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            textDecoration: 'none',
                            backgroundColor: '#f5f5f5',
                            padding: '8px 12px',
                            borderRadius: 8,
                            color: '#333',
                            fontWeight: 500,
                          }}
                        >
                          {getFileIcon(msg.piece_jointe)}
                          {msg.nom_piece_jointe || msg.piece_jointe}
                        </a>
                      )
                    ) : (
                      <Typography>{msg.contenu}</Typography>

                    )}

                    <Typography
                      variant="caption"
                      sx={{ fontSize: '0.7rem', opacity: 0.6, textAlign: 'right', mt: 0.5 }}
                    >
                      {new Date(msg.date_envoie || msg.date).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Typography>
                  </Box>

                  {/* VU affichage */}
                  {isLastMine && msg.est_lu && currentDiscussion?.type === 'prive' && (
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.5, ml: 1 }}
                    >
                      Vu
                    </Typography>
                  )}
                  {isLastMine && msg.est_lu && currentDiscussion?.type === 'groupe' && (
                    <Typography
                      variant="caption"
                      sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.5, ml: 1 }}
                    >
                      Vu par {msg.liste_utilisateur_vu?.join(", ")}
                    </Typography>
                  )}
                </Box>
              </Box>
            </React.Fragment>
          );
        })}


      </Box>




      {/* Zone de saisie */}
      <Box component="form" sx={{ display: 'flex', gap: 1 }} onSubmit={envoyerMessage}>
        <IconButton onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          <InsertEmoticonIcon />
        </IconButton>
        {showEmojiPicker && (
          <Box sx={{ position: 'absolute', bottom: '100px', zIndex: 10 }}>
            <Picker data={data} onEmojiSelect={addEmoji} theme="light" />
          </Box>
        )}

        <input
          type="file"
          id="fileInput"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />

        <IconButton onClick={() => document.getElementById('fileInput')?.click()}>
          <AttachFileIcon />
        </IconButton>


        <input
          type="text"
          placeholder="Écrire un message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        {pendingFile && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: '1px solid #ccc',
              borderRadius: 4,
              padding: 1,
              backgroundColor: '#f9f9f9',
              mt: 1,
              maxWidth: 300,
            }}
          >
            {pendingFile.type.startsWith("image/") ? (
              <img
                src={URL.createObjectURL(pendingFile)}
                alt="Aperçu"
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }}
              />
            ) : (
              <AttachFileIcon />
            )}
            <Typography variant="body2" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {pendingFile.name}
            </Typography>
            <IconButton size="small" onClick={() => setPendingFile(null)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        )}


        <IconButton type="submit" color="primary">
          <SendIcon />
        </IconButton>
      </Box>

    </Paper>
  );

}

export default ZoneMessage
