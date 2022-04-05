import * as web3 from '@solana/web3.js';

import * as factory from "@staratlas/factory"

import KeypairProvider from "./libs/pkg/keypair/secret_key_file/keypair"
import AnyResource from "./libs/instruction/any_resource/any"
import Harvest from "./libs/instruction/harvest/harvest"
import TransactionSender from "./libs/transaction_sender/basic/basic"
import R4 from "./libs/resource_calculator/r4/r4"
import {Resource} from "./libs/resource_calculator/calc"

import {scoreProgramID, atlasMint, foodMint, ammoMint, fuelMint, toolkitMint} from "./addresses"

//import Puller from "./libs/ships_data/puller/http_get/get"
import connection from "./libs/rpc_connection/figment/figment"
//const ships_puller = new Puller("https://galaxy.staratlas.com/nfts")

require('dotenv').config();

const kpp = new KeypairProvider(process.env.KEY_PATH)
const keypair = kpp.get()

const resourceCalc = new R4()

const harvestInstructionProvider = new Harvest(
	keypair.publicKey,
	scoreProgramID,
	atlasMint,
)

const feedInstructionProvider = new AnyResource(
	Resource.Food, 
	keypair.publicKey,
	scoreProgramID,
	foodMint,
)

const armInsctructionProvider = new AnyResource(
	Resource.Arms,
	keypair.publicKey,
	scoreProgramID,
	ammoMint,
)

const fuelInstructionProvider = new AnyResource(
	Resource.Fuel,
	keypair.publicKey,
	scoreProgramID,
	fuelMint,
)

const repairInstructionProvider = new AnyResource(
	Resource.Toolkit,
	keypair.publicKey,
	scoreProgramID,
	toolkitMint,
)

const transactionSender = new TransactionSender(
	keypair
)

async function go() {
	//const ships = await ships_puller.pull()

	const foodBalance = await getBalance(keypair.publicKey, foodMint)
	const armsBalance = await getBalance(keypair.publicKey, ammoMint)
	const foodBalance = await getBalance(keypair.publicKey, fuelMint)
	const toolkitBalance = await getBalance(keypair.publicKey, toolkitMint)

	const fleets =	await factory.getAllFleetsForUserPublicKey(connection, keypair.publicKey, scoreProgramID)
	let instructions: web3.TransactionInstruction[] = []
	for (let fleet of fleets) {
		const shipMint = fleet.shipMint
		console.log('shipMint: ', shipMint.toJSON());
		const scoreVarsShipInfo =	await factory.getScoreVarsShipInfo(connection, scoreProgramID, shipMint)
		const shipStakingAccountInfo =	await factory.getShipStakingAccountInfo(
			connection,
		 	scoreProgramID,
		 	shipMint,
		 	keypair.publicKey,
		)

		const neededFood = resourceCalc.resupply(Resource.Food, scoreVarsShipInfo, shipStakingAccountInfo)
		const neededArms = resourceCalc.resupply(Resource.Arms, scoreVarsShipInfo, shipStakingAccountInfo)
		const neededFuel = resourceCalc.resupply(Resource.Fuel, scoreVarsShipInfo, shipStakingAccountInfo)
		const neededToolkits = resourceCalc.resupply(Resource.Toolkit, scoreVarsShipInfo, shipStakingAccountInfo)

		console.log(neededFood)
		console.log(neededArms)
		console.log(neededFuel)
		console.log(neededToolkits)

		const feedInstruction = await feedInstructionProvider.get(connection, neededFood, shipMint)
		const armInstruction = await armInsctructionProvider.get(connection, neededArms, shipMint)
		const fuelInstruction = await fuelInstructionProvider.get(connection, neededFuel, shipMint)
		const repairInstruction = await repairInstructionProvider.get(connection, neededToolkits, shipMint)
		const harvestInstruction = await harvestInstructionProvider.get(connection, shipMint)
		instructions.push(feedInstruction, armInstruction, fuelInstruction, repairInstruction, harvestInstruction)
	}
	while (instructions.length > 0) {
		console.log(instructions.length)
		const processedInsctructions = instructions.splice(0,5)
		console.log(processedInsctructions.length)
		let transaction = new web3.Transaction()
		for (let instruction of processedInsctructions){
			transaction.add(instruction)
		}
		const signature = await transactionSender.send(connection, transaction)
		console.log("transaction sig: " ,signature)
	}
}

async function getBalance(wallet: web3.PublicKey, mint: web3.PublicKey){
	const tao = {mint: mint}
	const resp = await connection.getTokenAccountsByOwner(wallet, tao)
	const tokenWallet = resp.value[0].pubkey
	const accountBalance = await connection.getTokenAccountBalance(tokenWallet)
	return accountBalance.value.uiAmount
}

go()
