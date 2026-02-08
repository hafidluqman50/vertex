# Vertex Protocol (Front-End)

Vertex is a bonding-curve protocol on Arbitrum that provides always-available on-chain liquidity with a mathematically enforced rising floor price. This repo contains the Next.js front-end that interacts with the Vertex smart contract.

## Features
- Deterministic pricing via a bonding curve
- Always-on buy/sell quotes from the contract
- Rising floor reserve funded by protocol tax
- Simple UI for ETH/VTX conversion

## Smart Contract Location
- Contract source: `smart-contract/src/Vertex.sol`
- ABI + address used by FE: `front-end/src/constants/vertex.ts`

## Environment Variables
Create `front-end/.env.local`:

```env
NEXT_PUBLIC_VERTEX_ADDRESS=0xYourContractAddress
NEXT_PUBLIC_RPC_URL=https://arb-sepolia.g.alchemy.com/v2/yourKey
```

If these are missing, the app will log warnings and fall back to the default address or public RPC.

## Local Development

```bash
cd front-end
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

## Bonding Curve Math

### Definitions
- `SLOPE` is a constant that controls curve steepness
- `s` = current total supply (VTX, 18 decimals)
- `x` = token amount to buy/sell (VTX, 18 decimals)
- `P(s)` = spot (marginal) price at supply `s`

### Spot Price
Current marginal price for the next infinitesimal token:

```
P(s) = (SLOPE * s) / 10^18
```

### Buy Price (ETH cost)
ETH cost to buy `x` tokens from supply `s`:

```
buyPrice(s, x) = (SLOPE * ((s + x)^2 - s^2)) / (2 * 10^36)
```

### Sell Price (ETH return)
ETH return for selling `x` tokens from supply `s`:

```
sellPrice(s, x) = (SLOPE * (s^2 - (s - x)^2)) / (2 * 10^36)
```

### Protocol Tax
A 5% tax is applied on trades in the contract:

```
tax = (price * 5) / 100
```

For buys, tax goes to the floor reserve. For sells, tax is deducted from the return.

## Front-End Quoting Logic
The contract accepts token amount as input. The UI allows ETH input for buys, so the UI computes an **estimated token amount** by inverting the curve:

```
Given ETH amount e and supply s,
solve for x:

x = sqrt(s^2 + (2 * 10^36 * e) / SLOPE) - s
```

The UI then calls `getBuyPrice(x)` for an exact on-chain quote.

## File Map
- Hooks: `front-end/src/hooks/use-vertex.ts`
- Math utilities: `front-end/src/lib/vertex-math.ts`
- UI: `front-end/src/app/page.tsx`

## Notes
- All math is done in 18-decimal fixed-point (wei).
- Final quotes always come from the smart contract.

## License
MIT
