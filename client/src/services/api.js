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
        return $.ajax({
            url: `${API_URL}/auth/register`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(userData),
        });
    }
};

export default api;