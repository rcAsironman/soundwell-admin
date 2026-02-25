'use client'
import { Box, Button, TextField, Typography } from "@mui/material";
import { titleCss, inputFieldCss } from "@/app/css";
import theme from "../theme";
import { useState } from "react";
import { baseUrl } from "@/constants";
import { useToast } from "../components/ToastProvider";
import { useStore } from "@/store/useStore";

export default function CreatePhrase() {


    const [code, setCode] = useState<string>('');
    const [phrase, setPhrase] = useState<string>('');
    const {token} = useStore();
    const {showToast} = useToast();

    const handleSubmit = async () => {

        const body = {
            code,
            phrase
        }

        const response = await fetch(`${baseUrl}/phrase/create-phrase`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            
            body: JSON.stringify(body)
        });

        if(!response.ok){
            showToast("Phrase not Created", "warning",3000);
            console.log('failed to submit');
        }
        else{
            showToast("Phrase Created", "success",3000);
            setCode('');
            setPhrase('');
        }

        
    }
    return (
        <Box
            sx={{
                bgcolor: '#F9F6EE',
                height: '100%',
                width: '100%',
                padding: 2,
                color: 'black',
                paddingTop: 4,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'start',
                alignItems: 'center'

            }}
        >
            {/**Heading */}
            <Typography sx={[titleCss, { mb: 6 }]}>Create New Phrases Here</Typography>
            {/** Code */}
            <TextField
                label="Code"
                placeholder="Enter Phrase Code"
                variant="outlined"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                sx={[inputFieldCss, {mb: 4}]}
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
                    width: '60%'
                }}
            />

            <Button sx={{
                width: '60%',
                height: 40,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                mt: 12

            }}
            onClick={handleSubmit}
            >Create</Button>

        </Box>
    );
}