import * as web3 from '@solana/web3.js';

export interface TransactionSender{
	send(connection: web3.Connection, transaction: web3.Transaction): Promise<web3.TransactionSignature>
}
