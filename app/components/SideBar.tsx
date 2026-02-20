'use client'
import { Box, Typography, useTheme } from "@mui/material"
import NavBar from "./NavBar";

export default function SideBar(){

    const theme = useTheme();

    return(
        <Box
        sx={{
            bgcolor: theme.palette.primary.main,
            height: '100vh',
            width: '100%',
            padding: 2
        }}
        >
            {/** Branding */}
            <center>
                <Typography sx={{
                fontSize: 32,
                fontWeight: 600,
                color: 'white'
            }}>SoundWell</Typography>
            </center>

            {/**NavBar */}
            <NavBar/>
            {/**Account and setting with logout option */}
        </Box>
    )
}