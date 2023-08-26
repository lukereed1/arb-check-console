const fs = require("fs");
const path = require("path");
const readline = require("readline");
const axios = require("axios");
const bluebird = require("bluebird");
const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const API_URL = config.API_URL;
const allGames = [];
const bestMargins = [];
const selectedBooks = [
	"sportsbet",
	"unibet",
	"boombet",
	"palmerbet",
	"tab",
	"betdeluxe",
	"topsport",
	"neds",
	"pointsbet",
];
const allSports = ["afl", "rugby-league"];

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

async function main() {
	const userInput = await getInput("1. AFL\n2. NRL\n3. All Sports\n4. Exit\n");
	let loading;
	switch (userInput) {
		case "1":
			loading = showLoadingDots();
			await importBookieDataForChosenSport("afl");
			allGames.forEach((game) => sortTeamsList(game));
			clearInterval(loading);
			clearLoadingDots();
			findGameStats();
			resetArrays();
			await main();
		case "2":
			loading = showLoadingDots();
			await importBookieDataForChosenSport("rugby-league");
			clearInterval(loading);
			clearLoadingDots();
			findGameStats();
			resetArrays();
			await main();
		case "3":
			loading = showLoadingDots();
			await importAllSports();
			/* Afl must be sorted due to some games being at the
			 same time and bookies ordering them differently */
			sortTeamsList(allGames[0]);
			clearInterval(loading);
			clearLoadingDots();
			findGameStats(); // Prints to console
			resetArrays();
			await main();
		case "4":
			process.exit(0);
		default:
			console.log("Invalid input\n");
			await main();
			break;
	}
}

async function importAllSports() {
	for (let i = 0; i < allSports.length; i++) {
		await importBookieDataForChosenSport(allSports[i]);
	}
}

// Import bookie data function using bluebird to allow multiple scrapers to run at once. Higher load!
async function importBookieDataForChosenSport(sport) {
	let lowestAmountOfGames = Infinity;

	let sortedSport = await bluebird.map(
		selectedBooks,
		async (book) => {
			let allBookieGames = await getGames(book, sport);
			if (book.length === 0) console.log(`${book} has no games available`);
			return allBookieGames;
		},
		{ concurrency: 2 }
	);

	sortedSport.forEach((games) => {
		if (games.length < lowestAmountOfGames) lowestAmountOfGames = games.length;
	});

	allGames.push(sortedSport);
	trimGamesArrayLength(sortedSport, lowestAmountOfGames);
}

async function getGames(bookie, sport) {
	try {
		const res = await axios.get(`${API_URL}${bookie}/${sport}`);
		return res.data;
	} catch (error) {
		console.log(error.response.data);
	}
}

function compareSelectedBooks(sport) {
	for (let k = 0; k < sport[0].length; k++) {
		let firstTeamBestOdds = 0;
		let secondTeamBestOdds = 0;
		let firstTeamBookieWithBestOdds;
		let secondTeamBookieWithBestOdds;
		let firstTeamPlaying;
		let secondTeamPlaying;
		for (let i = 0; i < sport.length; i++) {
			firstTeamPlaying = sport[i][k].firstTeam;
			secondTeamPlaying = sport[i][k].secondTeam;

			if (sport[i][k].firstTeamOdds >= firstTeamBestOdds) {
				firstTeamBestOdds = sport[i][k].firstTeamOdds;
				firstTeamBookieWithBestOdds = sport[i][k].bookie;
			}

			if (sport[i][k].secondTeamOdds >= secondTeamBestOdds) {
				secondTeamBestOdds = sport[i][k].secondTeamOdds;
				secondTeamBookieWithBestOdds = sport[i][k].bookie;
			}
		}
		const gameData = {
			game: `${firstTeamPlaying} vs ${secondTeamPlaying}`,
			firstTeamBestOdds: firstTeamBestOdds,
			firstTeamBookie: firstTeamBookieWithBestOdds,
			secondTeamBestOdds: secondTeamBestOdds,
			secondTeamBookie: secondTeamBookieWithBestOdds,
		};

		bestMargins.push(gameData);
	}
}

function findGameStats() {
	allGames.forEach((sport) => compareSelectedBooks(sport));
	findMarginPercentage(bestMargins);
	bestMargins.sort((a, b) => a.margin - b.margin);
	console.log(bestMargins);
}

function findMarginPercentage(games) {
	for (let i = 0; i < games.length; i++) {
		let margin =
			1 / games[i].firstTeamBestOdds + 1 / games[i].secondTeamBestOdds;

		let roundedMargin = (margin * 100).toFixed(2);
		bestMargins[i].margin = roundedMargin;
	}
}

function trimGamesArrayLength(array, desiredLength) {
	for (let i = 0; i < array.length; i++) {
		if (array[i].length > desiredLength) array[i].splice(desiredLength);
	}
}

function sortTeamsList(array) {
	for (let i = 0; i < array.length; i++) {
		array[i].sort((a, b) => a.firstTeam.localeCompare(b.firstTeam));
	}
}

async function getInput(prompt) {
	return new Promise((resolve) => {
		rl.question(prompt, (answer) => {
			resolve(answer);
		});
	});
}

function showLoadingDots() {
	let count = 0;
	return setInterval(() => {
		process.stdout.write(".");
		count++;
		if (count === 8) {
			clearLoadingDots();
			count = 0;
		}
	}, 500);
}

function clearLoadingDots() {
	process.stdout.write("\r        \r");
}

function resetArrays() {
	bestMargins.length = 0;
	allGames.length = 0;
}

main();
