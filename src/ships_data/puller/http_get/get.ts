import axios from 'axios'

import * as web3 from '@solana/web3.js';

import { Ships, Ship} from "./../../dto"

export default class Puller{
	url: string
	constructor(url: string) {
		this.url = url
	}

	async pull(): Promise<Ships>{
		const response = await axios.get(this.url)
		const ships_info = response.data.filter((val:any) => {return val.attributes.itemType == "ship"})
		let ships: Ships = {}
		for (let ship_info of ships_info){
			let ship:Ship = {
				symbol:ship_info.symbol, 
				name: ship_info.name, 
				mint_addr: new web3.PublicKey(ship_info.mint)
			}	
			ships[ship_info.symbol] = ship
		}
		return ships
	}
}
