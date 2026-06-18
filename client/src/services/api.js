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
    },

    // Fetch posts feed
    getFeed: function () {
        const token = localStorage.getItem('token');
        return $.ajax({
            url: `${API_URL}/posts`,
            method: 'GET',
            dataType: 'json',
            headers: {
                Authorization: `Bearer ${token || ''}`,
            },
        });
    },

    // Create a new post (supports optional mediaUrl)
    createPost: function (content, teamTag, authorId, mediaUrl) {
        const token = localStorage.getItem('token');
        const payload = { author: authorId, content, teamTag };
        if (mediaUrl) payload.mediaUrl = mediaUrl;
        return $.ajax({
            url: `${API_URL}/posts`,
            method: 'POST',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify(payload),
            headers: {
                Authorization: `Bearer ${token || ''}`,
            },
        });
    },

    // Update a post
    updatePost: function (postId, content, userId, userRole = '') {
        const token = localStorage.getItem('token');
        return $.ajax({
            url: `${API_URL}/posts/${postId}`,
            method: 'PUT',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({ content, userId, userRole }),
            headers: {
                Authorization: `Bearer ${token || ''}`,
            },
        });
    },

    // Delete a post
    deletePost: function (postId, userId, userRole = '') {
        const token = localStorage.getItem('token');
        return $.ajax({
            url: `${API_URL}/posts/${postId}`,
            method: 'DELETE',
            contentType: 'application/json',
            dataType: 'json',
            data: JSON.stringify({ userId, userRole }),
            headers: {
                Authorization: `Bearer ${token || ''}`,
            },
        });
    }
};

export default api;