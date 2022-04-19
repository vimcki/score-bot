import * as fs from 'fs'

import {Account} from "@solana/web3.js"

export default class AccountProvider {
	account: Account

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

		this.account = new Account(secretKey)
	}

	get() {
		return this.account
	}
}
