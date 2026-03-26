//run these commands in terminal before running this script:
// npm install @heroiclabs/nakama-js node-fetch
//npm install ws
// Then run this script with: node loadtest.js

const { Client } = require('@heroiclabs/nakama-js');
const fetch = require('node-fetch');
const WebSocket = require('ws');
globalThis.WebSocket = WebSocket;
const client = new Client('defaultkey', '127.0.0.1', '7350', false);

const TOTAL_BOTS = 10000;

async function spawnBot(botId) {
    try {
        const session = await client.authenticateDevice(`bot_device_${botId}`, true, `Bot_${botId}`);
        const socket = client.createSocket();
        await socket.connect(session, true);

        console.log(`🤖 Bot ${botId} connected and looking for a match...`);

        socket.onmatchmakermatched = async (matched) => {
            console.log(`⚔️ Bot ${botId} joined match: ${matched.match_id.substring(0, 8)}...`);
            const match = await socket.joinMatch(matched.match_id, matched.token);

            // Send a random move every 2 seconds
            const moveInterval = setInterval(() => {
                const randomPosition = Math.floor(Math.random() * 9);
                console.log(` ➔ Bot ${botId} attempting to play cell [${randomPosition}]`);

                // 8 is the protobuf tag for the 'position' field
                socket.sendMatchState(match.match_id, 1, new Uint8Array([8, randomPosition]));
            }, 2000);

            // If the socket disconnects (or server kicks us), stop the spam loop
            socket.ondisconnect = () => {
                console.log(`🛑 Bot ${botId} disconnected.`);
                clearInterval(moveInterval);
            };
        };

        await socket.addMatchmaker("+properties.mode:timed", 2, 2, { mode: "timed" });

    } catch (err) {
        console.error(`Bot ${botId} failed:`, err.message);
    }
}

async function runLoadTest() {
    console.log(`🚀 Spawning ${TOTAL_BOTS} bots...`);
    for (let i = 0; i < TOTAL_BOTS; i++) {
        spawnBot(i);
        await new Promise(res => setTimeout(res, 50));
    }
}

runLoadTest();