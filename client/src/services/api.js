import $ from 'jquery';
const API_URL = 'http://localhost:5000/api';

const api = {
    //login function using jquery ajax
    login: function (username, password) {
        return $.ajax({
            url: `${API_URL}/auth/login`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ username, password }),
        });
    },

    //register function using jquery ajax
    register: function (userData) {
        const payload = { ...userData };
        if (payload.team && !payload.favoriteTeam) {
            payload.favoriteTeam = payload.team;
            delete payload.team;
        }
        return $.ajax({
            url: `${API_URL}/auth/register`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(payload),
        });
    },

    // Fetch locker room / group data by ID
    getLockerRoomData: function (groupId) {
        const token = localStorage.getItem('token');
        console.log('🔍 Fetching group data for:', groupId, 'Token:', token ? '✅ Present' : '❌ Missing');
        return $.ajax({
            url: `${API_URL}/groups/${groupId}`,
            method: 'GET',
            dataType: 'json',
            headers: {
                Authorization: `Bearer ${token || ''}`,
            },
        });
    },

    // Fetch all groups
    getAllGroups: function () {
        const token = localStorage.getItem('token');
        console.log('🔍 Fetching all groups... Token:', token ? '✅ Present' : '❌ Missing');
        return $.ajax({
            url: `${API_URL}/groups`,
            method: 'GET',
            dataType: 'json',
            headers: {
                Authorization: `Bearer ${token || ''}`,
            },
        });
    }
};

export default api;