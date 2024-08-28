import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, CardContent, IconButton, Button, Grid } from '@mui/material';
import { styled } from '@mui/system';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase";
import EditTreatmentDialog from './EditTreatmentDialog';

const StyledCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  marginBottom: theme.spacing(2),
  color: 'rgba(255, 255, 255, 0.9)',
}));

interface Treatment {
  id: string;
  medicineName: string;
  frequency: number;
  times: string[];
  startDate: any;
  endDate: any;
}

const Treatments: React.FC = () => {
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [selectedTreatment, setSelectedTreatment] = useState<Treatment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTreatments();
  }, []);

  const fetchTreatments = async () => {
    const user = auth.currentUser;
    if (user) {
      const treatmentsRef = collection(db, "treatments");
      const q = query(treatmentsRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const treatmentsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Treatment[];
      setTreatments(treatmentsData);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this treatment?")) {
      try {
        await deleteDoc(doc(db, "treatments", id));
        setTreatments(treatments.filter(treatment => treatment.id !== id));
      } catch (error) {
        console.error("Error deleting treatment:", error);
        alert("Failed to delete treatment. Please try again.");
      }
    }
  };

  const handleEdit = (treatment: Treatment) => {
    setSelectedTreatment(treatment);
    setIsEditDialogOpen(true);
  };

  const handleSave = async (updatedTreatment: Treatment) => {
    setIsEditDialogOpen(false);
    await fetchTreatments();
  };

  const formatDate = (date: any) => {
    if (!date) return 'Invalid Date';
    const jsDate = date.toDate ? date.toDate() : new Date(date);
    return jsDate.toLocaleDateString();
  };

  return (
    <Box sx={{ p: 2, pt: 0, maxWidth: 600, margin: 'auto' }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          color: 'rgba(255, 255, 255, 0.9)', 
          fontWeight: 700, 
          mb: 3,
          textAlign: 'center',
          textShadow: 'none' // Remove shadow from title
        }}
      >
        Your Treatments
      </Typography>
      {treatments.length === 0 ? (
        <Box textAlign="center" mt={4}>
          <Typography variant="body1" gutterBottom sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
            You haven't added any treatments yet.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/add-treatment')}
            sx={{ 
              mt: 2, 
              bgcolor: '#FF6B6B', 
              '&:hover': { 
                bgcolor: '#FF8C8C' 
              } 
            }}
          >
            Add New Treatment
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {treatments.map((treatment) => (
            <Grid item xs={12} key={treatment.id}>
              <StyledCard>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="h6" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>{treatment.medicineName}</Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {`${treatment.frequency} times a day: ${treatment.times.join(', ')}`}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        From: {formatDate(treatment.startDate)} To: {formatDate(treatment.endDate)}
                      </Typography>
                    </Box>
                    <Box>
                      <IconButton onClick={() => handleEdit(treatment)} sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(treatment.id)} sx={{ color: '#FF6B6B' }}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/add-treatment')}
              sx={{ 
                bgcolor: '#FF6B6B', 
                '&:hover': { 
                  bgcolor: '#FF8C8C' 
                } 
              }}
            >
              Add New Treatment
            </Button>
          </Grid>
        </Grid>
      )}
      {selectedTreatment && (
        <EditTreatmentDialog
          open={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          treatment={selectedTreatment}
          onSave={handleSave}
        />
      )}
    </Box>
  );
};

export default Treatments;