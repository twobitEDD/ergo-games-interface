Implement the ability for users to start without wallet funds and later become wallet-aware users.

Existing endpoints:
- POST /api/auth/sync
- GET /api/me
- POST /api/wallet/bind

Expand account model:
{
  userId: string;
  externalAuthId?: string;
  displayName: string;
  accountType: "GUEST" | "REGISTERED" | "WALLET_BOUND";
  createdAt: string;
  updatedAt: string;
}

WalletBinding:
{
  walletBindingId: string;
  userId: string;
  network: "testnet" | "mainnet";
  address: string;
  verified: boolean;
  createdAt: string;
}

Add APIs:
- POST /api/account/guest
- POST /api/account/register
- POST /api/account/convert-to-wallet
- GET /api/account/[userId]/history

Conversion behavior:
- no-funds user can play FREE_PLAY
- no-funds user can participate in eligible SPONSORED_PLAY
- user can later bind wallet
- wallet binding preserves profile, match history, replays, rankings, achievements, progression, and reward lifecycle entries
- wallet binding does not retroactively convert non-cash progression into cash value
- wallet-aware actions still require explicit signing