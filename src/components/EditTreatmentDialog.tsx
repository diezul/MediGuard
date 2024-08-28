import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Slider,
  Grid,
  Box,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { styled } from '@mui/system';
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

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

interface EditTreatmentDialogProps {
  open: boolean;
  onClose: () => void;
  treatment: any;
  onSave: (updatedTreatment: any) => void;
}

const EditTreatmentDialog: React.FC<EditTreatmentDialogProps> = ({
  open,
  onClose,
  treatment,
  onSave,
}) => {
  const [medicineName, setMedicineName] = useState(treatment.medicineName || '');
  const [frequency, setFrequency] = useState(treatment.frequency || 1);
  const [times, setTimes] = useState<string[]>(treatment.times || ['']);
  const [startDate, setStartDate] = useState<Date | null>(
    treatment.startDate ? new Date(treatment.startDate.seconds * 1000) : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    treatment.endDate ? new Date(treatment.endDate.seconds * 1000) : null
  );

  useEffect(() => {
    setMedicineName(treatment.medicineName || '');
    setFrequency(treatment.frequency || 1);
    setTimes(treatment.times || ['']);
    setStartDate(treatment.startDate ? new Date(treatment.startDate.seconds * 1000) : null);
    setEndDate(treatment.endDate ? new Date(treatment.endDate.seconds * 1000) : null);
  }, [treatment]);

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

  const handleSave = async () => {
    const updatedTreatment = {
      ...treatment,
      medicineName,
      frequency,
      times,
      startDate,
      endDate,
    };

    try {
      await updateDoc(doc(db, "treatments", treatment.id), updatedTreatment);
      onSave(updatedTreatment);
      onClose();
    } catch (error) {
      console.error("Error updating treatment:", error);
      alert("Failed to update treatment. Please try again.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Dialog 
        open={open} 
        onClose={onClose} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          style: {
            backgroundColor: '#1E1E2E',
            boxShadow: 'none', // Remove shadow from dialog box
          },
        }}
      >
        <DialogTitle>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)', 
              fontWeight: 700,
              textShadow: 'none' // Remove shadow from title
            }}
          >
            Edit Treatment
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ '& > :not(style)': { m: 1 } }}>
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
                />
              </Box>
            ))}
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => (
                    <StyledTextField 
                      {...params} 
                      fullWidth 
                      required 
                      sx={{
                        '& .MuiInputBase-input': {
                          color: 'white', // Set text color to white
                        },
                      }}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={6}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => (
                    <StyledTextField 
                      {...params} 
                      fullWidth 
                      required 
                      sx={{
                        '& .MuiInputBase-input': {
                          color: 'white', // Set text color to white
                        },
                      }}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 2, justifyContent: 'space-between' }}>
          <Button 
            onClick={onClose}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            variant="contained"
            sx={{ 
              backgroundColor: '#FF6B6B', // Change Save Changes button color
              color: 'white',
              '&:hover': {
                backgroundColor: '#FF8C8C',
              }
            }}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default EditTreatmentDialog;