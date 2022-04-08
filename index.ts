import * as web3 from '@solana/web3.js';

import * as factory from "@staratlas/factory"

import KeypairProvider from "./libs/pkg/keypair/secret_key_file/keypair"
import AnyResource from "./libs/instruction/any_resource/any"
import Harvest from "./libs/instruction/harvest/harvest"
import TransactionSender from "./libs/transaction_sender/basic/basic"
import R4 from "./libs/resource_calculator/r4/r4"
import {Resource} from "./libs/resource_calculator/calc"
import SerumMarket from "./libs/market/market"

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

const market = new SerumMarket()

async function go() {
	//const ships = await ships_puller.pull()

	console.log("pqqq")
	market.buy(connection, 69, keypair)
	return

	const foodBalance = await getBalance(keypair.publicKey, foodMint)
	const armsBalance = await getBalance(keypair.publicKey, ammoMint)
	const fuelBalance = await getBalance(keypair.publicKey, fuelMint)
	const toolkitBalance = await getBalance(keypair.publicKey, toolkitMint)

	let neededFood = 0
	let neededArms = 0
	let neededFuel = 0
	let neededToolkits = 0

	const fleets = await factory.getAllFleetsForUserPublicKey(connection, keypair.publicKey, scoreProgramID)
	let instructions: web3.TransactionInstruction[] = []
	for (let fleet of fleets) {
		const shipMint = fleet.shipMint
		console.log('shipMint: ', shipMint.toJSON());
		const scoreVarsShipInfo = await factory.getScoreVarsShipInfo(connection, scoreProgramID, shipMint)
		const shipStakingAccountInfo = await factory.getShipStakingAccountInfo(
			connection,
			scoreProgramID,
			shipMint,
			keypair.publicKey,
		)

		const neededFoodPart = resourceCalc.resupply(Resource.Food, scoreVarsShipInfo, shipStakingAccountInfo)
		const neededArmsPart = resourceCalc.resupply(Resource.Arms, scoreVarsShipInfo, shipStakingAccountInfo)
		const neededFuelPart = resourceCalc.resupply(Resource.Fuel, scoreVarsShipInfo, shipStakingAccountInfo)
		const neededToolkitsPart = resourceCalc.resupply(Resource.Toolkit, scoreVarsShipInfo, shipStakingAccountInfo)

		neededFood += neededFoodPart
		neededArms += neededArmsPart
		neededFuel += neededFuelPart
		neededToolkits += neededToolkitsPart

		const feedInstruction = await feedInstructionProvider.get(connection, neededFoodPart, shipMint)
		const armInstruction = await armInsctructionProvider.get(connection, neededArmsPart, shipMint)
		const fuelInstruction = await fuelInstructionProvider.get(connection, neededFuelPart, shipMint)
		const repairInstruction = await repairInstructionProvider.get(connection, neededToolkitsPart, shipMint)
		const harvestInstruction = await harvestInstructionProvider.get(connection, shipMint)
		instructions.push(feedInstruction, armInstruction, fuelInstruction, repairInstruction, harvestInstruction)
	}

	const missingFood = Math.max(neededFood - foodBalance, 0)
	const missingArms = Math.max(neededArms - armsBalance, 0)
	const missingFuel = Math.max(neededFuel - fuelBalance, 0)
	const missingToolkits = Math.max(neededToolkits - toolkitBalance, 0)

	console.log(missingFood)
	console.log(missingArms)
	console.log(missingFuel)
	console.log(missingToolkits)

	while (instructions.length > 0) {
		console.log(instructions.length)
		const processedInsctructions = instructions.splice(0, 5)
		console.log(processedInsctructions.length)
		let transaction = new web3.Transaction()
		for (let instruction of processedInsctructions) {
			transaction.add(instruction)
		}
		const signature = await transactionSender.send(connection, transaction)
		console.log("transaction sig: ", signature)
	}
}

async function getBalance(wallet: web3.PublicKey, mint: web3.PublicKey) {
	const tao = {mint: mint}
	const resp = await connection.getTokenAccountsByOwner(wallet, tao)
	const tokenWallet = resp.value[0].pubkey
	const accountBalance = await connection.getTokenAccountBalance(tokenWallet)
	return accountBalance.value.uiAmount
}

go()
