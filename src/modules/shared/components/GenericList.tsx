import React, { ReactNode, useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridColumnVisibilityModel, GridFilterState, gridPageCountSelector, gridPageSelector, gridPaginationRowCountSelector, GridRowId, GridRowParams, GridState, GridToolbar, GridToolbarColumnsButton, GridToolbarContainer, GridToolbarExport, GridToolbarFilterButton, GridToolbarQuickFilter, useGridApiContext, useGridApiRef, useGridSelector } from '@mui/x-data-grid';
import { Box, Button, Collapse, Modal, TablePagination, TextField, createTheme } from '@mui/material';
import { ThemeProvider } from '@emotion/react';
import LoopIcon from '@mui/icons-material/Loop';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { frFR } from '@mui/material/locale';

// import { TableOrder } from './TableOrder/TableOrder';
// import * as XLSX from 'xlsx';
// import { FileIcon } from '@react-pdf-viewer/default-layout';
// import { androany } from '../../../utils/androany';
// import { BoxModalStyle } from '../../../configs/style';
// import { RubanFermer } from './RubanFermer';
import { TableOrder } from './TableOrder';
import { RubanFermer } from './RubanFermer';
import { BoxModalStyle } from '../../../configs/style';

interface GenericListProps<T> {
  columns: GridColDef[];
  rows: T[];
  slots?: boolean;
  hideHeadersAndFooter?: boolean;
  visible?: GridColumnVisibilityModel;
  myPagination?: { page: number; pageSize: number }
  selectionMultiple?: boolean
  isMultiple?: (valeur: boolean) => void
  rowClick?: (id: number) => void
  height?: string
  tableName?: string
  getSelectedId? : (newSelection :  number[]) => void
}

const theme = createTheme(
  {
    palette: {
      primary: { main: '#1976d2' },
    },
  },
  frFR
);

