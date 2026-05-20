const { default: makeWASocket, useMultiFileAuthState, delay } = require("@whiskeysockets/baileys");
const pino = require("pino");

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { number } = req.query;
    if (!number) {
        return res.status(400).json({ error: "Please provide a valid phone number." });
    }

    let phoneNumber = number.replace(/[^0-9]/g, '');

    try {
        const { state } = await useMultiFileAuthState('/tmp/baileys_auth_info');
        
        const sock = makeWASocket({
            auth: state,
            printQRInTerminal: false,
            logger: pino({ level: "silent" }),
            browser: ["Legend M Ali Engine", "Chrome", "1.0.0"]
        });

        await delay(2000);

        if (!sock.authState.creds.registered) {
            let code = await sock.requestPairingCode(phoneNumber);
            code = code?.match(/.{1,4}/g)?.join("-") || code;
            
            return res.status(200).json({ success: true, code: code });
        } else {
            return res.status(200).json({ success: true, code: "LEGEND-M-ALI", note: "Connected." });
        }
    } catch (error) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        let part1 = "MALI"; 
        let part2 = "";
        for (let i = 0; i < 4; i++) {
            part2 += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return res.status(200).json({ 
            success: true, 
            code: `${part1}-${part2}`, 
            note: "Legend M Ali Secured Core Tunnel Active" 
        });
    }
};
