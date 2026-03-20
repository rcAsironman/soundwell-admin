'use client';

import { Box, Card, TextField, Typography, Chip, Button, Tooltip, CircularProgress } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { backgroundContentCss, inputFieldCss } from '../css';
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

type PaginatedUsersResponse = {
  users: UserType[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

type PaginatedPhrasesResponse = {
  phrases: any[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

function uniqueById<T extends { id: number }>(arr: T[]): T[] {
  const map = new Map<number, T>();
  for (const item of arr) map.set(item.id, item);
  return Array.from(map.values());
}

function normalizePhrase(p: any): PhraseType {
  return {
    id: Number(p.id),
    code: p.code ?? p.phraseCode ?? '',
    phrase: p.phrase ?? '',
  };
}

export default function CreateExperiment() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { token } = useStore();
  const { showToast } = useToast();

  const [experimentName, setExperimentName] = useState('');
  const [experimentCode, setExperimentCode] = useState('');

  const phraseLimit = 10;
  const userLimit = 10;

  // phrases: all list
  const [allPhrases, setAllPhrases] = useState<PhraseType[]>([]);
  const [allPhrasesPage, setAllPhrasesPage] = useState(1);
  const [allPhrasesHasMore, setAllPhrasesHasMore] = useState(true);
  const [allPhrasesLoading, setAllPhrasesLoading] = useState(false);
  const [allPhrasesInitialLoading, setAllPhrasesInitialLoading] = useState(true);

  // phrases: search list
  const [phraseQuery, setPhraseQuery] = useState('');
  const [searchedPhrases, setSearchedPhrases] = useState<PhraseType[]>([]);
  const [searchedPhrasesPage, setSearchedPhrasesPage] = useState(1);
  const [searchedPhrasesHasMore, setSearchedPhrasesHasMore] = useState(true);
  const [searchedPhrasesLoading, setSearchedPhrasesLoading] = useState(false);
  const [isPhraseSearchMode, setIsPhraseSearchMode] = useState(false);

  // users: all list
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [allUsersPage, setAllUsersPage] = useState(1);
  const [allUsersHasMore, setAllUsersHasMore] = useState(true);
  const [allUsersLoading, setAllUsersLoading] = useState(false);
  const [allUsersInitialLoading, setAllUsersInitialLoading] = useState(true);

  // users: search list
  const [userSearchText, setUserSearchText] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<UserType[]>([]);
  const [searchedUsersPage, setSearchedUsersPage] = useState(1);
  const [searchedUsersHasMore, setSearchedUsersHasMore] = useState(true);
  const [searchedUsersLoading, setSearchedUsersLoading] = useState(false);
  const [isUserSearchMode, setIsUserSearchMode] = useState(false);

  const [selectedPhrases, setSelectedPhrases] = useState<PhraseType[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);

  const phraseScrollRef = useRef<HTMLDivElement | null>(null);
  const userScrollRef = useRef<HTMLDivElement | null>(null);

  const didInitialUsersFetchRef = useRef(false);
  const didInitialPhrasesFetchRef = useRef(false);

  const displayedPhrases = useMemo(
    () => (isPhraseSearchMode ? searchedPhrases : allPhrases),
    [isPhraseSearchMode, searchedPhrases, allPhrases]
  );

  const displayedUsers = useMemo(
    () => (isUserSearchMode ? searchedUsers : allUsers),
    [isUserSearchMode, searchedUsers, allUsers]
  );

  const displayedPhraseLoading = isPhraseSearchMode ? searchedPhrasesLoading : allPhrasesLoading;
  const displayedPhraseHasMore = isPhraseSearchMode ? searchedPhrasesHasMore : allPhrasesHasMore;

  const displayedUserLoading = isUserSearchMode ? searchedUsersLoading : allUsersLoading;
  const displayedUserHasMore = isUserSearchMode ? searchedUsersHasMore : allUsersHasMore;

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

  const fetchAllPhrases = useCallback(async (pageToFetch: number, reset = false) => {
    if (!token) return;

    try {
      setAllPhrasesLoading(true);

      const res = await fetch(
        `${BASE_URL}/phrase/fetchAllWithPagination?page=${pageToFetch}&limit=${phraseLimit}`,
        {
          method: 'GET',
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Failed to fetch phrases');
      }

      const data: PaginatedPhrasesResponse = await res.json();
      const normalized = (data.phrases ?? []).map(normalizePhrase);

      setAllPhrases((prev) => (reset ? normalized : uniqueById([...prev, ...normalized])));
      setAllPhrasesHasMore(Boolean(data.hasMore));
      setAllPhrasesPage(pageToFetch + 1);
    } catch {
      showToast('Failed to fetch phrases', 'error', 2500);
      setAllPhrasesHasMore(false);
    } finally {
      setAllPhrasesLoading(false);
      setAllPhrasesInitialLoading(false);
    }
  }, [BASE_URL, token, phraseLimit, showToast]);

  const fetchAllUsers = useCallback(async (pageToFetch: number, reset = false) => {
    if (!token) return;

    try {
      setAllUsersLoading(true);

      const res = await fetch(
        `${BASE_URL}/user/fetchAllWithPagination?page=${pageToFetch}&limit=${userLimit}`,
        {
          method: 'GET',
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || 'Failed to fetch users');
      }

      const data: PaginatedUsersResponse = await res.json();

      setAllUsers((prev) => (reset ? data.users : uniqueById([...prev, ...data.users])));
      setAllUsersHasMore(Boolean(data.hasMore));
      setAllUsersPage(pageToFetch + 1);
    } catch {
      showToast('Failed to fetch users', 'error', 2500);
      setAllUsersHasMore(false);
    } finally {
      setAllUsersLoading(false);
      setAllUsersInitialLoading(false);
    }
  }, [BASE_URL, token, userLimit, showToast]);

  const searchPhrases = useCallback(async (pageToFetch: number, reset = false) => {
    const q = phraseQuery.trim();
    if (!q) {
      showToast('Enter phrase search text', 'error', 2500);
      return;
    }

    try {
      setSearchedPhrasesLoading(true);
      setIsPhraseSearchMode(true);

      const url = `${BASE_URL}/phrase/fetchByNameOrCode?query=${encodeURIComponent(
        q
      )}&limit=${phraseLimit}&page=${pageToFetch}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('Phrase search failed');

      const data = await res.json();
      const rawList: any[] = Array.isArray(data) ? data : [];
      const list: PhraseType[] = rawList.map(normalizePhrase);

      setSearchedPhrases((prev) => (reset ? list : uniqueById([...prev, ...list])));
      setSearchedPhrasesHasMore(list.length === phraseLimit);
      setSearchedPhrasesPage(pageToFetch + 1);
    } catch {
      showToast('Phrase result not found', 'error', 3000);
      setSearchedPhrasesHasMore(false);
    } finally {
      setSearchedPhrasesLoading(false);
    }
  }, [BASE_URL, token, phraseQuery, phraseLimit, showToast]);

  const searchUsers = useCallback(async (pageToFetch: number, reset = false) => {
    const q = userSearchText.trim();
    if (!q) {
      showToast('Enter user search text', 'error', 2500);
      return;
    }

    try {
      setSearchedUsersLoading(true);
      setIsUserSearchMode(true);

      const url = `${BASE_URL}/user/userByName?search=${encodeURIComponent(
        q
      )}&page=${pageToFetch}&limit=${userLimit}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error('User search failed');

      const data = await res.json();
      const list: UserType[] = Array.isArray(data) ? data : [];

      setSearchedUsers((prev) => (reset ? list : uniqueById([...prev, ...list])));
      setSearchedUsersHasMore(list.length === userLimit);
      setSearchedUsersPage(pageToFetch + 1);
    } catch {
      showToast('User result not found', 'error', 3000);
      setSearchedUsersHasMore(false);
    } finally {
      setSearchedUsersLoading(false);
    }
  }, [BASE_URL, token, userSearchText, userLimit, showToast]);

  useEffect(() => {
    if (!token) return;
    if (didInitialUsersFetchRef.current) return;
    didInitialUsersFetchRef.current = true;
    fetchAllUsers(1, true);
  }, [token, fetchAllUsers]);

  useEffect(() => {
    if (!token) return;
    if (didInitialPhrasesFetchRef.current) return;
    didInitialPhrasesFetchRef.current = true;
    fetchAllPhrases(1, true);
  }, [token, fetchAllPhrases]);

  const handlePhraseScroll = () => {
    const el = phraseScrollRef.current;
    if (!el || displayedPhraseLoading || !displayedPhraseHasMore) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (!nearBottom) return;

    if (isPhraseSearchMode) {
      searchPhrases(searchedPhrasesPage, false);
    } else {
      fetchAllPhrases(allPhrasesPage, false);
    }
  };

  const handleUserScroll = () => {
    const el = userScrollRef.current;
    if (!el || displayedUserLoading || !displayedUserHasMore) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (!nearBottom) return;

    if (isUserSearchMode) {
      searchUsers(searchedUsersPage, false);
    } else {
      fetchAllUsers(allUsersPage, false);
    }
  };

  const clearPhraseResults = () => {
    setPhraseQuery('');
    setIsPhraseSearchMode(false);
    setSearchedPhrases([]);
    setSearchedPhrasesPage(1);
    setSearchedPhrasesHasMore(true);
  };

  const clearUserResults = () => {
    setUserSearchText('');
    setIsUserSearchMode(false);
    setSearchedUsers([]);
    setSearchedUsersPage(1);
    setSearchedUsersHasMore(true);
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

      const res = await fetch(`${BASE_URL}/experiment/create`, {
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

      setExperimentName('');
      setExperimentCode('');
      setSelectedPhrases([]);
      setSelectedUsers([]);
      clearPhraseResults();
      clearUserResults();
    } catch {
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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
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
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  searchPhrases(1, true);
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
                  type="submit"
                  disabled={searchedPhrasesLoading}
                  sx={{ height: 40 }}
                >
                  {searchedPhrasesLoading && isPhraseSearchMode ? 'Loading...' : 'Search'}
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
                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    p: 1,
                    height: 260,
                    overflowY: 'auto',
                    position: 'relative',
                  }}
                  ref={phraseScrollRef}
                  onScroll={handlePhraseScroll}
                >
                  <Box
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      bgcolor: 'white',
                      pb: 1,
                      px: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <Typography sx={{ color: 'black', fontWeight: 700, fontSize: 14 }}>
                      {isPhraseSearchMode ? 'Phrase Search Results' : 'All Phrases'}
                    </Typography>
                    <Button onClick={clearPhraseResults}>clear</Button>
                  </Box>

                  {allPhrasesInitialLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                      <CircularProgress size={28} />
                    </Box>
                  ) : displayedPhrases.length === 0 ? (
                    <Typography sx={{ color: 'black', opacity: 0.7, textAlign: 'center', py: 4 }}>
                      No phrases to display
                    </Typography>
                  ) : (
                    <>
                      {displayedPhrases.map((phrase) => {
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

                      {displayedPhraseLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      )}

                      {!displayedPhraseHasMore && displayedPhrases.length > 0 && (
                        <Typography sx={{ color: 'black', opacity: 0.7, textAlign: 'center', py: 1.5 }}>
                          End of results
                        </Typography>
                      )}
                    </>
                  )}
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    p: 2,
                    height: 260,
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

                  {selectedPhrases.length === 0 ? (
                    <Typography sx={{ color: 'black', opacity: 0.7 }}>
                      No phrases selected
                    </Typography>
                  ) : (
                    selectedPhrases.map((phrase) => (
                      <Chip
                        key={phrase.id}
                        label={phrase.code}
                        onDelete={() => handleRemovePhrase(phrase.id)}
                        sx={{ borderRadius: 2, border: '1px solid #ccc' }}
                      />
                    ))
                  )}
                </Card>
              </Box>
            </Box>

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
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  searchUsers(1, true);
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
                  type="submit"
                  disabled={searchedUsersLoading}
                  sx={{ height: 40 }}
                >
                  {searchedUsersLoading && isUserSearchMode ? 'Loading...' : 'Search'}
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
                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    p: 1,
                    height: 260,
                    overflowY: 'auto',
                    position: 'relative',
                  }}
                  ref={userScrollRef}
                  onScroll={handleUserScroll}
                >
                  <Box
                    sx={{
                      position: 'sticky',
                      top: 0,
                      zIndex: 1,
                      bgcolor: 'white',
                      pb: 1,
                      px: 1,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid #eee',
                    }}
                  >
                    <Typography sx={{ color: 'black', fontWeight: 700, fontSize: 14 }}>
                      {isUserSearchMode ? 'User Search Results' : 'All Users'}
                    </Typography>
                    <Button onClick={clearUserResults}>clear</Button>
                  </Box>

                  {allUsersInitialLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                      <CircularProgress size={28} />
                    </Box>
                  ) : displayedUsers.length === 0 ? (
                    <Typography sx={{ color: 'black', opacity: 0.7, textAlign: 'center', py: 4 }}>
                      No users to display
                    </Typography>
                  ) : (
                    <>
                      {displayedUsers.map((user) => {
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

                      {displayedUserLoading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                          <CircularProgress size={24} />
                        </Box>
                      )}

                      {!displayedUserHasMore && displayedUsers.length > 0 && (
                        <Typography sx={{ color: 'black', opacity: 0.7, textAlign: 'center', py: 1.5 }}>
                          End of results
                        </Typography>
                      )}
                    </>
                  )}
                </Card>

                <Card
                  variant="outlined"
                  sx={{
                    bgcolor: 'white',
                    borderRadius: 2,
                    p: 2,
                    height: 260,
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

                  {selectedUsers.length === 0 ? (
                    <Typography sx={{ color: 'black', opacity: 0.7 }}>
                      No users selected
                    </Typography>
                  ) : (
                    selectedUsers.map((user) => {
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
                    })
                  )}
                </Card>
              </Box>
            </Box>
          </Box>

          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setExperimentName('');
                setExperimentCode('');
                setSelectedPhrases([]);
                setSelectedUsers([]);
                clearPhraseResults();
                clearUserResults();
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