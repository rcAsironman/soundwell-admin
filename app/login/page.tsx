'use client'

import { Box, Card, Typography, useTheme, TextField, Button } from "@mui/material"
import React from "react"
import Image from "next/image"


export default function Login() {

    const theme = useTheme();
    return (
        <Box
            sx={{
                height: '100vh',
                display: 'flex'
            }}
        >
            {/**Left side */}
            <Box
                sx={{
                    height: '100%',
                    width: '60%',
                    position: 'relative'

                }}

            >
                <Image
                    src="/sw-login-bg.jpg"
                    alt="SoundWell Logo"
                    fill
                    style={{ objectFit: 'fill' }}
                />
            </Box>

            {/**Right side */}
            <Box
                sx={{
                    bgcolor: '#F9F6EE',
                    height: '100%',
                    width: '40%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative'
                }}
            >
                <Typography sx={{
                    fontSize: 50,
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    position: 'absolute',
                    top: 40,
                    left: 40
                }}>SoundWell</Typography>
                <Card
                    sx={{

                        height: '60%',
                        width: "60%",
                        borderRadius: 10,
                        paddingLeft: 5,
                        paddingTop: 5

                    }}
                >

                    <Typography
                        sx={{
                            fontSize: 30,
                            fontWeight: 600,


                        }}
                    >
                        Login

                    </Typography>

                    <Box
                    sx={{
                        display:"flex",
                        flexDirection: 'column',
                        justifyContent: 'space-evenly',
                        height: '40%'

                    }}
                    >

                        {/**Email */}
                        <TextField 
                        sx={{
                           width: '70%'
                            
                        }} id="outlined-basic" label="Email" variant="outlined" />

                        {/**Password */}
                         <TextField 
                        sx={{
                           width: '70%'
                            
                        }} id="outlined-basic" label="Password" variant="outlined" />
                    </Box>

                    <Button  
                    sx={{
                        width: '80%',
                        marginTop: 10
                    }}
                    variant="contained">
                        <Typography 
                        sx={{
                            fontWeight: 600,
                            fontSize: 15
                        }}
                        >
                            Sign In
                        </Typography>
                    </Button>
                </Card>
            </Box>
        </Box>
    )
}