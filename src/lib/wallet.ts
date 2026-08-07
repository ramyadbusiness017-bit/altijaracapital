import { HDNodeWallet } from 'ethers';
import { createHash } from 'crypto';

/**
 * Derives a unique EVM wallet address (UIA) using strict sequential indexing.
 * Uses the master mnemonic from the environment variables.
 * 
 * @param index - The strict sequential integer (0, 1, 2, ...) assigned to the user
 * @returns The unique public Ethereum address (UIA)
 */
export function generateUIA(index: number): string {
  const mnemonic = process.env.WALLET_MNEMONIC;
  
  if (!mnemonic) {
    throw new Error('WALLET_MNEMONIC is not defined in environment variables');
  }

  // Derive the wallet using standard BIP44 sequential derivation for Ethereum (Coin type 60)
  const path = `m/44'/60'/0'/0/${index}`;
  const hdNode = HDNodeWallet.fromPhrase(mnemonic, undefined, path);

  return hdNode.address;
}
