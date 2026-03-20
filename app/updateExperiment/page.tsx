'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  id: string;
  experimentName: string;
  experimentCode: string;
  createdAt?: string;
  updatedAt?: string;
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

type FetchAllExperimentsResponse = {
  experiments: ExperimentListItem[];
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
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

function uniqueById<T extends { id: string | number }>(arr: T[]): T[] {
  const map = new Map<string | number, T>();
  for (const item of arr) map.set(item.id, item);
  return Array.from(map.values());
}

function displayUserLabel(u: UserType) {
  if (u.userName && u.userName.trim().length > 0) return u.userName;
  return u.firstName;
}

function normalizePhraseFromSearch(p: any): PhraseType {
  return {
    id: Number(p.id),
    phraseCode: p.phraseCode ?? p.code ?? '',
    phrase: p.phrase ?? '',
  };
}

const phraseChipGradients = [
  'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)',
  'linear-gradient(135deg, #E8F5E9 0%, #E0F7FA 100%)',
  'linear-gradient(135deg, #FFF3E0 0%, #FCE4EC 100%)',
  'linear-gradient(135deg, #F3E5F5 0%, #E8EAF6 100%)',
  'linear-gradient(135deg, #E0F2F1 0%, #E8F5E9 100%)',
  'linear-gradient(135deg, #FFFDE7 0%, #F3E5F5 100%)',
];

export default function UpdateExperimentPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { token } = useStore();
  const { showToast } = useToast();

  const [query, setQuery] = useState('');
  const [expPage, setExpPage] = useState(1);
  const expLimit = 10;

  const [expResults, setExpResults] = useState<ExperimentListItem[]>([]);
  const [expLoading, setExpLoading] = useState(false);
  const [expHasMore, setExpHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const didInitialFetchRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [activeExperimentId, setActiveExperimentId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [overlayLoading, setOverlayLoading] = useState(false);

  const [initialUserIds, setInitialUserIds] = useState<number[]>([]);
  const [initialPhraseIds, setInitialPhraseIds] = useState<number[]>([]);

  const [selectedUsers, setSelectedUsers] = useState<UserType[]>([]);
  const [selectedPhrases, setSelectedPhrases] = useState<PhraseType[]>([]);

  // users - default mode
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  const [allUsersPage, setAllUsersPage] = useState(1);
  const [allUsersHasMore, setAllUsersHasMore] = useState(true);
  const [allUsersLoading, setAllUsersLoading] = useState(false);
  const [allUsersInitialLoading, setAllUsersInitialLoading] = useState(true);

  // users - search mode
  const [userSearchText, setUserSearchText] = useState('');
  const [searchedUsers, setSearchedUsers] = useState<UserType[]>([]);
  const [searchedUsersPage, setSearchedUsersPage] = useState(1);
  const [searchedUsersHasMore, setSearchedUsersHasMore] = useState(true);
  const [searchedUsersLoading, setSearchedUsersLoading] = useState(false);
  const [isUserSearchMode, setIsUserSearchMode] = useState(false);

  // phrases - default mode
  const [allPhrases, setAllPhrases] = useState<PhraseType[]>([]);
  const [allPhrasesPage, setAllPhrasesPage] = useState(1);
  const [allPhrasesHasMore, setAllPhrasesHasMore] = useState(true);
  const [allPhrasesLoading, setAllPhrasesLoading] = useState(false);
  const [allPhrasesInitialLoading, setAllPhrasesInitialLoading] = useState(true);

  // phrases - search mode
  const [phraseSearchText, setPhraseSearchText] = useState('');
  const [searchedPhrases, setSearchedPhrases] = useState<PhraseType[]>([]);
  const [searchedPhrasesPage, setSearchedPhrasesPage] = useState(1);
  const [searchedPhrasesHasMore, setSearchedPhrasesHasMore] = useState(true);
  const [searchedPhrasesLoading, setSearchedPhrasesLoading] = useState(false);
  const [isPhraseSearchMode, setIsPhraseSearchMode] = useState(false);

  const didInitialUsersFetchRef = useRef(false);
  const didInitialPhrasesFetchRef = useRef(false);

  const displayedUsers = useMemo(
    () => (isUserSearchMode ? searchedUsers : allUsers),
    [isUserSearchMode, searchedUsers, allUsers]
  );

  const displayedPhrases = useMemo(
    () => (isPhraseSearchMode ? searchedPhrases : allPhrases),
    [isPhraseSearchMode, searchedPhrases, allPhrases]
  );

  const displayedUserLoading = isUserSearchMode ? searchedUsersLoading : allUsersLoading;
  const displayedUserHasMore = isUserSearchMode ? searchedUsersHasMore : allUsersHasMore;

  const displayedPhraseLoading = isPhraseSearchMode ? searchedPhrasesLoading : allPhrasesLoading;
  const displayedPhraseHasMore = isPhraseSearchMode ? searchedPhrasesHasMore : allPhrasesHasMore;

  const fetchAllExperiments = useCallback(
    async (pageToFetch: number, reset = false, silent = false) => {
      if (!token) {
        setInitialLoading(false);
        return;
      }

      try {
        setExpLoading(true);
        setIsSearchMode(false);

        const url = `${BASE_URL}/experiment/fetchAllWithPagination?page=${pageToFetch}&limit=${expLimit}`;

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || 'Failed to fetch experiments');
        }

        const data: FetchAllExperimentsResponse = await res.json();
        const list = Array.isArray(data?.experiments) ? data.experiments : [];

        setExpResults((prev) => (reset ? list : uniqueById([...prev, ...list])));
        setExpHasMore(data?.hasMore ?? list.length === expLimit);
        setExpPage(pageToFetch + 1);
      } catch (e: any) {
        if (!silent) {
          showToast(e?.message || 'Failed to fetch experiments', 'error', 3000);
        }
        setExpHasMore(false);
      } finally {
        setExpLoading(false);
        setInitialLoading(false);
      }
    },
    [BASE_URL, token, expLimit, showToast]
  );

  const fetchExperimentsBySearch = useCallback(
    async (reset: boolean) => {
      const q = query.trim();
      if (!q) {
        showToast('Enter search text', 'error', 2500);
        return;
      }

      const nextPage = reset ? 1 : expPage;

      try {
        setExpLoading(true);
        setIsSearchMode(true);

        const url = `${BASE_URL}/experiment/fetchByNameOrCode?query=${encodeURIComponent(
          q
        )}&page=${nextPage}&limit=${expLimit}`;

        const res = await fetch(url, {
          method: 'GET',
          headers: {
            accept: '*/*',
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || 'Search failed');
        }

        const data = await res.json();

        const list: ExperimentListItem[] = Array.isArray(data)
          ? data
          : Array.isArray(data?.results)
            ? data.results
            : data
              ? [data as ExperimentListItem]
              : [];

        setExpResults((prev) => (reset ? list : uniqueById([...prev, ...list])));
        setExpHasMore(list.length === expLimit);
        setExpPage(nextPage + 1);
      } catch (e: any) {
        showToast(e?.message || 'Result Not Found', 'error', 3000);
      } finally {
        setExpLoading(false);
        setInitialLoading(false);
      }
    },
    [BASE_URL, query, expPage, expLimit, token, showToast]
  );

  useEffect(() => {
    if (!token) return;
    if (didInitialFetchRef.current) return;
    didInitialFetchRef.current = true;
    fetchAllExperiments(1, true, false);
  }, [token, fetchAllExperiments]);

  const fetchExistingUsersPhrases = async (experimentId: string) => {
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

  const fetchAllUsers = useCallback(async (pageToFetch: number, reset = false) => {
    if (!token) return;

    try {
      setAllUsersLoading(true);

      const url = `${BASE_URL}/user/fetchAllWithPagination?page=${pageToFetch}&limit=10`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setAllUsersHasMore(false);
        throw new Error('Failed to fetch users');
      }

      const data: PaginatedUsersResponse = await res.json();
      const list = Array.isArray(data?.users) ? data.users : [];

      setAllUsers((prev) => (reset ? list : uniqueById([...prev, ...list])));
      setAllUsersHasMore(Boolean(data?.hasMore));
      setAllUsersPage(pageToFetch + 1);
    } catch {
      showToast('Failed to fetch users', 'error', 3000);
    } finally {
      setAllUsersLoading(false);
      setAllUsersInitialLoading(false);
    }
  }, [BASE_URL, token, showToast]);

  const fetchAllPhrases = useCallback(async (pageToFetch: number, reset = false) => {
    if (!token) return;

    try {
      setAllPhrasesLoading(true);

      const url = `${BASE_URL}/phrase/fetchAllWithPagination?page=${pageToFetch}&limit=10`;

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        setAllPhrasesHasMore(false);
        throw new Error('Failed to fetch phrases');
      }

      const data: PaginatedPhrasesResponse = await res.json();
      const raw = Array.isArray(data?.phrases) ? data.phrases : [];
      const list = raw.map(normalizePhraseFromSearch);

      setAllPhrases((prev) => (reset ? list : uniqueById([...prev, ...list])));
      setAllPhrasesHasMore(Boolean(data?.hasMore));
      setAllPhrasesPage(pageToFetch + 1);
    } catch {
      showToast('Failed to fetch phrases', 'error', 3000);
    } finally {
      setAllPhrasesLoading(false);
      setAllPhrasesInitialLoading(false);
    }
  }, [BASE_URL, token, showToast]);

  const fetchUsers = useCallback(async (pageToFetch: number, reset = false) => {
    const q = userSearchText.trim();
    if (!q) {
      showToast('Enter user search text', 'error', 2500);
      return;
    }

    try {
      setSearchedUsersLoading(true);
      setIsUserSearchMode(true);

      const url = `${BASE_URL}/user/userByName?search=${encodeURIComponent(q)}&page=${pageToFetch}&limit=10`;

      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setSearchedUsersHasMore(false);
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

      setSearchedUsers((prev) => (reset ? list : uniqueById([...prev, ...list])));
      setSearchedUsersHasMore(list.length === 10);
      setSearchedUsersPage(pageToFetch + 1);
    } catch {
      showToast('Result Not Found', 'error', 3000);
    } finally {
      setSearchedUsersLoading(false);
    }
  }, [BASE_URL, userSearchText, token, showToast]);

  const fetchPhrases = useCallback(async (pageToFetch: number, reset = false) => {
    const q = phraseSearchText.trim();
    if (!q) {
      showToast('Enter phrase search text', 'error', 2500);
      return;
    }

    try {
      setSearchedPhrasesLoading(true);
      setIsPhraseSearchMode(true);

      const url = `${BASE_URL}/phrase/fetchByNameOrCode?query=${encodeURIComponent(q)}&limit=10&page=${pageToFetch}`;

      const res = await fetch(url, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setSearchedPhrasesHasMore(false);
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

      setSearchedPhrases((prev) => (reset ? list : uniqueById([...prev, ...list])));
      setSearchedPhrasesHasMore(list.length === 10);
      setSearchedPhrasesPage(pageToFetch + 1);
    } catch {
      showToast('Result Not Found', 'error', 3000);
    } finally {
      setSearchedPhrasesLoading(false);
    }
  }, [BASE_URL, phraseSearchText, token, showToast]);

  const openExperiment = async (exp: ExperimentListItem) => {
    setOpen(true);
    setOverlayLoading(true);

    try {
      setActiveExperimentId(exp.id);
      setNewName(exp.experimentName);

      await fetchExistingUsersPhrases(exp.id);

      setUserSearchText('');
      setPhraseSearchText('');
      setIsUserSearchMode(false);
      setIsPhraseSearchMode(false);
      setSearchedUsers([]);
      setSearchedPhrases([]);
      setSearchedUsersPage(1);
      setSearchedPhrasesPage(1);
      setSearchedUsersHasMore(true);
      setSearchedPhrasesHasMore(true);

      if (!didInitialUsersFetchRef.current) {
        didInitialUsersFetchRef.current = true;
        await fetchAllUsers(1, true);
      }

      if (!didInitialPhrasesFetchRef.current) {
        didInitialPhrasesFetchRef.current = true;
        await fetchAllPhrases(1, true);
      }
    } catch {
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

  const resetUserSearch = () => {
    setUserSearchText('');
    setIsUserSearchMode(false);
    setSearchedUsers([]);
    setSearchedUsersPage(1);
    setSearchedUsersHasMore(true);
  };

  const resetPhraseSearch = () => {
    setPhraseSearchText('');
    setIsPhraseSearchMode(false);
    setSearchedPhrases([]);
    setSearchedPhrasesPage(1);
    setSearchedPhrasesHasMore(true);
  };

  const handleUserScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (displayedUserLoading || !displayedUserHasMore) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (!nearBottom) return;

    if (isUserSearchMode) {
      fetchUsers(searchedUsersPage, false);
    } else {
      fetchAllUsers(allUsersPage, false);
    }
  };

  const handlePhraseScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (displayedPhraseLoading || !displayedPhraseHasMore) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (!nearBottom) return;

    if (isPhraseSearchMode) {
      fetchPhrases(searchedPhrasesPage, false);
    } else {
      fetchAllPhrases(allPhrasesPage, false);
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
    } catch {
      showToast('Update failed', 'error', 3000);
    } finally {
      setSaving(false);
    }
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

  const clearExperimentSearch = () => {
    setQuery('');
    setExpResults([]);
    setExpPage(1);
    setExpHasMore(true);
    setIsSearchMode(false);
    fetchAllExperiments(1, true, false);
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
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            setExpPage(1);
            fetchExperimentsBySearch(true);
          }}
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
            type="submit"
            sx={[searchButtonBgColorCss, { height: 45 }]}
            disabled={expLoading}
          >
            <Typography sx={[searchTextCss]}>{expLoading ? '...' : 'SEARCH'}</Typography>
          </Button>
        </Box>

        <Card
          elevation={0}
          sx={{
            width: searchRowWidth,
            mt: 2.5,
            borderRadius: 3,
            bgcolor: 'white',
            border: '1px solid #ececec',
            overflow: 'hidden',
            position: 'relative',
            minHeight: 220,
            p: 3,
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography sx={{ fontWeight: 700, color: 'black', fontSize: 16 }}>
              {isSearchMode ? 'Search Results' : 'All Experiments'}
            </Typography>

            <Button onClick={clearExperimentSearch} sx={{ fontSize: 12 }}>
              CLEAR
            </Button>
          </Box>

          {initialLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : expResults.length === 0 ? (
            <Typography sx={{ textAlign: 'center', py: 8, color: 'black', opacity: 0.7 }}>
              No experiments to display
            </Typography>
          ) : (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                  },
                  gap: 2,
                }}
              >
                {expResults.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => openExperiment(item)}
                    elevation={0}
                    sx={{
                      borderRadius: 3,
                      p: 2,
                      cursor: 'pointer',
                      border: '1px solid #e8e8e8',
                      bgcolor: 'white',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: 'black',
                        fontSize: 15,
                        mb: 1,
                        wordBreak: 'break-word',
                      }}
                    >
                      {item.experimentName}
                    </Typography>

                    <Chip
                      label={item.experimentCode}
                      size="small"
                      sx={{
                        bgcolor: '#f6f6f6',
                        border: '1px solid #e0e0e0',
                        fontWeight: 700,
                        width: 'fit-content',
                      }}
                    />
                  </Card>
                ))}
              </Box>

              <Box sx={{ pt: 3, display: 'flex', justifyContent: 'center' }}>
                {expHasMore ? (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      if (isSearchMode) {
                        fetchExperimentsBySearch(false);
                      } else {
                        fetchAllExperiments(expPage, false, false);
                      }
                    }}
                    disabled={expLoading}
                  >
                    {expLoading ? 'Loading...' : 'Load more'}
                  </Button>
                ) : (
                  <Typography sx={{ color: 'black', opacity: 0.7 }}>
                    End of results
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Card>
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

                    <Box
                      component="form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        fetchPhrases(1, true);
                      }}
                      sx={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 2 }}
                    >
                      <TextField
                        label="Search phrases"
                        size="small"
                        sx={[inputFieldCss, { width: '100%' }]}
                        value={phraseSearchText}
                        onChange={(e) => setPhraseSearchText(e.target.value)}
                      />
                      <Button
                        type="submit"
                        variant="outlined"
                        disabled={searchedPhrasesLoading}
                        sx={{ height: 40 }}
                      >
                        {searchedPhrasesLoading && isPhraseSearchMode ? '...' : 'Search'}
                      </Button>
                    </Box>

                    <Card variant="outlined" sx={{ mt: 1.5, borderRadius: 2 }}>
                      <Box
                        sx={{
                          position: 'sticky',
                          top: 0,
                          zIndex: 1,
                          bgcolor: 'white',
                          px: 1.5,
                          py: 1,
                          borderBottom: '1px solid #eee',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography sx={{ color: 'black', fontWeight: 700, fontSize: 13 }}>
                          {isPhraseSearchMode ? 'Phrase Search Results' : 'All Phrases'}
                        </Typography>
                        <Button size="small" onClick={resetPhraseSearch}>clear</Button>
                      </Box>

                      <Box sx={{ maxHeight: 220, overflowY: 'auto' }} onScroll={handlePhraseScroll}>
                        {allPhrasesInitialLoading ? (
                          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : displayedPhrases.length === 0 ? (
                          <Typography sx={{ color: 'black', opacity: 0.7, fontSize: 13, textAlign: 'center', py: 3 }}>
                            No phrases found
                          </Typography>
                        ) : (
                          <>
                            {displayedPhrases.map((p) => {
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
                                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
                                    <Typography sx={{ color: 'black' }}>{p.phrase}</Typography>

                                    <Chip
                                      label={p.phraseCode}
                                      size="small"
                                      sx={{
                                        width: 'fit-content',
                                        fontWeight: 700,
                                        color: '#333',
                                        background: phraseChipGradients[p.id % phraseChipGradients.length],
                                        border: '1px solid rgba(0,0,0,0.08)',
                                      }}
                                    />
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

                            {displayedPhraseLoading && (
                              <Box sx={{ py: 1.5, display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress size={20} />
                              </Box>
                            )}

                            {!displayedPhraseHasMore && displayedPhrases.length > 0 && (
                              <Typography sx={{ color: 'black', opacity: 0.7, fontSize: 13, textAlign: 'center', py: 1.5 }}>
                                End of results
                              </Typography>
                            )}
                          </>
                        )}
                      </Box>
                    </Card>

                    <Card variant="outlined" sx={{ mt: 2, p: 2, borderRadius: 2, minHeight: 120 }}>
                      <Typography sx={{ color: 'black', fontWeight: 700, mb: 1 }}>
                        Selected phrases
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {selectedPhrases.map((p) => (
                          <Chip
                            key={p.id}
                            label={`${p.phraseCode} - ${p.phrase}`}
                            onDelete={() => removePhrase(p.id)}
                            sx={{
                              maxWidth: 260,
                              fontWeight: 700,
                              color: '#333',
                              background: phraseChipGradients[p.id % phraseChipGradients.length],
                              border: '1px solid rgba(0,0,0,0.08)',
                              '& .MuiChip-label': {
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              },
                            }}
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

                    <Box
                      component="form"
                      onSubmit={(e) => {
                        e.preventDefault();
                        fetchUsers(1, true);
                      }}
                      sx={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 2 }}
                    >
                      <TextField
                        label="Search users"
                        size="small"
                        sx={[inputFieldCss, { width: '100%' }]}
                        value={userSearchText}
                        onChange={(e) => setUserSearchText(e.target.value)}
                      />
                      <Button
                        type="submit"
                        variant="outlined"
                        disabled={searchedUsersLoading}
                        sx={{ height: 40 }}
                      >
                        {searchedUsersLoading && isUserSearchMode ? '...' : 'Search'}
                      </Button>
                    </Box>

                    <Card variant="outlined" sx={{ mt: 1.5, borderRadius: 2 }}>
                      <Box
                        sx={{
                          position: 'sticky',
                          top: 0,
                          zIndex: 1,
                          bgcolor: 'white',
                          px: 1.5,
                          py: 1,
                          borderBottom: '1px solid #eee',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography sx={{ color: 'black', fontWeight: 700, fontSize: 13 }}>
                          {isUserSearchMode ? 'User Search Results' : 'All Users'}
                        </Typography>
                        <Button size="small" onClick={resetUserSearch}>clear</Button>
                      </Box>

                      <Box sx={{ maxHeight: 220, overflowY: 'auto' }} onScroll={handleUserScroll}>
                        {allUsersInitialLoading ? (
                          <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                            <CircularProgress size={24} />
                          </Box>
                        ) : displayedUsers.length === 0 ? (
                          <Typography sx={{ color: 'black', opacity: 0.7, fontSize: 13, textAlign: 'center', py: 3 }}>
                            No users found
                          </Typography>
                        ) : (
                          <>
                            {displayedUsers.map((u) => {
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

                            {displayedUserLoading && (
                              <Box sx={{ py: 1.5, display: 'flex', justifyContent: 'center' }}>
                                <CircularProgress size={20} />
                              </Box>
                            )}

                            {!displayedUserHasMore && displayedUsers.length > 0 && (
                              <Typography sx={{ color: 'black', opacity: 0.7, fontSize: 13, textAlign: 'center', py: 1.5 }}>
                                End of results
                              </Typography>
                            )}
                          </>
                        )}
                      </Box>
                    </Card>

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