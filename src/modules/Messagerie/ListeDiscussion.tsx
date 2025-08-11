import React, { useEffect, useState } from 'react'
import { getMesDiscussions } from './MesDiscussion';
import { Box, IconButton, List, ListItem, ListItemButton, ListItemText, Paper, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

interface Discussion {
  id: number;
  nom: string;
  type: string;
}

interface ListeDiscussionsProps {
  token: string;
  onSelectDiscussion: (discussion: Discussion) => void;
}

const ListeDiscussion: React.FC<ListeDiscussionsProps> = ({ token, onSelectDiscussion }) => {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDiscussions() {

      try {
        const data = await getMesDiscussions(token);
        setDiscussions(data);
      } catch (err) {

        console.error("Erreur lors de la récupération des discussions :", err);
      }
    }
    fetchDiscussions();
  }, [token]);

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
        {discussions.map((discussion) => (
          <ListItem key={`${discussion.type}-${discussion.id}`} disablePadding>
            <ListItemButton onClick={() => onSelectDiscussion(discussion)}>
              <ListItemText sx={{ color: 'black' }} primary={discussion.nom} secondary={discussion.type} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default ListeDiscussion