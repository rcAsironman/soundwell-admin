'use client'
import { Box, Button, TextField, Typography, Card, CardContent } from "@mui/material";
import { titleCss, inputFieldCss, backgroundContentCss } from "@/app/css";
import theme from "../theme";
import { useState } from "react";
import { useToast } from "../components/ToastProvider";
import { useStore } from "@/store/useStore";

export default function CreatePhrase() {

    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const [code, setCode] = useState<string>('');
    const [phrase, setPhrase] = useState<string>('');
    const { token } = useStore();
    const { showToast } = useToast();

    const handleSubmit = async () => {

        const body = {
            code,
            phrase
        }

        const response = await fetch(`${BASE_URL}/phrase/create-phrase`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify(body)
        });

        if (!response.ok) {
            showToast("Phrase not Created", "warning", 3000);
            console.log('failed to submit');
        }
        else {
            showToast("Phrase Created", "success", 3000);
            setCode('');
            setPhrase('');
        }


    }
    return (
        <Box
            sx={[backgroundContentCss]}
        >
            <center>
                <Card sx={{ width: 650, height: 500, mt: 10, borderRadius: 3, py: 0 }}>
                    <CardContent>
                        {/**Heading */}
                        <Typography sx={[titleCss, { mb: 6 }]}>Create New Phrase</Typography>
                        {/** Code */}
                        <TextField
                            label="Code"
                            placeholder="Enter Phrase Code"
                            variant="outlined"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            sx={[inputFieldCss, { mb: 2, width: '80%'}]}
                        />
                        {/** Phrase */}
                        <TextField
                            label="Phrase"
                            placeholder="Enter Phrase Here"
                            fullWidth
                            multiline
                            rows={9}          // visible rows
                            // value={value}
                            // onChange={(e) => setValue(e.target.value)}
                            variant="outlined"
                            value={phrase}
                            onChange={(e) => setPhrase(e.target.value)}
                            sx={{
                                width: '80%'
                            }}
                        />

                        <Button sx={{
                            width: '80%',
                            height: 40,
                            bgcolor: theme.palette.primary.main,
                            color: 'white',
                            mt: 12

                        }}
                            onClick={handleSubmit}
                        >Create</Button>
                    </CardContent>
                </Card>
            </center>

        </Box>
    );
}