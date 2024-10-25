const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Function to scrape data from the webpage
const scrapeData = async () => {
  try {
    // URL of the webpage to scrape
    const url = 'https://www.espncricinfo.com/records/tournament/team-match-results/icc-cricket-world-cup-2023-24-15338';

    // Make an HTTP GET request to fetch the webpage content
    const response = await axios.get(url);
    
    // Load the HTML content into Cheerio
    const $ = cheerio.load(response.data);

    // Array to store the scraped data
    let cricketStates = [];

    // Selecting all rows from the target table
    const dataAll = $('table.ds-w-full > tbody > tr');

    // Looping through each row and extracting data from cells
    dataAll.each((index, element) => {
      const tds = $(element).find('td');
      cricketStates.push({
        'team1': $(tds[0]).text().trim(),
        'team2': $(tds[1]).text().trim(),
        'winner': $(tds[2]).text().trim(),
        'margin': $(tds[3]).text().trim(),
        'ground': $(tds[4]).text().trim(),
        'matchDate': $(tds[5]).text().trim(),
        'scorecard': $(tds[6]).text().trim()
      });
    });

    // Save the scraped data to a CSV file
    const year = url.match(/\d{4}/)[0];
    const filename = `gameSummary${year}.csv`;
    const csvWriter = createCsvWriter({
        path: filename,
        header: [
            {id: 'team1', title: 'team1'},
            {id: 'team2', title: 'team2'},
            {id: 'winner', title: 'winner'},
            {id: 'margin', title: 'margin'},
            {id: 'ground', title: 'ground'},
            {id: 'matchDate', title: 'matchDate'},
            {id: 'scorecard', title: 'scorecard'}
        ]
    });

    await csvWriter.writeRecords(cricketStates);
    console.log(`Data saved to CSV file: ${filename}`);
    
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

// Call the function to start scraping
scrapeData();
