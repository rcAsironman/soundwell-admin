'use client'

import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  MenuItem,
} from '@mui/material'

export default function CreateUser() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('1999-01-01')
  const [gender, setGender] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const payload = {
      firstName,
      lastName,
      email,
      dob,
      gender,
    }

    console.log(payload)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Card sx={{ width: 400 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Create User
          </Typography>

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />

            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <TextField
              label="Date of Birth"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />

            <TextField
              select
              label="Gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
            >
              <MenuItem value="MALE">Male</MenuItem>
              <MenuItem value="FEMALE">Female</MenuItem>
            </TextField>

            <Button type="submit" variant="contained">
              Create User
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}