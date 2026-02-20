'use client'
import { Widgets } from "@mui/icons-material";
import { Box, Card, TextField, Typography, Chip, Button } from "@mui/material";
import { useEffect, useState } from "react";
import SearchPhrase from "../components/SearchPhrase";
import { UserType } from "../components/Search";
import SearchUser from "../components/Search";


const titleCss = {
    fontSize: 20,
    fontWeight: 600,

}



type PhraseType = {
    id: number,
    code: string,
    phrase: string
}




export default function CreateExperiment() {


    const [experimentName, setExperimentName] = useState('');
    const [experimentCode, setExperimentCode] = useState('');
    const [userIds, setUserIds] = useState<number[]>([]);
    const [selectedPhrases, setSelectedPhrases] = useState<PhraseType[]>([]);
    const [phraseResult, setPhraseResult] = useState<PhraseType[]>([]);
    const [userResult, setUserResult] = useState<UserType[]>([])
    const [selectedUsers, setSelectedUsers] = useState<UserType[]>([])



    const addUser = (user: UserType) => {
        setSelectedUsers((prev) =>
            prev.some((u) => u.id === user.id) ? prev : [...prev, user]
        )
    }

    const addPhrases = (phrase: PhraseType) => {
        setSelectedPhrases((prev) => {
            const alreadyExists = prev.some(
                (item) => item.id === phrase.id
            )

            if (alreadyExists) {
                return prev // do nothing
            }

            return [...prev, phrase]
        })

    }

    const clearSearchResult = () => {
        setPhraseResult([]);
    }
    const clearUserSearchResult = () => setUserResult([])
    const clearSelectedUsers = () => setSelectedUsers([])
    const clearSelectedPhrases = () => setSelectedPhrases([])

    const handleRemove = (id: number) => {
        setSelectedPhrases((prev) => prev.filter((item) => item.id != id));
    }



    const handleRemoveUser = (id: number) => {
        setSelectedUsers((prev) => prev.filter((item) => item.id != id));
    }
    return (<Box
        sx={{
            height: '100%',
            width: '100%',
            bgcolor: '#F9F6EE',
            color: 'black',
            padding: 2,
        }}
    >
        <Typography sx={{ fontSize: 18, fontWeight: 600 }}>Create new experiment</Typography>
        <Box sx={{ height: 2, width: 204, bgcolor: 'black' }}></Box>

        {/**
         * 
         * {
  "experimentName": "Memory Test 01",
  "experimentCode": "EXP001",
  "phraseIds": [
    1,
    2,
    3
  ],
  "userIds": [
    1,
    2,
    3
  ]
}
         */}


        <Box sx={{
            height: '90%',
            marginTop: 2,

        }}>
            <TextField
                type="text"
                placeholder="Experiment Name here"
                label="Experiment Name"
                sx={{ width: '60%', marginBottom: 2 }}
                size="small"
                onChange={(e) => setExperimentName(e.target.value)}
            />

            <TextField
                type="text"
                placeholder="Experiment Code here"
                label="Experiment Code"
                sx={{ width: '60%', marginBottom: 2 }}
                size="small"
                onChange={(e) => setExperimentName(e.target.value)}
            />

            <Typography sx={{ fontSize: 18, fontWeight: 600 }}>Search Phrases</Typography>

            <Box sx={{
                marginTop: '2%',
                width: '80%',
            }}>
                <SearchPhrase onResult={setPhraseResult} />
                <Box
                    sx={{
                        display: 'flex',

                    }}
                >
                    {/***Search Result */}
                    {
                        phraseResult.length > 0 && (
                            <Box
                                sx={{
                                    overflowY: 'auto',
                                    width: '65%',
                                    height: 200,
                                    bgcolor: '#E8E8E8',
                                    mt: 2,
                                    position: 'relative'

                                }}
                            >
                                <Button sx={{
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                }}
                                    onClick={() => clearSearchResult()}
                                >clear</Button>

                                {
                                    phraseResult?.map((phrase) => {
                                        return (
                                            <Box
                                                key={phrase.id}
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 0.5,
                                                    width: '100%',
                                                    px: 3,
                                                    py: 1.5,
                                                    mt: 1,
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid #ccc',
                                                }}
                                                onClick={() => addPhrases(phrase)}

                                            >
                                                <Typography sx={{ display: 'flex' }}><Typography sx={{ fontWeight: 600 }}>Phrase</Typography> : {phrase.phrase.slice(0, 20)}</Typography>
                                                <Typography sx={{ display: 'flex' }}><Typography sx={{ fontWeight: 600 }}>Code</Typography> : {phrase.code.slice(0, 20)}</Typography>
                                            </Box>
                                        )
                                    })
                                }
                            </Box>
                        )
                    }

                    {/** selected Phrases */}
                    {
                        selectedPhrases.length > 0 && (
                            <Card
                                sx={{
                                    height: 200,
                                    width: '30%',
                                    overflowY: 'auto',
                                    mt: 2,
                                    ml: 5,
                                    p: 2,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 1,
                                    alignContent: 'flex-start',
                                    position: 'relative',
                                }}
                            >
                                <Button
                                    sx={{ position: 'absolute', top: 0, right: 0 }}
                                    onClick={clearSelectedPhrases}
                                >
                                    clear
                                </Button>
                                {
                                    selectedPhrases?.map((phrase) => {
                                        return (
                                            <Chip
                                                label={phrase.code}
                                                onDelete={() => handleRemove(phrase.id)}
                                                sx={{
                                                    backgroundColor: '#e0e0e0',
                                                    borderRadius: 2,
                                                    width: 80,
                                                    border: '1px solid'
                                                }}
                                            />
                                        )
                                    })
                                }

                            </Card>
                        )
                    }
                </Box>
            </Box>


            <Typography sx={{ fontSize: 18, fontWeight: 600, marginTop: 5}}>Search Users</Typography>

            <Box sx={{ marginTop: '2%', width: '80%' }}>
                <SearchUser onResult={setUserResult} />

                <Box sx={{ display: 'flex' }}>
                    {/* Search Result */}
                    {userResult.length > 0 && (
                        <Box
                            sx={{
                                overflowY: 'auto',
                                width: '65%',
                                height: 200,
                                bgcolor: '#E8E8E8',
                                mt: 2,
                                position: 'relative',
                                p: 1,
                            }}
                        >
                            <Button
                                sx={{ position: 'absolute', top: 0, right: 0, }}
                                onClick={clearUserSearchResult}
                            >
                                clear
                            </Button>

                            {userResult.map((user) => (
                                <Box
                                    key={user.id}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 0.5,
                                        width: '100%',
                                        px: 3,
                                        py: 1.5,
                                        mt: 1,
                                        cursor: 'pointer',
                                        borderBottom: '1px solid #ccc',
                                    }}
                                    onClick={() => addUser(user)}
                                >
                                    <Typography>
                                        <b>Name</b>: {user.firstName} {user.lastName}
                                    </Typography>
                                    <Typography>
                                        <b>Username</b>: {user.username}
                                    </Typography>
                                    <Typography>
                                        <b>Email</b>: {user.email}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                        <Card
                            sx={{
                                height: 200,
                                width: '30%',
                                overflowY: 'auto',
                                mt: 2,
                                ml: 5,
                                p: 2,
                                display: 'flex',
                                flexWrap: 'wrap',
                                gap: 1,
                                alignContent: 'flex-start',
                                position: 'relative',
                            }}
                        >
                            <Button
                                sx={{ position: 'absolute', top: 0, right: 0 }}
                                onClick={clearSelectedUsers}
                            >
                                clear
                            </Button>

                            {selectedUsers.map((user) => (
                                <Chip
                                    key={user.id}
                                    label={user.username}
                                    onDelete={() => handleRemove(user.id)}
                                    sx={{
                                        backgroundColor: '#e0e0e0',
                                        borderRadius: 2,
                                        border: '1px solid',
                                    }}
                                />
                            ))}
                        </Card>
                    )}
                </Box>
            </Box>

        </Box>

    </Box>);
}