'use client'

import { Box, Card, Typography, useTheme, TextField, Button, Alert } from "@mui/material"
import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useStore } from "@/store/useStore"
import { useRouter } from "next/navigation"




export default function Login() {


    const [email, setemail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const { setEmail, setToken, clearAuthStorage, setFirstName, setLastName } = useStore();
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    const router = useRouter();


    useEffect(() => {
        console.log("This is base url : ", BASE_URL);
        clearAuthStorage();
    }, [useStore])


    const handleLogin = async () => {


        let data;
        try {
            const response = await fetch(`${BASE_URL}/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            if (!response.ok) {
                const res = await response.json();
                throw new Error(res.message || 'Network response was not ok')
            }


            data = await response.json();
            console.log(data);
            setEmail(email ? email : '');
            setToken(data?.token);
            setFirstName(data?.result?.firstName);
            setLastName(data?.result?.lastName);
            router.replace('/homePage');

        }
        catch (error) {
            window.alert(JSON.stringify(error));
        }

        const user = {
            email: email ? email : '',
            token: 'jdsjdskksklslslssklkslsls12343ndmmdmd@',
            firstName: 'Karthik',
            lastName: 'Mangineni'
        }


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
                            mb: 4

                        }}
                    >
                        Login

                    </Typography>

                    <Box
                        component="form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleLogin();
                        }}
                        sx={{
                            display: "flex",
                            flexDirection: 'column',
                            justifyContent: 'space-evenly',
                            height: '40%'

                        }}
                    >

                        {/**Email */}
                        <TextField

                            sx={{
                                width: '88%',
                                mb: 4

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
                        <Button
                            type="submit"
                            sx={{
                                width: '88%',
                                marginTop: 2
                            }}
                            variant="contained"
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
                    </Box>
                </Card>
            </Box>
        </Box>
    )
}