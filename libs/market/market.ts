import * as web3 from '@solana/web3.js';

import * as serum from "@project-serum/serum"

import {OrderParams} from "@project-serum/serum/lib/market"

import {atlasMint} from "./../../addresses"
import {TransactionSender} from "../transaction_sender/sender"
import {Resource} from "../resource_calculator/calc"

const serumProgramID = new web3.PublicKey("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin")

export default class SerumMarket {
	transactionSender: TransactionSender
	constructor(ts: TransactionSender) {
		this.transactionSender = ts
	}

	async buy(connection: web3.Connection, resource: Resource, ammount: number, keypair: web3.Keypair) {
		const resourceMarketAddr = resourceMarket(resource)
		let market = await serum.Market.load(connection, resourceMarketAddr, {}, serumProgramID);
		await this._buy(connection, market, ammount, keypair)
		await this._settle(connection, market, keypair)
	}

	async _buy(connection: web3.Connection, market: serum.Market, ammount: number, keypair: web3.Keypair) {
		const asks = await market.loadAsks(connection)
		const price = asks.getL2(1)[0][0]

		let openOrdersAccounts = await market.findOpenOrdersAccountsForOwner(connection, keypair.publicKey, 1000)
		const resp = await connection.getTokenAccountsByOwner(keypair.publicKey, {mint: atlasMint})
		const atlasWallet = resp.value[0].pubkey

		const orderArgs = {
			owner: keypair.publicKey,
			payer: atlasWallet,
			side: 'buy',
			price: price,
			size: Math.round(ammount) + 1,
			orderType: 'limit',
			selfTradeBehavior: 'decrementTake',
			openOrdersAddressKey: openOrdersAccounts[0].address,
		} as OrderParams<web3.PublicKey>
		let placeOrderInstruction = market.makePlaceOrderInstruction(connection, orderArgs)
		let transaction = new web3.Transaction()
		transaction.add(placeOrderInstruction)
		const sig = await this.transactionSender.send(connection, transaction)
		console.log("buy:", sig)
	}

	async _settle(connection: web3.Connection, market: serum.Market, keypair: web3.Keypair) {
		let shouldBreak = false
		while (shouldBreak == false) {
			let openOrdersAccounts = await market.findOpenOrdersAccountsForOwner(connection, keypair.publicKey, 1000)
			for (let openOrders of openOrdersAccounts) {
				if (openOrders.baseTokenFree > 0 || openOrders.quoteTokenFree > 0) {
					shouldBreak = true
					break
				}
			}
			console.log("waiting for order to fill")
			await new Promise(resolve => setTimeout(resolve, 5000))
		}

		for (let openOrders of await market.findOpenOrdersAccountsForOwner(connection, keypair.publicKey,)) {
			if (openOrders.baseTokenFree > 0 || openOrders.quoteTokenFree > 0) {
				const base = await market.findBaseTokenAccountsForOwner(connection, keypair.publicKey);
				const baseTokenAccount = base[0].pubkey;
				const quote = await market.findQuoteTokenAccountsForOwner(connection, keypair.publicKey);
				const quoteTokenAccount = quote[0].pubkey;

				const tx = await market.makeSettleFundsTransaction(
					connection,
					openOrders,
					baseTokenAccount,
					quoteTokenAccount,
				);
				const settleFunds = await this.transactionSender.send(connection, tx.transaction)
				console.log("settle:", settleFunds)
				console.log("baseTokenFree:", openOrders.baseTokenFree.toNumber(), "quoteTokenFree:", openOrders.quoteTokenFree.toNumber())
			}

		}
	}
}

const foodMarketAddr = new web3.PublicKey("AdL6nGkPe3snPb7TEgSjaN8qCG493iYQqv4DeoCqH53F")
const armsMarketAddr = new web3.PublicKey("8qtV9oq8VcrUHZdEeCJ2bUM3uLwjrfJ9U9FGrCSvu34z")
const fuelMarketAddr = new web3.PublicKey("D6rLbJLqi1VvV81ViPScgWiKYcZoTPnMiQTcrmH9X5oQ")
const toolkitMarketAddr = new web3.PublicKey("32Pr4MhSD1K4J9buESjjbSZnXWLQ5oHFgB9MhEC2hp6J")

function resourceMarket(resource: Resource) {
	switch (resource) {
		case Resource.Food: {
			return foodMarketAddr
		}
		case Resource.Arms: {
			return armsMarketAddr
		}
		case Resource.Fuel: {
			return fuelMarketAddr
		}
		case Resource.Toolkit: {
			return toolkitMarketAddr
		}
		default: {
			throw new Error("Unknown resource")
		}
	}
}
