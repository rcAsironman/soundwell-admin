'use client'
import { Box, Button, TextField, Typography } from "@mui/material";
import { backgroundContentCss, inputFieldCss, searchButtonBgColorCss, searchTextCss } from '@/app/css';

export default function UpdatePhrase() {

    const handleSearch = () => {

    }
    return (
        <Box sx={[backgroundContentCss]}>
            <Box sx={{
                display: 'flex',
                bgcolor: 'green',
                width: '70vw'
            }}>
                <TextField
                    label="Search"
                    placeholder="Search with phrase Code or Phrase..."
                    sx={[inputFieldCss, {border: '1px solid red'}]}
                />
                <Button onClick={handleSearch} sx={[searchButtonBgColorCss, {border: '1px solid red'}]}><Typography sx={[searchTextCss]}>Search</Typography></Button>
            </Box>
        </Box>
    );
}

