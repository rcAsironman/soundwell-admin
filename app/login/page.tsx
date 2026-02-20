'use client'

import { Box, Card, Typography, useTheme, TextField, Button } from "@mui/material"
import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useStore } from "@/store/useStore"
import { useRouter } from "next/navigation"
export default function Login() {


    const [email, setemail] = useState<null | string>(null);
    const[password, setPassword] = useState<null | string>(null);
    const {setEmail,  setToken, clearAuthStorage} = useStore();


    const router = useRouter();


    useEffect(()=>{
        clearAuthStorage();
    },[useStore])
    const handleLogin = async () => {

        const user = {
            email: email? email : '',
            token: 'jdsjdskksklslslssklkslsls12343ndmmdmd@',
            firstName: 'Karthik',
            lastName: 'Mangineni'
        }

        setEmail(email? email : '');
        setToken(user.token);
        router.replace('/HomePage');
    }

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
                    fontSize: 28,
                    fontWeight: 700,
                    color: theme.palette.primary.main,
                    position: 'absolute',
                    top: 40,
                    left: 40
                }}>SoundWell</Typography>
                <Typography
                sx={{
                    color: 'black',
                    position: 'absolute',
                    top: 80,
                    left: 40,
                    fontSize: 9,
                    fontWeight: 700,
                }}
                >This Application is only for Admin(s)/Researcher(s)</Typography>
                <Card
                    sx={{

                        height: '60%',
                        width: "70%",
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
                           width: '88%'
                            
                        }} id="outlined-basic" label="Email" variant="outlined" 
                        type="email"
                        onChange={(e) => setemail(e.target.value)}
                        value={email}
                        />

                        {/**Password */}
                         <TextField 
                        sx={{
                           width: '88%'
                            
                        }} id="outlined-basic" label="Password" variant="outlined" 
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                        />
                    </Box>

                        <Button  
                    sx={{
                        width: '88%',
                        marginTop: 10
                    }}
                    variant="contained"
                    onClick={handleLogin}
                    >
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