import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Grid } from '@mui/material';
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
    
    try {
      await addDoc(collection(db, "treatments"), {
        userId: auth.currentUser?.uid,
        medicineName,
        frequency,
        times,
        startDate,
        endDate
      });
      navigate("/dashboard");
    } catch (err) {
      console.error("Error adding document: ", err);
    }
  };

  return (
    <Box>
      <Typography variant="h4">Add Treatment</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Medicine Name"
          value={medicineName}
          onChange={(e) => setMedicineName(e.target.value)}
          fullWidth
          margin="normal"
        />

        <Typography>Start Date</Typography>
        <DatePicker
          selected={startDate}
          onChange={(date: Date) => setStartDate(date)}
          dateFormat="dd/MM/yyyy"
          customInput={<TextField fullWidth />}
        />

        <Typography>End Date</Typography>
        <DatePicker
          selected={endDate}
          onChange={(date: Date) => setEndDate(date)}
          dateFormat="dd/MM/yyyy"
          customInput={<TextField fullWidth />}
        />

        <Button type="submit" variant="contained" color="primary">
          Submit
        </Button>
      </form>
    </Box>
  );
};

export default AddTreatment;
