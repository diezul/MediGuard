import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Slider, Grid } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNotifications } from '../hooks/useNotifications';

const StyledForm = styled('form')(({ theme }) => ({
  width: '100%',
  maxWidth: '500px',
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

const AddTreatment: React.FC = () => {
  const [medicineName, setMedicineName] = useState('');
  const [frequency, setFrequency] = useState(1);
  const [times, setTimes] = useState<string[]>(['']);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const navigate = useNavigate();
  const { testNotification } = useNotifications();

  const handleFrequencyChange = (_event: Event, newValue: number | number[]) => {
    const updatedFrequency = newValue as number;
    setFrequency(updatedFrequency);
    setTimes(Array(updatedFrequency).fill(''));
  };

  const handleTimeChange = (index: number, value: string) => {
    const newTimes = [...times];
    newTimes[index] = value;
    setTimes(newTimes);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineName || !startDate || !endDate || times.some(time => time === '')) {
      alert("Please fill in all fields.");
      return;
    }

    const user = auth.currentUser;
    if (user) {
      try {
        const treatmentData = {
          userId: user.uid,
          medicineName,
          frequency,
          times: times.map(time => time.slice(0, 5)), // Ensure times are in HH:MM format
          startDate,
          endDate,
        };

        await addDoc(collection(db, "treatments"), treatmentData);
        console.log('Treatment added:', treatmentData);
        alert("Treatment added successfully!");
        navigate('/treatments');
      } catch (error) {
        console.error("Error adding treatment:", error);
        alert("Failed to add treatment. Please try again.");
      }
    } else {
      alert("You must be logged in to add a treatment.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 2, pt: 0 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          align="center" 
          sx={{ 
            color: 'rgba(255, 255, 255, 0.9)', 
            fontWeight: 700, 
            mb: 3,
            textShadow: 'none'
          }}
        >
          Add New Treatment
        </Typography>
        <StyledForm onSubmit={handleSubmit}>
          <StyledTextField
            fullWidth
            label="Medicine Name"
            value={medicineName}
            onChange={(e) => setMedicineName(e.target.value)}
            margin="normal"
            required
          />
          <Box sx={{ mt: 3, mb: 2 }}>
            <Typography gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Frequency per day: {frequency}
            </Typography>
            <Slider
              value={frequency}
              onChange={handleFrequencyChange}
              step={1}
              marks
              min={1}
              max={12}
              valueLabelDisplay="auto"
              sx={{
                color: 'rgba(255, 255, 255, 0.7)',
                '& .MuiSlider-thumb': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
                '& .MuiSlider-track': {
                  backgroundColor: 'rgba(255, 255, 255, 0.7)',
                },
                '& .MuiSlider-rail': {
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            />
          </Box>
          {times.map((time, index) => (
            <Box key={index} sx={{ mb: 2 }}>
              <Typography gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                Specify the hour to take the {index === 0 ? 'first' : index === 1 ? 'second' : index === 2 ? 'third' : `${index + 1}th`} medicine
              </Typography>
              <StyledTextField
                type="time"
                value={time}
                onChange={(e) => handleTimeChange(index, e.target.value)}
                fullWidth
                required
                InputLabelProps={{
                  shrink: true,
                }}
                inputProps={{
                  step: 300, // 5 min
                }}
              />
            </Box>
          ))}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                renderInput={(params) => <StyledTextField {...params} fullWidth required />}
              />
            </Grid>
            <Grid item xs={6}>
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                renderInput={(params) => <StyledTextField {...params} fullWidth required />}
              />
            </Grid>
          </Grid>
          <Button 
            type="submit" 
            fullWidth 
            variant="contained" 
            sx={{ 
              mt: 3, 
              bgcolor: '#FF6B6B', 
              color: 'white',
              '&:hover': { 
                bgcolor: '#FF8C8C' 
              } 
            }}
          >
            Save Treatment
          </Button>
        </StyledForm>
        <Button 
          onClick={testNotification}
          fullWidth 
          variant="outlined" 
          sx={{ 
            mt: 2, 
            color: '#FF6B6B', 
            borderColor: '#FF6B6B',
            '&:hover': { 
              bgcolor: 'rgba(255, 107, 107, 0.1)' 
            } 
          }}
        >
          Test Notification
        </Button>
      </Box>
    </LocalizationProvider>
  );
};

export default AddTreatment;