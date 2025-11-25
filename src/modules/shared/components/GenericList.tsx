import React, { useEffect, useState } from 'react';
import {
  DataGrid,
  GridColDef,
  GridColumnVisibilityModel,
  GridRowParams,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarQuickFilter,
  useGridApiRef,
  GridPreferencePanelsValue
} from '@mui/x-data-grid';
import {
  Box,
  Button,
  Modal,
  Tooltip,
  Typography,
  createTheme,
} from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import { frFR } from '@mui/material/locale';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import DownloadIcon from '@mui/icons-material/Download';
import { RubanFermer } from './RubanFermer';
import { TableOrder } from './TableOrder';
import { BoxModalStyle } from '../../../configs/style';

interface GenericListProps<T> {
  columns: GridColDef[];
  rows: T[];
  visible?: GridColumnVisibilityModel;
  myPagination?: { page: number; pageSize: number };
  selectionMultiple?: boolean;
  isMultiple?: (valeur: boolean) => void;
  rowClick?: (id: number) => void;
  height?: string;
  tableName?: string;
  getSelectedId?: (newSelection: number[]) => void;
}

const theme = createTheme(
  {
    palette: {
      primary: { main: '#2563EB' }, // Bleu plus doux et moderne
      background: { default: '#F5F6FA' },
      text: { primary: '#1F2937' },
    },
    typography: {
      fontFamily: 'Rubik, sans-serif',
    },
  },
  frFR
);

const GenericList = <T,>({
  columns,
  rows,
  visible,
  myPagination = { page: 0, pageSize: 20 },
  selectionMultiple = false,
  rowClick,
  height = '600px',
  tableName = 'ExportPlateforme',
  getSelectedId,
}: GenericListProps<T>) => {
  const apiRef = useGridApiRef();
  const [selectedId, setSelectedId] = useState<number[]>([]);
  const [columnVisibilityModel, setColumnVisibilityModel] =
    useState<GridColumnVisibilityModel>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (visible) setColumnVisibilityModel(visible);
  }, [visible]);

  useEffect(() => {
    if (getSelectedId) getSelectedId(selectedId);
  }, [selectedId]);

  const handleRowClick = (params: GridRowParams) => {
    if (rowClick) rowClick(params.row.id);
  };

  const handleDownloadExcel = () => {
    apiRef.current?.exportDataAsCsv({ fileName: tableName });
  };
  const handleTri = () => {
    apiRef.current?.showPreferences?.('columns' as GridPreferencePanelsValue);
  };
  

  const CustomToolbar = () => (
  <GridToolbarContainer
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start', // tout à gauche
      backgroundColor: 'white',
      borderBottom: '1px solid #E5E7EB',
      px: 2,
      py: 1,
      gap: 1, // petit espace entre les éléments
      flexWrap: 'wrap', // si trop d'éléments, ils passent à la ligne
    }}
  >
    {/* Boutons export et colonnes */}
    <Tooltip title="Exporter en Excel">
      <Button
        variant="outlined"
        size="small"
        
        startIcon={<DownloadIcon />}
        sx={{
          textTransform: 'none',
          borderRadius: 2,
          borderColor: '#D1D5DB',
          color: '#374151',
          '&:hover': { backgroundColor: '#F9FAFB' },
        }}
        onClick={handleDownloadExcel}
      >
        Exporter
      </Button>
    </Tooltip>

    <Tooltip title="Gérer les colonnes">
  <Button
    size="small"
    sx={{
      color: '#374151',
      border: '1px solid #D1D5DB',
      borderRadius: 2,
      minWidth: '36px',
      '&:hover': { backgroundColor: '#F9FAFB' },
    }}
    onClick={() => handleTri()}
  >
    <ViewColumnIcon fontSize="small" />
  </Button>
</Tooltip>


    {/* Barre de recherche */}
    <GridToolbarQuickFilter
      placeholder="Rechercher..."
      sx={{
        backgroundColor: '#F9FAFB',
        borderRadius: 2,
        ml: 1,
        input: {
          p: 0.5,
          fontSize: '0.9rem',
        },
        minWidth: '180px',
      }}
    />
  </GridToolbarContainer>
);


  return (
    <ThemeProvider theme={theme}>
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={BoxModalStyle}>
          <RubanFermer handleClose={() => setOpen(false)} />
          <Box p={2}>
            <TableOrder execultable={() => {}} liste={columns.map((c) => c.field)} />
          </Box>
        </Box>
      </Modal>

      <Box
        sx={{
          boxShadow: 2,
          borderRadius: 3,
          backgroundColor: 'white',
          overflow: 'hidden',
        }}
      >
        <DataGrid
          apiRef={apiRef}
          rows={rows}
          columns={columns}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={setColumnVisibilityModel}
          onRowClick={handleRowClick}
          checkboxSelection={selectionMultiple}
          disableRowSelectionOnClick
          initialState={{
            pagination: { paginationModel: myPagination },
          }}
          slots={{ toolbar: CustomToolbar }}
          localeText={{
            noRowsLabel: 'Aucune donnée disponible',
            toolbarExport: 'Exporter',
            toolbarQuickFilterPlaceholder: 'Rechercher…',
          }}
          sx={{
            height,
            border: 'none',
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #E5E7EB',
              fontSize: '0.9rem',
            },
            '& .MuiDataGrid-row:hover': {
              backgroundColor: '#F9FAFB',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#F3F4F6',
              color: '#111827',
              fontWeight: 600,
              fontSize: '0.9rem',
            },
            '& .MuiDataGrid-footerContainer': {
              backgroundColor: '#F9FAFB',
            },
          }}
        />
      </Box>
    </ThemeProvider>
  );
};

export default GenericList;
