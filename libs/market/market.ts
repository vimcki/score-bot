import * as web3 from '@solana/web3.js';

import * as serum from "@project-serum/serum"
import { OrderParams } from "@project-serum/serum/lib/market"
//var serum = require("@project-serum/serum")

const foodMarketAddr = new web3.PublicKey("AdL6nGkPe3snPb7TEgSjaN8qCG493iYQqv4DeoCqH53F")
const serumProgramID = new web3.PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin")

export default class SerumMarket{
	constructor(){
	}
	async buy(connection: web3.Connection, keypair: web3.Keypair){
		let market = await serum.Market.load(connection, foodMarketAddr, {}, serumProgramID);
		const asks = await market.loadAsks(connection)
		const price = asks.getL2(1)[0][0]
		console.log(price)
		const orderArgs = {
				owner: keypair,
				payer: new web3.PublicKey("..."),
				side: 'buy',
				price: price,
				size: 1,
				orderType: 'limit',
			} as OrderParams<web3.Keypair>
		market.makePlaceOrderInstruction
		market.placeOrder(
			connection,
			orderArgs,
		)
		web3.Account
	}
}

