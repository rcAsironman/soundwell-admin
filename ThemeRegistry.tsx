'use client';

import * as React from 'react';
import { CacheProvider } from '@emotion/react';
import createEmotionCache from './createEmotionCache';
import { CssVarsProvider } from '@mui/joy/styles';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const clientSideEmotionCache = createEmotionCache();
const materialTheme = createTheme();

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider value={clientSideEmotionCache}>
      <CssVarsProvider>
        <ThemeProvider theme={materialTheme}>
          {children}
        </ThemeProvider>
      </CssVarsProvider>
    </CacheProvider>
  );
}
