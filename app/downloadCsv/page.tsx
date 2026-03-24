'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  TextField,
  Typography,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import ClearAllIcon from '@mui/icons-material/ClearAll';

import { backgroundContentCss, inputFieldCss } from '../css';
import { useStore } from '@/store/useStore';
import { useToast } from '../components/ToastProvider';

type ExperimentListItem = {
  id: string;
  experimentName: string;
  experimentCode: string;
  createdAt?: string;
  updatedAt?: string;
};

type FetchAllExperimentsResponse = {
  experiments: ExperimentListItem[];
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
};

type DownloadSelectedPayload = {
  experimentIds: number[];
};

function uniqueById<T extends { id: string | number }>(arr: T[]): T[] {
  const map = new Map<string | number, T>();
  for (const item of arr) map.set(item.id, item);
  return Array.from(map.values());
}

function formatDate(value?: string) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function DownloadCsvPage() {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const { token } = useStore();
  const { showToast } = useToast();

  const expLimit = 10;

  const [allExperiments, setAllExperiments] = useState<ExperimentListItem[]>([]);
  const [allExperimentsPage, setAllExperimentsPage] = useState(1);
  const [allExperimentsHasMore, setAllExperimentsHasMore] = useState(true);
  const [allExperimentsLoading, setAllExperimentsLoading] = useState(false);
  const [allExperimentsInitialLoading, setAllExperimentsInitialLoading] = useState(true);

  const [selectedExperimentIds, setSelectedExperimentIds] = useState<number[]>([]);
  const [searchText, setSearchText] = useState('');
  const [downloading, setDownloading] = useState(false);

  const experimentScrollRef = useRef<HTMLDivElement | null>(null);
  const didInitialFetchRef = useRef(false);

  const displayedExperiments = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return allExperiments;

    return allExperiments.filter((exp) => {
      return (
        exp.experimentName.toLowerCase().includes(q) ||
        exp.experimentCode.toLowerCase().includes(q) ||
        exp.id.toLowerCase().includes(q)
      );
    });
  }, [allExperiments, searchText]);

  const selectedExperiments = useMemo(() => {
    const selectedSet = new Set(selectedExperimentIds);
    return allExperiments.filter((exp) => selectedSet.has(Number(exp.id)));
  }, [allExperiments, selectedExperimentIds]);

  const fetchAllExperiments = useCallback(
    async (pageToFetch: number, reset = false) => {
      if (!token) return;

      try {
        setAllExperimentsLoading(true);

        const res = await fetch(
          `${BASE_URL}/experiment/fetchAllWithPagination?page=${pageToFetch}&limit=${expLimit}`,
          {
            method: 'GET',
            headers: {
              accept: '*/*',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || 'Failed to fetch experiments');
        }

        const data: FetchAllExperimentsResponse = await res.json();
        const list = Array.isArray(data?.experiments) ? data.experiments : [];

        setAllExperiments((prev) => (reset ? list : uniqueById([...prev, ...list])));
        setAllExperimentsHasMore(Boolean(data?.hasMore));
        setAllExperimentsPage(pageToFetch + 1);
      } catch (e: any) {
        showToast(e?.message || 'Failed to fetch experiments', 'error', 3000);
        setAllExperimentsHasMore(false);
      } finally {
        setAllExperimentsLoading(false);
        setAllExperimentsInitialLoading(false);
      }
    },
    [BASE_URL, token, expLimit, showToast]
  );

  useEffect(() => {
    if (!token) return;
    if (didInitialFetchRef.current) return;
    didInitialFetchRef.current = true;
    fetchAllExperiments(1, true);
  }, [token, fetchAllExperiments]);

  const handleExperimentScroll = () => {
    const el = experimentScrollRef.current;
    if (!el || allExperimentsLoading || !allExperimentsHasMore) return;

    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (!nearBottom) return;

    fetchAllExperiments(allExperimentsPage, false);
  };

  const toggleExperiment = (exp: ExperimentListItem) => {
    const numericId = Number(exp.id);
    setSelectedExperimentIds((prev) =>
      prev.includes(numericId)
        ? prev.filter((id) => id !== numericId)
        : [...prev, numericId]
    );
  };

  const removeSelectedExperiment = (id: number) => {
    setSelectedExperimentIds((prev) => prev.filter((item) => item !== id));
  };

  const clearSelection = () => {
    setSelectedExperimentIds([]);
  };

  const downloadCsv = useCallback(async () => {
    if (!token) {
      showToast('Authentication token not found', 'error', 3000);
      return;
    }

    try {
      setDownloading(true);

      const downloadAll = selectedExperimentIds.length === 0;
      const url = downloadAll
        ? `${BASE_URL}/researcher-download/csv/all`
        : `${BASE_URL}/researcher-download/csv`;

      const res = await fetch(url, {
        method: downloadAll ? 'GET' : 'POST',
        headers: {
          accept: '*/*',
          Authorization: `Bearer ${token}`,
          ...(downloadAll ? {} : { 'Content-Type': 'application/json' }),
        },
        ...(downloadAll
          ? {}
          : {
              body: JSON.stringify({
                experimentIds: selectedExperimentIds,
              } as DownloadSelectedPayload),
            }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to download CSV');
      }

      const blob = await res.blob();
      const fileUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = fileUrl;
      a.download =
        selectedExperimentIds.length === 0
          ? 'all-experiments.csv'
          : 'selected-experiments.csv';

      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(fileUrl);

      showToast(
        selectedExperimentIds.length === 0
          ? 'All experiments downloaded'
          : 'Selected experiments downloaded',
        'success',
        3000
      );
    } catch (e: any) {
      showToast(e?.message || 'Failed to download CSV', 'error', 3000);
    } finally {
      setDownloading(false);
    }
  }, [BASE_URL, token, selectedExperimentIds, showToast]);

  const containerWidth = { xs: '92vw', sm: 720, md: 920 };

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
          width: '80vw',
          bgcolor: 'white',
          borderRadius: 3,
          p: { xs: 2, sm: 3 },
          border: '1px solid #e6e6e6',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: 'black' }}>
              Researcher Download
            </Typography>
            <Box sx={{ height: 2, width: 220, bgcolor: 'black', mt: 1 }} />
            <Typography sx={{ mt: 1.25, color: 'black', opacity: 0.75, fontSize: 14 }}>
              Select experiments from the left side. Selected experiments will appear on
              the right side. If nothing is selected, all experiments will be downloaded.
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              label={`${selectedExperimentIds.length} selected`}
              sx={{
                bgcolor: '#0A1F78',
                color: 'white',
                fontWeight: 700,
              }}
            />
            <Chip
              label={
                selectedExperimentIds.length === 0
                  ? 'No selection means all experiments will be downloaded'
                  : 'Only selected experiments will be downloaded'
              }
              sx={{
                bgcolor: selectedExperimentIds.length === 0 ? '#FFF7E6' : '#EEF8EE',
                color: selectedExperimentIds.length === 0 ? '#9A6B00' : '#2E7D32',
                border: '1px solid #d9d9d9',
                fontWeight: 500,
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: { xs: 'stretch', md: 'center' },
              flexDirection: { xs: 'column', md: 'row' },
              gap: 2,
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'black' }}>
                Download Options
              </Typography>
              
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                startIcon={<ClearAllIcon />}
                onClick={clearSelection}
                disabled={selectedExperimentIds.length === 0 || downloading}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2,
                }}
              >
                Clear Selection
              </Button>

              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={downloadCsv}
                disabled={downloading}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  borderRadius: 2,
                  bgcolor: '#0A1F78',
                  '&:hover': { bgcolor: '#08185d' },
                }}
              >
                {downloading
                  ? 'Downloading...'
                  : selectedExperimentIds.length === 0
                    ? 'Download All Experiments'
                    : 'Download Selected Experiments'}
              </Button>
            </Box>
          </Box>

          <Divider />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
              gap: 0,
            }}
          >
            <Card
              variant="outlined"
              sx={{
                bgcolor: 'white',
                borderRadius: 2,
                p: 1,
                height: 420,
                width: '80%',
                overflowY: 'auto',
                position: 'relative',
              }}
              ref={experimentScrollRef}
              onScroll={handleExperimentScroll}
            >
              <Box
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                  bgcolor: 'white',
                  pb: 1,
                  px: 1,
                  borderBottom: '1px solid #eee',
                }}
              >
                <Typography sx={{ color: 'black', fontWeight: 700, fontSize: 14, mb: 1 }}>
                  All Experiments
                </Typography>

                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search by name, code, or id"
                  sx={[inputFieldCss]}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: '#999', fontSize: 18 }} />,
                  }}
                />
              </Box>

              {allExperimentsInitialLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                  <CircularProgress size={28} />
                </Box>
              ) : displayedExperiments.length === 0 ? (
                <Typography sx={{ color: 'black', opacity: 0.7, textAlign: 'center', py: 4 }}>
                  No experiments to display
                </Typography>
              ) : (
                <>
                  {displayedExperiments.map((exp) => {
                    const isSelected = selectedExperimentIds.includes(Number(exp.id));

                    return (
                      <Box
                        key={exp.id}
                        onClick={() => toggleExperiment(exp)}
                        sx={{
                          px: 2,
                          py: 1.5,
                          mt: 0.75,
                          cursor: 'pointer',
                          border: isSelected ? '2px solid #2563EB' : '1px solid #eaeaea',
                          borderRadius: 2,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          opacity: 1,
                          bgcolor: isSelected ? '#F7FAFF' : 'white',
                          width: '100%'
                        }}
                      >
                        <Box>
                          <Typography sx={{ color: 'black', fontWeight: 700, fontSize: 16 }}>
                            {exp.experimentName}
                          </Typography>
                          <Typography sx={{ color: 'black', opacity: 0.85, fontSize: 14, mt: 0.5 }}>
                            Code: {exp.experimentCode}
                          </Typography>
                          <Typography sx={{ color: 'black', opacity: 0.7, fontSize: 13, mt: 0.5 }}>
                            Experiment ID: {exp.id}
                          </Typography>
                          <Typography sx={{ color: 'black', opacity: 0.7, fontSize: 12, mt: 0.5 }}>
                            Created: {formatDate(exp.createdAt)}
                          </Typography>
                          <Typography sx={{ color: 'black', opacity: 0.7, fontSize: 12, mt: 0.25 }}>
                            Updated: {formatDate(exp.updatedAt)}
                          </Typography>
                        </Box>

                        {isSelected && (
                          <Chip
                            label="Selected"
                            size="small"
                            sx={{
                              borderRadius: 2,
                              border: '1px solid #ccc',
                              bgcolor: '#f2f2f2',
                            }}
                          />
                        )}
                      </Box>
                    );
                  })}

                  {allExperimentsLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                      <CircularProgress size={24} />
                    </Box>
                  )}

                  {!allExperimentsHasMore && displayedExperiments.length > 0 && (
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
                height: 420,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                position: 'relative',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ color: 'black', fontWeight: 700, fontSize: 14 }}>
                  Selected Experiments
                </Typography>
                <Button size="small" onClick={clearSelection}>
                  clear
                </Button>
              </Box>

              {selectedExperiments.length === 0 ? (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    px: 1,
                  }}
                >
                  <Typography sx={{ color: 'black', opacity: 0.7, fontSize: 14 }}>
                    No experiments selected
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {selectedExperiments.map((exp) => (
                      <Chip
                        key={exp.id}
                        label={`${exp.experimentName} (${exp.experimentCode})`}
                        onDelete={() => removeSelectedExperiment(Number(exp.id))}
                        sx={{ borderRadius: 2, border: '1px solid #ccc' }}
                      />
                    ))}
                  </Box>

                  <Divider sx={{ my: 1 }} />

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {selectedExperiments.map((exp) => (
                      <Box
                        key={exp.id}
                        sx={{
                          border: '1px solid #ececec',
                          borderRadius: 2,
                          p: 1.25,
                        }}
                      >
                        <Typography sx={{ color: 'black', fontWeight: 700, fontSize: 14 }}>
                          {exp.experimentName}
                        </Typography>
                        <Typography sx={{ color: 'black', opacity: 0.8, fontSize: 13, mt: 0.5 }}>
                          Code: {exp.experimentCode}
                        </Typography>
                        <Typography sx={{ color: 'black', opacity: 0.7, fontSize: 12, mt: 0.35 }}>
                          Experiment ID: {exp.id}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </>
              )}
            </Card>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}