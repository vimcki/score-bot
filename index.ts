import * as web3 from '@solana/web3.js';

import * as factory from "@staratlas/factory"

import KeypairProvider from "./libs/pkg/keypair/secret_key_file/keypair"

//import Puller from "./libs/ships_data/puller/http_get/get"
import connection from "./libs/rpc_connection/sa/sa"
//const ships_puller = new Puller("https://galaxy.staratlas.com/nfts")

const atlas_mint = new web3.PublicKey("ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx")
const score_program_id = new web3.PublicKey("FLEET1qqzpexyaDpqb2DGsSzE2sDCizewCg9WjrA6DBW")

const kpp = new KeypairProvider("/home/user/.config/solana/bank.json")

const keypair = kpp.get()


async function go() {
	//const ships = await ships_puller.pull()

	const resp = await connection.getTokenAccountsByOwner(keypair.publicKey, {mint: atlas_mint})
	const my_atlas_account = resp.value[0].pubkey
	const fleets =	await factory.getAllFleetsForUserPublicKey(connection, keypair.publicKey, score_program_id)

	for (var fleet of fleets) {
		console.log('shipMint: ', fleet.shipMint.toJSON());
		const instructions = await factory.createHarvestInstruction(
			connection, 
			keypair.publicKey, 
			my_atlas_account,
			atlas_mint,
			fleet.shipMint,
			score_program_id
		)
		let transaction = new web3.Transaction()
		transaction.add(instructions[0])
		const signature = await web3.sendAndConfirmTransaction(
			connection,
			transaction,
			[keypair],
		);
		console.log('SIGNATURE', signature);
	}
}
go()
