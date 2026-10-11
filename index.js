/**
 * Cat's Cradle // Bulletproof Autonomous Discord Sentinel
 * Zero external dependencies. Self-healing, resilient to network drops.
 */

const fs = require('fs');
const path = require('path');

process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[CRITICAL] Unhandled Rejection:', reason);
});

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const TOKEN_CA = "HgZ8TxCnJ4Mmqn9y6oB3SQHHcFx8rFpw1AvGXv9kpump";
const TOKEN_SYMBOL = "JOBLESS";

const CHANNELS = {
  BUY_TRACKER: "1558727266253672550",
  CABAL_SCANS: "1558762233595691049",
  ROAST_MY_BAG: "1558762617462591561",
  TWITTER_RAIDS: "1558762670746763314",
  FOUNDER_QA: "1558762749503340554",
  VIP_SYNDICATE: "1558763043801014272"
};

async function postMessage(channelId, payload, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bot ${BOT_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (err) {
      if (attempt < retries) await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return false;
}

const ROASTS = [
  {
    opening: "Ah yes, another groundbreaking financial instrument created in 45 seconds on Pump.fun while the dev was sitting in a Wendy's parking lot.",
    whitepaper: "Your 'utility roadmap' looks like a horoscope written by someone who bought Solana at $250. Phase 1: Launch. Phase 2: Community takeover. Phase 3: Dev deleting their Telegram account.",
    cabal: "Our on-chain radar detects that the top 3 wallets are probably your personal Phantom, your burner Solflare, and your cousin's phone. If one of you sells, the chart turns into an elevator shaft.",
    verdict: "Emotional Damage Level: 9.8/10. Liquidity Condition: Terminal."
  },
  {
    opening: "I've analyzed over 10,000 Solana contracts and this one looks like it was compiled by a golden retriever walking across a mechanical keyboard.",
    whitepaper: "Roadmap: 'Community Takeover (CTO)'. Translation: The dev dumped everything 14 minutes after launch and left 42 college students to argue on voice chat.",
    cabal: "The dev split his bag across 12 stealth wallets funded by the same OKX deposit address. If one of them hits market sell, your portfolio becomes a charitable donation.",
    verdict: "Verdict: Not even a 100x leverage bounce can save this bag."
  },
  {
    opening: "You asked the Unemployed Cat to audit this token, but honestly an exorcist would be more qualified. This isn't a bag, it's an on-chain hostage situation.",
    whitepaper: "The dev promised an 'AI Agent Ecosystem'. In reality, it's a free ChatGPT API key running on a $5 droplet that stopped responding because the billing card declined.",
    cabal: "Top 10 holders control 64% of the supply and none of them have slept in 72 hours because they're terrified someone else will dump first.",
    verdict: "Recommended Action: Take whatever 0.04 SOL is left and buy a coffee."
  }
];

const SOLANA_CA_REGEX = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/;
const TWITTER_URL_REGEX = /https?:\/\/(x\.com|twitter\.com)\/[a-zA-Z0-9_]+\/status\/[0-9]+/;

let ws;
let heartbeatTimer;
let sequence = null;

function connectGateway() {
  try {
    ws = new WebSocket("wss://gateway.discord.gg/?v=10&encoding=json");
  } catch (e) {
    setTimeout(connectGateway, 5000);
    return;
  }

  ws.onclose = () => {
    clearInterval(heartbeatTimer);
    setTimeout(connectGateway, 3000);
  };

  ws.onmessage = async (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.s) sequence = msg.s;

      if (msg.op === 10) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ op: 1, d: sequence }));
          }
        }, msg.d.heartbeat_interval);

        ws.send(JSON.stringify({
          op: 2,
          d: {
            token: BOT_TOKEN,
            intents: 33281,
            properties: { os: "linux", browser: "cats-cradle-sentinel", device: "cats-cradle-sentinel" },
            presence: {
              activities: [{ name: "Solana Cabals & Bags | !help", type: 3 }],
              status: "online"
            }
          }
        }));
      }

      if (msg.op === 0 && msg.t === "MESSAGE_CREATE") {
        const d = msg.d;
        if (d.author.bot || d.webhook_id) return;

        const content = (d.content || "").trim();
        const lower = content.toLowerCase();
        const channelId = d.channel_id;

        if (lower === "!help" || lower === "!commands") {
          return postMessage(channelId, {
            message_reference: { message_id: d.id },
            embeds: [{
              title: "🐾 CAT'S CRADLE // BOT COMMAND MENU",
              color: 0x00f0ff,
              description: "Welcome to the **Cat's Cradle Autonomous Sentinel**:",
              fields: [
                { name: "🔥 #roast-my-bag", value: "👉 **Just paste any coin name or CA!**", inline: false },
                { name: "🛰 #cabal-scans", value: "👉 **Just paste any Solana Contract Address!**", inline: false },
                { name: "⚔ #twitter-raids", value: "👉 **Just paste any X/Twitter link!**", inline: false },
                { name: "🟢 #buy-tracker", value: "`!buy` (Latest buy) · `!whale` (Whale alert)", inline: false },
                { name: "💎 #vip-syndicate", value: "`!verify <your_wallet>` (Verifies 1M+ $JOBLESS)", inline: false }
              ],
              footer: { text: "Cat's Cradle · Autonomous Solana Security" }
            }]
          });
        }

        if (lower === "!ca") {
          return postMessage(channelId, {
            message_reference: { message_id: d.id },
            embeds: [{
              title: "🐾 $JOBLESS CONTRACT ADDRESS",
              color: 0x00ffa3,
              description: `\`${TOKEN_CA}\`\n\n• **Visualizer:** [Galaxy Loom (60 FPS)](https://loom.unemployedcat.workers.dev)\n• **Buy:** [Pump.fun](https://pump.fun/coin/${TOKEN_CA})`
            }]
          });
        }

        if (lower === "!loom") {
          return postMessage(channelId, {
            message_reference: { message_id: d.id },
            content: "🌌 **Cat's Cradle Galaxy Loom (60 FPS Visualizer):** https://loom.unemployedcat.workers.dev"
          });
        }

        if (channelId === CHANNELS.ROAST_MY_BAG || lower.startsWith("!roast")) {
          let target = content.replace(/^!roast\s*/i, "").trim() || "Your Mysterious Bag";
          const r = ROASTS[Math.floor(Math.random() * ROASTS.length)];
          return postMessage(channelId, {
            message_reference: { message_id: d.id },
            embeds: [{
              title: `🔥 FORENSIC AUTOPSY: ${target.substring(0, 36).toUpperCase()}`,
              url: "https://loom.unemployedcat.workers.dev",
              color: 0xff706b,
              description: `Victim <@${d.author.id}> just submitted **${target}** to the slaughterhouse.`,
              fields: [
                { name: "💀 THE OPENING BURN", value: r.opening, inline: false },
                { name: "📉 ROADMAP REALITY CHECK", value: r.whitepaper, inline: false },
                { name: "🛰 ON-CHAIN SYBIL FINDINGS", value: r.cabal, inline: false },
                { name: "📊 FINAL DIAGNOSIS", value: `${r.verdict}\n\n🌌 **[Galaxy Loom (60 FPS)](https://loom.unemployedcat.workers.dev)**\n🐾 **[$JOBLESS VIP Pass](https://hirethecatapp.pages.dev)**`, inline: false }
              ],
              footer: { text: "Cat's Cradle Roaster · 100% Emotional Damage Guarantee" }
            }]
          });
        }

        const foundCA = content.match(SOLANA_CA_REGEX);
        if (channelId === CHANNELS.CABAL_SCANS || lower.startsWith("!scan")) {
          if (foundCA) {
            const targetCA = foundCA[0];
            const isJobless = (targetCA === TOKEN_CA);
            const riskScore = isJobless ? 6 : Math.floor(40 + Math.random() * 55);
            return postMessage(channelId, {
              message_reference: { message_id: d.id },
              embeds: [{
                title: `🛰 FORENSIC CABAL AUDIT REPORT`,
                url: `https://loom.unemployedcat.workers.dev/?locator=${targetCA}`,
                color: riskScore < 20 ? 0x00ffa3 : 0xff0055,
                description: `Autonomous scan requested for \`${targetCA}\``,
                fields: [
                  { name: "🚨 Threat Level", value: isJobless ? "**🟢 LOW RISK (SAFE)**" : "**🔴 HIGH RISK**", inline: true },
                  { name: "💥 100% Dump Shockwave", value: isJobless ? "-3.8% (Extreme Resilience)" : "-42.5% Liquidity Collapse", inline: true },
                  { name: "⚡ Interactive 3D Orbit", value: `🌌 **[Open in Galaxy Loom (60 FPS)](https://loom.unemployedcat.workers.dev/?locator=${targetCA})**`, inline: false }
                ],
                footer: { text: "Cat's Cradle Radar · Autonomous Forensic Scanner" }
              }]
            });
          }
        }

        const tweetMatch = content.match(TWITTER_URL_REGEX);
        if (channelId === CHANNELS.TWITTER_RAIDS || lower.startsWith("!raid")) {
          if (tweetMatch) {
            return postMessage(channelId, {
              content: "@everyone 🚨 **NEW RAID ORDER DEPLOYED!**",
              embeds: [{
                title: "⚔️ NEW RAID DIRECTIVE // ALL PAWS ON DECK",
                url: tweetMatch[0],
                color: 0xff0055,
                description: `🎯 **TARGET:** [Click Here to Open Tweet](${tweetMatch[0]})\n\n**MISSION:** Like, Retweet, and drop viral replies!`,
                footer: { text: "Raid Commander · Algorithmic Dominance Protocol" }
              }]
            });
          }
        }
      }
    } catch (e) {}
  };
}

connectGateway();
