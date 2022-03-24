import * as web3 from '@solana/web3.js';

export interface InstructionProvider{
	get(connection: web3.Connection, shipMint: web3.PublicKey): web3.TransactionInstruction
}
