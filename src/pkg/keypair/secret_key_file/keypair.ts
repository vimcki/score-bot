import * as fs from 'fs'

import {Keypair} from "@solana/web3.js"

export default class KeypairProvider {
	keypair: Keypair

	constructor(path: string) {
		var data: string = ''
		try {
			data = fs.readFileSync(path, 'utf8')
		} catch (err) {
			console.error(err)
		}

		const opening_bracket_index: number = data.indexOf("[")
		const closing_bracket_index: number = data.indexOf("]") - data.length

		data = data.slice(opening_bracket_index + 1, closing_bracket_index)
		const data_list: string[] = data.split(",")

		const data_ints = data_list.map((item) => parseInt(item));


		let secretKey = Uint8Array.from(data_ints);

		this.keypair = Keypair.fromSecretKey(secretKey);
	}

	get() {
		return this.keypair
	}
}
