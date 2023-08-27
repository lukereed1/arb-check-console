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
	"unibet",
	"betdeluxe",
	"neds",
	"sportsbet",
	"boombet",
	"tab",
];
const allSports = ["afl", "rugby-league", "mlb"];

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

async function main() {
	const userInput = await getInput(
		"1. AFL\n2. NRL\n3. MLB\n4. All Sports\n5. Exit\n"
	);
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
			await importBookieDataForChosenSport("mlb");
			clearInterval(loading);
			clearLoadingDots();
			findGameStats();
			resetArrays();
			await main();
		case "4":
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
		case "5":
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

	let allSportsAllBooksIncludingBooksWithNoGames = await bluebird.map(
		selectedBooks,
		async (book) => {
			let allBookieGames = await getGames(book, sport);
			return allBookieGames;
		},
		{ concurrency: 2 }
	);

	// Removes bookie if it is showing no games
	let sortedSportAllBooks = allSportsAllBooksIncludingBooksWithNoGames.filter(
		(subArray) => subArray.length > 0
	);

	// Finds bookie with lowest amount of games
	sortedSportAllBooks.forEach((games) => {
		if (games.length < lowestAmountOfGames) lowestAmountOfGames = games.length;
	});

	if (sport === "mlb") {
		// Removes bookies not compatible with MLB at the moment
		for (let i = 0; i < sortedSportAllBooks.length; i++) {
			if (
				sortedSportAllBooks[i][0].bookie === "Tab" ||
				sortedSportAllBooks[i][0].bookie === "BetDeluxe"
			) {
				sortedSportAllBooks.splice(i, 1);
			}
		}

		/* MLB team orders always different across books
		this checks one order and makes the rest the same */
		let teamOne = sortedSportAllBooks[0][0].firstTeam.split()[0];
		for (let i = 0; i < sortedSportAllBooks.length; i++) {
			if (sortedSportAllBooks[i][0].firstTeam.split()[0] !== teamOne) {
				sortedSportAllBooks[i].forEach((game) => {
					let tempTeam = game.firstTeam;
					game.firstTeam = game.secondTeam;
					game.secondTeam = tempTeam;

					let tempOdds = game.firstTeamOdds;
					game.firstTeamOdds = game.secondTeamOdds;
					game.secondTeamOdds = tempOdds;
				});
			}
		}
		// For MLB some bookies only show some games, this ensures each bookie array has exact same game data
		sortTeamsList(sortedSportAllBooks);
		sortedSportAllBooks = ensureBookiesHaveSameGameData(sortedSportAllBooks);
	}

	trimGamesArrayLength(sortedSportAllBooks, lowestAmountOfGames);
	allGames.push(sortedSportAllBooks);
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

function ensureBookiesHaveSameGameData(array) {
	let allTeams = new Set(
		array.flat().map((obj) => obj.firstTeam.split(" ")[0])
	);

	allTeams = [...allTeams].filter((team) =>
		array.every((subArray) =>
			subArray.some((obj) => obj.firstTeam.startsWith(team))
		)
	);

	return array.map((subArray) =>
		allTeams.map((team) =>
			subArray.find((obj) => obj.firstTeam.startsWith(team))
		)
	);
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

async function test() {
	await importBookieDataForChosenSport("mlb");
	console.log(allGames);
}

main();
