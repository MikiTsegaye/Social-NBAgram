import React, { useEffect, useState } from 'react';
import { 
    Container, Button, Typography, Box, Paper, 
    ThemeProvider, createTheme, CssBaseline 
} from '@mui/material';
import api from '../services/api';

// Unified NBA Dark/Red Theme (matching Login & Register)
const nbaTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff1744', // NBA Red
    },
    secondary: {
      main: '#FDB927', // NBA Gold
    },
    background: {
      default: '#0a0a0a', // Deep Black
      paper: '#1a1a1a',   // Dark Gray Paper
    },
  },
});

const getTeamBrand = (teamName) => {
  const normalized = String(teamName || '').trim().toLowerCase();
  const teams = {
    'los angeles lakers': { primary: '#552583', secondary: '#FDB927', surface: '#120C26' },
    'lakers': { primary: '#552583', secondary: '#FDB927', surface: '#120C26' },
    'golden state warriors': { primary: '#1d428a', secondary: '#ffc72c', surface: '#0b183c' },
    'warriors': { primary: '#1d428a', secondary: '#ffc72c', surface: '#0b183c' },
    'chicago bulls': { primary: '#a10707', secondary: '#ffffff', surface: '#240707' },
    'bulls': { primary: '#a10707', secondary: '#ffffff', surface: '#240707' },
    'brooklyn nets': { primary: '#000000', secondary: '#ffffff', surface: '#111111' },
    'nets': { primary: '#000000', secondary: '#ffffff', surface: '#111111' },
    'miami heat': { primary: '#98002e', secondary: '#f9a01b', surface: '#1a060f' },
    'denver nuggets': { primary: '#0e2240', secondary: '#fdb927', surface: '#081427' },
    'new york knicks': { primary: '#006bb6', secondary: '#f58426', surface: '#061829' },
    'boston celtics': { primary: '#007a33', secondary: '#ba9653', surface: '#05180f' },
  };
  return teams[normalized] || { primary: '#ff1744', secondary: '#FDB927', surface: '#1a1a1a' };
};

