import minimist from "minimist";
import axios from "axios";

const args = minimist(process.argv.slice(2));
const baseURL = args.url || "https://paywall.fly.dev";

const BOT_NAME = "ai-bot";
const HEADERS = {
    "User-Agent": BOT_NAME,
    "X-Agent-Type": "bot",
};


async function main() {
    try {

        const apiBase = axios.create({ baseURL });

        const content = await apiBase.get("/index.html", {
            headers: {
                ...HEADERS,
            }
        });
        console.log("[✓] Content:\n", content.data);
    } catch (error) {
        console.error("Error:", (error as Error).message);
        process.exit(1);
    }
}

main();
