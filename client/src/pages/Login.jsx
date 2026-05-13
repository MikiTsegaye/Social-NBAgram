import React, { useState } from 'react';
import { 
    Container, TextField, Button, Typography, Box, Paper, 
    Link, ThemeProvider, createTheme, CssBaseline 
} from '@mui/material';
import api from '../services/api';

// Define the exact same NBA Dark/Red Theme
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

const Login = ({ onLoginSuccess, onSwitchToRegister }) => {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        api.login(formData.username, formData.password)
            .done((response) => {
                // Save user to local storage (Simple Auth strategy)
                localStorage.setItem('user', JSON.stringify(response.user));
                onLoginSuccess(response.user);
            })
            .fail((err) => {
                setError(err.responseJSON?.message || 'Login failed');
            });
    };

    return (
        <ThemeProvider theme={darkRedTheme}>
            <CssBaseline />
            <Container maxWidth="xs">
                <Box sx={{ mt: 12, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Paper 
                        elevation={6} 
                        sx={{ 
                            p: 4, 
                            width: '100%', 
                            borderRadius: '20px',
                            border: '1px solid #333',
                            boxShadow: '0 0 20px rgba(255, 23, 68, 0.1)' 
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
                            
                            {error && (
                                <Typography color="error" variant="body2" sx={{ textAlign: 'center', mt: 1 }}>
                                    {error}
                                </Typography>
                            )}

                            <Button 
                                fullWidth variant="contained" 
                                type="submit" 
                                sx={{ 
                                    mt: 3, mb: 2, py: 1.5,
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
                                ENTER LOCKER ROOM
                            </Button>
                        </form>

                        <Typography align="center" variant="body2" sx={{ color: '#888', mt: 2 }}>
                            Don't have an account? <Link component="button" type="button" onClick={(e) => { e.preventDefault(); if(typeof onSwitchToRegister === 'function') onSwitchToRegister(); }} sx={{ color: '#ff1744', textDecoration: 'none', fontWeight: 'bold', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>Register here</Link>
                        </Typography>
                    </Paper>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default Login;