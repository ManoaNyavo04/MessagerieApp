import { Box, Button, Tooltip } from "@mui/material"
import { RubanModalStyle } from "../../../configs/style"

interface myProps {
    handleClose : ()=> void
}
export const RubanFermer: React.FC<myProps> = ({handleClose}) => {
    return (
        <Box sx={RubanModalStyle}>
            <Tooltip title="Fermer">
                <Button size='small' variant='contained' color='error' onClick={handleClose} >X</Button>
            </Tooltip>
        </Box>
    )
}

                                 