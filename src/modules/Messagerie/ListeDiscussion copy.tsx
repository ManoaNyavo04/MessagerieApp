import React, { useEffect, useState } from 'react'
import { getMesDiscussions, getUnreadCounts } from './MesDiscussion';
import { Box, IconButton, List, ListItem, ListItemButton, ListItemText, Paper, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { searchUser } from '../Utilisateur/UtilisateurService';
import { useSignalR } from '../../contexts/SignalRContext';

interface Discussion {
  id: number;
  nom: string;
  type: string;
}

interface ListeDiscussionsProps {
  token: string;
  onSelectDiscussion: (discussion: Discussion) => void;
  currentDiscussion: Discussion | null;
}

const ListeDiscussion: React.FC<ListeDiscussionsProps> = ({ token, onSelectDiscussion, currentDiscussion }) => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<{ [key: number]: number }>({});

  useEffect(() => {
    async function fetchDiscussions() {

      try {
        const data = await getMesDiscussions(token);
        setDiscussions(data);
      } catch (err) {

        console.error("Erreur lors de la récupération des discussions :", err);
      }
    }

    if (searchTerm.trim().length > 0) {
      const fetchSearchResults = async () => {
        try {
          const results = await searchUser(token, searchTerm);
          setSearchResults(results);
        } catch (err) {
          console.error("Erreur recherche utilisateur :", err);
        }
      };

      fetchSearchResults();
    } else {
      setSearchResults([]);
    }

    fetchDiscussions();
  }, [searchTerm, token]);

  useEffect(() => {
    async function fetchUnreadCounts() {
      try {
        const counts = await getUnreadCounts(token);
        console.log("Unread counts récupérés:", counts);
        console.log("Token utilisé pour fetchUnreadCounts:", token);

        setUnreadCounts(counts); // ex: { 2: 5, 8: 1 }
      } catch (err) {
        console.error("Erreur lors de la récupération des messages non lus :", err);
      }
    }

    fetchUnreadCounts();
  }, [token]);




  const connection = useSignalR();
  useEffect(() => {
    if (!connection) return;

    const handler = (msg: any) => {
      if (msg.id_discussion !== currentDiscussion?.id) {
        setUnreadCounts(prev => ({
          ...prev,
          [msg.id_discussion]: (prev[msg.id_discussion] || 0) + 1
        }));
      }
    };

    connection.on("ReceiveMessage", handler);
    return () => {
      connection.off("ReceiveMessage", handler);
    };
  }, [connection, currentDiscussion]);

  // Quand on clique sur une discussion → reset compteur
  const handleSelectDiscussion = (discussion: Discussion) => {
    setUnreadCounts(prev => ({
      ...prev,
      [discussion.id]: 0
    }));
    onSelectDiscussion(discussion);
  };


  return (
    <Paper sx={{ p: 2, height: '80vh', overflowY: 'auto' }}>
      <Typography variant="h6" gutterBottom>Mes Discussions</Typography>

      {/* 🔍 Barre de recherche */}
      <Box sx={{ display: "flex", mb: 2 }}>
        <TextField
          variant="outlined"
          size="small"
          fullWidth
          placeholder="Rechercher par nom, prénom, matricule..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <IconButton >
          <SearchIcon />
        </IconButton>
      </Box>

      <List>
        {searchResults.length > 0 ? (
          searchResults.map((user) => {
            // Find if a discussion already exists with this user
            const discussion = discussions.find(
              (d) => d.id === user.id_utilisateur
            ) || {
              id: user.id_utilisateur,
              nom: user.nom + (user.prenom ? ' ' + user.prenom : ''),
              type: 'utilisateur'
            };

            return (
              <ListItem key={user.id_utilisateur} disablePadding>
                <ListItemButton onClick={() => handleSelectDiscussion(discussion)}>
                  <ListItemText
                    primaryTypographyProps={{ sx: { color: "black" } }}
                    primary={discussion.nom}
                    secondary={discussion.type}
                  />
                  {unreadCounts[discussion.id] > 0 && (
                    <Box
                      sx={{
                        backgroundColor: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        px: 1,
                        fontSize: '0.8rem',
                        minWidth: '20px',
                        textAlign: 'center'
                      }}
                    >
                      {unreadCounts[discussion.id]}
                    </Box>
                  )}
                </ListItemButton>

              </ListItem>
            );
          })
        ) : (
          discussions.map((discussion) => (
            <ListItem key={`${discussion.type}-${discussion.id}`} disablePadding>
              <ListItemButton onClick={() => onSelectDiscussion(discussion)}>
                <ListItemText
                  primaryTypographyProps={{ sx: { color: "black" } }}
                  primary={discussion.nom}
                  secondary={discussion.type}
                />
              </ListItemButton>
            </ListItem>
          ))
        )}
      </List>


      {/* <List>
        {discussions.map((discussion) => (
          <ListItem key={`${discussion.type}-${discussion.id}`} disablePadding>
            <ListItemButton onClick={() => onSelectDiscussion(discussion)}>
              <ListItemText sx={{ color: 'black' }} primary={discussion.nom} secondary={discussion.type} />
            </ListItemButton>
          </ListItem>
        ))}
      </List> */}
    </Paper>
  );
}

export default ListeDiscussion