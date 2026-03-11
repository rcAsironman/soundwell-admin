'use client'

import { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
} from '@mui/material'
import { backgroundContentCss } from '../css'
import { useStore } from '@/store/useStore'
import { useToast } from '../components/ToastProvider'


export default function CreateAdminPage() {

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const {token} = useStore();
  const {showToast} = useToast();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const payload = {
      firstName,
      lastName,
      email,
      password,
    }

    const response = await fetch(`${BASE_URL}/admin/create`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      }
    );


    if(!response.ok){
      showToast("Something Went Wrong", 'error', 3000);
    }

    showToast("Admin Created Successfully", 'success', 3000);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPassword('');
    console.log(payload);
  }

  return (
    <Box
      sx={[backgroundContentCss,]}
    >
     <center>
       <Card sx={{ width: 650, height: 500, mt: 10, borderRadius: 3, py:4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Create Admin
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
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button type="submit" variant="contained" sx={{
              height: 50
            }}>
              <Typography sx={{fontSize: 12}}>
                Create Admin
              </Typography>
            </Button>
          </Box>
        </CardContent>
      </Card>
     </center>
    </Box>
  )
}