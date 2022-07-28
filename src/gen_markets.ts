import axios from 'axios'

async function main() {
	let entries = []
	const response = await axios.get("https://galaxy.staratlas.com/nfts")
	for (let asset of response.data) {
		for (let market of asset.markets) {
			if (!market.serumProgramId) {
				continue
			}
			entries.push({
				name: asset.symbol + "/" + market.quotePair,
				baseLabel: asset.symbol,
				address: market.id,
				programId: market.serumProgramId,
			})
		}
	}
	console.log(JSON.stringify(entries, null, 2))
}
main()
