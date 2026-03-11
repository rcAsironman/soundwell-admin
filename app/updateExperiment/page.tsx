'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  IconButton,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { useStore } from '@/store/useStore';
import { useToast } from '../components/ToastProvider';
import {
  backgroundContentCss,
  inputFieldCss,
  searchButtonBgColorCss,
  searchTextCss,
} from '@/app/css';



type ExperimentListItem = {
  id: number;
  experimentName: string;
  experimentCode: string;
  usersCount?: number;
  phrasesCount?: number;
};

type UserType = {
  id: number;
  userName: string | null;
  firstName: string;
  lastName: string;
  email?: string;
};

type PhraseType = {
  id: number;
  phraseCode: string;
  phrase: string;
};

type FetchByIdResponse = {
  users: Array<{ user: UserType }>;
  phrases: Array<{ phrase: PhraseType }>;
};

type UpdateExperimentPayload = {
  id: string;
  experimentName: string;
  addPhraseIds: number[];
  removePhraseIds: number[];
  addUserIds: number[];
  removeUserIds: number[];
};

function uniqueById<T extends { id: number }>(arr: T[]): T[] {
  const map = new Map<number, T>();
  for (const item of arr) map.set(item.id, item);
  return Array.from(map.values());
}

function displayUserLabel(u: UserType) {
  if (u.userName && u.userName.trim().length > 0) return u.userName;
  return u.firstName;
}

function normalizePhraseFromSearch(p: any): PhraseType {
  return {
    id: p.id,
    phraseCode: p.phraseCode ?? p.code ?? '',
    phrase: p.phrase ?? '',
  };
}

