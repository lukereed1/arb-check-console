const axios = require("axios");
const readline = require("readline");

const allGames = [];
const bestMargins = [];
const selectedBooks = ["neds", "sportsbet", "unibet", "pointsbet", "tab"];
const allSports = ["afl", "rugby-league"];

require("dotenv").config();

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

async function main() {
	const userInput = await getInput("1. AFL\n2. NRL\n3. All Sports\n4. Exit\n");
	const loading = showLoadingDots();
	switch (userInput) {
		case "1":
			await importBookieDataForChosenSport("afl");
			allGames.forEach((game) => sortTeamsList(game));
			clearInterval(loading);
			clearLoadingDots();
			findGameStats();
			main();
			break;
		case "2":
			await importBookieDataForChosenSport("rugby-league");
			clearInterval(loading);
			clearLoadingDots();
			findGameStats();
			main();
			break;
		case "3":
			await importAllSports();
			// Afl must be sorted due to some games being at the same time and bookies ordering them differently
			sortTeamsList(allGames[0]);
			clearInterval(loading);
			clearLoadingDots();
			findGameStats();
			main();
			break;
		case "4":
			process.exit(0);
			break;
		default:
			console.log("Invalid input.\n");
			main();
			break;
	}
}

async function getInput(prompt) {
	return new Promise((resolve) => {
		rl.question(prompt, (answer) => {
			resolve(answer);
		});
	});
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

async function importAllSports() {
	for (let i = 0; i < allSports.length; i++) {
		await importBookieDataForChosenSport(allSports[i]);
	}
}

async function importBookieDataForChosenSport(sport) {
	let lowestAmountOfGames = Infinity;
	let sortedSport = [];
	for (let i = 0; i < selectedBooks.length; i++) {
		let allBookieGames = await getGames(selectedBooks[i], sport);
		if (selectedBooks[i].length === 0)
			console.log(`${selectedBooks[i]} has no games available`);

		if (allBookieGames.length < lowestAmountOfGames)
			lowestAmountOfGames = allBookieGames.length;

		sortedSport.push(allBookieGames);
	}
	allGames.push(sortedSport);
	trimGamesArrayLength(sortedSport, lowestAmountOfGames);
}

async function getGames(bookie, sport) {
	try {
		const res = await axios.get(`${process.env.APIURL}${bookie}/${sport}`);
		return res.data;
	} catch (error) {
		console.log(error.response.data);
	}
}

function trimGamesArrayLength(array, desiredLength) {
	for (let i = 0; i < array.length; i++) {
		if (array[i].length > desiredLength) array[i].splice(desiredLength);
	}
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

function sortTeamsList(array) {
	for (let i = 0; i < array.length; i++) {
		array[i].sort((a, b) => a.firstTeam.localeCompare(b.firstTeam));
	}
}

function clearLoadingDots() {
	process.stdout.write("\r        \r");
}

main();
