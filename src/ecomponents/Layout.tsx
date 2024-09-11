import React from 'react';
import { Box, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { styled } from '@mui/system';
import { useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AddIcon from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import { useAuth } from '../hooks/useAuth';

const ContentWrapper = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: '#1E1E2E', // Dark background color
  color: '#FFFFFF', // Light text color
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(8), // Add padding to account for bottom navigation
}));

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleNavigation = (event: React.ChangeEvent<{}>, newValue: string) => {
    navigate(newValue);
  };

  return (
    <ContentWrapper>
      {children}
      {user && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
          <BottomNavigation
            value={location.pathname}
            onChange={handleNavigation}
            showLabels
            sx={{
              backgroundColor: '#2A2A3C', // Dark background for bottom navigation
              '& .MuiBottomNavigationAction-root': {
                color: '#B0B0B0', // Light gray for inactive icons
              },
              '& .Mui-selected': {
                color: '#FF6B6B', // Accent color for active icon
              },
            }}
          >
            <BottomNavigationAction label="Treatments" icon={<HomeIcon />} value="/treatments" />
            <BottomNavigationAction label="Add" icon={<AddIcon />} value="/add-treatment" />
            <BottomNavigationAction label="Settings" icon={<SettingsIcon />} value="/settings" />
          </BottomNavigation>
        </Paper>
      )}
    </ContentWrapper>
  );
};

export default Layout;