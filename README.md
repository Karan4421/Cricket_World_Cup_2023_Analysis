This repository contains a Power BI report analyzing player performance during the 2023 Cricket World Cup. The report provides insights into various aspects of the tournament, including top players, batting styles, strike rates, and more.

Data Collection
The data for this report was gathered from ESPNcricinfo website using Node.js for web scraping. I used the following steps to collect the data:

Web Scraping:

Node.js: Used for parsing and scraping data from ESPNcricinfo's detailed match and player statistics pages. The script uses **Axios** to fetch HTML content, **Cheerio** to parse and extract specific data from the webpage, and **csv-writer** to save the scraped data into a CSV file for easy analysis.
Data Cleaning: After scraping, the data was cleaned and structured for analysis. This included:

Removing any missing or irrelevant data, renaming headers all was done in Power BI.
The report is built in Power BI and offers an interactive dashboard for analyzing different player categories, such as:

Openers: Performance of top opening batsmen, showing their runs scored, strike rate, batting average, and boundary percentage.
Anchors: Insights into players who stabilize the innings.
Finishers: Examines players who excel in finishing innings strongly.
Best Bowlers: Analyzes the top bowlers of the tournament.
