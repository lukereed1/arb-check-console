let allGames = [];
const selectedBooks = ["neds", "sportsbet"];
const selectedSports = ["rugby-league", "afl"];

async function main() {
	try {
		await importBookieData();
		console.log(allGames);
		// const aflNeds = await getGames("neds", "afl");
		// const aflSportsbet = await getGames("sportsbet", "afl");
		// const rugbyleagueNeds = await getGames("neds", "rugby-league");
		// const rugbyleagueSportsbet = await getGames("sportsbet", "rugby-league");
		// sortTeamsList(aflNeds);
		// sortTeamsList(aflSportsbet);
		// sortTeamsList(rugbyleagueNeds);
		// sortTeamsList(rugbyleagueSportsbet);
		// compareBooks(aflNeds, aflSportsbet);
		// console.log(" ");
		// compareBooks(rugbyleagueNeds, rugbyleagueSportsbet);
	} catch (error) {
		console.error(error);
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

async function importBookieData() {
	for (let i = 0; i < selectedBooks.length; i++) {
		for (let j = 0; j < selectedSports.length; j++) {
			allGames.push(await getGames(selectedBooks[j], selectedSports[i]));
		}
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

function sortTeamsList(array) {
	array.sort((a, b) => a.firstTeam.localeCompare(b.firstTeam));
}

function findMargin(book1team1, book1team2, book2team1, book2team2) {
	let margin1 = 1 / +book1team1 + 1 / +book2team2;
	let margin2 = 1 / +book1team2 + 1 / +book2team1;

	let bestMargin = ((margin1 < margin2 ? margin1 : margin2) * 100).toFixed(2);
	return bestMargin + "%";
}

main();
