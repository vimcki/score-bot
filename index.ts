import * as web3 from '@solana/web3.js';

import {createHarvestInstruction} from "@staratlas/factory"

import KeypairProvider from "./pkg/keypair/secret_key_file/keypair"

const atlas_mint = new web3.PublicKey("ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx")
const ship_mint = new web3.PublicKey("Ev3xUhc1Leqi4qR2E5VoG9pcxCvHHmnAaSRVPg485xAT")
const score_program_id = new web3.PublicKey("FLEET1qqzpexyaDpqb2DGsSzE2sDCizewCg9WjrA6DBW")

const kpp = new KeypairProvider("/home/user/.config/solana/bank.json")

const keypair = kpp.get()


async function go() {
	let connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'));

	const resp = await connection.getTokenAccountsByOwner(keypair.publicKey, {mint: atlas_mint})
	const my_atlas_account = resp.value[0].pubkey

	const instruction = await createHarvestInstruction(
		connection, 
		keypair.publicKey, 
		my_atlas_account,
		atlas_mint,
		ship_mint,
		score_program_id
	)

	console.log(instruction)
}
go()
