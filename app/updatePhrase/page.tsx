'use client';

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  TextField,
  Typography,
  Card,
} from '@mui/material';

import {
  backgroundContentCss,
  inputFieldCss,
  searchButtonBgColorCss,
  searchTextCss,
} from '@/app/css';

import { useToast } from '../components/ToastProvider';
import { useStore } from '@/store/useStore';

type PhraseDetails = {
  id: string;
  phraseCode: string;
  phrase: string;
};

type PhraseRowType = {
  id: number;
  phrase: string;
  code: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
};

type PaginatedPhrasesResponse = {
  phrases: PhraseRowType[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

async function safeReadError(res: Response): Promise<string> {
  try {
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      const j = await res.json();
      return j?.message?.toString?.() || j?.error?.toString?.() || JSON.stringify(j);
    }
    return await res.text();
  } catch {
    return '';
  }
}

const chipGradients = [
  'linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)',
  'linear-gradient(135deg, #E8F5E9 0%, #E0F7FA 100%)',
  'linear-gradient(135deg, #FFF3E0 0%, #FCE4EC 100%)',
  'linear-gradient(135deg, #F3E5F5 0%, #E8EAF6 100%)',
  'linear-gradient(135deg, #E0F2F1 0%, #E8F5E9 100%)',
  'linear-gradient(135deg, #FFFDE7 0%, #F3E5F5 100%)',
];

export default function UpdatePhrase() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { showToast } = useToast();
  const { token } = useStore();

  const [query, setQuery] = useState('');
  const limit = 10;

  const [phraseResults, setPhraseResults] = useState<PhraseRowType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [updatedPhraseId, setUpdatedPhraseId] = useState<number | null>(null);

  const [openEditor, setOpenEditor] = useState(false);
  const [initial, setInitial] = useState<PhraseDetails | null>(null);
  const [editPhrase, setEditPhrase] = useState('');
  const [editCode, setEditCode] = useState('');
  const [saving, setSaving] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const didInitialFetchRef = useRef(false);
  const updatedItemRef = useRef<HTMLDivElement | null>(null);

  const mergeUniquePhrases = (prev: PhraseRowType[], next: PhraseRowType[]) => {
    const map = new Map<number, PhraseRowType>();
    prev.forEach((item) => map.set(item.id, item));
    next.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  };

  const mapPhraseList = (data: any[]): PhraseRowType[] => {
    return data.map((x: any) => ({
      id: Number(x.id),
      code: x.code ?? x.phraseCode ?? '',
      phrase: x.phrase ?? '',
      createdAt: x.createdAt,
      updatedAt: x.updatedAt,
      createdBy: x.createdBy,
    }));
  };

  const fetchAllPhrases = useCallback(
    async (pageToFetch: number, reset = false, silent = false) => {
      if (!token) return;

      try {
        setLoading(true);

        const res = await fetch(
          `${BASE_URL}/phrase/fetchAllWithPagination?page=${pageToFetch}&limit=${limit}`,
          {
            method: 'GET',
            headers: {
              accept: '*/*',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const msg = await safeReadError(res);
          throw new Error(msg || 'Failed to fetch phrases');
        }

        const data: PaginatedPhrasesResponse = await res.json();
        const list = Array.isArray(data?.phrases) ? data.phrases : [];

        setPhraseResults((prev) => (reset ? list : mergeUniquePhrases(prev, list)));
        setHasMore(Boolean(data?.hasMore));
        setPage(pageToFetch + 1);
      } catch (error: any) {
        console.error('fetchAllPhrases error:', error);
        if (!silent) {
          showToast(error?.message || 'Failed to fetch phrases', 'error', 2500);
        }
        setHasMore(false);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [BASE_URL, token, limit, showToast]
  );

  const fetchSearchPhrases = useCallback(
    async (reset: boolean, silent = false) => {
      if (!token) return;

      const q = query.trim();

      if (!q) {
        setIsSearchMode(false);
        setPage(1);
        setHasMore(true);
        fetchAllPhrases(1, true, silent);
        return;
      }

      const nextPage = reset ? 1 : page;

      try {
        setLoading(true);
        setIsSearchMode(true);

        const response = await fetch(
          `${BASE_URL}/phrase/fetchByNameOrCode?query=${encodeURIComponent(q)}&limit=${limit}&page=${nextPage}`,
          {
            headers: {
              accept: '*/*',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const msg = await safeReadError(response);
          throw new Error(msg || 'Search failed');
        }

        const data = await response.json();

        let list: PhraseRowType[] = [];
        let nextHasMore = false;

        if (Array.isArray(data)) {
          list = mapPhraseList(data);
          nextHasMore = list.length === limit;
        } else if (Array.isArray(data?.phrases)) {
          list = mapPhraseList(data.phrases);
          nextHasMore = Boolean(data?.hasMore);
        }

        setPhraseResults((prev) => (reset ? list : mergeUniquePhrases(prev, list)));
        setHasMore(nextHasMore);
        setPage(nextPage + 1);

        if (reset && list.length === 0 && !silent) {
          showToast('Result Not Found', 'error', 3000);
        }
      } catch (error: any) {
        console.error('fetchSearchPhrases error:', error);
        if (!silent) {
          showToast(error?.message || 'Result Not Found', 'error', 3000);
        }
        setPhraseResults([]);
        setHasMore(false);
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [BASE_URL, token, query, page, limit, showToast, fetchAllPhrases]
  );

  useEffect(() => {
    if (!token) return;
    if (didInitialFetchRef.current) return;

    didInitialFetchRef.current = true;
    fetchAllPhrases(1, true, true);
  }, [token, fetchAllPhrases]);

  useEffect(() => {
    if (!updatedPhraseId) return;

    const timer = setTimeout(() => {
      setUpdatedPhraseId(null);
    }, 3500);

    return () => clearTimeout(timer);
  }, [updatedPhraseId]);

  useEffect(() => {
    if (updatedPhraseId && updatedItemRef.current) {
      updatedItemRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [updatedPhraseId, phraseResults]);

  const lastPhraseRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            if (isSearchMode) {
              fetchSearchPhrases(false, true);
            } else {
              fetchAllPhrases(page, false, true);
            }
          }
        },
        {
          root: scrollContainerRef.current,
          threshold: 0.2,
        }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, hasMore, isSearchMode, page, fetchAllPhrases, fetchSearchPhrases]
  );

  const clearResult = () => {
    setQuery('');
    setPhraseResults([]);
    setPage(1);
    setHasMore(true);
    setIsSearchMode(false);
    setUpdatedPhraseId(null);
    if (token) {
      fetchAllPhrases(1, true, true);
    }
  };

  const openEdit = (item: PhraseRowType) => {
    const base: PhraseDetails = {
      id: String(item.id),
      phraseCode: item.code,
      phrase: item.phrase,
    };

    setInitial(base);
    setEditPhrase(base.phrase);
    setEditCode(base.phraseCode);
    setOpenEditor(true);
  };

  const closeEdit = () => {
    setOpenEditor(false);
    setInitial(null);
    setEditPhrase('');
    setEditCode('');
  };

  const phraseChanged = useMemo(() => {
    if (!initial) return false;
    return initial.phrase.trim() !== editPhrase.trim();
  }, [initial, editPhrase]);

  const codeChanged = useMemo(() => {
    if (!initial) return false;
    return initial.phraseCode.trim() !== editCode.trim();
  }, [initial, editCode]);

const handleSave = async () => {
  if (!initial || !token) return;

  if (!phraseChanged && !codeChanged) {
    closeEdit();
    return;
  }

  const nextPhrase = editPhrase.trim();
  const nextCode = editCode.trim();

  if (!nextPhrase || !nextCode) {
    showToast('Fields cannot be empty', 'error', 3000);
    return;
  }

  setSaving(true);

  try {
    if (phraseChanged) {
      const res = await fetch(`${BASE_URL}/phrase/update-phrase`, {
        method: 'PUT',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: initial.id,
          phraseCode: nextCode,
          phrase: nextPhrase,
        }),
      });

      if (!res.ok) {
        const msg = await safeReadError(res);
        throw new Error(msg || 'Failed to update phrase');
      }
    }

    if (codeChanged) {
      const res = await fetch(`${BASE_URL}/phrase/update-phrase-code`, {
        method: 'PUT',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: initial.id,
          currentCode: initial.phraseCode,
          newCode: nextCode,
        }),
      });

      if (!res.ok) {
        const msg = await safeReadError(res);
        const lowered = (msg || '').toLowerCase();

        if (
          res.status === 409 ||
          lowered.includes('already') ||
          lowered.includes('exists') ||
          lowered.includes('unique')
        ) {
          showToast('This phrase code already exists. Use a different code.', 'error', 3500);
          return;
        }

        throw new Error(msg || 'Failed to update phrase code');
      }
    }

    const updatedId = Number(initial.id);

    closeEdit();
    setUpdatedPhraseId(updatedId);
    showToast('Phrase updated successfully', 'success', 2500);

    // refetch current view from backend
    setPhraseResults([]);
    setPage(1);
    setHasMore(true);

    if (isSearchMode && query.trim()) {
      await fetchSearchPhrases(true, true);
    } else {
      await fetchAllPhrases(1, true, true);
    }
  } catch (error: any) {
    console.error('handleSave error:', error);
    showToast(error?.message || 'Update failed', 'error', 3000);
  } finally {
    setSaving(false);
  }
};

  const PhraseList = memo(({ data }: { data: PhraseRowType[] }) => {
    if (!data.length) return null;

    return (
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            px: 3,
            py: 1.5,
            borderBottom: '1px solid #eee',
            bgcolor: '#fafafa',
            borderRadius: 2,
            mb: 1,
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'black' }}>
            Phrase
          </Typography>
          <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'black', width: 140, textAlign: 'right' }}>
            Code
          </Typography>
        </Box>

        {data.map((item, index) => {
          const isLast = index === data.length - 1;
          const isUpdated = updatedPhraseId === item.id;

          return (
            <Box
              key={item.id}
              ref={(node: HTMLDivElement | null) => {
                if (isLast) {
                  lastPhraseRef(node);
                }
                if (isUpdated) {
                  updatedItemRef.current = node;
                }
              }}
              onClick={() => openEdit(item)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 3,
                py: 2,
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: isUpdated ? '#fff8e1' : 'transparent',
                outline: isUpdated ? '2px solid #fbc02d' : 'none',
                borderRadius: isUpdated ? 2 : 0,
                '&:hover': {
                  bgcolor: isUpdated ? '#fff3c4' : '#fafafa',
                },
              }}
            >
              <Box sx={{ flex: 1, pr: 3 }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 500,
                    color: 'black',
                    lineHeight: 1.4,
                    wordBreak: 'break-word',
                  }}
                >
                  {item.phrase}
                </Typography>

                {isUpdated && (
                  <Typography
                    sx={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#b26a00',
                      mt: 0.75,
                    }}
                  >
                    Updated just now
                  </Typography>
                )}
              </Box>

              <Box sx={{ width: 140, display: 'flex', justifyContent: 'flex-end' }}>
                <Chip
                  label={item.code || 'NO CODE'}
                  size="small"
                  sx={{
                    fontSize: 11,
                    fontWeight: 600,
                    background: chipGradients[item.id % chipGradients.length],
                    '& .MuiChip-label': {
                      px: 1.2,
                    },
                  }}
                />
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  });

  return (
    <Box sx={[backgroundContentCss]}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          pt: 5,
          width: '100%',
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
          }}
        >
          <TextField
            fullWidth
            label="Search"
            placeholder="Search with phrase Code or Phrase..."
            sx={[inputFieldCss]}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setPage(1);
                fetchSearchPhrases(true);
              }
            }}
          />

          <Button
            onClick={() => {
              setPage(1);
              fetchSearchPhrases(true);
            }}
            sx={[searchButtonBgColorCss, { height: 40, minWidth: 120 }]}
            disabled={loading}
          >
            <Typography sx={[searchTextCss]}>
              {loading && isSearchMode ? 'Searching...' : 'Search'}
            </Typography>
          </Button>

          <Button
            variant="outlined"
            onClick={clearResult}
            sx={{ height: 40, minWidth: 100 }}
          >
            Clear
          </Button>
        </Box>

        <Box
          ref={scrollContainerRef}
          sx={{
            width: '100%',
            height: '75vh',
            overflowY: 'auto',
            bgcolor: 'white',
            border: '1px solid #e6e6e6',
            borderRadius: 3,
            p: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              pb: 1.5,
              borderBottom: '1px solid #eee',
              bgcolor: 'white',
            }}
          >
            <Typography sx={{ fontWeight: 700, color: 'black', fontSize: 16 }}>
              {isSearchMode ? 'Search Results' : 'All Phrases'}
            </Typography>

            <Typography sx={{ fontSize: 13, color: 'black', opacity: 0.7 }}>
              {phraseResults.length} phrase(s)
            </Typography>
          </Box>

          {initialLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : phraseResults.length === 0 ? (
            <Typography sx={{ textAlign: 'center', py: 8, color: 'black', opacity: 0.7 }}>
              No phrases to display
            </Typography>
          ) : (
            <>
              <PhraseList data={phraseResults} />

              {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
                  <CircularProgress size={28} />
                </Box>
              )}

              {!hasMore && phraseResults.length > 0 && (
                <Typography
                  sx={{
                    textAlign: 'center',
                    py: 3,
                    color: 'black',
                    opacity: 0.65,
                    fontSize: 12,
                  }}
                >
                  End of results
                </Typography>
              )}
            </>
          )}
        </Box>

        {openEditor && initial && (
          <Box
            sx={{
              position: 'fixed',
              inset: 0,
              bgcolor: 'rgba(0,0,0,0.5)',
              zIndex: 2000,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              px: 2,
            }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeEdit();
            }}
          >
            <Card
              elevation={0}
              sx={{
                width: { xs: '95vw', sm: 900, md: 1000 },
                borderRadius: 4,
                p: { xs: 3, sm: 4 },
                border: '1px solid #e6e6e6',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 20, fontWeight: 800, color: 'black' }}>
                  Update Phrase
                </Typography>

                <Button variant="text" onClick={closeEdit}>
                  Close
                </Button>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  label="Phrase"
                  value={editPhrase}
                  onChange={(e) => setEditPhrase(e.target.value)}
                  sx={[inputFieldCss]}
                />

                <TextField
                  label="Phrase Code"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  sx={[inputFieldCss]}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 1 }}>
                  <Button variant="outlined" onClick={closeEdit} disabled={saving}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleSave} disabled={saving}>
                    {saving ? 'Saving...' : 'Save'}
                  </Button>
                </Box>
              </Box>
            </Card>
          </Box>
        )}
      </Box>
    </Box>
  );
}