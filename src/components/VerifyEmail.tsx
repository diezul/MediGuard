import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { sendEmailVerification } from 'firebase/auth';
import { Box, Button, Typography, CircularProgress, Container } from '@mui/material';
import { styled } from '@mui/system';

const StyledContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #ff6b6b 0%, #6b5b95 100%)',
}));

const StyledBox = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: '400px',
  padding: theme.spacing(4),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
  backdropFilter: 'blur(10px)',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  textAlign: 'center',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius,
}));

const VerifyEmail: React.FC = () => {
  const [message, setMessage] = useState<string>('A verification email has been sent to your inbox. Please check your email and click the verification link.');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const intervalId = setInterval(() => {
      auth.currentUser?.reload().then(() => {
        if (auth.currentUser?.emailVerified) {
          setMessage('Your email has been verified! Redirecting...');
          clearInterval(intervalId);
          setTimeout(() => {
            navigate('/profile-setup');
          }, 2000); // Redirect after 2 seconds
        }
      }).catch(() => {
        setError('Failed to verify your email. Please try again.');
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, [navigate]);

  const handleResendVerification = async () => {
    setLoading(true);
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        setMessage('Verification email resent. Please check your inbox.');
        setError(null);
      }
    } catch (error: any) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledContainer maxWidth={false}>
      <StyledBox>
        <Typography variant="h4" align="center" gutterBottom sx={{ color: 'white' }}>
          Verify Your Email
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph sx={{ color: 'white' }}>
          {message}
        </Typography>
        {error && (
          <Typography variant="body1" color="error" paragraph>
            {error}
          </Typography>
        )}
        <StyledButton
          variant="contained"
          color="primary"
          onClick={handleResendVerification}
          disabled={loading}
          fullWidth
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Resend Verification Email'}
        </StyledButton>
        <Typography variant="body2" color="textSecondary" mt={2} sx={{ color: 'white' }}>
          If you haven't received the email, please check your spam folder.
        </Typography>
      </StyledBox>
    </StyledContainer>
  );
};

export default VerifyEmail;
