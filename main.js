// Loop through all bookies and print best margin for chosen sport

let allGames = [];
const selectedBooks = ["neds", "sportsbet", "tab", "pointsbet"];
const selectedSport = "afl";

const allSports = ["afl", "rugby-league"];

async function main() {
	try {
		await importAllSports();
		allGames.forEach((game) => sortTeamsList(game));
		console.log(allGames);
	} catch (error) {
		console.error(error);
	}
}

async function importBookieDataForChosenSport(sport) {
	let lowestAmountOfGames = Infinity;
	let sortedSport = [];
	for (let i = 0; i < selectedBooks.length; i++) {
		let allBookieGames = await getGames(selectedBooks[i], sport);

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
		console.error(error);
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
