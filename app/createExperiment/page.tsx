'use client';

import { Box, Card, TextField, Typography, Chip, Button, Tooltip } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { backgroundContentCss, inputFieldCss } from '../css';
import { baseUrl } from '@/constants';
import { useStore } from '@/store/useStore';
import { useToast } from '../components/ToastProvider';

type PhraseType = {
  id: number;
  code: string;
  phrase: string;
};

export type UserType = {
  id: number;
  firstName: string;
  lastName: string;
  userName: string | null;
  email?: string | null;
};

type CreateExperimentPayload = {
  experimentName: string;
  experimentCode: string;
  phraseIds: number[];
  userIds: number[];
};

export default function CreateExperiment() {
  const { token } = useStore();
  const { showToast } = useToast();

  const [experimentName, setExperimentName] = useState('');
  const [experimentCode, setExperimentCode] = useState('');

  // Phrase search
  const [phraseQuery, setPhraseQuery] = useState('');
  const [phrasePage, setPhrasePage] = useState(1);
  const phraseLimit = 10;
  const [phraseResult, setPhraseResult] = useState<PhraseType[]>([]);
  const [selectedPhrases, setSelectedPhrases] = useState<PhraseType[]>([]);
  const [phraseHasMore, setPhraseHasMore] = useState(true);
  const [phraseLoading, setPhraseLoading] = useState(false);

  // User search
  const [userSearchText, setUserSearchText] = useState('');
  const [userPage, setUserPage] = useState(1);
  const userLimit = 10;
  const [userResult, setUserResult] = useState<UserType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [userHasMore, setUserHasMore] = useState(true);
  const [userLoading, setUserLoading] = useState(false);

  // If you're using click-outside to clear, keep a wrapper ref.
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (searchWrapperRef.current && !searchWrapperRef.current.contains(event.target as Node)) {
        // clear only search lists (not selected items)
        setUserResult([]);
        setUserSearchText('');
        setUserPage(1);
        setUserHasMore(true);

        setPhraseResult([]);
        setPhraseQuery('');
        setPhrasePage(1);
        setPhraseHasMore(true);
      }
    };

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const addUser = (user: UserType) => {
    setSelectedUsers((prev) => (prev.some((u) => u.id === user.id) ? prev : [...prev, user]));
  };

  const addPhrase = (phrase: PhraseType) => {
    setSelectedPhrases((prev) => (prev.some((p) => p.id === phrase.id) ? prev : [...prev, phrase]));
  };

  const handleRemovePhrase = (id: number) => {
    setSelectedPhrases((prev) => prev.filter((p) => p.id !== id));
  };

  const handleRemoveUser = (id: number) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const clearSelectedPhrases = () => setSelectedPhrases([]);
  const clearSelectedUsers = () => setSelectedUsers([]);

  const clearPhraseResults = () => {
    setPhraseResult([]);
    setPhraseQuery('');
    setPhrasePage(1);
    setPhraseHasMore(true);
  };

  const clearUserResults = () => {
    setUserResult([]);
    setUserSearchText('');
    setUserPage(1);
    setUserHasMore(true);
  };

  const fetchPhrases = async (opts: { reset: boolean }) => {
    const q = phraseQuery.trim();
    if (!q) {
      showToast('Enter phrase search text', 'error', 2500);
      return;
    }

    const nextPage = opts.reset ? 1 : phrasePage;

    try {
      setPhraseLoading(true);

      const url = `${baseUrl}/phrase/fetchByNameOrCode?query=${encodeURIComponent(
        q
      )}&limit=${phraseLimit}&page=${nextPage}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Phrase search failed');

      const data = await res.json();
      const list: PhraseType[] = Array.isArray(data) ? data : [];

      setPhraseResult((prev) => (opts.reset ? list : [...prev, ...list]));
      setPhraseHasMore(list.length === phraseLimit);
      setPhrasePage(nextPage + 1);
    } catch (e) {
      showToast('Phrase result not found', 'error', 3000);
      setPhraseHasMore(false);
    } finally {
      setPhraseLoading(false);
    }
  };

  const fetchUsers = async (opts: { reset: boolean }) => {
    const q = userSearchText.trim();
    if (!q) {
      showToast('Enter user search text', 'error', 2500);
      return;
    }

    const nextPage = opts.reset ? 1 : userPage;

    try {
      setUserLoading(true);

      const url = `${baseUrl}/user/userByName?search=${encodeURIComponent(
        q
      )}&page=${nextPage}&limit=${userLimit}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('User search failed');

      const data = await res.json();
      const list: UserType[] = Array.isArray(data) ? data : [];

      setUserResult((prev) => (opts.reset ? list : [...prev, ...list]));
      setUserHasMore(list.length === userLimit);
      setUserPage(nextPage + 1);
    } catch (e) {
      showToast('User result not found', 'error', 3000);
      setUserHasMore(false);
    } finally {
      setUserLoading(false);
    }
  };

  const buildPayload = (): CreateExperimentPayload => ({
    experimentName: experimentName.trim(),
    experimentCode: experimentCode.trim(),
    phraseIds: selectedPhrases.map((p) => p.id),
    userIds: selectedUsers.map((u) => u.id),
  });

  const [creating, setCreating] = useState(false);

  const handleCreateExperiment = async () => {
    const payload = buildPayload();

    if (!payload.experimentName) {
      showToast('Experiment name is required', 'error', 3000);
      return;
    }
    if (!payload.experimentCode) {
      showToast('Experiment code is required', 'error', 3000);
      return;
    }
    if (payload.phraseIds.length === 0) {
      showToast('Select at least one phrase', 'error', 3000);
      return;
    }
    if (payload.userIds.length === 0) {
      showToast('Select at least one user', 'error', 3000);
      return;
    }

    try {
      setCreating(true);

      const res = await fetch(`${baseUrl}/experiment/create`, {
        method: 'POST',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || 'Create failed');
      }

      showToast('Experiment created', 'success', 2500);

      // Reset form
      setExperimentName('');
      setExperimentCode('');
      clearPhraseResults();
      clearUserResults();
      setSelectedPhrases([]);
      setSelectedUsers([]);
    } catch (e: any) {
      showToast('Create experiment failed', 'error', 3000);
    } finally {
      setCreating(false);
    }
  };

  const containerWidth = { xs: '92vw', sm: 720, md: 900 };

  return (
    <Box
      sx={[
        backgroundContentCss,
        {
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          py: 6,
        },
      ]}
    >
      <Card
        elevation={0}
        sx={{
          width: containerWidth,
          bgcolor: 'white',
          borderRadius: 3,
          p: { xs: 2, sm: 4 },
          border: '1px solid #e6e6e6',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'black' }}>
              Create new experiment
            </Typography>
            <Box sx={{ height: 2, width: 220, bgcolor: 'black', mt: 1 }} />
          </Box>

          {/* Basic fields */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              type="text"
              placeholder="Experiment Name here"
              label="Experiment Name"
              sx={[inputFieldCss]}
              size="small"
              value={experimentName}
              onChange={(e) => setExperimentName(e.target.value)}
            />

            <TextField
              type="text"
              placeholder="Experiment Code here"
              label="Experiment Code"
              sx={[inputFieldCss]}
              size="small"
              value={experimentCode}
              onChange={(e) => setExperimentCode(e.target.value)}
            />
          </Box>

          <Box
            ref={searchWrapperRef}
            sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}
          >
            {/* Phrases */}
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'black' }}>
                Search Phrases
              </Typography>

              <Box
                sx={{
                  mt: 1,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 120px' },
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <TextField
                  label="Search phrases"
                  size="small"
                  placeholder="Search with phrase or code..."
                  sx={[inputFieldCss]}
                  value={phraseQuery}
                  onChange={(e) => setPhraseQuery(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={() => fetchPhrases({ reset: true })}
                  disabled={phraseLoading}
                  sx={{ height: 40 }}
                >
                  {phraseLoading ? 'Loading...' : 'Search'}
                </Button>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                  gap: 2,
                }}
              >
                {/* Phrase Results */}
                {phraseResult.length > 0 && (
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 2,
                      p: 1,
                      height: 220,
                      overflowY: 'auto',
                      position: 'relative',
                    }}
                  >
                    <Button sx={{ position: 'absolute', top: 8, right: 8 }} onClick={clearPhraseResults}>
                      clear
                    </Button>

                    {phraseResult.map((phrase) => {
                      const isSelected = selectedPhrases.some((p) => p.id === phrase.id);

                      return (
                        <Box
                          key={phrase.id}
                          sx={{
                            px: 2,
                            py: 1.5,
                            mt: 0.5,
                            cursor: isSelected ? 'not-allowed' : 'pointer',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            opacity: isSelected ? 0.7 : 1,
                          }}
                          onClick={() => {
                            if (!isSelected) addPhrase(phrase);
                          }}
                        >
                          <Box>
                            <Typography sx={{ color: 'black' }}>
                              <b>Phrase</b>: {phrase.phrase}
                            </Typography>
                            <Typography sx={{ color: 'black', opacity: 0.8 }}>
                              <b>Code</b>: {phrase.code}
                            </Typography>
                          </Box>

                          {isSelected && (
                            <Chip
                              label="Selected"
                              size="small"
                              sx={{ borderRadius: 2, border: '1px solid #ccc', bgcolor: '#f2f2f2' }}
                            />
                          )}
                        </Box>
                      );
                    })}

                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                      {phraseHasMore ? (
                        <Button
                          variant="outlined"
                          onClick={() => fetchPhrases({ reset: false })}
                          disabled={phraseLoading}
                        >
                          {phraseLoading ? 'Loading...' : 'Load more'}
                        </Button>
                      ) : (
                        <Typography sx={{ color: 'black', opacity: 0.7 }}>End of results</Typography>
                      )}
                    </Box>
                  </Card>
                )}

                {/* Selected Phrases */}
                {selectedPhrases.length > 0 && (
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 2,
                      p: 2,
                      height: 220,
                      overflowY: 'auto',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      alignContent: 'flex-start',
                      position: 'relative',
                    }}
                  >
                    <Button sx={{ position: 'absolute', top: 8, right: 8 }} onClick={clearSelectedPhrases}>
                      clear
                    </Button>

                    {selectedPhrases.map((phrase) => (
                      <Chip
                        key={phrase.id}
                        label={phrase.code}
                        onDelete={() => handleRemovePhrase(phrase.id)}
                        sx={{ borderRadius: 2, border: '1px solid #ccc' }}
                      />
                    ))}
                  </Card>
                )}
              </Box>
            </Box>

            {/* Users */}
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'black' }}>
                Search Users
              </Typography>

              <Box
                sx={{
                  mt: 1,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 120px' },
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <TextField
                  label="Search users"
                  size="small"
                  placeholder="Search with first name, last name, email, username..."
                  sx={[inputFieldCss]}
                  value={userSearchText}
                  onChange={(e) => setUserSearchText(e.target.value)}
                />
                <Button
                  variant="contained"
                  onClick={() => fetchUsers({ reset: true })}
                  disabled={userLoading}
                  sx={{ height: 40 }}
                >
                  {userLoading ? 'Loading...' : 'Search'}
                </Button>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
                  gap: 2,
                }}
              >
                {/* User Results */}
                {userResult.length > 0 && (
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 2,
                      p: 1,
                      height: 220,
                      overflowY: 'auto',
                      position: 'relative',
                    }}
                  >
                    <Button sx={{ position: 'absolute', top: 8, right: 8 }} onClick={clearUserResults}>
                      clear
                    </Button>

                    {userResult.map((user) => {
                      const isSelected = selectedUsers.some((u) => u.id === user.id);

                      return (
                        <Box
                          key={user.id}
                          sx={{
                            px: 2,
                            py: 1.5,
                            mt: 0.5,
                            cursor: isSelected ? 'not-allowed' : 'pointer',
                            borderBottom: '1px solid #eee',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            opacity: isSelected ? 0.7 : 1,
                          }}
                          onClick={() => {
                            if (!isSelected) addUser(user);
                          }}
                        >
                          <Box>
                            <Typography sx={{ color: 'black' }}>
                              <b>Name</b>: {user.firstName} {user.lastName}
                            </Typography>
                            <Typography sx={{ color: 'black', opacity: 0.8 }}>
                              <b>Username</b>: {user.userName ?? '-'}
                            </Typography>
                            <Typography sx={{ color: 'black', opacity: 0.8 }}>
                              <b>Email</b>: {user.email ?? '-'}
                            </Typography>
                          </Box>

                          {isSelected && (
                            <Chip
                              label="Selected"
                              size="small"
                              sx={{ borderRadius: 2, border: '1px solid #ccc', bgcolor: '#f2f2f2' }}
                            />
                          )}
                        </Box>
                      );
                    })}

                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                      {userHasMore ? (
                        <Button variant="outlined" onClick={() => fetchUsers({ reset: false })} disabled={userLoading}>
                          {userLoading ? 'Loading...' : 'Load more'}
                        </Button>
                      ) : (
                        <Typography sx={{ color: 'black', opacity: 0.7 }}>End of results</Typography>
                      )}
                    </Box>
                  </Card>
                )}

                {/* Selected Users */}
                {selectedUsers.length > 0 && (
                  <Card
                    variant="outlined"
                    sx={{
                      bgcolor: 'white',
                      borderRadius: 2,
                      p: 2,
                      height: 220,
                      overflowY: 'auto',
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 1,
                      alignContent: 'flex-start',
                      position: 'relative',
                    }}
                  >
                    <Button sx={{ position: 'absolute', top: 8, right: 8 }} onClick={clearSelectedUsers}>
                      clear
                    </Button>

                    {selectedUsers.map((user) => {
                      const label = user.userName ?? user.firstName;

                      if (!user.userName) {
                        return (
                          <Tooltip key={user.id} title="User not activated their account" placement="top">
                            <Chip
                              label={label}
                              onDelete={() => handleRemoveUser(user.id)}
                              sx={{
                                borderRadius: 2,
                                border: '1px solid #ccc',
                                opacity: 0.65,
                                bgcolor: '#fafafa',
                              }}
                            />
                          </Tooltip>
                        );
                      }

                      return (
                        <Chip
                          key={user.id}
                          label={label}
                          onDelete={() => handleRemoveUser(user.id)}
                          sx={{ borderRadius: 2, border: '1px solid #ccc' }}
                        />
                      );
                    })}
                  </Card>
                )}
              </Box>
            </Box>
          </Box>

          {/* Submit */}
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setExperimentName('');
                setExperimentCode('');
                clearPhraseResults();
                clearUserResults();
                setSelectedPhrases([]);
                setSelectedUsers([]);
              }}
              disabled={creating}
            >
              Reset
            </Button>

            <Button variant="contained" onClick={handleCreateExperiment} disabled={creating}>
              {creating ? 'Creating...' : 'Create Experiment'}
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}