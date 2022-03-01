import * as web3 from '@solana/web3.js';

import * as factory from "@staratlas/factory"

import KeypairProvider from "./pkg/keypair/secret_key_file/keypair"

const atlas_mint = new web3.PublicKey("ATLASXmbPQxBUYbxPsV97usA3fPQYEqzQBUHgiFCUsXx")

const kpp = new KeypairProvider("/home/user/.config/solana/bank.json")

const keypair = kpp.get()


async function go() {
	let connection = new web3.Connection(web3.clusterApiUrl('mainnet-beta'));

	const my_atlas_account = await connection.getTokenAccountsByOwner(keypair.publicKey, {mint: atlas_mint})
	console.log(my_atlas_account.value[0].pubkey.toJSON())
	console.log(factory)

	//factory.createHarvestInstruction(connection, keypair.publicKey, )

	//console.log(keypair.publicKey.toJSON())
}
go()