const GenericList = <T,>({ columns, rows, slots = true, hideHeadersAndFooter = false, visible, myPagination = { page: 0, pageSize: 30 }, selectionMultiple = false, isMultiple, rowClick, height = "600px", tableName = "ExportPlateforme", getSelectedId }: GenericListProps<T>) => {
  const apiRef = useGridApiRef()
  const [motCle, setMotCle] = useState<string>('');
  const [selectedId, setSelectedId] = useState<number[]>([])
  const [activeId, setActiveId] = useState<number>(0)

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMotCle(event.target.value);
  };

  const [filteredRows, setFilteredRows] = useState<T[]>([]);

  useEffect(() => {
    const calculateFilteredRows = () => {
      if (!rows) return [];
      const searchTerms = motCle.toLowerCase().split(/\s+/);
      return rows.filter(row =>
        searchTerms.every(term =>
          columns.some(column => {
            const value = row[column.field as keyof T];
            return value && value.toString().toLowerCase().includes(term);
          })
        )
      );
    };
    setFilteredRows(calculateFilteredRows());
  }, [rows, motCle, columns]);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState<GridColumnVisibilityModel>({});

  useEffect(() => {
    if (visible != undefined) {
      setColumnVisibilityModel(visible)
    }
  }, [visible])

  useEffect
  (() => {
    if(!getSelectedId) {
      return
    }
    if (selectedId.length > 0) { 
      getSelectedId(selectedId)
    }else{
     getSelectedId([])
    } 
  }, [selectedId])

  const handleRowClick = (params: GridRowParams) => {
    setActiveId(params.id as number)          
    if (rowClick) {
      rowClick(params.row.id)
    }
  };
 

  

 

  //arragement des colonnes

  const fieldNames: string[] = columns.map(column => column.field);
  const reorderColumns = (columns: GridColDef[], fieldOrder: string[]): GridColDef[] => {
    const columnsMap = new Map(columns.map(column => [column.field, column]));
    const reorderedColumns = fieldOrder
      .map(field => columnsMap.get(field))
      .filter((col): col is GridColDef => !!col);
    return reorderedColumns;
  };

  const [dColumns, setDColumns] = useState(columns)

  const arrangement = (liste: string[]) => {
    setDColumns(reorderColumns(columns, liste))
  }

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const CustomToolbar: React.FC = () => {
    return (
      <GridToolbarContainer className='tableToolbar'>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarExport />
        <Button startIcon={<InsertDriveFileIcon />} className='tableToolbar' onClick={handleDownloadExcel}>Excel</Button>
        <GridToolbarQuickFilter sx={{ marginLeft: 0,  padding: 1}}/>

        <Toolbar />

      </GridToolbarContainer>
    )
  }

  const dateToExcelSerial = (date: Date): number | undefined => {
    if (!date) return undefined;

    // Convertir la date en millisecondes
    const utc_days = (date.getTime() / (1000 * 60 * 60 * 24)) + 25569; // Convertir en nombre de jours depuis 1900-01-01
    return utc_days;
  };
  const handleDownloadExcel = () => {
    // Obtenir les IDs des lignes filtrées directement depuis l'état actuel du DataGrid

    const filteredRowIds = Object.keys(apiRef.current.state.filter.filteredRowsLookup)
      .filter((id) => apiRef.current.state.filter.filteredRowsLookup[id]);
  
    const fr = filteredRowIds
      .map((id) => rows.find((row) => (row as any).id.toString().toUpperCase() === id.toString().toUpperCase()))
      .filter((row): row is T => row !== undefined);
  
    const hiddenColumns = ['supprimer', 'action', 'modifier'];
    const visibleColumns = columns.filter((col) => !hiddenColumns.includes(col.field));



    

  
    const formattedData = fr.map((row) => {
      const formattedRow: Record<string, any> = {};
  
      visibleColumns.forEach((col) => {
        const header = col.headerName || col.field;
        let valeur = row[col.field as keyof T];
        let valeurString = valeur as string;
        if (header.toUpperCase().includes("DATE")) {
        //   valeurString = androany(valeur as string);
          const dateNumber = dateToExcelSerial(new Date(valeurString));
          valeurString = dateNumber != undefined ? dateNumber.toString() : "undefined";
  
          formattedRow[header] = {
            v: valeurString,
            t: 'n',
            z: 'yyyy-mm-dd',
          };
        } else {
          formattedRow[header] = valeurString;
        }
      });
  
      return formattedRow;
    });
  
    // const worksheet = XLSX.utils.json_to_sheet(formattedData);
    // const workbook = XLSX.utils.book_new();
    // XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    // const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    // const blob = new Blob([excelBuffer], {
    //   type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    // });
    // const link = document.createElement('a');
    // link.href = URL.createObjectURL(blob);
    // link.download = tableName + ".xlsx";
    // link.click();
  };
  

  const [fRowId, setFRowId] = useState([""]);

  function getKeysFromLookup(obj: GridFilterState['filteredRowsLookup']) {
    const keys = [];
    for (const key in obj) {
      if (obj.hasOwnProperty(key) && obj[key]) {
        keys.push(key);
      }
    }
    return keys;
  }
  const handleStateChange = React.useCallback(
    (state: GridState) => {
      const filteredKeys = getKeysFromLookup(state.filter.filteredRowsLookup);
      setFRowId(filteredKeys)
    },
    [apiRef],
  );


  function Toolbar() {
    const apiRef = useGridApiContext();
    const page = useGridSelector(apiRef, gridPageSelector);
    const pageCount = useGridSelector(apiRef, gridPaginationRowCountSelector);


    const handleChangePage = (event: any, newPage: number) => {
      apiRef.current.setPage(newPage);
    };

    return (
      <TablePagination
        sx={{ ml: 'auto', backgroundColor: '#1d2f53', marginBottom: "-1000px", color: "white" }} // Utiliser backgroundColor avec sx
        component="div"
        count={pageCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={myPagination.pageSize}
        rowsPerPageOptions={[]}
      />

    );
  }
  return (
    <>
      <style>
        {`
          .MuiDataGrid-row:hover {
            cursor: pointer;
          }
        `}
      </style>
      {/* <TextField
        sx={{ m: 0, }}

        label="Rechercher"
        variant="outlined"
        value={motCle}
        onChange={handleSearchChange}
        size='small'
        margin='dense'
      /> */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
        className='myModal'
      >
        <Box sx={BoxModalStyle}>
          <RubanFermer  handleClose={handleClose}/>
          
          <Box p={1}>
          <TableOrder execultable={arrangement} liste={fieldNames} />
          </Box>
        </Box>
      </Modal>
      

      <Box sx={{
        display: 'flex',

        flexDirection: 'row-reverse',
        bgcolor: 'inherit',
        borderRadius: 1,
      }}>
 
      </Box>


      <Box sx={{ height: height }}>
        <ThemeProvider theme={theme}>
        <DataGrid
          
          apiRef={apiRef}
            rows={filteredRows}
            columns={dColumns}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) =>
              setColumnVisibilityModel(newModel)
            }
            initialState={{
              pagination: {
                paginationModel: myPagination,
              },
            }}
            pageSizeOptions={[10, 15]}
            checkboxSelection={selectionMultiple}
            disableRowSelectionOnClick
            {...(hideHeadersAndFooter ? { hideFooter: true, hideHeader: true } : {})}
            onRowClick={handleRowClick}
            onRowSelectionModelChange={(ids) => {
              setSelectedId(ids.map(id => Number(id)))
              if (isMultiple) {
                if (ids.length >= 2) {
                  isMultiple(true)
                } else {
                  isMultiple(false)
                }
              }
            }}
            getRowClassName={(params) => {
              const isSelected = activeId === (params.id as number) ? 'selected' : '';
              const rowClass = params.indexRelativeToCurrentPage % 2 === 0 ? 'even' : 'odd';
              
              return `${isSelected} ${rowClass}`.trim();
            }}
            
            slots={{ toolbar: CustomToolbar }}


            //autoHeight

            // Traduction : 

            localeText={{
              // Root
              noRowsLabel: 'Pas de résultats',
              noResultsOverlayLabel: 'Aucun résultat.',

              // Density selector toolbar button text
              toolbarDensity: 'Densité',
              toolbarDensityLabel: 'Densité',
              toolbarDensityCompact: 'Compacte',
              toolbarDensityStandard: 'Standard',
              toolbarDensityComfortable: 'Confortable',

              // Columns selector toolbar button text
              toolbarColumns: 'Colonnes',
              toolbarColumnsLabel: 'Choisir les colonnes',

              // Filters toolbar button text
              toolbarFilters: 'Filtres',
              toolbarFiltersLabel: 'Afficher les filtres',
              toolbarFiltersTooltipHide: 'Masquer les filtres',
              toolbarFiltersTooltipShow: 'Afficher les filtres',
              toolbarFiltersTooltipActive: (count) =>
                count > 1 ? `${count} filtres actifs` : `${count} filtre actif`,

              // Quick filter toolbar field
              toolbarQuickFilterPlaceholder: 'Rechercher…',
              toolbarQuickFilterLabel: 'Recherche',
              toolbarQuickFilterDeleteIconLabel: 'Supprimer',

              // Export selector toolbar button text
              toolbarExport: 'Exporter',
              toolbarExportLabel: 'Exporter',
              toolbarExportCSV: 'Télécharger en CSV',
              toolbarExportPrint: 'Imprimer',
              toolbarExportExcel: 'Télécharger pour Excel',

              // Columns management text
              columnsManagementSearchTitle: 'Rechercher',
              columnsManagementNoColumns: 'Pas de colonnes',
              columnsManagementShowHideAllText: 'Afficher/masquer toutes',
              // columnsManagementReset: 'Reset',

              // Filter panel text
              filterPanelAddFilter: 'Ajouter un filtre',
              filterPanelRemoveAll: 'Tout supprimer',
              filterPanelDeleteIconLabel: 'Supprimer',
              filterPanelLogicOperator: 'Opérateur logique',
              filterPanelOperator: 'Opérateur',
              filterPanelOperatorAnd: 'Et',
              filterPanelOperatorOr: 'Ou',
              filterPanelColumns: 'Colonne',
              filterPanelInputLabel: 'Valeur',
              filterPanelInputPlaceholder: 'Filtrer la valeur',

              // Filter operators text
              filterOperatorContains: 'contient',
              filterOperatorEquals: 'est égal à',
              filterOperatorStartsWith: 'commence par',
              filterOperatorEndsWith: 'se termine par',
              filterOperatorIs: 'est',
              filterOperatorNot: "n'est pas",
              filterOperatorAfter: 'postérieur',
              filterOperatorOnOrAfter: 'égal ou postérieur',
              filterOperatorBefore: 'antérieur',
              filterOperatorOnOrBefore: 'égal ou antérieur',
              filterOperatorIsEmpty: 'est vide',
              filterOperatorIsNotEmpty: "n'est pas vide",
              filterOperatorIsAnyOf: 'fait partie de',
              'filterOperator=': '=',
              'filterOperator!=': '!=',
              'filterOperator>': '>',
              'filterOperator>=': '>=',
              'filterOperator<': '<',
              'filterOperator<=': '<=',

              // Header filter operators text
              headerFilterOperatorContains: 'Contient',
              headerFilterOperatorEquals: 'Est égal à',
              headerFilterOperatorStartsWith: 'Commence par',
              headerFilterOperatorEndsWith: 'Se termine par',
              headerFilterOperatorIs: 'Est',
              headerFilterOperatorNot: "N'est pas",
              headerFilterOperatorAfter: 'Postérieur',
              headerFilterOperatorOnOrAfter: 'Égal ou postérieur',
              headerFilterOperatorBefore: 'Antérieur',
              headerFilterOperatorOnOrBefore: 'Égal ou antérieur',
              headerFilterOperatorIsEmpty: 'Est vide',
              headerFilterOperatorIsNotEmpty: "N'est pas vide",
              headerFilterOperatorIsAnyOf: 'Fait partie de',
              'headerFilterOperator=': 'Est égal à',
              'headerFilterOperator!=': "N'est pas égal à",
              'headerFilterOperator>': 'Est supérieur à',
              'headerFilterOperator>=': 'Est supérieur ou égal à',
              'headerFilterOperator<': 'Est inférieur à',
              'headerFilterOperator<=': 'Est inférieur ou égal à',

              // Filter values text
              filterValueAny: 'tous',
              filterValueTrue: 'vrai',
              filterValueFalse: 'faux',

              // Column menu text
              columnMenuLabel: 'Menu',
              columnMenuShowColumns: 'Afficher les colonnes',
              columnMenuManageColumns: 'Gérer les colonnes',
              columnMenuFilter: 'Filtrer',
              columnMenuHideColumn: 'Masquer',
              columnMenuUnsort: 'Annuler le tri',
              columnMenuSortAsc: 'Tri ascendant',
              columnMenuSortDesc: 'Tri descendant',

              // Column header text
              columnHeaderFiltersTooltipActive: (count) =>
                count > 1 ? `${count} filtres actifs` : `${count} filtre actif`,
              columnHeaderFiltersLabel: 'Afficher les filtres',
              columnHeaderSortIconLabel: 'Trier',

              // Rows selected footer text
              footerRowSelected: (count) =>
                count > 1
                  ? `${count.toLocaleString()} lignes sélectionnées`
                  : `${count.toLocaleString()} ligne sélectionnée`,

              // Total row amount footer text
              footerTotalRows: 'Total de lignes :',

              // Total visible row amount footer text
              footerTotalVisibleRows: (visibleCount, totalCount) =>
                `${visibleCount.toLocaleString()} sur ${totalCount.toLocaleString()}`,

              // Checkbox selection text
              checkboxSelectionHeaderName: 'Sélection',
              checkboxSelectionSelectAllRows: 'Sélectionner toutes les lignes',
              checkboxSelectionUnselectAllRows: 'Désélectionner toutes les lignes',
              checkboxSelectionSelectRow: 'Sélectionner la ligne',
              checkboxSelectionUnselectRow: 'Désélectionner la ligne',

              // Boolean cell text
              booleanCellTrueLabel: 'vrai',
              booleanCellFalseLabel: 'faux',

              // Actions cell more text
              actionsCellMore: 'Plus',

              // Column pinning text
              pinToLeft: 'Épingler à gauche',
              pinToRight: 'Épingler à droite',
              unpin: 'Désépingler',

              // Tree Data
              treeDataGroupingHeaderName: 'Groupe',
              treeDataExpand: 'afficher les enfants',
              treeDataCollapse: 'masquer les enfants',

              // Grouping columns
              groupingColumnHeaderName: 'Groupe',
              groupColumn: (name) => `Grouper par ${name}`,
              unGroupColumn: (name) => `Arrêter de grouper par ${name}`,

              // Master/detail
              detailPanelToggle: 'Afficher/masquer les détails',
              expandDetailPanel: 'Afficher',
              collapseDetailPanel: 'Masquer',

              // Row reordering text
              rowReorderingHeaderName: 'Positionnement des lignes',

              // Aggregation
              aggregationMenuItemHeader: 'Agrégation',
              aggregationFunctionLabelSum: 'Somme',
              aggregationFunctionLabelAvg: 'Moyenne',
              aggregationFunctionLabelMin: 'Minimum',
              aggregationFunctionLabelMax: 'Maximum',
              aggregationFunctionLabelSize: "Nombre d'éléments",
            }}

            sx={{
              // background: 'red',
              // '& .MuiDataGrid-root': {
              //   borderRadius: "0px", // Assure que la grille entière n’a pas de border-radius
              // },
              '& .MuiDataGrid-columnHeaders': {
                borderBottom: '1px solid #ffff !important;',
                borderRight: '2px solid #ffff', 
                backgroundColor : 'red',
                borderRadius: "0px"
              },
              '& .MuiDataGrid-cell': {
                borderRight: '1px solid #e0e0e0;',
                fontFamily: "Rubik"
              },
              '& .MuiDataGrid-cell:last-child': {
                borderRight: 'none', // Supprime la bordure de la dernière colonne
                borderLeft: '1px solid #e0e0e0;',
              },
              '& .MuiDataGrid-row.even': {
                backgroundColor: '#f5f5f5', // Couleur de fond pour les lignes paires
              },
              '& .MuiDataGrid-row.odd': {
                backgroundColor: '#ffffff', // Couleur de fond pour les lignes impaires
              },
              '.MuiDataGrid-main.css-3eek4p-MuiDataGrid-main': {
                  borderTopLeftRadius: "0px"
              },
              // '& .MuiDataGrid-columnHeaderTitleContainer': {
              //   borderRight: '0.5px solid #ffff', 
              
              // },
              padding: 3,
            }}

            hideFooterPagination
        />
        </ThemeProvider>
      </Box>



    </>
  );
};



export default GenericList;


