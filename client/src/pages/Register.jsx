import React, { useState } from 'react';
import { 
    Container, TextField, Button, Typography, Box, Paper, 
    MenuItem, Link, ThemeProvider, createTheme, CssBaseline 
} from '@mui/material';
import api from '../services/api';

// Define the NBA Dark/Red Theme
const darkRedTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff1744', // NBA Red
    },
    background: {
      default: '#0a0a0a', // Deep Black
      paper: '#1a1a1a',   // Dark Gray Paper
    },
  },
});

const teams = ["Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets", "Chicago Bulls",
    "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets", "Detroit Pistons", "Golden State Warriors",
    "Houston Rockets", "Indiana Pacers", "Los Angeles Clippers", "Los Angeles Lakers", "Memphis Grizzlies",
    "Miami Heat", "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans", "New York Knicks",
    "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns", "Portland Trail Blazers",
    "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors", "Utah Jazz", "Washington Wizards"];

const Register = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({ username: '', password: '', team: '' });
    const [status, setStatus] = useState({ msg: '', type: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        api.register(formData)
            .done(() => {
                setStatus({ msg: "Success! Welcome to the League.", type: "success" });
                setTimeout(() => onSwitchToLogin(), 2000);
            })
            .fail((err) => {
                setStatus({ msg: err.responseJSON?.message || "Registration failed", type: "error" });
            });
    };

    return (
        <ThemeProvider theme={darkRedTheme}>
            <CssBaseline /> {/* This makes the whole page background dark */}
            <Container maxWidth="xs">
                <Box sx={{ mt: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper 
                        elevation={6} 
                        sx={{ 
                            p: 4, 
                            width: '100%', 
                            borderRadius: '20px',
                            border: '1px solid #333', // Subtle border
                            boxShadow: '0 0 20px rgba(255, 23, 68, 0.1)' // Soft red glow
                        }}
                    >
                        <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: '900', color: '#ff1744', letterSpacing: '1px' }}>
                            THE LEAGUE
                        </Typography>
                        <Typography variant="subtitle2" align="center" sx={{ mb: 3, color: '#aaa' }}>
                            NBA PLAYERS ONLY
                        </Typography>
                        
                        <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth label="Username" margin="normal" required
                                variant="outlined"
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                sx={{ mb: 1 }}
                            />
                            <TextField
                                fullWidth label="Password" type="password" margin="normal" required
                                variant="outlined"
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                sx={{ mb: 1 }}
                            />
                            <TextField
                                //set as a dropdown but show only 5 teams at a time with scroll
                                select fullWidth label="Draft Team" margin="normal" required
                                value={formData.team}
                                onChange={(e) => setFormData({...formData, team: e.target.value})}
                                sx={{ mb: 2 }}
                                SelectProps={{
                                    MenuProps: {
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200, // Show 5 teams at a time
                                            },
                                        },
                                    },
                                }}
                            >
                                {teams.map((t) => (
                                    <MenuItem key={t} value={t}>{t}</MenuItem>
                                ))}
                            </TextField>

                            {status.msg && (
                                <Typography color={status.type === "error" ? "error" : "primary"} variant="body2" sx={{ textAlign: 'center', mb: 1 }}>
                                    {status.msg}
                                </Typography>
                            )}

                            <Button 
                                fullWidth variant="contained" 
                                type="submit" 
                                sx={{ 
                                    mt: 2, mb: 3, py: 1.5,
                                    borderRadius: '30px', 
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    transition: '0.4s',
                                    background: 'linear-gradient(45deg, #ff1744 30%, #b2102f 90%)',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        boxShadow: '0 0 15px #ff1744'
                                    }
                                }}
                            >
                                DRAFT ME
                            </Button>
                        </form>

                        <Typography align="center" variant="body2" sx={{ color: '#888' }}>
                            Already verified? <Link href="#" onClick={onSwitchToLogin} sx={{ color: '#ff1744', textDecoration: 'none', fontWeight: 'bold' }}>Login</Link>
                        </Typography>
                    </Paper>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default Register;