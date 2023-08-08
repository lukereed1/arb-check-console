// const button = document
// 	.querySelector("#testButton")
// 	.addEventListener("click", () => getGames("neds", "afl"));

async function main() {
	try {
		const aflNeds = await getGames("neds", "afl");
		const aflSportsbet = await getGames("sportsbet", "afl");

		aflNeds.sort((a, b) => a.firstTeam.localeCompare(b.firstTeam));
		// sortArray(aflSportsbet);

		console.log(aflNeds);
		console.log(aflSportsbet);

		compareBooks(aflNeds, aflSportsbet);
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

function compareBooks(a, b) {
	let gameData = [];
	for (let i = 0; i < a.length; i++) {
		gameData = `${a[i].firstTeam} vs ${a[i].secondTeam} `;
		console.log(gameData);
	}
}

function sortArray(array) {
	array.sort((a, b) => a.firstTeam.localeCompare(b.firstTeam));
}
main();
