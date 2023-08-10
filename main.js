// Find smallest array for each sport
// need to sort
// Loop through all bookies and print best margin for chosen sport

let allGames = [];
const selectedBooks = ["neds", "sportsbet"];
const selectedSport = "afl";

async function main() {
	try {
		await importBookieDataForChosenSport();
		sortTeamsList(allGames);
		console.log(allGames);
	} catch (error) {
		console.error(error);
	}
}

async function importBookieDataForChosenSport() {
	let lowestAmountOfGames = Infinity;
	for (let i = 0; i < selectedBooks.length; i++) {
		let allBookieGames = await getGames(selectedBooks[i], selectedSport);

		if (allBookieGames.length < lowestAmountOfGames)
			lowestAmountOfGames = allBookieGames.length;

		allGames.push(allBookieGames);
	}

	for (let i = 0; i < allGames.length; i++) {
		if (allGames[i].length > lowestAmountOfGames)
			allGames[i].splice(lowestAmountOfGames);
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

function trimArray(array, desiredLength) {}

main();
