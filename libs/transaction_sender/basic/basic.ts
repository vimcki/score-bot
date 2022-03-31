import * as web3 from '@solana/web3.js';

const confirmOptions = {
	maxRetries: 20,
	commitment: 'processed' as web3.Commitment,
}

export default class TransactionSender{
	keypair: web3.Keypair
	constructor(keypair: web3.Keypair){
		this.keypair = keypair
	}
	
	async send(connection: web3.Connection, transaction: web3.Transaction): Promise<web3.TransactionSignature>{
		return  await web3.sendAndConfirmTransaction(
			connection,
			transaction,
			[this.keypair],
			confirmOptions,
		);
	}
}
