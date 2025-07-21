import { Box, Button, Grid } from '@mui/material';
import React, { useState } from 'react';

interface myProps {
    liste : string[],
    execultable : (liste : string[])=>void
}
export const TableOrder: React.FC<myProps> = (props) => {

    const [list, setList] = useState<string[]>(props.liste);


    const moveUp = (index: number) => {
        if (index > 0) {
            const newList = [...list];
            [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
            setList(newList);
            props.execultable(newList)
        }
    };


    const moveDown = (index: number) => {
        if (index < list.length - 1) {
            const newList = [...list];
            [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
            setList(newList);
            props.execultable(newList)
        }
    };

    return (
        <Box m={1} pb={1} sx={{height:'400px', overflow:"auto"}}>
            {list.map((item, index) => (
                <Grid key={index} sx={{mt:.01}} container spacing={1}>
                    <Grid item xs={8}>
                    <Button fullWidth variant='outlined' size='small' > {item}</Button>
                    </Grid>
                    <Grid item xs={4}>
                        <Box sx={{display : 'flex', flexDirection:'row'}}>
                        <Button sx={{ml:1}} variant='contained' size='small' fullWidth onClick={() => moveUp(index)} disabled={index === 0}>↑</Button>
                        <Button sx={{ml:1}} variant='contained' size='small'  fullWidth onClick={() => moveDown(index)} disabled={index === list.length - 1}>↓</Button>
                        </Box>
                   
                    </Grid>
                </Grid>                   
            ))}
        </Box>
    );
};
