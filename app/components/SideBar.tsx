'use client'
import { Box, Button, Typography, useTheme } from "@mui/material"
import NavBar from "./NavBar";
import LogoutIcon from '@mui/icons-material/Logout';
import { useStore } from "@/store/useStore";
import { useRouter } from "next/navigation";




export default function SideBar() {

    const theme = useTheme();
    const {clearAuthStorage} = useStore();
    const router = useRouter();
    const handleLogout = () => {
        clearAuthStorage();
        router.replace('/');
    }

    return (
        <Box
            sx={{
                bgcolor: theme.palette.primary.main,
                height: '100vh',
                width: '20vw',
                padding: 2,
                position: 'relative'
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
            <NavBar />
            {/**Account and setting with logout option */}
            <Button
                variant="contained"
                endIcon={<LogoutIcon />}
                sx={{
                    backgroundColor: 'white',
                    color: 'red',
                    '&:hover': {
                        backgroundColor: '#f5f5f5'
                    },
                    width: '80%',
                    position: 'absolute',
                    bottom: 20,
                    left: 20

                }}
                onClick={handleLogout}
            >
                Logout
            </Button>
        </Box>
    )
}