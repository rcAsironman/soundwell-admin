'use client';

import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Button, Card, Divider, TextField, Typography } from '@mui/material';

import {
  backgroundContentCss,
  inputFieldCss,
  searchButtonBgColorCss,
  searchTextCss,
} from '@/app/css';

import { useToast } from '../components/ToastProvider';
import { useStore } from '@/store/useStore';

type SearchResultType = {
  id: number;
  phrase: string;
  code: string;
};

type PhraseDetails = {
  id: string;
  phraseCode: string;
  phrase: string;
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

export default function UpdatePhrase() {

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { showToast } = useToast();
  const { token } = useStore();

  const [query, setQuery] = useState('');
  const [limit] = useState(10);
  const [page] = useState(1);
  const [searchResult, setSearchResult] = useState<SearchResultType[]>([]);
  const mouseEventRef = useRef<HTMLDivElement | null>(null);

  const [openEditor, setOpenEditor] = useState(false);
  const [initial, setInitial] = useState<PhraseDetails | null>(null);
  const [editPhrase, setEditPhrase] = useState('');
  const [editCode, setEditCode] = useState('');
  const [saving, setSaving] = useState(false);

  const clearResult = () => {
    setSearchResult([]);
    setQuery('');
  };

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (mouseEventRef.current && !mouseEventRef.current.contains(event.target as Node)) {
        clearResult();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    if (!query.trim()) {
      showToast('Enter search text', 'error', 2500);
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/phrase/fetchByNameOrCode?query=${encodeURIComponent(query)}&limit=${limit}&page=${page}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error();

      const data = await response.json();

      const list: SearchResultType[] = Array.isArray(data)
        ? data.map((x: any) => ({
            id: Number(x.id),
            code: x.code ?? '',
            phrase: x.phrase ?? '',
          }))
        : [];

      setSearchResult(list);
    } catch {
      showToast('Result Not Found', 'error', 3000);
    }
  };

  const openEdit = (item: SearchResultType) => {
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
    if (!initial) return;

    // If nothing changed, do not call API
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
      // Update phrase text (and keep phraseCode in sync)
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

      // Update code (validate duplicates)
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

          // If API returns duplicate-code error, show a specific message
          const lowered = (msg || '').toLowerCase();
          if (res.status === 409 || lowered.includes('already') || lowered.includes('exists') || lowered.includes('unique')) {
            showToast('This phrase code already exists. Use a different code.', 'error', 3500);
            return; // keep modal open
          }

          throw new Error(msg || 'Failed to update phrase code');
        }
      }

      // Update UI list locally
      setSearchResult((prev) =>
        prev.map((x) =>
          x.id === Number(initial.id) ? { ...x, phrase: nextPhrase, code: nextCode } : x
        )
      );

      showToast('Updated successfully', 'success', 2500);
      closeEdit();
    } catch {
      showToast('Update failed', 'error', 3000);
    } finally {
      setSaving(false);
    }
  };

  const SearchResultList = memo(({ data }: { data: SearchResultType[] }) => {
    if (!data.length) return null;

    return (
      <Box
        ref={mouseEventRef}
        sx={{
          borderRadius: 3,
          bgcolor: 'white',
          height: 320,
          width: '60vw',
          mt: 2,
          overflowY: 'auto',
          border: '1px solid #e6e6e6',
        }}
      >
        {/* Header row so Clear never overlaps content */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            bgcolor: 'white',
            px: 2,
            py: 1,
            display: 'flex',
            justifyContent: 'flex-end',
            borderBottom: '1px solid #eee',
          }}
        >
          <Button sx={{ fontSize: 12 }} onClick={clearResult}>
            clear
          </Button>
        </Box>

        {data.map((item) => (
          <Box
            key={item.id}
            sx={{
              py: 2,
              px: 3,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid #eee',
              '&:hover': { bgcolor: '#fafafa' },
            }}
            onClick={() => openEdit(item)}
          >
            <Typography>{item.phrase}</Typography>
            <Typography>{item.code}</Typography>
          </Box>
        ))}
      </Box>
    );
  });

  return (
    <Box sx={[backgroundContentCss]}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pt: 8,
        }}
      >
        {/* Reduced gap and removed extra spacing */}
        <Box
          sx={{
            width: '60vw',
            display: 'flex',
            alignItems: 'center',
            gap: 2, // smaller gap
          }}
        >
          <TextField
            fullWidth
            label="Search"
            placeholder="Search with phrase Code or Phrase..."
            sx={[inputFieldCss]}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <Button
            onClick={handleSearch}
            sx={[searchButtonBgColorCss, { height: 40, minWidth: 120 }]}
          >
            <Typography sx={[searchTextCss]}>Search</Typography>
          </Button>
        </Box>

        <SearchResultList data={searchResult} />

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
            {/* Bigger modal */}
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