const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// Function to fetch and parse the HTML content of a webpage
const fetchAndParseHTML = async (url) => {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        return $;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
};

// Function to scrape match summary links
const scrapeMatchSummaryLinks = async () => {
    const url = 'https://www.espncricinfo.com/records/tournament/team-match-results/icc-cricket-world-cup-2023-24-15338';
    const $ = await fetchAndParseHTML(url);
    
    const year = url.match(/\d{4}/)[0];
    let links = [];

    const allRows = $('table.ds-w-full > tbody > tr');
    allRows.each((index, element) => {
        const tds = $(element).find('td');
        const href = $(tds[6]).find('a').attr('href');
        if (href) {
            const rowURL = "https://www.espncricinfo.com" + href;
            links.push(rowURL);
        }
    });

    return { links, year };
};

// Function to scrape bowling summary data from a match summary page
const scrapeBowlingSummary = async (url) => {
    const $ = await fetchAndParseHTML(url);

    let teamNames = [];
    $('span:contains("Innings")').each(function() {
        const text = $(this).text().replace(" Innings", "");
        if (text && !teamNames.includes(text)) {
            teamNames.push(text);
        }
    });

    if (teamNames.length < 2) {
        console.log("Could not find enough team names.");
        return null;
    }

    const team1 = teamNames[0];
    const team2 = teamNames[1];
    const matchInfo = `${team1} Vs ${team2}`;

    const tables = $('div > table.ds-table');
    const firstInningRows = $(tables.eq(1)).find('tbody > tr').filter(function() {
        return $(this).find("td").length >= 11;
    });

    const secondInningsRows = $(tables.eq(3)).find('tbody > tr').filter(function() {
        return $(this).find("td").length >= 11;
    });

    let bowlingSummary = [];

    // First innings bowling data
    firstInningRows.each((index, element) => {
        const tds = $(element).find('td');
        bowlingSummary.push({
            "match": matchInfo,
            "bowlingTeam": team2,
            "bowlerName": $(tds.eq(0)).find('a > span').text().trim(),
            "overs": $(tds.eq(1)).text(),
            "maiden": $(tds.eq(2)).text(),
            "runs": $(tds.eq(3)).text(),
            "wickets": $(tds.eq(4)).text(),
            "economy": $(tds.eq(5)).text(),
            "0s": $(tds.eq(6)).text(),
            "4s": $(tds.eq(7)).text(),
            "6s": $(tds.eq(8)).text(),
            "wides": $(tds.eq(9)).text(),
            "noBalls": $(tds.eq(10)).text()
        });
    });

    // Second innings bowling data
    secondInningsRows.each((index, element) => {
        const tds = $(element).find('td');
        bowlingSummary.push({
            "match": matchInfo,
            "bowlingTeam": team1,
            "bowlerName": $(tds.eq(0)).find('a > span').text().trim(),
            "overs": $(tds.eq(1)).text(),
            "maiden": $(tds.eq(2)).text(),
            "runs": $(tds.eq(3)).text(),
            "wickets": $(tds.eq(4)).text(),
            "economy": $(tds.eq(5)).text(),
            "0s": $(tds.eq(6)).text(),
            "4s": $(tds.eq(7)).text(),
            "6s": $(tds.eq(8)).text(),
            "wides": $(tds.eq(9)).text(),
            "noBalls": $(tds.eq(10)).text()
        });
    });

    return bowlingSummary;
};

// Function to save data to CSV
const saveToCSV = (data, year) => {
    const filename = `bowlingdata${year}.csv`;
    const csvWriter = createCsvWriter({
        path: filename,
        header: [
            {id: 'match', title: 'match'},
            {id: 'bowlingTeam', title: 'bowlingTeam'},
            {id: 'bowlerName', title: 'bowlerName'},
            {id: 'overs', title: 'overs'},
            {id: 'maiden', title: 'maiden'},
            {id: 'runs', title: 'runs'},
            {id: 'wickets', title: 'wickets'},
            {id: 'economy', title: 'economy'},
            {id: '0s', title: '0s'},
            {id: '4s', title: '4s'},
            {id: '6s', title: '6s'},
            {id: 'wides', title: 'wides'},
            {id: 'noBalls', title: 'noBalls'}
        ]
    });

    csvWriter.writeRecords(data)
        .then(() => console.log('Data saved to CSV file:', filename))
        .catch(error => console.error('Error saving data to CSV:', error));
};

// Main function to orchestrate the scraping process
const main = async () => {
    const { links, year } = await scrapeMatchSummaryLinks();
    if (!links || links.length === 0 || !year) {
        console.log('No match summary links found or year missing.');
        return;
    }

    let allBowlingSummary = [];
    for (let url of links) {
        const bowlingSummary = await scrapeBowlingSummary(url);
        if (bowlingSummary) {
            allBowlingSummary.push(...bowlingSummary);
        } else {
            console.log('Error scraping bowling summary for:', url);
        }
    }

    saveToCSV(allBowlingSummary, year);
};

// Execute the main function
main();
