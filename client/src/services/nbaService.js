// 🏀 NBA Teams Service - Client-side utility for fetching team data
import $ from 'jquery';
const API_URL = 'http://localhost:5000/api';

const nbaService = {
  // Fetch all NBA teams
  getAllTeams: function () {
    return $.ajax({
      url: `${API_URL}/nba-teams`,
      method: 'GET',
      dataType: 'json',
    });
  },

  // Fetch teams by conference (Western or Eastern)
  getTeamsByConference: function (conference) {
    return $.ajax({
      url: `${API_URL}/nba-teams?conference=${encodeURIComponent(conference)}`,
      method: 'GET',
      dataType: 'json',
    });
  },

  // Fetch teams by division
  getTeamsByDivision: function (division) {
    return $.ajax({
      url: `${API_URL}/nba-teams?division=${encodeURIComponent(division)}`,
      method: 'GET',
      dataType: 'json',
    });
  },

  // Get unique divisions
  getDivisions: function () {
    return this.getAllTeams().then((data) => {
      const divisions = [...new Set(data.teams.map(team => team.division))];
      return divisions.sort();
    });
  },

  // Get unique conferences
  getConferences: function () {
    return this.getAllTeams().then((data) => {
      const conferences = [...new Set(data.teams.map(team => team.conference))];
      return conferences.sort();
    });
  },

  // Find team by name
  findTeam: function (teamName) {
    return this.getAllTeams().then((data) => {
      return data.teams.find(team => 
        team.name.toLowerCase() === teamName.toLowerCase() ||
        team.fullName.toLowerCase() === teamName.toLowerCase()
      );
    });
  },

  // Get teams by city
  getTeamsByCity: function (city) {
    return this.getAllTeams().then((data) => {
      return data.teams.filter(team => 
        team.city.toLowerCase() === city.toLowerCase()
      );
    });
  },

  // Get team details with full information
  getTeamDetails: function (teamName) {
    return this.findTeam(teamName);
  }
};

export default nbaService;
