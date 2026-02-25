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
  useTheme
} from '@mui/material'
import { useToast } from '../components/ToastProvider';

import {baseUrl} from '@/constants'
import { useStore } from "@/store/useStore"


export default function CreateUser() {

  const theme = useTheme();
  const { showToast } = useToast();
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [dob, setDob] = useState('1999-01-01')
  const [gender, setGender] = useState('')
  const [copied, setCopied] = useState<boolean>();
  const [textToCopy, setTextToCopy] = useState<string>('');


  const { token } = useStore();

  const handleCopy = async () => {

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(true)
      showToast("Email Copied!", "success", 3000);
      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const payload = {
      firstName,
      lastName,
      email,
      dob,
      gender,
    }

    let data;

    try {
      const response = await fetch(`${baseUrl}/admin/create-user`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify(payload),
      });

      if(!response.ok){
        const res = await response.json();
        throw new Error(res.message || 'Network response was not ok')
      };

      data = await response.json();

      console.log(data);

    }
    catch (error) {

    }

    const inviteCode = data?.inviteCode;

    const emailTemplate = `
Hi ${firstName} ${lastName},

We are pleased to inform you that your account has been successfully created.

Account Details:
--------------------------------
First Name: ${firstName}
Last Name: ${lastName}
Email: ${email}
Gender: ${gender}
Invite Code: ${inviteCode}
--------------------------------

To activate your account, please:

1. Visit the activation page.
2. Enter your Invite Code.
3. Enter your Date of Birth for verification.
4. Complete your Username and Password setup.

Note: Your account will not be active until activation is completed.

Best regards,
SoundWell
`;

    setTextToCopy(emailTemplate);
    showToast("User created successfully!", "success", 3000);
    console.log(payload)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'start',
        height: '100vh',
      }}
    >
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-around' }}>
        <Card sx={{ width: '60%', marginTop: 10 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Create User
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 5 }}
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

              <Button type="submit" variant="contained" sx={{ height: 30 }}>
                <Typography sx={{ fontSize: 12 }}>
                  Create Admin
                </Typography>
              </Button>
            </Box>
          </CardContent>
        </Card>

        {
          textToCopy.length > 0 && (
            <Card
              sx={{
                width: '30%',
                height: 400,
                mt: 10,
                overflowY: 'auto',
                p: 2,
                position: 'relative',
              }}>
              <Box
                sx={{
                  position: 'sticky',
                  top: 0,
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
              >
                <Button sx={{

                  bgcolor: copied ? 'grey' : theme.palette.primary.main,
                  color: copied ? 'black' : 'white',
                }}
                  onClick={handleCopy}

                >copy</Button>
              </Box>
              {textToCopy}
            </Card>
          )
        }
      </Box>
    </Box>
  )
}