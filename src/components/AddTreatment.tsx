import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Slider, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import DatePicker from 'react-datepicker';  // Importă react-datepicker
import 'react-datepicker/dist/react-datepicker.css';  // Importă stilurile

const AddTreatment: React.FC = () => {
  const [medicineName, setMedicineName] = useState('');
  const [frequency, setFrequency] = useState(1);
  const [times, setTimes] = useState<string[]>(['']);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const navigate = useNavigate();

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
          times: times.map(time => time.slice(0, 5)),  // Formatează timpul la HH:MM
          startDate,
          endDate,
        };

        await addDoc(collection(db, "treatments"), treatmentData);
        alert("Treatment added successfully!");
        navigate('/treatments');
      } catch (error) {
        alert("Failed to add treatment. Please try again.");
      }
    } else {
      alert("You must be logged in to add a treatment.");
    }
  };

  return (
    <Box sx={{ p: 2, pt: 0 }}>
      <Typography variant="h4" align="center">
        Add New Treatment
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Medicine Name"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          margin="normal"
          required
        />
        <Box>
          <Typography>Frequency per day: {frequency}</Typography>
          <Slider
            value={frequency}
            onChange={(event, newValue) => setFrequency(newValue as number)}
            step={1}
            marks
            min={1}
            max={12}
            valueLabelDisplay="auto"
          />
        </Box>
        {times.map((time, index) => (
          <Box key={index}>
            <Typography>
              Specify the hour to take the {index + 1}th medicine
            </Typography>
            <TextField
              type="time"
              value={time}
              onChange={(e) => setTimes([...times.slice(0, index), e.target.value, ...times.slice(index + 1)])}
              required
            />
          </Box>
        ))}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date as Date)}
              dateFormat="yyyy/MM/dd"
              customInput={<TextField label="Start Date" fullWidth />}
            />
          </Grid>
          <Grid item xs={6}>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date as Date)}
              dateFormat="yyyy/MM/dd"
              customInput={<TextField label="End Date" fullWidth />}
            />
          </Grid>
        </Grid>
        <Button type="submit" fullWidth variant="contained" color="primary">
          Save Treatment
        </Button>
      </form>
    </Box>
  );
};

export default AddTreatment;