export default function UpdateExperimentPage() {
  
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { token } = useStore();
  const { showToast } = useToast();

  // Experiment search (top)
  const [query, setQuery] = useState('');
  const [expPage, setExpPage] = useState(1);
  const expLimit = 10;

  const [expResults, setExpResults] = useState<ExperimentListItem[]>([]);
  const [expLoading, setExpLoading] = useState(false);
  const [expHasMore, setExpHasMore] = useState(true);

  const expResultsRef = useRef<HTMLDivElement | null>(null);

  const clearExperimentSearch = () => {
    setExpResults([]);
    setQuery('');
    setExpPage(1);
    setExpHasMore(true);
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (expResultsRef.current && !expResultsRef.current.contains(event.target as Node)) {
        clearExperimentSearch();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchExperiments = async (opts: { reset: boolean }) => {
    const q = query.trim();
    if (!q) {
      showToast('Enter search text', 'error', 2500);
      return;
    }

    const nextPage = opts.reset ? 1 : expPage;

    try {
      setExpLoading(true);

      const url = `${BASE_URL}/experiment/fetchByNameOrCode?query=${encodeURIComponent(
        q
      )}&page=${nextPage}&limit=${expLimit}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setExpHasMore(false);
        throw new Error('Search failed');
      }

      const data = await res.json();

      const list: ExperimentListItem[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : data
        ? [data as ExperimentListItem]
        : [];

      setExpResults((prev) => (opts.reset ? list : uniqueById([...prev, ...list])));
      setExpHasMore(list.length === expLimit);
      setExpPage(nextPage + 1);
    } catch (e) {
      showToast('Result Not Found', 'error', 3000);
    } finally {
      setExpLoading(false);
    }
  };

  // Overlay state
  const [open, setOpen] = useState(false);
  const [activeExperimentId, setActiveExperimentId] = useState<number | null>(null);
  const [newName, setNewName] = useState('');

  const [overlayLoading, setOverlayLoading] = useState(false);

  // Baseline ids (existing assigned)
  const [initialUserIds, setInitialUserIds] = useState<number[]>([]);
  const [initialPhraseIds, setInitialPhraseIds] = useState<number[]>([]);

  // Current selected items
  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [selectedPhrases, setSelectedPhrases] = useState<PhraseType[]>([]);

  // User search in overlay
  const [userSearchText, setUserSearchText] = useState('');
  const [userResults, setUserResults] = useState<UserType[]>([]);
  const [userPage, setUserPage] = useState(1);
  const userLimit = 10;
  const [userLoading, setUserLoading] = useState(false);
  const [userHasMore, setUserHasMore] = useState(true);

  // Phrase search in overlay
  const [phraseSearchText, setPhraseSearchText] = useState('');
  const [phraseResults, setPhraseResults] = useState<PhraseType[]>([]);
  const [phrasePage, setPhrasePage] = useState(1);
  const phraseLimit = 10;
  const [phraseLoading, setPhraseLoading] = useState(false);
  const [phraseHasMore, setPhraseHasMore] = useState(true);

  const resetUserSearch = () => {
    setUserSearchText('');
    setUserResults([]);
    setUserPage(1);
    setUserHasMore(true);
  };

  const resetPhraseSearch = () => {
    setPhraseSearchText('');
    setPhraseResults([]);
    setPhrasePage(1);
    setPhraseHasMore(true);
  };

  const closeOverlay = () => {
    setOpen(false);
    setActiveExperimentId(null);
    setNewName('');

    setInitialUserIds([]);
    setInitialPhraseIds([]);
    setSelectedUsers([]);
    setSelectedPhrases([]);

    resetUserSearch();
    resetPhraseSearch();
  };

  const fetchExistingUsersPhrases = async (experimentId: number) => {
    const url = `${BASE_URL}/experiment/fetchById?id=${experimentId}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error('Failed to fetch experiment details');

    const data: FetchByIdResponse = await res.json();

    const users: UserType[] = (data.users ?? []).map((x) => x.user).filter(Boolean);
    const phrases: PhraseType[] = (data.phrases ?? []).map((x) => x.phrase).filter(Boolean);

    setSelectedUsers(users);
    setSelectedPhrases(phrases);

    setInitialUserIds(users.map((u) => u.id));
    setInitialPhraseIds(phrases.map((p) => p.id));
  };

  const openExperiment = async (exp: ExperimentListItem) => {
    setOpen(true);
    setOverlayLoading(true);

    try {
      setActiveExperimentId(exp.id);
      setNewName(exp.experimentName);

      await fetchExistingUsersPhrases(exp.id);

      resetUserSearch();
      resetPhraseSearch();
    } catch (e) {
      showToast('Failed to open experiment', 'error', 3000);
    } finally {
      setOverlayLoading(false);
    }
  };

  const addUser = (user: UserType) => {
    setSelectedUsers((prev) => (prev.some((u) => u.id === user.id) ? prev : [...prev, user]));
  };

  const removeUser = (id: number) => {
    setSelectedUsers((prev) => prev.filter((u) => u.id !== id));
  };

  const addPhrase = (phrase: PhraseType) => {
    setSelectedPhrases((prev) => (prev.some((p) => p.id === phrase.id) ? prev : [...prev, phrase]));
  };

  const removePhrase = (id: number) => {
    setSelectedPhrases((prev) => prev.filter((p) => p.id !== id));
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

      const url = `${BASE_URL}/user/userByName?search=${encodeURIComponent(
        q
      )}&page=${nextPage}&limit=${userLimit}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setUserHasMore(false);
        throw new Error('User search failed');
      }

      const data = await res.json();

      const list: UserType[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : data
        ? [data as UserType]
        : [];

      setUserResults((prev) => (opts.reset ? list : uniqueById([...prev, ...list])));
      setUserHasMore(list.length === userLimit);
      setUserPage(nextPage + 1);
    } catch (e) {
      showToast('Result Not Found', 'error', 3000);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchPhrases = async (opts: { reset: boolean }) => {
    const q = phraseSearchText.trim();
    if (!q) {
      showToast('Enter phrase search text', 'error', 2500);
      return;
    }

    const nextPage = opts.reset ? 1 : phrasePage;

    try {
      setPhraseLoading(true);

      const url = `${BASE_URL}/phrase/fetchByNameOrCode?query=${encodeURIComponent(
        q
      )}&limit=${phraseLimit}&page=${nextPage}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setPhraseHasMore(false);
        throw new Error('Phrase search failed');
      }

      const data = await res.json();

      const rawList: any[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : data
        ? [data]
        : [];

      const list: PhraseType[] = rawList.map(normalizePhraseFromSearch);

      setPhraseResults((prev) => (opts.reset ? list : uniqueById([...prev, ...list])));
      setPhraseHasMore(list.length === phraseLimit);
      setPhrasePage(nextPage + 1);
    } catch (e) {
      showToast('Result Not Found', 'error', 3000);
    } finally {
      setPhraseLoading(false);
    }
  };

  const payload: UpdateExperimentPayload | null = useMemo(() => {
    if (!activeExperimentId) return null;

    const currentUserIds = selectedUsers.map((u) => u.id);
    const currentPhraseIds = selectedPhrases.map((p) => p.id);

    return {
      id: String(activeExperimentId),
      experimentName: newName.trim(),
      addUserIds: currentUserIds.filter((id) => !initialUserIds.includes(id)),
      removeUserIds: initialUserIds.filter((id) => !currentUserIds.includes(id)),
      addPhraseIds: currentPhraseIds.filter((id) => !initialPhraseIds.includes(id)),
      removePhraseIds: initialPhraseIds.filter((id) => !currentPhraseIds.includes(id)),
    };
  }, [activeExperimentId, newName, selectedUsers, selectedPhrases, initialUserIds, initialPhraseIds]);

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!payload) return;

    if (!payload.experimentName) {
      showToast('Experiment name is required', 'error', 3000);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${BASE_URL}/experiment/update`, {
        method: 'PUT',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Update failed');

      showToast('Experiment updated', 'success', 2500);
      closeOverlay();
    } catch (e) {
      showToast('Update failed', 'error', 3000);
    } finally {
      setSaving(false);
    }
  };

  const searchRowWidth = { xs: '92vw', sm: '70vw', md: '60vw' };

  return (
    <Box sx={[backgroundContentCss]}>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 10,
        }}
      >
        <Box
          sx={{
            width: searchRowWidth,
            display: 'grid',
            gridTemplateColumns: '1fr 120px',
            gap: 3,
            alignItems: 'center',
          }}
        >
          <TextField
            label="Search"
            placeholder="Search experiments with name or code..."
            sx={[inputFieldCss, { width: '100%' }]}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <Button
            onClick={() => {
              setExpPage(1);
              fetchExperiments({ reset: true });
            }}
            sx={[searchButtonBgColorCss, { height: 45 }]}
            disabled={expLoading}
          >
            <Typography sx={[searchTextCss]}>{expLoading ? '...' : 'SEARCH'}</Typography>
          </Button>
        </Box>

        {expResults.length > 0 && (
          <Card
            ref={expResultsRef}
            elevation={0}
            sx={{
              width: searchRowWidth,
              mt: 2.5,
              borderRadius: 3,
              bgcolor: 'white',
              border: '1px solid #ececec',
              overflow: 'hidden',
              position: 'relative',
              minHeight: 340,
            }}
          >
            <Button
              onClick={clearExperimentSearch}
              sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                fontSize: 12,
                letterSpacing: 0.4,
              }}
            >
              CLEAR
            </Button>

            {expResults.map((item) => (
              <Box
                key={item.id}
                onClick={() => openExperiment(item)}
                sx={{
                  px: 4,
                  py: 3,
                  cursor: 'pointer',
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  alignItems: 'center',
                  borderBottom: '1px solid #e3e3e3',
                  '&:hover': { bgcolor: '#fafafa' },
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 700, color: 'black' }}>
                    {item.experimentName}
                  </Typography>
                  <Typography sx={{ color: 'black', opacity: 0.7 }}>
                    {item.experimentCode}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 3 }}>
                  {typeof item.usersCount === 'number' && (
                    <Typography sx={{ color: 'black', opacity: 0.8 }}>
                      Users: {item.usersCount}
                    </Typography>
                  )}
                  {typeof item.phrasesCount === 'number' && (
                    <Typography sx={{ color: 'black', opacity: 0.8 }}>
                      Phrases: {item.phrasesCount}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}

            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              {expHasMore ? (
                <Button
                  variant="outlined"
                  onClick={() => fetchExperiments({ reset: false })}
                  disabled={expLoading}
                >
                  {expLoading ? 'Loading...' : 'Load more'}
                </Button>
              ) : (
                <Typography sx={{ color: 'black', opacity: 0.7 }}>End of results</Typography>
              )}
            </Box>
          </Card>
        )}
      </Box>

      {open && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.45)',
            zIndex: 2000,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            py: 6,
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeOverlay();
          }}
        >
          <Card
            elevation={0}
            sx={{
              width: { xs: '94vw', sm: 900, md: 1050 },
              bgcolor: 'white',
              borderRadius: 3,
              border: '1px solid #e6e6e6',
              p: { xs: 2.5, sm: 3.5 },
              position: 'relative',
              maxHeight: '88vh',
              overflowY: 'auto',
            }}
          >
            <IconButton onClick={closeOverlay} sx={{ position: 'absolute', top: 10, right: 10 }}>
              <CloseIcon />
            </IconButton>

            <Typography sx={{ fontSize: 20, fontWeight: 800, color: 'black' }}>
              Update Experiment
            </Typography>

            {overlayLoading ? (
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Box sx={{ mt: 2 }}>
                  <TextField
                    label="Experiment Name"
                    size="small"
                    sx={[inputFieldCss, { width: '100%' }]}
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </Box>

                <Box
                  sx={{
                    mt: 3,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                    gap: 3,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 800, color: 'black', mb: 1 }}>Phrases</Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 2 }}>
                      <TextField
                        label="Search phrases"
                        size="small"
                        sx={[inputFieldCss, { width: '100%' }]}
                        value={phraseSearchText}
                        onChange={(e) => setPhraseSearchText(e.target.value)}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setPhrasePage(1);
                          setPhraseHasMore(true);
                          fetchPhrases({ reset: true });
                        }}
                        disabled={phraseLoading}
                        sx={{ height: 40 }}
                      >
                        {phraseLoading ? '...' : 'Search'}
                      </Button>
                    </Box>

                    {phraseResults.length > 0 && (
                      <Card
                        variant="outlined"
                        sx={{
                          mt: 1.5,
                          borderRadius: 2,
                          maxHeight: 180,
                          overflowY: 'auto',
                        }}
                      >
                        {phraseResults.map((p) => {
                          const isSelected = selectedPhrases.some((sp) => sp.id === p.id);

                          return (
                            <Box
                              key={p.id}
                              onClick={() => {
                                if (!isSelected) addPhrase(p);
                              }}
                              sx={{
                                px: 2.5,
                                py: 1.5,
                                cursor: isSelected ? 'not-allowed' : 'pointer',
                                borderBottom: '1px solid #eee',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                opacity: isSelected ? 0.7 : 1,
                                '&:hover': { bgcolor: isSelected ? 'inherit' : '#fafafa' },
                              }}
                            >
                              <Box>
                                <Typography sx={{ color: 'black' }}>{p.phrase}</Typography>
                                <Typography sx={{ color: 'black', opacity: 0.7 }}>
                                  {p.phraseCode}
                                </Typography>
                              </Box>

                              {isSelected && (
                                <Chip
                                  label="Selected"
                                  size="small"
                                  sx={{ border: '1px solid #ccc', bgcolor: '#f2f2f2' }}
                                />
                              )}
                            </Box>
                          );
                        })}

                        <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center' }}>
                          {phraseHasMore ? (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => fetchPhrases({ reset: false })}
                              disabled={phraseLoading}
                            >
                              {phraseLoading ? 'Loading...' : 'Load more'}
                            </Button>
                          ) : (
                            <Typography sx={{ color: 'black', opacity: 0.7, fontSize: 13 }}>
                              End of results
                            </Typography>
                          )}
                        </Box>
                      </Card>
                    )}

                    <Card variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 2, minHeight: 120 }}>
                      <Typography sx={{ color: 'black', fontWeight: 700, mb: 1 }}>
                        Selected phrases
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedPhrases.map((p) => (
                          <Chip
                            key={p.id}
                            label={p.phraseCode}
                            onDelete={() => removePhrase(p.id)}
                            sx={{ border: '1px solid #ccc' }}
                          />
                        ))}
                        {selectedPhrases.length === 0 && (
                          <Typography sx={{ color: 'black', opacity: 0.7 }}>
                            No phrases selected.
                          </Typography>
                        )}
                      </Box>
                    </Card>
                  </Box>

                  <Box>
                    <Typography sx={{ fontWeight: 800, color: 'black', mb: 1 }}>Users</Typography>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 2 }}>
                      <TextField
                        label="Search users"
                        size="small"
                        sx={[inputFieldCss, { width: '100%' }]}
                        value={userSearchText}
                        onChange={(e) => setUserSearchText(e.target.value)}
                      />
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setUserPage(1);
                          setUserHasMore(true);
                          fetchUsers({ reset: true });
                        }}
                        disabled={userLoading}
                        sx={{ height: 40 }}
                      >
                        {userLoading ? '...' : 'Search'}
                      </Button>
                    </Box>

                    {userResults.length > 0 && (
                      <Card
                        variant="outlined"
                        sx={{
                          mt: 1.5,
                          borderRadius: 2,
                          maxHeight: 180,
                          overflowY: 'auto',
                        }}
                      >
                        {userResults.map((u) => {
                          const isSelected = selectedUsers.some((su) => su.id === u.id);
                          const isActivated = Boolean(u.userName);
                          const label = displayUserLabel(u);

                          return (
                            <Box
                              key={u.id}
                              onClick={() => {
                                if (!isSelected) addUser(u);
                              }}
                              sx={{
                                px: 2.5,
                                py: 1.5,
                                borderBottom: '1px solid #eee',
                                cursor: isSelected ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                opacity: isSelected ? 0.7 : 1,
                                '&:hover': { bgcolor: isSelected ? 'inherit' : '#fafafa' },
                              }}
                            >
                              <Box>
                                <Typography sx={{ color: 'black' }}>
                                  {label}
                                  {!isActivated && (
                                    <Typography
                                      component="span"
                                      sx={{ ml: 1, fontSize: 12, opacity: 0.7 }}
                                    >
                                      (not activated)
                                    </Typography>
                                  )}
                                </Typography>
                                {u.email && (
                                  <Typography sx={{ color: 'black', opacity: 0.7 }}>
                                    {u.email}
                                  </Typography>
                                )}
                              </Box>

                              {isSelected && (
                                <Chip
                                  label="Selected"
                                  size="small"
                                  sx={{ border: '1px solid #ccc', bgcolor: '#f2f2f2' }}
                                />
                              )}
                            </Box>
                          );
                        })}

                        <Box sx={{ p: 1.5, display: 'flex', justifyContent: 'center' }}>
                          {userHasMore ? (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => fetchUsers({ reset: false })}
                              disabled={userLoading}
                            >
                              {userLoading ? 'Loading...' : 'Load more'}
                            </Button>
                          ) : (
                            <Typography sx={{ color: 'black', opacity: 0.7, fontSize: 13 }}>
                              End of results
                            </Typography>
                          )}
                        </Box>
                      </Card>
                    )}

                    <Card variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 2, minHeight: 120 }}>
                      <Typography sx={{ color: 'black', fontWeight: 700, mb: 1 }}>
                        Selected users
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedUsers.map((u) => {
                          const isActivated = Boolean(u.userName);
                          const label = displayUserLabel(u);

                          if (!isActivated) {
                            return (
                              <Tooltip
                                key={u.id}
                                title="User not activated their account"
                                placement="top"
                              >
                                <Chip
                                  label={label}
                                  onDelete={() => removeUser(u.id)}
                                  sx={{
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
                              key={u.id}
                              label={label}
                              onDelete={() => removeUser(u.id)}
                              sx={{ border: '1px solid #ccc' }}
                            />
                          );
                        })}

                        {selectedUsers.length === 0 && (
                          <Typography sx={{ color: 'black', opacity: 0.7 }}>
                            No users selected.
                          </Typography>
                        )}
                      </Box>
                    </Card>
                  </Box>
                </Box>

                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button variant="outlined" onClick={closeOverlay} disabled={saving}>
                    CANCEL
                  </Button>
                  <Button variant="contained" onClick={handleSave} disabled={saving || !payload}>
                    {saving ? 'SAVING...' : 'SAVE CHANGES'}
                  </Button>
                </Box>
              </>
            )}
          </Card>
        </Box>
      )}
    </Box>
  );
}