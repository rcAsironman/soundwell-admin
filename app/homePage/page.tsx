'use client'
import { Box, Button, Typography } from "@mui/material"
import ExperimentWidget from "../components/ExperimentWidget"
import { useState, useRef, useEffect } from "react";
import SearchUser from '../components/Search'
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useStore } from "@/store/useStore";


type UserType = {
    id: number
    firstName: string
    lastName: string
    username: string
    email: string
}

export default function HomePage() {

    const [searchText, setSearchText] = useState('');
    const [userResults, setUserResults] = useState<UserType[]>([])
    const searchResultRef = useRef<HTMLElement | null>(null);
    const {firstName, lastName} = useStore();

    useEffect(()=>{

        const handleClick = (event: MouseEvent) => {
            if(searchResultRef.current && !searchResultRef.current.contains(event.target as Node)){
               clearSearchResult();
            }
        }

        document.addEventListener('mousedown', handleClick);

        return() => {
            document.removeEventListener('mousedown', handleClick);
        }

    },[])
    const clearSearchResult = () => {
        setUserResults([]);
        setSearchText('');
    }

    return (
        <Box sx={{
            bgcolor: '#F9F6EE',
            height: '100%',
            width: '100%',
            padding: 2,
            color: 'black',
        }}>
            <Typography style={{fontSize: 20,fontWeight: 600}}>Hello,</Typography>
            <Typography style={{fontWeight: 600}}>{firstName}, {lastName}</Typography>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                height: '8%',
                maxWidth: '100%',

            }}>
                < SearchUser value={searchText} onChange={setSearchText} onResult={setUserResults} />

                {
                    userResults.length > 0 && (
                        <Box 
                        ref={searchResultRef}
                        sx={{
                            position: 'absolute',
                            bgcolor: 'white',
                            width: '52%',
                            height: 300,
                            zIndex: 1,
                            top: 120,
                            overflowY: 'auto',
                            borderRadius: 2,

                        }}>
                            <Button sx={{
                                position: 'absolute',
                                top: 0,
                                right: 0,
                            }}
                                onClick={() => clearSearchResult()}
                            >clear</Button>

                            {
                                userResults.map((user) => (
                                    <div key={user.id} style={{
                                        padding: "10px 30px",
                                        marginTop: 20,
                                        marginBottom: 0,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        cursor: 'pointer',
                                    }}>
                                        {user.firstName} {user.lastName} - {user.email}
                                        <AccountCircleIcon />
                                    </div>
                                ))
                            }
                        </Box>
                    )
                }
            </Box>
            {/**Experiments widget */}
            <Box sx={{
                position: 'relative',
                top: 50,
            }}>
                <ExperimentWidget />
            </Box>

        </Box>
    )
}