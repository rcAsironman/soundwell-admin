'use client';

import {
    Box,
    Button,
    Chip,
    CircularProgress,
    TextField,
    Typography
} from "@mui/material";
import { useEffect, useRef, useState, useCallback } from "react";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useStore } from "@/store/useStore";
import { backgroundContentCss } from "../css";
import { useToast } from "../components/ToastProvider";

type ExperimentType = {
    id: number;
    experimentName: string;
    experimentCode: string;
};

type UserType = {
    id: number;
    firstName: string;
    lastName: string;
    userName?: string | null;
    email?: string | null;
    dob?: string;
    gender?: string;
    createdAt?: string;
    updatedAt?: string;
    createdByAdminId?: number | null;
    createdByAdminName?: string | null;
    createdByAdminEmail?: string | null;
    experiments: ExperimentType[];
};

type PaginatedUsersResponse = {
    users: UserType[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
};

const chipGradients = [
    "linear-gradient(135deg, #E3F2FD 0%, #F3E5F5 100%)",
    "linear-gradient(135deg, #E8F5E9 0%, #E0F7FA 100%)",
    "linear-gradient(135deg, #FFF3E0 0%, #FCE4EC 100%)",
    "linear-gradient(135deg, #F3E5F5 0%, #E8EAF6 100%)",
    "linear-gradient(135deg, #E0F2F1 0%, #E8F5E9 100%)",
    "linear-gradient(135deg, #FFFDE7 0%, #F3E5F5 100%)",
];

export default function HomePage() {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

    const { firstName, lastName, token } = useStore();
    const { showToast } = useToast();

    const [searchText, setSearchText] = useState('');
    const [userResults, setUserResults] = useState<UserType[]>([]);
    const [page, setPage] = useState(1);
    const limit = 10;
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [isSearchMode, setIsSearchMode] = useState(false);

    const observerRef = useRef<IntersectionObserver | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

    const mergeUniqueUsers = (prev: UserType[], next: UserType[]) => {
        const map = new Map<number, UserType>();
        prev.forEach((user) => map.set(user.id, user));
        next.forEach((user) => map.set(user.id, user));
        return Array.from(map.values());
    };

    const fetchAllUsers = useCallback(async (pageToFetch: number, reset = false) => {
        try {
            setLoading(true);

            const res = await fetch(
                `${BASE_URL}/user/fetchAllWithPagination?page=${pageToFetch}&limit=${limit}`,
                {
                    method: 'GET',
                    headers: {
                        accept: '*/*',
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || 'Failed to fetch users');
            }

            const data: PaginatedUsersResponse = await res.json();

            setUserResults((prev) =>
                reset ? data.users : mergeUniqueUsers(prev, data.users)
            );
            setHasMore(data.hasMore);
            setPage(pageToFetch + 1);
        } catch (error) {
            showToast("Failed to fetch users", "error", 2500);
            setHasMore(false);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    }, [BASE_URL, token, limit, showToast]);

    const fetchSearchUsers = useCallback(async (reset: boolean) => {
        const q = searchText.trim();

        if (!q) {
            setIsSearchMode(false);
            setPage(1);
            setHasMore(true);
            fetchAllUsers(1, true);
            return;
        }

        const nextPage = reset ? 1 : page;

        try {
            setLoading(true);
            setIsSearchMode(true);

            const res = await fetch(
                `${BASE_URL}/user/userByName?search=${encodeURIComponent(q)}&page=${nextPage}&limit=${limit}`,
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

            let list: UserType[] = [];
            let nextHasMore = false;

            if (Array.isArray(data)) {
                list = data;
                nextHasMore = list.length === limit;
            } else if (Array.isArray(data?.users)) {
                list = data.users;
                nextHasMore = Boolean(data?.hasMore);
            }

            setUserResults((prev) => reset ? list : mergeUniqueUsers(prev, list));
            setHasMore(nextHasMore);
            setPage(nextPage + 1);

            if (reset && list.length === 0) {
                showToast("No users found", "error", 2500);
            }
        } catch (e) {
            showToast("No users found", "error", 3000);
            setUserResults([]);
            setHasMore(false);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    }, [BASE_URL, token, searchText, page, limit, showToast, fetchAllUsers]);

    useEffect(() => {
        fetchAllUsers(1, true);
    }, [fetchAllUsers]);

    const lastUserRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;

        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    if (isSearchMode) {
                        fetchSearchUsers(false);
                    } else {
                        fetchAllUsers(page, false);
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
    }, [loading, hasMore, isSearchMode, page, fetchAllUsers, fetchSearchUsers]);

    const clearAll = () => {
        setSearchText('');
        setUserResults([]);
        setPage(1);
        setHasMore(true);
        setIsSearchMode(false);
        fetchAllUsers(1, true);
    };

    return (
        <Box sx={[backgroundContentCss]}>
            <Typography sx={{ fontWeight: 600, fontSize: 20 }}>
                Welcome back, {firstName}, {lastName}
            </Typography>

            <Box sx={{ mt: 3, width: '100%' }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        width: "100%",
                        maxWidth: 1000,
                        mb: 3,
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
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                setPage(1);
                                fetchSearchUsers(true);
                            }
                        }}
                    />

                    <Button
                        variant="contained"
                        onClick={() => {
                            setPage(1);
                            fetchSearchUsers(true);
                        }}
                        disabled={loading}
                        sx={{ height: 40, minWidth: 120 }}
                    >
                        {loading && isSearchMode ? "Searching..." : "Search"}
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={clearAll}
                        sx={{ height: 40, minWidth: 100 }}
                    >
                        Clear
                    </Button>
                </Box>

                <Box
                    ref={scrollContainerRef}
                    sx={{
                        width: "100%",
                        height: "75vh",
                        overflowY: "auto",
                        bgcolor: "white",
                        border: "1px solid #e6e6e6",
                        borderRadius: 3,
                        p: 3,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                            pb: 1.5,
                            borderBottom: "1px solid #eee",
                            bgcolor: "white",
                        }}
                    >
                        <Typography sx={{ fontWeight: 700, color: "black", fontSize: 16 }}>
                            {isSearchMode ? "Search Results" : "All Users"}
                        </Typography>

                        <Typography sx={{ fontSize: 13, color: "black", opacity: 0.7 }}>
                            {userResults.length} user(s)
                        </Typography>
                    </Box>

                    {initialLoading ? (
                        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : userResults.length === 0 ? (
                        <Typography sx={{ textAlign: "center", py: 8, color: "black", opacity: 0.7 }}>
                            No users to display
                        </Typography>
                    ) : (
                        <>
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
                                    gap: 2,
                                }}
                            >
                                {userResults.map((user, index) => {
                                    const isLast = index === userResults.length - 1;

                                    return (
                                        <Box
                                            key={user.id}
                                            ref={isLast ? lastUserRef : null}
                                            sx={{
                                                border: "1px solid #ececec",
                                                borderRadius: 3,
                                                p: 2,
                                                bgcolor: "white",
                                                boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
                                                transition: "all 0.2s ease",
                                                minHeight: 220,
                                                display: "flex",
                                                flexDirection: "column",
                                                justifyContent: "space-between",
                                                "&:hover": {
                                                    boxShadow: "0px 6px 18px rgba(0,0,0,0.08)",
                                                    transform: "translateY(-2px)",
                                                },
                                            }}
                                        >
                                            <Box>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        alignItems: "flex-start",
                                                        mb: 1.5,
                                                    }}
                                                >
                                                    <Box sx={{ pr: 1 }}>
                                                        <Typography
                                                            sx={{
                                                                fontWeight: 700,
                                                                fontSize: 15,
                                                                color: "black",
                                                                lineHeight: 1.2,
                                                            }}
                                                        >
                                                            {user.firstName} {user.lastName}
                                                        </Typography>

                                                        <Typography
                                                            sx={{
                                                                fontSize: 11,
                                                                color: "black",
                                                                opacity: 0.65,
                                                                mt: 0.5,
                                                            }}
                                                        >
                                                            ID: {user.id}
                                                        </Typography>
                                                    </Box>

                                                    <AccountCircleIcon
                                                        sx={{
                                                            opacity: 0.65,
                                                            fontSize: 30,
                                                        }}
                                                    />
                                                </Box>

                                                <Typography
                                                    sx={{
                                                        fontSize: 12,
                                                        color: "black",
                                                        opacity: 0.75,
                                                        mb: 0.7,
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    Email: {user.email ?? "-"}
                                                </Typography>

                                                <Typography
                                                    sx={{
                                                        fontSize: 12,
                                                        color: "black",
                                                        opacity: 0.75,
                                                        mb: 0.7,
                                                    }}
                                                >
                                                    Username: {user.userName ?? "Not Activated"}
                                                </Typography>

                                                <Typography
                                                    sx={{
                                                        fontSize: 12,
                                                        color: "black",
                                                        opacity: 0.75,
                                                        mb: 0.7,
                                                    }}
                                                >
                                                    Created By: {user.createdByAdminName ?? "Root Admin"}
                                                </Typography>

                                                <Typography
                                                    sx={{
                                                        fontSize: 12,
                                                        color: "black",
                                                        opacity: 0.75,
                                                        mb: 1.5,
                                                        wordBreak: "break-word",
                                                    }}
                                                >
                                                    Creator Email: {user.createdByAdminEmail ?? "-"}
                                                </Typography>
                                            </Box>

                                            <Box>
                                                <Typography
                                                    sx={{
                                                        fontWeight: 600,
                                                        fontSize: 12,
                                                        color: "black",
                                                        mb: 1,
                                                    }}
                                                >
                                                    Experiments
                                                </Typography>

                                                {user.experiments && user.experiments.length > 0 ? (
                                                    <Box
                                                        sx={{
                                                            display: "flex",
                                                            flexWrap: "wrap",
                                                            gap: 0.8,
                                                        }}
                                                    >
                                                        {user.experiments.map((exp, expIndex) => (
                                                            <Chip
                                                                key={exp.id}
                                                                label={`${exp.experimentName} (${exp.experimentCode})`}
                                                                size="small"
                                                                sx={{
                                                                    fontSize: 10,
                                                                    height: 24,
                                                                    color: "#333",
                                                                    background: chipGradients[expIndex % chipGradients.length],
                                                                    borderRadius: "14px",
                                                                    maxWidth: "100%",
                                                                    "& .MuiChip-label": {
                                                                        px: 1.2,
                                                                        overflow: "hidden",
                                                                        textOverflow: "ellipsis",
                                                                    },
                                                                }}
                                                            />
                                                        ))}
                                                    </Box>
                                                ) : (
                                                    <Typography
                                                        sx={{
                                                            fontSize: 11,
                                                            color: "black",
                                                            opacity: 0.55,
                                                        }}
                                                    >
                                                        No experiments assigned
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>

                            {loading && (
                                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                                    <CircularProgress size={28} />
                                </Box>
                            )}

                            {!hasMore && userResults.length > 0 && (
                                <Typography
                                    sx={{
                                        textAlign: "center",
                                        py: 3,
                                        color: "black",
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
            </Box>
        </Box>
    );
}
