const fs = require("fs");
const path = require("path");
const readline = require("readline");
const axios = require("axios");
const bluebird = require("bluebird");
const configPath = path.join(__dirname, "config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

const API_URL = config.API_URL;
const allGames = [];
const allSoccerGames = [];
const bestMargins = [];
const bestMarginsSoccer = [];
const selectedBooks = [
	"neds",
	// "sportsbet",
	// "unibet",
	"tab",
	// "betdeluxe",
	// "boombet",
	// "palmerbet",
	// "topsport",
	// "pointsbet",
];
const allSports = ["afl", "rugby-league", "mlb"];
const soccerLeagues = ["epl"];

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

async function main() {
	const userInput = await getInput(
		"1. AFL\n2. NRL\n3. MLB\n4. EPL\n5. All Sports\n6. Exit\n"
	);
	let loading;
	switch (userInput) {
		case "1":
			loading = showLoadingDots();
			await importBookieDataForTwoOutcomeSport("afl");
			allGames.forEach((game) => sortTeamsList(game));
			clearInterval(loading);
			clearLoadingDots();
			allGames.forEach((sport) => compareSelectedBooks(sport));
			findMarginPercentage(bestMargins);
			sortResultsByMargin(bestMargins);
			console.log(bestMargins);
			resetArrays();
			await main();

		case "2":
			loading = showLoadingDots();
			await importBookieDataForTwoOutcomeSport("rugby-league");
			clearInterval(loading);
			clearLoadingDots();
			allGames.forEach((sport) => compareSelectedBooks(sport));
			findMarginPercentage(bestMargins);
			sortResultsByMargin(bestMargins);
			console.log(bestMargins);
			resetArrays();
			await main();

		case "3":
			loading = showLoadingDots();
			await importBookieDataForTwoOutcomeSport("mlb");
			clearInterval(loading);
			clearLoadingDots();
			allGames.forEach((sport) => compareSelectedBooks(sport));
			findMarginPercentage(bestMargins);
			sortResultsByMargin(bestMargins);
			console.log(bestMargins);
			resetArrays();
			await main();

		case "4":
			loading = showLoadingDots();
			await importBookieDataForSoccer("epl");
			clearInterval(loading);
			clearLoadingDots();
			allSoccerGames.forEach((sport) => compareSelectedBooksForSoccer(sport));
			findMarginPercentageSoccer(bestMarginsSoccer);
			sortResultsByMargin(bestMarginsSoccer);
			console.log(bestMarginsSoccer);
			resetArrays();
			await main();

		case "5":
			loading = showLoadingDots();
			await importAllSports();
			/* Afl must be sorted due to some games being at the
			 same time and bookies ordering them differently */
			sortTeamsList(allGames[0]);
			clearInterval(loading);
			clearLoadingDots();
			allGames.forEach((sport) => compareSelectedBooks(sport));
			allSoccerGames.forEach((sport) => compareSelectedBooksForSoccer(sport));
			findMarginPercentage(bestMargins);
			findMarginPercentageSoccer(bestMarginsSoccer);
			bestMarginsSoccer.forEach((league) => bestMargins.push(league));
			sortResultsByMargin(bestMargins);
			console.log(bestMargins);
			resetArrays();
			await main();

		case "6":
			process.exit(0);

		default:
			console.log("Invalid input\n");
			await main();
			break;
	}
}

async function importAllSports() {
	for (let i = 0; i < allSports.length; i++) {
		await importBookieDataForTwoOutcomeSport(allSports[i]);
	}

	for (let i = 0; i < soccerLeagues.length; i++) {
		await importBookieDataForSoccer(soccerLeagues[i]);
	}
}

// Import bookie data function using bluebird to allow multiple scrapers to run at once. Higher load!
async function importBookieDataForTwoOutcomeSport(sport) {
	let lowestAmountOfGames = Infinity;

	let allSportsAllBooksIncludingBooksWithNoGames = await bluebird.map(
		selectedBooks,
		async (book) => {
			let allBookieGames = await getGames(book, sport);
			return allBookieGames;
		},
		{ concurrency: 3 }
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

async function importBookieDataForSoccer(league) {
	let lowestAmountOfGames = Infinity;

	let allSportsAllBooksIncludingBooksWithNoGames = await bluebird.map(
		selectedBooks,
		async (book) => {
			let allBookieGames = await getSoccerGames(book, league);
			return allBookieGames;
		},
		{ concurrency: 3 }
	);

	// Removes bookie if it is showing no games
	let sortedSportAllBooks = allSportsAllBooksIncludingBooksWithNoGames.filter(
		(subArray) => subArray.length > 0
	);

	// Finds bookie with lowest amount of games
	sortedSportAllBooks.forEach((games) => {
		if (games.length < lowestAmountOfGames) lowestAmountOfGames = games.length;
	});

	sortTeamsList(sortedSportAllBooks);
	trimGamesArrayLength(sortedSportAllBooks, lowestAmountOfGames);
	allSoccerGames.push(sortedSportAllBooks);
}

async function getGames(bookie, sport) {
	try {
		const res = await axios.get(`${API_URL}${bookie}/${sport}`);
		return res.data;
	} catch (error) {
		console.log(error.response.data);
	}
}

async function getSoccerGames(bookie, league) {
	try {
		const res = await axios.get(`${API_URL}${bookie}/soccer/${league}`);
		return res.data;
	} catch (error) {
		console.log(error.response.data);
	}
}

// Finds best odds for each outcome for bookies selected
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

function compareSelectedBooksForSoccer(league) {
	for (let k = 0; k < league[0].length; k++) {
		let firstTeamBestOdds = 0;
		let secondTeamBestOdds = 0;
		let drawBestOdds = 0;
		let firstTeamBookieWithBestOdds;
		let secondTeamBookieWithBestOdds;
		let drawBestOddsBookie;
		let firstTeamPlaying;
		let secondTeamPlaying;

		for (let i = 0; i < league.length; i++) {
			firstTeamPlaying = league[i][k].firstTeam;
			secondTeamPlaying = league[i][k].secondTeam;

			if (league[i][k].firstTeamOdds >= firstTeamBestOdds) {
				firstTeamBestOdds = league[i][k].firstTeamOdds;
				firstTeamBookieWithBestOdds = league[i][k].bookie;
			}

			if (league[i][k].secondTeamOdds >= secondTeamBestOdds) {
				secondTeamBestOdds = league[i][k].secondTeamOdds;
				secondTeamBookieWithBestOdds = league[i][k].bookie;
			}

			if (league[i][k].drawOdds >= drawBestOdds) {
				drawBestOdds = league[i][k].drawOdds;
				drawBestOddsBookie = league[i][k].bookie;
			}
		}

		const gameData = {
			game: `${firstTeamPlaying} vs ${secondTeamPlaying}`,
			firstTeamBestOdds: firstTeamBestOdds,
			firstTeamBookie: firstTeamBookieWithBestOdds,
			drawBestOdds: drawBestOdds,
			drawBookie: drawBestOddsBookie,
			secondTeamBestOdds: secondTeamBestOdds,
			secondTeamBookie: secondTeamBookieWithBestOdds,
		};

		bestMarginsSoccer.push(gameData);
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

function findMarginPercentage(games) {
	for (let i = 0; i < games.length; i++) {
		let margin =
			1 / games[i].firstTeamBestOdds + 1 / games[i].secondTeamBestOdds;

		let roundedMargin = (margin * 100).toFixed(2);
		bestMargins[i].margin = roundedMargin;
	}
}

function findMarginPercentageSoccer(games) {
	for (let i = 0; i < games.length; i++) {
		let margin =
			1 / games[i].firstTeamBestOdds +
			1 / games[i].secondTeamBestOdds +
			1 / games[i].drawBestOdds;

		let roundedMargin = (margin * 100).toFixed(2);
		bestMarginsSoccer[i].margin = roundedMargin;
	}
}

function trimGamesArrayLength(array, desiredLength) {
	for (let i = 0; i < array.length; i++) {
		if (array[i].length > desiredLength) array[i].splice(desiredLength);
	}
}

function sortTeamsList(array) {
	for (let i = 0; i < array.length; i++) {
		array[i].sort((a, b) =>
			normalizeTeamName(a.firstTeam).localeCompare(
				normalizeTeamName(b.firstTeam)
			)
		);
	}
}

function normalizeTeamName(name) {
	if (name.toLowerCase() === "manchester city") return "man city";
	// Add more such mappings as required
	return name.toLowerCase();
}

function sortResultsByMargin(array) {
	array.sort((a, b) => a.margin - b.margin);
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
	bestMarginsSoccer.length = 0;
	allGames.length = 0;
	allSoccerGames.length = 0;
}

async function test() {
	await importBookieDataForSoccer("epl");
	// allGames.forEach((game) => sortTeamsList(game));
	console.log(allSoccerGames);
	allSoccerGames.forEach((sport) => compareSelectedBooksForSoccer(sport));
	findMarginPercentageSoccer(bestMarginsSoccer);
	sortResultsByMargin(bestMarginsSoccer);
	console.log(bestMarginsSoccer);
}

main();
