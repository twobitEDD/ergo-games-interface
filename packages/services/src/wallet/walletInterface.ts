export interface WalletBindRequest {
  userId: string;
  network: "ERGO_MAINNET" | "ERGO_TESTNET";
  address: string;
}

export interface WalletSigner {
  getAddress(): Promise<string>;
  signTx(unsignedTxHex: string): Promise<{ signedTxHex: string }>;
}

export interface WalletGateway {
  bindWallet(input: WalletBindRequest): Promise<{ walletId: string; trustNotice: string }>;
  requestSigner(userId: string): Promise<WalletSigner>;
}

export class StubWalletGateway implements WalletGateway {
  async bindWallet(input: WalletBindRequest): Promise<{ walletId: string; trustNotice: string }> {
    return {
      walletId: `wlt_${input.userId}_${input.network}`,
      trustNotice: "Wallet binding stub only. No automatic transfer authorization is granted.",
    };
  }

  async requestSigner(_userId: string): Promise<WalletSigner> {
    return {
      async getAddress() {
        return "stub-ergo-address";
      },
      async signTx(unsignedTxHex: string) {
        return {
          signedTxHex: `signed_stub_${unsignedTxHex}`,
        };
      },
    };
  }
}
