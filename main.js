const allGames = [];
const bestMargins = [];
const selectedBooks = ["unibet", "sportsbet", "tab", "pointsbet"];
const allSports = ["rugby-league"];
let selectedSport = "afl";

async function main() {
	try {
		await importAllSports();
		allGames.forEach((sport) => compareSelectedBooks(sport));
		console.log(allGames);
		console.log(bestMargins);
		printMargins(bestMargins);
	} catch (error) {
		console.error(error);
	}
}

function printMargins(games) {
	for (let i = 0; i < games.length; i++) {
		let margin =
			1 / games[i].firstTeamBestOdds + 1 / games[i].secondTeamBestOdds;

		let roundedMargin = (margin * 100).toFixed(2);
		console.log(`${games[i].game} | ${roundedMargin}%`);
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

async function importAllSports() {
	for (let i = 0; i < allSports.length; i++) {
		await importBookieDataForChosenSport(allSports[i]);
	}
}

async function getGames(bookie, sport) {
	try {
		const res = await axios.get(`http://localhost:5000/api/${bookie}/${sport}`);
		return res.data;
	} catch (error) {
		console.log(error.response.data);
	}
}

function sortTeamsList(array) {
	for (let i = 0; i < array.length; i++) {
		array[i].sort((a, b) => a.firstTeam.localeCompare(b.firstTeam));
	}
}

function compareBooks(a, b) {
	let gameData = [];
	for (let i = 0; i < a.length; i++) {
		gameData = `${a[i].firstTeam} vs ${a[i].secondTeam}\nMargin: ${findMargin(
			a[i].firstTeamOdds,
			a[i].secondTeamOdds,
			b[i].firstTeamOdds,
			b[i].secondTeamOdds
		)}`;
		console.log(gameData);
	}
}

function findMargin(book1team1, book1team2, book2team1, book2team2) {
	let margin1 = 1 / +book1team1 + 1 / +book2team2;
	let margin2 = 1 / +book1team2 + 1 / +book2team1;

	let bestMargin = ((margin1 < margin2 ? margin1 : margin2) * 100).toFixed(2);
	return bestMargin + "%";
}

function trimGamesArrayLength(array, desiredLength) {
	for (let i = 0; i < array.length; i++) {
		if (array[i].length > desiredLength) array[i].splice(desiredLength);
	}
}

main();
