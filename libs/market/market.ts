import * as web3 from '@solana/web3.js';

import * as serum from "@project-serum/serum"
//var serum = require("@project-serum/serum")

import {atlasMint} from "./../../addresses"

const foodMarketAddr = new web3.PublicKey("AdL6nGkPe3snPb7TEgSjaN8qCG493iYQqv4DeoCqH53F")
const serumProgramID = new web3.PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin")

export default class SerumMarket {
	constructor() {
	}
	async buy(connection: web3.Connection, ammount: number, keypair: web3.Keypair) {
		const resp = await connection.getTokenAccountsByOwner(keypair.publicKey, {mint: atlasMint})
		const atlasWallet = resp.value[0].pubkey
		let market = await serum.Market.load(connection, foodMarketAddr, {}, serumProgramID);
		const asks = await market.loadAsks(connection)
		const price = asks.getL2(1)[0][0]

		const orderArgs = {
			owner: keypair,
			payer: atlasWallet,
			side: 'buy',
			price: price,
			size: ammount + 1,
			orderType: 'limit',
			selfTradeBehavior: 'decrementTake',
		}

		const openOrders = await market.findOpenOrdersAccountsForOwner(connection, keypair.publicKey))
		var transaction = await market.makeSettleFundsTransaction(
			connection,
			openOrders,
			baseWallet
			quoteWallet
		)

		const sig = await market.placeOrder(
			connection,
			orderArgs,
		)
		console.log(sig)
	}
}
