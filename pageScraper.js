const { name } = require('ejs');
const { MongoClient } = require('mongodb');
require('dotenv').config();





const scraperObject = {
	url: 'https://www.espn.com/nfl/players',
	async scraper(browser) {
    const mongoURL = process.env.MONGO_URL
    const dbName = 'NFL_players_scraped_data'; // Replace with your preferred database name
    const client = new MongoClient(mongoURL, { useUnifiedTopology: true });
		let data = [];
		let dataObj = {};
		let page = await browser.newPage();
		console.log(`Navigating to ${this.url}...`);
		// Navigate to the selected page
		await page.goto(this.url);
		// Wait for the required DOM to be rendered
		await page.waitForSelector('#my-players-table');
		// Get the link to all the required books
		let urls = await page.$$eval('#my-players-table li a', (links) => {
			// Extract the links from the data
			links = links.map((el) => el.href);
			return links;
		});
		let teamNames = await page.$$eval('#my-players-table li div a', (names) => {
			names = names.map((el) => el.textContent);
			return names;
		});

		// Loop through each of those links, open a new page instance and get the relevant data from them
		let pagePromise = (link) =>
			new Promise(async (resolve, reject) => {
				let newPage = await browser.newPage();
				await newPage.goto(link);

        const offensivePlayersTeam = await newPage.$$eval('.page-container div div section div section div h1',
        (teamName) =>{
          return teamName.map((element)=>{
            const team = element.textContent
            if(team === '2023 Schedule'){
              return  
            }

            return team.split(" ").slice(0, -1).join(" ")
          })
        }
        )
        // console.log(offensivePlayersTeam)

				const offensivePlayersIndexs = await newPage.$$eval(
					'.Offense table tbody tr',
					(indexs) => {
						return indexs.map((element) => {
							const playerIndex = element.getAttribute('data-idx');
							return { index: playerIndex };
						});
					}
				);

				const offensivePlayersNames = await newPage.$$eval(
					'.Offense table tbody tr td:nth-child(2) .AnchorLink',
					(names) => {
						return names.map((element) => {
							const playerName = element.textContent;
							return { name: playerName };
						});
					}
				);

				const offensivePlayersNumbers = await newPage.$$eval(
					'.Offense table tbody tr td:nth-child(2) .n10',
					(nums) => {
						return nums.map((element) => {
							let playerNum;
							if (element.textContent.length > 0) {
								playerNum = element.textContent;
							} else {
								playerNum = 'No Number';
							}
							return { number: playerNum };
						});
					}
				);

				const offensivePlayersPosition = await newPage.$$eval(
					'.Offense div:nth-child(2) div table tbody tr td:nth-child(3) div',
					(details) => {
						return details.map((element) => {
							const playerPosition = element.textContent;
							return { position: playerPosition };
						});
					}
				);
				const offensivePlayersAge = await newPage.$$eval(
					'.Offense div:nth-child(2) div table tbody tr td:nth-child(4) div',
					(details) => {
						return details.map((element) => {
							const playerAge = element.textContent;
							return { age: playerAge };
						});
					}
				);
				const offensivePlayersHeight = await newPage.$$eval(
					'.Offense div:nth-child(2) div table tbody tr td:nth-child(5) div',
					(details) => {
						return details.map((element) => {
							const playerHeight = element.textContent;
							return { height: playerHeight };
						});
					}
				);
				const offensivePlayersWeight = await newPage.$$eval(
					'.Offense div:nth-child(2) div table tbody tr td:nth-child(6) div',
					(details) => {
						return details.map((element) => {
							const playerWeight = element.textContent;
							return { weight: playerWeight };
						});
					}
				);

				const offensivePlayersExp = await newPage.$$eval(
					'.Offense div:nth-child(2) div table tbody tr td:nth-child(7) div',
					(details) => {
						return details.map((element) => {
							const playerExp = element.textContent;
							return { experience: playerExp };
						});
					}
				);


				// Combine names, numbers, indexes, and other player details into final player objects
				const offensivePlayers = offensivePlayersNames.map((nameObj, index) => {
					return {
						...nameObj,
						// ...offensivePlayersNumbers[index],
						...offensivePlayersIndexs[index],
						...offensivePlayersPosition[index],
						...offensivePlayersAge[index],
						...offensivePlayersHeight[index],
						...offensivePlayersWeight[index],
						...offensivePlayersExp[index],
					};
				});

				let teamData = { team: offensivePlayersTeam, players: offensivePlayers };

        // console.log("teamdata", teamData)
        resolve(teamData);
				await newPage.close();
			});
		// console.log(teamNames[0])
		for (let i = 0; i < urls.length; i++) {
			let currentPageData = await pagePromise(urls[i]);
			// const team = teamNames[i];
			// currentPageData = { ...currentPageData, Team: team };
      console.log(currentPageData)
			if (currentPageData.players.length > 0) {
				data.push(currentPageData);
			}
		}

    try {
      // Connect to the MongoDB server
      await client.connect();
      console.log('Connected to MongoDB server');

      // Get the database instance
      const db = client.db(dbName);

      // Save the scraped data to the database
      const collection = db.collection('NFL_Players'); // Replace 'scraped_data' with your preferred collection name
      await collection.drop();
      await collection.insertMany(data); // Assuming 'data' is the array containing scraped data

      console.log('Data saved to MongoDB');

    } catch (error) {
      console.error('Error while connecting to MongoDB:', error);
    } finally {
      // Close the MongoDB connection
      client.close();
      console.log('Connection to MongoDB closed');
    }

		return data;
	},
};

module.exports = scraperObject;
