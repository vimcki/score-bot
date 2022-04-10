import * as web3 from '@solana/web3.js';

import * as serum from "@project-serum/serum"

import {OrderParams} from "@project-serum/serum/lib/market"

import {atlasMint} from "./../../addresses"
import {TransactionSender} from "../transaction_sender/sender"

const foodMarketAddr = new web3.PublicKey("AdL6nGkPe3snPb7TEgSjaN8qCG493iYQqv4DeoCqH53F")
const serumProgramID = new web3.PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin")

export default class SerumMarket {
	transactionSender: TransactionSender
	constructor(ts: TransactionSender) {
		this.transactionSender = ts
	}

	async buy(connection: web3.Connection, ammount: number, keypair: web3.Keypair) {
		const resp = await connection.getTokenAccountsByOwner(keypair.publicKey, {mint: atlasMint})
		const atlasWallet = resp.value[0].pubkey
		let market = await serum.Market.load(connection, foodMarketAddr, {}, serumProgramID);
		const asks = await market.loadAsks(connection)
		const price = asks.getL2(1)[0][0]

		const openOrdersAccounts = await market.findOpenOrdersAccountsForOwner(connection, keypair.publicKey)

		const orderArgs = {
			owner: keypair.publicKey,
			payer: atlasWallet,
			side: 'buy',
			price: price,
			size: ammount + 1,
			orderType: 'limit',
			selfTradeBehavior: 'decrementTake',
			openOrdersAddressKey: openOrdersAccounts[0].address,
		} as OrderParams<web3.PublicKey>
		//const sig = await market.placeOrder(connection, orderArgs)
		//console.log(sig)

		//const placeOrderInstruction = market.makeNewOrderV3Instruction(orderArgs)
		let placeOrderInstruction = market.makePlaceOrderInstruction(connection, orderArgs)
		let transaction = new web3.Transaction()
		transaction.add(placeOrderInstruction)
		const sig = await this.transactionSender.send(connection, transaction)
		console.log(sig)
		return

		//for (let openOrders of await market.findOpenOrdersAccountsForOwner(connection, keypair.publicKey,)) {
		//	if (openOrders.baseTokenFree > 0 || openOrders.quoteTokenFree > 0) {
		//		const base = await market.findBaseTokenAccountsForOwner(connection, keypair.publicKey);
		//		const baseTokenAccount = base[0].pubkey;
		//		const quote = await market.findQuoteTokenAccountsForOwner(connection, keypair.publicKey);
		//		const quoteTokenAccount = quote[0].pubkey;

		//		await market.makeSettleFundsTransaction(
		//			connection,
		//			openOrders,
		//			baseTokenAccount,
		//			quoteTokenAccount,
		//		);
		//	}

		//}

		//console.log(sig)
	}
}
