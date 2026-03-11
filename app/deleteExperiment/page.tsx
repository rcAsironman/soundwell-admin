'use client';

import React, { memo, useEffect, useRef, useState } from 'react';
import { Alert, Box, Button, Card, Divider, TextField, Typography } from '@mui/material';

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
  experimentName: string;
  code: string;
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

export default function DeleteExperiment() {

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { showToast } = useToast();
  const { token } = useStore();

  const [query, setQuery] = useState('');
  const [limit] = useState(10);
  const [page] = useState(1);
  const [searchResult, setSearchResult] = useState<SearchResultType[]>([]);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<SearchResultType | null>(null);
  const [deleting, setDeleting] = useState(false);

  const mouseEventRef = useRef<HTMLDivElement | null>(null);

  // Deletion disabled initially
  const deletionDisabled = true;

  useEffect(() => {
    if (deletionDisabled) {
      showToast('Experiment deletion is temporarily disabled.', 'error', 3000);
    }
  }, []);

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
  }, []);

  const handleSearch = async () => {

    if (deletionDisabled) return;

    if (!query.trim()) {
      showToast('Enter search text', 'error', 2500);
      return;
    }

    try {

      const response = await fetch(
        `${BASE_URL}/experiment/fetchByName?query=${encodeURIComponent(query)}&limit=${limit}&page=${page}`,
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
            experimentName: x.experimentName ?? '',
          }))
        : [];

      setSearchResult(list);

      if (!list.length) showToast('Result Not Found', 'error', 3000);

    } catch {
      showToast('Search failed', 'error', 3000);
    }
  };

  const openDelete = (item: SearchResultType) => {
    if (deletionDisabled) return;
    setSelectedExperiment(item);
    setOpenDeleteModal(true);
  };

  const closeDelete = () => {
    setSelectedExperiment(null);
    setOpenDeleteModal(false);
  };

  const handleDelete = async () => {

    if (!selectedExperiment || deletionDisabled) return;

    setDeleting(true);

    try {

      const response = await fetch(`${BASE_URL}/experiment/delete-experiment`, {
        method: 'DELETE',
        headers: {
          accept: '*/*',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: selectedExperiment.id,
        }),
      });

      if (!response.ok) {
        const msg = await safeReadError(response);
        throw new Error(msg || 'Failed to delete experiment');
      }

      setSearchResult(prev => prev.filter(x => x.id !== selectedExperiment.id));

      showToast('Experiment deleted successfully', 'success', 2500);

      closeDelete();

    } catch (error: any) {

      showToast(error?.message || 'Delete failed', 'error', 3000);

    } finally {

      setDeleting(false);

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
          opacity: deletionDisabled ? 0.6 : 1,
          pointerEvents: deletionDisabled ? 'none' : 'auto',
        }}
      >

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
          <Button sx={{ fontSize: 12 }} onClick={clearResult} disabled={deletionDisabled}>
            clear
          </Button>
        </Box>

        {data.map(item => (
          <Box
            key={item.id}
            sx={{
              py: 2,
              px: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #eee',
              '&:hover': { bgcolor: '#fafafa' },
            }}
          >
            <Box>
              <Typography sx={{ fontWeight: 600 }}>{item.experimentName}</Typography>
              <Typography sx={{ fontSize: 13, color: '#666' }}>{item.code}</Typography>
            </Box>

            <Button
              variant="contained"
              color="error"
              disabled
              onClick={() => openDelete(item)}
            >
              Delete
            </Button>
          </Box>
        ))}
      </Box>
    );
  });

  return (
    <Box sx={[backgroundContentCss]}>

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 8 }}>

        <Box sx={{ width: '60vw', mb: 2 }}>
          <Alert severity="warning" sx={{ borderRadius: 2 }}>
            Experiment deletion is temporarily disabled.
          </Alert>
        </Box>

        <Box
          sx={{
            width: '60vw',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            opacity: deletionDisabled ? 0.6 : 1,
          }}
        >

          <TextField
            fullWidth
            label="Search"
            placeholder="Search experiment name..."
            sx={[inputFieldCss]}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={deletionDisabled}
          />

          <Button
            onClick={handleSearch}
            sx={[searchButtonBgColorCss, { height: 40, minWidth: 120 }]}
            disabled={deletionDisabled}
          >
            <Typography sx={[searchTextCss]}>Search</Typography>
          </Button>

        </Box>

        <SearchResultList data={searchResult} />

        {openDeleteModal && selectedExperiment && (
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
          >

            <Card
              elevation={0}
              sx={{
                width: { xs: '95vw', sm: 700 },
                borderRadius: 4,
                p: 4,
                border: '1px solid #e6e6e6',
              }}
            >

              <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
                Delete Experiment
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography sx={{ mb: 2 }}>
                Are you sure you want to delete this experiment?
              </Typography>

              <Box sx={{ border: '1px solid #eee', borderRadius: 2, p: 2, bgcolor: '#fafafa' }}>
                <Typography sx={{ fontWeight: 700 }}>
                  {selectedExperiment.experimentName}
                </Typography>
                <Typography sx={{ fontSize: 13, color: '#666' }}>
                  Code: {selectedExperiment.code}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>

                <Button variant="outlined" onClick={closeDelete} disabled={deleting}>
                  Cancel
                </Button>

                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </Button>

              </Box>

            </Card>
          </Box>
        )}

      </Box>
    </Box>
  );
}