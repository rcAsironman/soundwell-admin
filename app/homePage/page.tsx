'use client';

import { Box, Button, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useStore } from "@/store/useStore";
import { backgroundContentCss } from "../css";
import { baseUrl } from "@/constants";
import { useToast } from "../components/ToastProvider";

type UserType = {
    id: number;
    firstName: string;
    lastName: string;
    userName?: string | null;
    email?: string | null;
};

export default function HomePage() {
    const { firstName, lastName, token } = useStore();
    const { showToast } = useToast();

    const [searchText, setSearchText] = useState('');
    const [userResults, setUserResults] = useState<UserType[]>([]);
    const [page, setPage] = useState(1);
    const limit = 10;
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const resultsRef = useRef<HTMLDivElement | null>(null);
    const searchBarRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            const target = event.target as Node;
            const insideResults = resultsRef.current?.contains(target);
            const insideSearch = searchBarRef.current?.contains(target);

            if (!insideResults && !insideSearch) {
                // close results only (don’t wipe input unless you want)
                setUserResults([]);
                setPage(1);
                setHasMore(true);
            }
        };

        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const clearAll = () => {
        setSearchText('');
        setUserResults([]);
        setPage(1);
        setHasMore(true);
    };

    const fetchUsers = async (opts: { reset: boolean }) => {
        const q = searchText.trim();
        if (!q) {
            showToast("Enter a name/email/username to search", "error", 2500);
            return;
        }

        const nextPage = opts.reset ? 1 : page;

        try {
            setLoading(true);

            // This matches your curl exactly:
            // GET /user/userByName?search=john&page=1&limit=10
            const res = await fetch(
                `${baseUrl}/user/userByName?search=${encodeURIComponent(q)}&page=${nextPage}&limit=${limit}`,
                {
                    method: "GET",
                    headers: {
                        accept: "*/*",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || "Search failed");
            }

            const data = await res.json();
            const list: UserType[] = Array.isArray(data) ? data : [];

            setUserResults((prev) => (opts.reset ? list : [...prev, ...list]));
            setHasMore(list.length === limit);
            setPage(nextPage + 1);

            if (opts.reset && list.length === 0) {
                showToast("No users found", "error", 2500);
            }
        } catch (e: any) {
            showToast("No users found", "error", 3000);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={[backgroundContentCss]}>
            <Typography style={{ fontWeight: 600, fontSize: 20 }}>
                Welcome back, {firstName}, {lastName}
            </Typography>

            <Box sx={{ position: "relative", width: "100%", mt: 2 }}>
                <Box
                    ref={searchBarRef}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        width: "60%",
                        minWidth: 520,
                    }}
                >
                    <TextField
                        fullWidth
                        label="Search user"
                        placeholder="Search by name / email / username..."
                        size="medium"
                        value={searchText}
                        onChange={(e) => {
                            setSearchText(e.target.value);
                            setPage(1);
                            setHasMore(true);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") fetchUsers({ reset: true });
                        }}
                    />

                    <Button
                        variant="contained"
                        onClick={() => fetchUsers({ reset: true })}
                        disabled={loading}
                        sx={{ height: 40, minWidth: 120 }}
                    >
                        {loading ? "Searching..." : "Search"}
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={clearAll}
                        sx={{ height: 40, minWidth: 100 }}
                    >
                        Clear
                    </Button>
                </Box>

                {userResults.length > 0 && (
                    <Box
                        ref={resultsRef}
                        sx={{
                            position: "absolute",
                            top: 56,
                            left: 0,
                            width: "60%",
                            minWidth: 520,
                            bgcolor: "white",
                            border: "1px solid #e6e6e6",
                            borderRadius: 2,
                            zIndex: 10,
                            maxHeight: 320,
                            overflowY: "auto",
                        }}
                    >
                        {/* Sticky header so buttons never overlap list */}
                        <Box
                            sx={{
                                position: "sticky",
                                top: 0,
                                bgcolor: "white",
                                borderBottom: "1px solid #eee",
                                px: 2,
                                py: 1,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                zIndex: 2,
                            }}
                        >
                            <Typography sx={{ fontSize: 12, color: "black", opacity: 0.7 }}>
                                Results: {userResults.length}
                            </Typography>

                            <Button
                                size="small"
                                onClick={() => {
                                    setUserResults([]);
                                    setPage(1);
                                    setHasMore(true);
                                }}
                            >
                                close
                            </Button>
                        </Box>

                        {userResults.map((user) => (
                            <Box
                                key={user.id}
                                sx={{
                                    px: 3,
                                    py: 1.5,
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    borderBottom: "1px solid #f2f2f2",
                                    cursor: "pointer",
                                    "&:hover": { bgcolor: "#fafafa" },
                                }}
                            >
                                <Box>
                                    <Typography sx={{ fontWeight: 700, color: "black", fontSize: 13 }}>
                                        {user.firstName} {user.lastName}
                                    </Typography>
                                    <Typography sx={{ color: "black", opacity: 0.7, fontSize: 12 }}>
                                        {user.email ?? "-"}
                                    </Typography>
                                </Box>
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    width: '20%'
                                }}>
                                    {user.userName=== null && (
                                        <Typography sx={{ color: "grey", opacity: 0.7, fontSize: 8 }}>
                                        Not Activated
                                    </Typography>
                                    )}
                                    <AccountCircleIcon sx={{ opacity: 0.7 }} />
                                </Box>
                            </Box>
                        ))}

                        <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                            {hasMore ? (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => fetchUsers({ reset: false })}
                                    disabled={loading}
                                >
                                    {loading ? "Loading..." : "Load more"}
                                </Button>
                            ) : (
                                <Typography sx={{ color: "black", opacity: 0.65, fontSize: 12 }}>
                                    End of results
                                </Typography>
                            )}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
}