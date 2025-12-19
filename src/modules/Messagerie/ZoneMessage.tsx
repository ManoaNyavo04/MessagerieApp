import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Snackbar, TextField, Tooltip, Typography } from '@mui/material';
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
import { deleteMessage, getMessages, markMessagesAsRead, modifierMessage } from './MesDiscussion';
import { useSignalR } from '../../contexts/SignalRContext';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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
import DownloadIcon from '@mui/icons-material/Download';
import { baseUrl } from '../../URL/Url';
import { downloadPieceJointe, envoyerPieceJointe } from '../PieceJoint/PieceJointService';
import RechercheMessage from './RechercheMessage';



interface Discussion {
  id: number;
  nom: string;
  type: string;
  matricule?: string;
}

interface ZoneMessagesProps {
  currentDiscussion: Discussion | null;
  currentUser: { id: number; nom: string; matricule: string };
  token: string;
}

const ZoneMessage: React.FC<ZoneMessagesProps> = ({ currentDiscussion, currentUser, token }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState<string>('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [openRecherche, setOpenRecherche] = useState(false);
  const messageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [highlightedId, setHighlightedId] = useState<number | null>(null);





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

  const handleOpenRecherche = () => {
    setOpenRecherche(true);
    handleMenuClose();
  };

  const handleCloseRecherche = () => {
    setOpenRecherche(false);
  };

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [messageToEdit, setMessageToEdit] = useState<any | null>(null);
  const [editContent, setEditContent] = useState("");

  const ouvrirModalEdit = (msg: any) => {
    setMessageToEdit(msg);
    setEditContent(msg.contenu);
    setEditModalOpen(true);
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
    if (!file) return;

    const maxSize = 25 * 1024 * 1024; // 25 Mo en bytes

    if (file.size > maxSize) {
      setSnackbarMessage(
        `❌ Fichier trop lourd (${(file.size / 1024 / 1024).toFixed(1)} Mo). Limite : 25 Mo.`
      );
      setSnackbarOpen(true);
      return;
    }
    setPendingFile(file);
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

  const handleDownload = async (id: any) => {
    try {
      await downloadPieceJointe(id, token);
    } catch (err) {
      console.error("Erreur download :", err);
    }
  };

  // const normalizeDate = (dateStr: string | null) => {
  //   if (!dateStr) return null;

  //   // Corrige format "YYYY-MM-DD HH:mm:ss"
  //   // const normalized = dateStr.replace(" ", "T");
  //   const normalized = dateStr.replace(" ", "T") + "Z"; // force UTC

  //   const d = new Date(normalized);

  //   if (isNaN(d.getTime())) return null;

  //   return d;
  // };



  const canEdit = (msg: any) => {
    console.log("Vérifie si modifiable :", msg.modifiable_jusqua);

    if (!msg.modifiable_jusqua) return false;

    const modifDate = new Date(msg.modifiable_jusqua);

    if (isNaN(modifDate.getTime())) return false;

    return modifDate.getTime() > Date.now();
  };

  const handleDelete = async (id_message: number) => {
    if (!window.confirm("Supprimer ce message ?")) return;

    try {
      await deleteMessage(id_message, token);

      // 🔁 Mise à jour UI (soft delete)
      setMessages((prev) =>
        prev.map((m) =>
          m.id_message === id_message
            ? { ...m, id_status_msg: 5 }
            : m
        )
      );
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la suppression");
    }
  };





  const handleSaveEdition = async () => {
    // Sécurité : éviter d'accéder à messageToEdit si null
    if (!messageToEdit) {
      console.warn("Aucun message sélectionné pour l'édition.");
      return;
    }

    const payload = {
      id_message: messageToEdit.id_message,
      id_utilisateur: currentUser.id,
      contenu: editContent
    };

    try {
      await modifierMessage(payload, token);

      // On ferme le modal
      setEditModalOpen(false);

      // On met à jour localement
      setMessages(prev =>
        prev.map(m =>
          m.id_message === messageToEdit.id_message
            ? { ...m, contenu: editContent, date_modification: new Date(), id_status_msg: 6 }
            : m
        )
      );

      // SignalR pour notifier les autres (si connection présente)
      if (connection) {
        connection.invoke("UpdateMessageContent",
          messageToEdit.id_message,
          editContent,
          currentDiscussion?.type === 'groupe' ? currentDiscussion?.id : null
        )
          .catch(err => console.error(err));

      }

    } catch (err) {
      console.error(err);
    }
  };

  const scrollToMessage = (messageId: number) => {
    const el = messageRefs.current[messageId];

    if (el) {
      el.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      setHighlightedId(messageId);

      setTimeout(() => {
        setHighlightedId(null);
      }, 2000);
    }
  };


  const getAvatarUrl = (code?: string) =>
    code
      ? `https://10.5.100.7:8888/api/Dossier/profil/${code}`
      : "/avatar-default.png";




  return (
    <><Paper sx={{
      p: 2,

      height: '80vh',
      display: 'flex',

      flexDirection: 'column',
      // backgroundColor: '#f0f2f5', // clair, comme Messenger
    }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {currentDiscussion?.type === 'prive' && currentDiscussion?.matricule && (
          <Avatar
            src={getAvatarUrl(currentDiscussion.matricule)}
            alt={currentDiscussion.matricule}
            sx={{ width: 40, height: 40 }}
          />
        )}



        <Typography variant="h6">
          {currentDiscussion ? `Discussion : ${currentDiscussion.nom}` : 'Aucune discussion sélectionnée'}
        </Typography>

        {currentDiscussion?.type && (
          <>
            <IconButton onClick={handleMenuOpen}>
              <MoreVertIcon />
            </IconButton>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleOpenRecherche}>
                Rechercher dans la discussion
              </MenuItem>

              {currentDiscussion?.type === 'groupe' && (
                <MenuItem onClick={handleOpenModal}>Membres</MenuItem>
              )}
            </Menu>

            <RechercheMessage
              open={openRecherche}
              onClose={handleCloseRecherche}
              discussion={currentDiscussion}
              currentUser={currentUser}
              token={token}
              onSelectMessage={(msgId) => scrollToMessage(msgId)}
            />

            {/* Modal des membres */}
            <ListeMembre
              open={openModal}
              handleClose={handleCloseModal}
              idGroupe={currentDiscussion.id}
              token={token} />
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

          const isDeleted = msg.id_status_msg === 5;

          return (
            <React.Fragment key={msg.id_message || idx}>
              <div
                ref={(el) => {
                  if (el) messageRefs.current[msg.id_message] = el;
                }}
              ></div>

              {/* Ligne "Nouveau" */}
              {isFirstUnread && (
                <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
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

              {/* Message aligné */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: isMine ? 'flex-end' : 'flex-start',
                  gap: 1,
                }}
              >


                {/* WRAPPER QUI GÈRE LE HOVER */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    maxWidth: '70%',
                    "&:hover .edit-btn, &:hover .delete-btn": {
                      opacity: 1,
                      pointerEvents: "auto",
                    }
                  }}
                >


                  {/* BULLE DU MESSAGE */}
                  {!isMine && currentDiscussion?.type === 'prive' && currentDiscussion.matricule && (
                    <Avatar
                      src={getAvatarUrl(msg.matricule_autre)}
                      alt={msg.matricule_autre}
                      sx={{ width: 32, height: 32 }}
                    />
                  )}



                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      backgroundColor: isDeleted
                        ? 'transparent'
                        : isMine ? '#060a12db' : '#E5E5EA',
                      color: isDeleted
                        ? '#9e9e9e'
                        : isMine ? 'white' : 'black',
                      px: 2,
                      py: 1.5,
                      borderRadius: 4,
                      borderTopLeftRadius: isMine ? 12 : 0,
                      borderTopRightRadius: isMine ? 0 : 12,
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                      wordBreak: 'break-word',
                      boxShadow: isDeleted ? 'none' : 2,
                      width: '100%',
                      position: "relative",
                      border: isDeleted ? '1px dashed #bdbdbd' : 'none',
                    }}
                  >
                    {/* Nom expéditeur (groupe) */}
                    {currentDiscussion?.type === 'groupe' && !isMine && (
                      <Typography
                        variant="caption"
                        sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.5 }}
                      >
                        {msg.nom_expediteur}
                      </Typography>
                    )}

                    {/* Fichier / Image / Texte */}
                    {/* CONTENU */}
                    {isDeleted ? (
                      <Typography
                        variant="body2"
                        sx={{
                          fontStyle: 'italic',
                          color: '#9e9e9e',
                        }}
                      >
                        Message supprimé
                      </Typography>
                    ) : msg.piece_jointe ? (
                      /\.(png|jpg|jpeg|gif|bmp|webp|svg)$/i.test(msg.piece_jointe) ? (
                        <img
                          src={`${baseUrl}/Uploads/${msg.piece_jointe}`}
                          alt="Pièce jointe"
                          style={{
                            maxWidth: "100%",
                            borderRadius: 8,
                            cursor: "pointer",
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                          }}
                          onClick={() => window.open(`${baseUrl}/Uploads/${msg.piece_jointe}`, "_blank")}
                        />
                      ) : (
                        <>
                          <a
                            href={`${baseUrl}/Uploads/${msg.piece_jointe}`}
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

                          <IconButton onClick={() => handleDownload(msg.id_piece_jointe)}>
                            <DownloadIcon />
                          </IconButton>
                        </>
                      )
                    ) : (
                      <Typography>{msg.contenu}</Typography>
                    )}


                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{ fontSize: '0.7rem', opacity: 0.6 }}
                      >
                        {new Date(msg.date_envoie || msg.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {!isDeleted && (
                          <> • {msg.id_status_msg === 1 ? 'Envoyé' : msg.id_status_msg === 6 ? 'Modifié' : ''}</>
                        )}
                      </Typography>
                    </Box>
                  </Box>

                  {isMine && !isDeleted && (
                    <>
                      {/* ✏️ EDIT */}
                      <Tooltip title={canEdit(msg) ? "Modifier le message" : "Délai expiré"}>
                        <span>
                          <IconButton
                            className="edit-btn"
                            size="small"
                            disabled={!canEdit(msg)}
                            onClick={() => ouvrirModalEdit(msg)}
                            sx={{
                              opacity: 0,
                              pointerEvents: canEdit(msg) ? "auto" : "none",
                              transition: "opacity 0.2s",
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>

                      {/* 🗑️ DELETE */}
                      <Tooltip title="Supprimer le message">
                        <IconButton
                          className="delete-btn"
                          size="small"
                          onClick={() => handleDelete(msg.id_message)}
                          sx={{
                            opacity: 0,
                            transition: "opacity 0.2s",
                            color: "error.main",
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}





                </Box>
              </Box>

              {/* VU */}
              {isLastMine && msg.est_lu && currentDiscussion?.type === 'prive' && (
                <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.5 }}>
                  Vu
                </Typography>
              )}

              {isLastMine && msg.est_lu && currentDiscussion?.type === 'groupe' && (
                <Typography variant="caption" sx={{ fontSize: '0.75rem', color: 'text.secondary', mb: 0.5 }}>
                  Vu par {msg.liste_utilisateur_vu?.join(", ")}
                </Typography>
              )}

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
          accept="*"
          id="fileInput"
          style={{ display: 'none' }}
          onChange={handleFileSelect} />

        <IconButton onClick={() => document.getElementById('fileInput')?.click()}>
          <AttachFileIcon />
        </IconButton>


        <input
          type="text"
          placeholder="Écrire un message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }} />
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
                style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
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

        <Dialog open={editModalOpen} onClose={() => setEditModalOpen(false)}>
          <DialogTitle>Modifier message</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveEdition} variant="contained">Sauvegarder</Button>
          </DialogActions>
        </Dialog>

      </Box>

    </Paper>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        message={snackbarMessage} />
    </>
  );

}

export default ZoneMessage
