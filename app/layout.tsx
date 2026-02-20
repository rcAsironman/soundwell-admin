'use client'

import type { Metadata } from "next";
import "./globals.css";
import ClientThemeProvider from "./ClientThemeProvider";
import { CssVarsProvider } from '@mui/joy/styles'
import { ToastProvider } from "@/app/components/ToastProvider";
import ThemeRegistry from "@/ThemeRegistry";
import SideBar from "./components/SideBar";
import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";

// export const metadata: Metadata = {
//   title: "Soundwell",
//   description: "Soundwell Admin",
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<any>(null);
  const {email, token} = useStore();

  useEffect(()=>{
    const user = localStorage.getItem('user');
    setUser(user);
  },[])
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <ToastProvider>
            <CssVarsProvider>
              <ClientThemeProvider>
                <div  className={`${token != '' ? 'layout' : ''}`}>
                  {
                    token != '' &&(<SideBar />)
                  }
                  <main className="content">
                    {children}
                  </main>
                </div>
              </ClientThemeProvider>
            </CssVarsProvider>
          </ToastProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
