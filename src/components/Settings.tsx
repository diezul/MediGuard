import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, Switch, FormControlLabel, Avatar, Divider } from '@mui/material';
import { styled } from '@mui/system';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { auth, db } from "../firebase";
import { signOut, deleteUser, updatePassword, User } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";

const StyledBox = styled(Box)(({ theme }) => ({
  maxWidth: '600px',
  margin: 'auto',
  padding: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.7)',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.9)',
    },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  '& .MuiInputBase-input': {
    color: 'rgba(255, 255, 255, 0.9)',
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  color: '#1E1E2E',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
}));

const Settings: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notificationSound, setNotificationSound] = useState(true);
  const [notificationVibration, setNotificationVibration] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();
      if (userData) {
        setFullName(userData.fullName || '');
        setPhoneNumber(userData.phoneNumber || '');
        setNotificationSound(userData.notificationSound ?? true);
        setNotificationVibration(userData.notificationVibration ?? true);
        setNotificationsEnabled(userData.notificationsEnabled ?? false);
        setEmail(user.email || '');
      }
    }
  };

  const handleUpdateProfile = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          fullName,
          phoneNumber,
          notificationSound,
          notificationVibration,
          notificationsEnabled,
        });
        alert("Profile updated successfully");
      } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile. Please try again.");
      }
    }
  };

  const handleChangePassword = async () => {
    const user = auth.currentUser;
    if (user && newPassword) {
      try {
        await updatePassword(user, newPassword);
        alert("Password updated successfully");
        setNewPassword('');
      } catch (error: any) {
        console.error("Error updating password:", error);
        alert("Failed to update password. Please try again.");
      }
    } else {
      alert("Please enter a new password.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
      alert("Failed to sign out. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      const user = auth.currentUser;
      if (user) {
        try {
          await deleteDoc(doc(db, "users", user.uid));
          await deleteUser(user);
          navigate("/login");
        } catch (error: any) {
          console.error("Error deleting account:", error);
          alert("Failed to delete account. Please try again.");
        }
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <StyledBox>
        <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
          <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'rgba(255, 255, 255, 0.9)' }} />
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontWeight: 700,
            }}
          >
            Settings
          </Typography>
        </Box>
        <StyledTextField
          fullWidth
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          margin="normal"
        />
        <StyledTextField
          fullWidth
          label="Phone Number"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          margin="normal"
        />
        <StyledTextField
          fullWidth
          label="Email Address"
          value={email}
          margin="normal"
          disabled
          sx={{
            '& .MuiInputBase-input': {
              color: 'rgba(255, 255, 255, 0.9)', // Make email text white
            },
          }}
        />
        <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
        <FormControlLabel
          control={
            <Switch
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              color="primary"
            />
          }
          label={<Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>Enable Notifications</Typography>}
        />
        <FormControlLabel
          control={
            <Switch
              checked={notificationSound}
              onChange={(e) => setNotificationSound(e.target.checked)}
              color="primary"
            />
          }
          label={<Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>Enable Notification Sound</Typography>}
        />
        <FormControlLabel
          control={
            <Switch
              checked={notificationVibration}
              onChange={(e) => setNotificationVibration(e.target.checked)}
              color="primary"
            />
          }
          label={<Typography sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>Enable Notification Vibration</Typography>}
        />
        <StyledButton onClick={handleUpdateProfile} fullWidth variant="contained">
          Update Profile
        </StyledButton>
        <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
        <Typography variant="h6" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
          Change Password
        </Typography>
        <StyledTextField
          fullWidth
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          margin="normal"
        />
        <StyledButton onClick={handleChangePassword} fullWidth variant="contained">
          Update Password
        </StyledButton>
        <Divider sx={{ my: 3, bgcolor: 'rgba(255, 255, 255, 0.3)' }} />
        <Button 
          onClick={handleLogout} 
          fullWidth 
          variant="contained" 
          sx={{ 
            mt: 2, 
            bgcolor: '#FF6B6B', 
            color: 'white',
            '&:hover': { 
              bgcolor: '#FF8C8C' 
            } 
          }}
        >
          Logout
        </Button>
        <Button 
          onClick={handleDeleteAccount} 
          fullWidth 
          variant="outlined" 
          sx={{ 
            mt: 2, 
            color: '#ff6b6b', 
            borderColor: '#ff6b6b',
            '&:hover': {
              bgcolor: 'rgba(255, 107, 107, 0.1)'
            }
          }}
        >
          Delete Account
        </Button>
      </StyledBox>
    </motion.div>
  );
};

export default Settings;