const LockerRoom = ({ groupId, onBack }) => {
    const [groupData, setGroupData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState({ favoriteTeam: '', id: null, username: 'Guest' });

    const teamBrand = getTeamBrand(currentUser.favoriteTeam);
    const primaryColor = teamBrand.primary;
    const secondaryColor = teamBrand.secondary;
    const surfaceColor = teamBrand.surface;
    const lightBorder = `${secondaryColor}33`;

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setCurrentUser({
                    favoriteTeam: parsedUser.favoriteTeam || parsedUser.team || '',
                    id: parsedUser._id || parsedUser.id || null,
                    username: parsedUser.username || 'Guest',
                });
            } catch (err) {
                setCurrentUser({ favoriteTeam: '', id: null, username: 'Guest' });
            }
        }
    }, []);

    useEffect(() => {
        if (!groupId) {
            setGroupData(null);
            setError('Locker room ID is required.');
            return;
        }

        setLoading(true);
        setError('');

        api.getLockerRoomData(groupId)
            .done((data) => {
                console.log('✅ Group data loaded:', data);
                setGroupData(data);
                setLoading(false);
            })
            .fail((xhr, statusText, errorThrown) => {
                console.error('❌ API Error:', { xhr, statusText, errorThrown });
                const errorMsg = xhr?.responseJSON?.message || statusText || errorThrown || 'Unable to load locker room data.';
                console.error('Error Message:', errorMsg);
                setError(errorMsg);
                setLoading(false);
            });
    }, [groupId]);

    const normalizeId = (value) => {
        if (!value) return null;
        if (typeof value === 'string') return value;
        if (typeof value === 'object') return value._id || value.id || null;
        return null;
    };

    const adminId = normalizeId(groupData?.admin);
    const managerId = normalizeId(groupData?.manager);
    const isGroupManager = Boolean(
        currentUser.id &&
        (adminId === currentUser.id.toString() || managerId === currentUser.id.toString())
    );

    if (!groupId) {
        return (
            <ThemeProvider theme={nbaTheme}>
                <CssBaseline />
                <Container maxWidth="sm">
                    <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Paper elevation={6} sx={{ p: 4, width: '100%', borderRadius: '20px', border: '1px solid #333' }}>
                            <Typography variant="h5" align="center" sx={{ color: primaryColor, fontWeight: 'bold' }}>
                                Locker Room Unavailable
                            </Typography>
                            <Typography variant="body2" align="center" sx={{ mt: 2, color: '#aaa' }}>
                                Please provide a valid locker room ID to continue.
                            </Typography>
                        </Paper>
                    </Box>
                </Container>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={nbaTheme}>
            <CssBaseline />
            <Container maxWidth="md">
                <Box sx={{
                    minHeight: '100vh',
                    py: 4,
                    background: `radial-gradient(circle at top left, ${secondaryColor}22, transparent 30%), linear-gradient(180deg, ${surfaceColor} 0%, #0a0a0a 100%)`
                }}>
                    {onBack && (
                        <Button 
                            onClick={onBack}
                            variant="text"
                            sx={{ 
                                mb: 3, 
                                color: primaryColor,
                                fontSize: '0.95rem',
                                fontWeight: '600',
                                textTransform: 'none',
                                '&:hover': {
                                    backgroundColor: `${primaryColor}20`
                                }
                            }}
                        >
                            ← Back to Groups
                        </Button>
                    )}

                    <Paper 
                        elevation={6} 
                        sx={{ 
                            p: 4, 
                            width: '100%', 
                            borderRadius: '20px',
                            border: `1px solid ${lightBorder}`,
                            boxShadow: `0 0 20px ${secondaryColor}20`
                        }}
                    >
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h4" sx={{ fontWeight: '900', color: primaryColor, letterSpacing: '1px', mb: 1 }}>
                                {groupData?.name || 'Locker Room'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#aaa' }}>
                                {groupData?.description || 'Loading locker room details...'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: secondaryColor, display: 'block', mt: 2, fontWeight: '600' }}>
                                {currentUser.username} • {currentUser.favoriteTeam}
                            </Typography>
                        </Box>

                        {loading && (
                            <Typography variant="body2" sx={{ color: '#999' }}>
                                Loading locker room...
                            </Typography>
                        )}

                        {error && (
                            <Typography variant="body2" sx={{ color: '#ffb3b3' }}>
                                {error}
                            </Typography>
                        )}

                        {groupData && !loading && (
                            <Box sx={{ display: 'grid', gap: 3 }}>
                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                                    <Paper sx={{ p: 2.5, backgroundColor: surfaceColor, border: `1px solid ${lightBorder}`, borderRadius: '12px' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: secondaryColor, mb: 1.5 }}>
                                            Locker Room Info
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            <strong>ID:</strong> {groupData._id?.substring(0, 8)}...
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            <strong>Admin:</strong> {adminId?.substring(0, 8) || 'Unknown'}...
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Private:</strong> {groupData.isPrivate ? 'Yes' : 'No'}
                                        </Typography>
                                    </Paper>

                                    <Paper sx={{ p: 2.5, backgroundColor: surfaceColor, border: `1px solid ${lightBorder}`, borderRadius: '12px' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: secondaryColor, mb: 1.5 }}>
                                            Membership
                                        </Typography>
                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                            <strong>Members:</strong> {Array.isArray(groupData.members) ? groupData.members.length : 0}
                                        </Typography>
                                        <Typography variant="body2">
                                            <strong>Pending Requests:</strong> {Array.isArray(groupData.pendingRequests) ? groupData.pendingRequests.length : 0}
                                        </Typography>
                                    </Paper>
                                </Box>

                                {isGroupManager && (
                                    <Paper sx={{ p: 3, backgroundColor: surfaceColor, border: `1px solid ${secondaryColor}`, borderRadius: '12px' }}>
                                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: secondaryColor, mb: 2 }}>
                                            Pending Join Requests
                                        </Typography>
                                        {Array.isArray(groupData.pendingRequests) && groupData.pendingRequests.length > 0 ? (
                                            <Box sx={{ display: 'grid', gap: 1.5 }}>
                                                {groupData.pendingRequests.map((request) => {
                                                    const requestId = request?.toString ? request.toString() : request;
                                                    return (
                                                        <Typography 
                                                            key={requestId}
                                                            variant="body2" 
                                                            sx={{ 
                                                                p: 1.5, 
                                                                backgroundColor: surfaceColor, 
                                                                borderRadius: '8px',
                                                                border: `1px solid ${secondaryColor}`,
                                                                fontFamily: 'monospace',
                                                                fontSize: '0.85rem'
                                                            }}
                                                        >
                                                            {requestId}
                                                        </Typography>
                                                    );
                                                })}
                                            </Box>
                                        ) : (
                                            <Typography variant="body2" sx={{ color: '#999' }}>
                                                No pending requests at the moment.
                                            </Typography>
                                        )}
                                    </Paper>
                                )}

                                {!isGroupManager && (
                                    <Paper sx={{ p: 2.5, backgroundColor: `${primaryColor}22`, border: `1px solid ${primaryColor}30`, borderRadius: '12px' }}>
                                        <Typography variant="body2" sx={{ color: primaryColor }}>
                                            <strong>Access Control:</strong> Pending requests are hidden because you are not the locker room manager.
                                        </Typography>
                                    </Paper>
                                )}
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Container>
        </ThemeProvider>
    );
};

export default LockerRoom;