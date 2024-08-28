import React from 'react';
import { Box, IconButton } from '@mui/material';
import { styled } from '@mui/system';
import HomeIcon from '@mui/icons-material/Home';
import AddBoxIcon from '@mui/icons-material/AddBox';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';

// Styled components
const PageContainer = styled(Box)({
  backgroundColor: '#1E1E2F',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
});

const ContentWrapper = styled(Box)({
  flex: '1 0 auto',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
});

const BottomNav = styled(Box)({
  backgroundColor: '#2C2C3A',
  padding: '10px 20px',
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  width: '100%',
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  boxShadow: '0 -2px 5px rgba(0, 0, 0, 0.3)',
  zIndex: 1000,
});

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <PageContainer>
      <ContentWrapper>
        {children}
      </ContentWrapper>
      <BottomNav>
        <IconButton onClick={() => navigate('/treatments')} color="primary">
          <HomeIcon fontSize="large" style={{ color: '#FFF' }} />
        </IconButton>
        <IconButton onClick={() => navigate('/add-treatment')} color="primary">
          <AddBoxIcon fontSize="large" style={{ color: '#FFF' }} />
        </IconButton>
        <IconButton onClick={() => navigate('/settings')} color="primary">
          <SettingsIcon fontSize="large" style={{ color: '#FFF' }} />
        </IconButton>
      </BottomNav>
    </PageContainer>
  );
};

export default PageLayout;