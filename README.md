# snackmoney-paywall-bot

A TypeScript bot that interacts with a paywalled site using [snack.money](https://snack.money) payment endpoints.  
It reads payment requirements from `robots.txt`, sends payment if required, and fetches protected content.

## Features

- Reads custom payment directives from `robots.txt`
- Automatically sends payment using a wallet private key
- Fetches and prints protected content after payment

## Requirements

- Node.js (18+ recommended)
- Yarn
- A valid Ethereum private key (hex string, 0x-prefixed) in `.env`

## Setup

1. **Clone the repo:**
   ```sh
   git clone https://github.com/snack-money/ai-agent-paywall
   cd ai-agent-paywall
   ```

2. **Install dependencies:**
   ```sh
   yarn install
   ```

3. **Configure your private key:**
   Create a `.env` file in the project root:
   ```
   PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
   ```

## Usage

Start the bot and specify the target URL:

```sh
yarn start:bot
```

## How it works

1. Fetches `robots.txt` from the target site.
2. Checks for payment requirements.
3. If payment is required, sends payment to the endpoint specified in `robots.txt`.
4. Fetches and prints the protected content.

## Example robots.txt

```
User-agent: *
Disallow:

# Custom directive for AI agents
Payment-Required: true
Payment-Endpoint: https://api.snack.money/payments/pay
Payment-Amount: 0.01
```

## License

MIT (add a license if needed)