import type { Metadata } from "next";
import "./globals.css";
import ClientThemeProvider from "./ClientThemeProvider";
import { CssVarsProvider } from '@mui/joy/styles'
import { ToastProvider } from "@/app/components/ToastProvider";
import ThemeRegistry from "@/ThemeRegistry";


export const metadata: Metadata = {
  title: "Soundwell",
  description: "Soundwell Admin",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <ToastProvider>
            <CssVarsProvider>
              <ClientThemeProvider>
                {children}
              </ClientThemeProvider>
            </CssVarsProvider>
          </ToastProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
