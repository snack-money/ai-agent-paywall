import minimist from "minimist";
import axios from "axios";
import { config } from "dotenv";
import { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { withPaymentInterceptor, decodeXPaymentResponse } from "x402-axios";

config();

const privateKeyRaw = process.env.PRIVATE_KEY;
const privateKey = (privateKeyRaw?.trim() ?? "") as Hex;
console.log(`[DEBUG] Loaded PRIVATE_KEY: '${privateKey}'`);
console.log("privateKey type:", typeof privateKey);
if (
    !privateKey ||
    typeof privateKey !== "string" ||
    !privateKey.startsWith("0x") ||
    privateKey.length !== 66 ||
    !/^(0x)[0-9a-fA-F]{64}$/.test(privateKey)
) {
    console.error("PRIVATE_KEY in .env is missing, not hex, or wrong length");
    process.exit(1);
}



const args = minimist(process.argv.slice(2));
const baseURL = args.url || "https://paywall.fly.dev";

const BOT_NAME = "ai-agent-with-wallet-v1";
const HEADERS = {
    "User-Agent": BOT_NAME,
    "X-Agent-Type": "ai",
};

async function fetchRobotsTxt(baseURL: string) {
    console.log(`[+] Fetching ${baseURL}/robots.txt...`);
    const res = await axios.get(`${baseURL}/robots.txt`, { headers: HEADERS });
    const lines = res.data.split("\n");
    const config: Record<string, string> = {};
    for (const line of lines) {
        if (line.includes(":")) {
            const idx = line.indexOf(":");
            const key = line.slice(0, idx).trim();
            const value = line.slice(idx + 1).trim();
            config[key] = value;
        }
    }
    return config;
}

async function main() {
    try {
        const config = await fetchRobotsTxt(baseURL);

        if (config["Payment-Required"] !== "true") {
            console.log("[✓] No payment required. Accessing content...");
            const res = await axios.get(`${baseURL}/index.html`, { headers: HEADERS });
            console.log(res.data);
            return;
        }

        const endpointPath = config["Payment-Endpoint"];
        console.log(`[+] Payment endpoint from robots.txt: ${endpointPath}`);
        const amountRaw = config["Payment-Amount"];

        if (!endpointPath) {
            throw new Error("Payment-Endpoint missing in robots.txt");
        }
        if (!amountRaw) {
            throw new Error("Payment-Amount missing in robots.txt");
        }

        const amount = parseFloat(amountRaw);
        if (isNaN(amount)) {
            throw new Error("Payment-Amount in robots.txt is not a valid number");
        }

        const username = config["Payment-Username"];
        const identity = config["Payment-Identity"];
        const paymentData = {
            amount,
            currency: "USDC",
            type: "social-network",
            sender_username: BOT_NAME,
            receiver_username: username,
            receiver_identity: identity,
        };

        console.log("Passing privateKey to privateKeyToAccount:", privateKey);
        const account = privateKeyToAccount(privateKey);

        // Use axios for baseURL (localhost) for robots.txt and content
        const apiBase = axios.create({ baseURL });

        // Use axios for payment endpoint (full URL from robots.txt)
        const apiPayment = withPaymentInterceptor(
            axios.create(), // no baseURL, use full endpointPath
            account,
        );


        console.log("[!] Sending payment...");
        const res = await apiPayment.post(endpointPath, paymentData);
        const xToken = res.headers["x-token"];
        // const xToken = "eyJhbGciOiJIUzI1NiJ9.eyJzZW5kZXJfdXNlcm5hbWUiOiJhaS1hZ2VudC13aXRoLXdhbGxldC12MSIsInJlY2VpdmVyX3VzZXJuYW1lIjoic25hY2subW9uZXkiLCJhbW91bnQiOjAuMDIsImN1cnJlbmN5IjoiVVNEQyIsInRpbWVzdGFtcCI6MTc1NDY5MDA5NjE3MiwiZGF0YSI6IjB4OTJiMzI1NGZkOTk0NDc3N2QyZjUxN2ViNTg1NDhiZTMwZDBjMTRkODdlNDZjMjkxMjQ4MWJhMmQ2MWJhZDcyMiIsImlhdCI6MTc1NDY5MDA5NiwiZXhwIjoxNzU0Njk3Mjk2fQ.sroZ8GtxK9H8apvfl4INeW-Woyn0xmko77k8NRVWq7U"; //res.headers["x-token"];
        if (!xToken) {
            throw new Error("x-token missing in response headers");
        }
        console.log("[✓] x-token:", xToken);
        // const xTokenDecoded = decodeXPaymentResponse(xToken);
        // console.log("[✓] x-token decoded:", xTokenDecoded);

        const content = await apiBase.get("/index.html", {
            headers: {
                ...HEADERS,
                "X-TOKEN": xToken
            }
        });
        console.log("[✓] Content:\n", content.data);
    } catch (error) {
        console.error("Error:", (error as Error).message);
        process.exit(1);
    }
}

main();
