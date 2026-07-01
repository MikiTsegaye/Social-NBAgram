// 🏀 Complete NBA Teams Database
// All 30 NBA teams organized by conference and division

const nbaTeams = [
  // ==================== WESTERN CONFERENCE ====================
  // Pacific Division
  {
    name: 'Warriors',
    fullName: 'Golden State Warriors',
    city: 'San Francisco',
    state: 'CA',
    division: 'Pacific',
    conference: 'Western',
    founded: 1946,
    colors: ['Blue', 'Gold'],
    arena: 'Chase Center'
  },
  {
    name: 'Lakers',
    fullName: 'Los Angeles Lakers',
    city: 'Los Angeles',
    state: 'CA',
    division: 'Pacific',
    conference: 'Western',
    founded: 1948,
    colors: ['Purple', 'Gold'],
    arena: 'Crypto.com Arena'
  },
  {
    name: 'Clippers',
    fullName: 'Los Angeles Clippers',
    city: 'Los Angeles',
    state: 'CA',
    division: 'Pacific',
    conference: 'Western',
    founded: 1970,
    colors: ['Red', 'Blue', 'White'],
    arena: 'Crypto.com Arena'
  },
  {
    name: 'Suns',
    fullName: 'Phoenix Suns',
    city: 'Phoenix',
    state: 'AZ',
    division: 'Pacific',
    conference: 'Western',
    founded: 1968,
    colors: ['Purple', 'Orange'],
    arena: 'Footprint Center'
  },
  {
    name: 'Kings',
    fullName: 'Sacramento Kings',
    city: 'Sacramento',
    state: 'CA',
    division: 'Pacific',
    conference: 'Western',
    founded: 1945,
    colors: ['Purple', 'Silver'],
    arena: 'Golden 1 Center'
  },

  // Southwest Division
  {
    name: 'Mavericks',
    fullName: 'Dallas Mavericks',
    city: 'Dallas',
    state: 'TX',
    division: 'Southwest',
    conference: 'Western',
    founded: 1980,
    colors: ['Blue', 'Silver', 'Navy'],
    arena: 'American Airlines Center'
  },
  {
    name: 'Spurs',
    fullName: 'San Antonio Spurs',
    city: 'San Antonio',
    state: 'TX',
    division: 'Southwest',
    conference: 'Western',
    founded: 1973,
    colors: ['Black', 'Silver'],
    arena: 'AT&T Center'
  },
  {
    name: 'Rockets',
    fullName: 'Houston Rockets',
    city: 'Houston',
    state: 'TX',
    division: 'Southwest',
    conference: 'Western',
    founded: 1971,
    colors: ['Red', 'Black', 'Silver'],
    arena: 'Toyota Center'
  },
  {
    name: 'Grizzlies',
    fullName: 'Memphis Grizzlies',
    city: 'Memphis',
    state: 'TN',
    division: 'Southwest',
    conference: 'Western',
    founded: 1995,
    colors: ['Blue', 'Silver', 'Yellow'],
    arena: 'FedexForum'
  },
  {
    name: 'Pelicans',
    fullName: 'New Orleans Pelicans',
    city: 'New Orleans',
    state: 'LA',
    division: 'Southwest',
    conference: 'Western',
    founded: 2002,
    colors: ['Navy', 'Gold', 'Red'],
    arena: 'Smoothie King Center'
  },

  // Northwest Division
  {
    name: 'Nuggets',
    fullName: 'Denver Nuggets',
    city: 'Denver',
    state: 'CO',
    division: 'Northwest',
    conference: 'Western',
    founded: 1976,
    colors: ['Blue', 'Gold', 'White'],
    arena: 'Ball Arena'
  },
  {
    name: 'Timberwolves',
    fullName: 'Minnesota Timberwolves',
    city: 'Minneapolis',
    state: 'MN',
    division: 'Northwest',
    conference: 'Western',
    founded: 1989,
    colors: ['Blue', 'Green', 'Silver'],
    arena: 'Target Center'
  },
  {
    name: 'Thunder',
    fullName: 'Oklahoma City Thunder',
    city: 'Oklahoma City',
    state: 'OK',
    division: 'Northwest',
    conference: 'Western',
    founded: 2008,
    colors: ['Blue', 'Orange', 'Yellow'],
    arena: 'Paycom Center'
  },
  {
    name: 'Jazz',
    fullName: 'Utah Jazz',
    city: 'Salt Lake City',
    state: 'UT',
    division: 'Northwest',
    conference: 'Western',
    founded: 1974,
    colors: ['Purple', 'Blue', 'Orange'],
    arena: 'Delta Center'
  },
  {
    name: 'Trail Blazers',
    fullName: 'Portland Trail Blazers',
    city: 'Portland',
    state: 'OR',
    division: 'Northwest',
    conference: 'Western',
    founded: 1970,
    colors: ['Red', 'Black', 'Silver'],
    arena: 'Moda Center'
  },

  // ==================== EASTERN CONFERENCE ====================
  // Atlantic Division
  {
    name: 'Celtics',
    fullName: 'Boston Celtics',
    city: 'Boston',
    state: 'MA',
    division: 'Atlantic',
    conference: 'Eastern',
    founded: 1957,
    colors: ['Green', 'White', 'Black'],
    arena: 'TD Garden'
  },
  {
    name: '76ers',
    fullName: 'Philadelphia 76ers',
    city: 'Philadelphia',
    state: 'PA',
    division: 'Atlantic',
    conference: 'Eastern',
    founded: 1949,
    colors: ['Blue', 'Red', 'White'],
    arena: 'Wells Fargo Center'
  },
  {
    name: 'Nets',
    fullName: 'Brooklyn Nets',
    city: 'Brooklyn',
    state: 'NY',
    division: 'Atlantic',
    conference: 'Eastern',
    founded: 1967,
    colors: ['Black', 'White', 'Gray'],
    arena: 'Barclays Center'
  },
  {
    name: 'Raptors',
    fullName: 'Toronto Raptors',
    city: 'Toronto',
    state: 'ON',
    division: 'Atlantic',
    conference: 'Eastern',
    founded: 1995,
    colors: ['Red', 'Black', 'Silver'],
    arena: 'Scotiabank Arena'
  },
  {
    name: 'Knicks',
    fullName: 'New York Knicks',
    city: 'New York',
    state: 'NY',
    division: 'Atlantic',
    conference: 'Eastern',
    founded: 1946,
    colors: ['Blue', 'Orange', 'White'],
    arena: 'Madison Square Garden'
  },

  // Central Division
  {
    name: 'Bucks',
    fullName: 'Milwaukee Bucks',
    city: 'Milwaukee',
    state: 'WI',
    division: 'Central',
    conference: 'Eastern',
    founded: 1968,
    colors: ['Green', 'Cream'],
    arena: 'Fiserv Forum'
  },
  {
    name: 'Cavaliers',
    fullName: 'Cleveland Cavaliers',
    city: 'Cleveland',
    state: 'OH',
    division: 'Central',
    conference: 'Eastern',
    founded: 1970,
    colors: ['Maroon', 'Gold', 'Navy'],
    arena: 'Quicken Loans Arena'
  },
  {
    name: 'Pistons',
    fullName: 'Detroit Pistons',
    city: 'Detroit',
    state: 'MI',
    division: 'Central',
    conference: 'Eastern',
    founded: 1941,
    colors: ['Blue', 'Red', 'White'],
    arena: 'Little Caesars Arena'
  },
  {
    name: 'Bulls',
    fullName: 'Chicago Bulls',
    city: 'Chicago',
    state: 'IL',
    division: 'Central',
    conference: 'Eastern',
    founded: 1966,
    colors: ['Red', 'Black', 'White'],
    arena: 'United Center'
  },
  {
    name: 'Pacers',
    fullName: 'Indiana Pacers',
    city: 'Indianapolis',
    state: 'IN',
    division: 'Central',
    conference: 'Eastern',
    founded: 1976,
    colors: ['Gold', 'Blue'],
    arena: 'Gainbridge Fieldhouse'
  },

  // Southeast Division
  {
    name: 'Hawks',
    fullName: 'Atlanta Hawks',
    city: 'Atlanta',
    state: 'GA',
    division: 'Southeast',
    conference: 'Eastern',
    founded: 1946,
    colors: ['Red', 'Gold', 'Black'],
    arena: 'State Farm Arena'
  },
  {
    name: 'Heat',
    fullName: 'Miami Heat',
    city: 'Miami',
    state: 'FL',
    division: 'Southeast',
    conference: 'Eastern',
    founded: 1988,
    colors: ['Red', 'Black', 'White'],
    arena: 'FTX Arena'
  },
  {
    name: 'Hornets',
    fullName: 'Charlotte Hornets',
    city: 'Charlotte',
    state: 'NC',
    division: 'Southeast',
    conference: 'Eastern',
    founded: 2004,
    colors: ['Purple', 'Teal', 'Orange'],
    arena: 'Spectrum Center'
  },
  {
    name: 'Magic',
    fullName: 'Orlando Magic',
    city: 'Orlando',
    state: 'FL',
    division: 'Southeast',
    conference: 'Eastern',
    founded: 1989,
    colors: ['Blue', 'Black', 'Silver'],
    arena: 'Amway Center'
  },
  {
    name: 'Wizards',
    fullName: 'Washington Wizards',
    city: 'Washington',
    state: 'DC',
    division: 'Southeast',
    conference: 'Eastern',
    founded: 1961,
    colors: ['Navy', 'Red', 'White'],
    arena: 'Capital One Arena'
  }
];

module.exports = nbaTeams;
