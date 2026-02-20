'use client'

import { useState, useEffect } from 'react'
import { TextField, Button, Typography, Box } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'

export type UserType = {
  id: number
  firstName: string
  lastName: string
  username: string
  email: string
}

type SearchUserProps = {
  onResult: (result: UserType[]) => void
}

const SearchUser = ({ onResult }: SearchUserProps) => {
  const [query, setQuery] = useState('')

  // Clear results when query becomes empty
  useEffect(() => {
    if (query.trim() === '') {
      onResult([])
    }
  }, [query, onResult])

  const handleSearch = async () => {
    // 🔥 Replace with real API call later

    const data: UserType[] = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        username: 'john_doe',
        email: `john_${query}@example.com`,
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'jane_smith',
        email: `jane_${query}@example.com`,
      },
      {
        id: 3,
        firstName: 'Alex',
        lastName: 'Brown',
        username: 'alex_brown',
        email: `alex_${query}@example.com`,
      },
      {
        id: 4,
        firstName: 'John',
        lastName: 'Doe',
        username: 'john_doe',
        email: `john_${query}@example.com`,
      },
      {
        id: 5,
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'jane_smith',
        email: `jane_${query}@example.com`,
      },
      {
        id: 6,
        firstName: 'Alex',
        lastName: 'Brown',
        username: 'alex_brown',
        email: `alex_${query}@example.com`,
      },
      {
        id: 7,
        firstName: 'John',
        lastName: 'Doe',
        username: 'john_doe',
        email: `john_${query}@example.com`,
      },
      {
        id: 8,
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'jane_smith',
        email: `jane_${query}@example.com`,
      },
      {
        id: 9,
        firstName: 'Alex',
        lastName: 'Brown',
        username: 'alex_brown',
        email: `alex_${query}@example.com`,
      },
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        username: 'john_doe',
        email: `john_${query}@example.com`,
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'jane_smith',
        email: `jane_${query}@example.com`,
      },
      {
        id: 3,
        firstName: 'Alex',
        lastName: 'Brown',
        username: 'alex_brown',
        email: `alex_${query}@example.com`,
      },
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        username: 'john_doe',
        email: `john_${query}@example.com`,
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'jane_smith',
        email: `jane_${query}@example.com`,
      },
      {
        id: 3,
        firstName: 'Alex',
        lastName: 'Brown',
        username: 'alex_brown',
        email: `alex_${query}@example.com`,
      },
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        username: 'john_doe',
        email: `john_${query}@example.com`,
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'jane_smith',
        email: `jane_${query}@example.com`,
      },
      {
        id: 3,
        firstName: 'Alex',
        lastName: 'Brown',
        username: 'alex_brown',
        email: `alex_${query}@example.com`,
      },
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        username: 'john_doe',
        email: `john_${query}@example.com`,
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'jane_smith',
        email: `jane_${query}@example.com`,
      },
      {
        id: 3,
        firstName: 'Alex',
        lastName: 'Brown',
        username: 'alex_brown',
        email: `alex_${query}@example.com`,
      },
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        username: 'john_doe',
        email: `john_${query}@example.com`,
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'jane_smith',
        email: `jane_${query}@example.com`,
      },
      {
        id: 3,
        firstName: 'Alex',
        lastName: 'Brown',
        username: 'alex_brown',
        email: `alex_${query}@example.com`,
      },
    ]

    onResult(data)
  }

  return (
    <Box
      sx={{
        width: '80%',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <TextField
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search user..."
        size="small"
        sx={{ width: '90%' }}
      />

      <Button
        variant="contained"
        sx={{ ml: 2 }}
        onClick={handleSearch}
        startIcon={<SearchIcon />}
      >
        <Typography>Search</Typography>
      </Button>
    </Box>
  )
}

export default SearchUser