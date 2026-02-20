'use client'
import { type Dispatch, type SetStateAction, type ChangeEvent, type FormEvent, useState, useEffect } from 'react'
import { TextField, Button, Typography, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';


type PhraseType = {
    id: number,
    code: string,
    phrase: string
}
type SearchBarProps = {
    onResult: (result: PhraseType[]) => void
}


const SearchPhrase = ({ onResult }: SearchBarProps) => {

    const [query, setQuery] = useState('');

    useEffect(() => {
        if (query === '') {
            onResult([]);
        }
    }, [query])
    const handleSearch = async () => {
        const data: PhraseType[] = [
            { id: 1, code: 'CJ1', phrase: `${query} result 1` },
            { id: 2, code: 'CJ2', phrase: `${query} result 2` },
            { id: 3, code: 'CJ3', phrase: `${query} result 3` },
            { id: 4, code: 'CJ4', phrase: `${query} result 4` },
            { id: 5, code: 'CJ5', phrase: `${query} result 5` },
            { id: 6, code: 'CJ6', phrase: `${query} result 6` },
            { id: 7, code: 'CJ7', phrase: `${query} result 7` },
            { id: 8, code: 'CJ8', phrase: `${query} result 8` },
            { id: 9, code: 'CJ9', phrase: `${query} result 9` },
            { id: 10, code: 'CJ10', phrase: `${query} result 10` },
            { id: 11, code: 'CJ11', phrase: `${query} result 11` },
            { id: 12, code: 'CJ12', phrase: `${query} result 12` },
        ];


        onResult(data);
    };
    return (
        <Box sx={{
            width: '80%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',

        }}>

            <TextField
                id="search-bar"
                className="text"
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                size="small"
                value={query}
                sx={{
                    width: '90%',

                }}
            />


            <Button
                variant="contained"
                sx={{ ml: 2 }}
                onClick={handleSearch}
                startIcon={<SearchIcon />}
            >
                <Typography>Search</Typography>
            </Button>

        </Box>);

};

export default SearchPhrase;