const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const host = process.env.HOST || "localhost";
const port = Number(process.env.PORT) || 8080;
const publicDirectory = __dirname;
const groqApiKey = process.env.GROQ_API_KEY;

const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".ico": "image/x-icon"
};

function send(response, statusCode, body, contentType) {
    response.writeHead(statusCode, {
        "Content-Type": contentType,
        "Cache-Control": "no-cache"
    });
    response.end(body);
}

function sendJson(response, statusCode, body) {
    send(
        response,
        statusCode,
        JSON.stringify(body),
        "application/json; charset=utf-8"
    );
}

function readRequestBody(request) {
    return new Promise((resolve, reject) => {
        let body = "";

        request.setEncoding("utf8");
        request.on("data", chunk => {
            body += chunk;

            if (body.length > 10000) {
                reject(new Error("Request body is too large"));
                request.destroy();
            }
        });
        request.on("end", () => resolve(body));
        request.on("error", reject);
    });
}

async function handleTransactionIntelligence(request, response) {
    if (request.method !== "POST") {
        sendJson(response, 405, { error: "Method Not Allowed" });
        return;
    }

    if (!groqApiKey) {
        sendJson(response, 503, {
            error: "Transaction Intelligence API is not configured"
        });
        return;
    }

    let transaction;

    try {
        transaction = JSON.parse(await readRequestBody(request));
    } catch {
        sendJson(response, 400, { error: "Invalid JSON request" });
        return;
    }

    const prompt = [
        "Review this transaction for fraud risk.",
        "Return concise plain text with: risk level, key concerns, and one recommendation.",
        `Merchant: ${String(transaction.merchant || "Unknown")}`,
        `Amount: ${Number(transaction.amount) || 0}`,
        `Location: ${String(transaction.location || "Not provided")}`,
        `Local risk score: ${Number(transaction.localRisk) || 0}/100`,
        `Local reasons: ${Array.isArray(transaction.reasons) ? transaction.reasons.join(", ") : "None"}`
    ].join("\n");

    try {
        const groqResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${groqApiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content: "You are Sentinel AI, a careful transaction security assistant. Do not claim certainty or accuse a user of fraud."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.2,
                    max_tokens: 180
                })
            }
        );

        const result = await groqResponse.json();

        if (!groqResponse.ok) {
            sendJson(response, 502, { error: "Transaction Intelligence request failed" });
            return;
        }

        sendJson(response, 200, {
            analysis: result.choices?.[0]?.message?.content || "No AI review was returned."
        });
    } catch {
        sendJson(response, 502, { error: "Transaction Intelligence service unavailable" });
    }
}

async function handleLinkSecurity(request, response) {
    if (request.method !== "POST") {
        sendJson(response, 405, { error: "Method Not Allowed" });
        return;
    }

    if (!groqApiKey) {
        sendJson(response, 503, {
            error: "Link Security Monitor API is not configured"
        });
        return;
    }

    let link;

    try {
        link = JSON.parse(await readRequestBody(request));
    } catch {
        sendJson(response, 400, { error: "Invalid JSON request" });
        return;
    }

    const prompt = [
        "Review this URL security scan.",
        "Return concise plain text with: risk level, key concerns, and one recommendation.",
        `URL: ${String(link.url || "Unknown")}`,
        `Local risk score: ${Number(link.localRisk) || 0}/100`,
        `Local findings: ${Array.isArray(link.reasons) ? link.reasons.join(", ") : "None"}`
    ].join("\n");

    try {
        const groqResponse = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${groqApiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content: "You are Sentinel AI, a cautious URL security assistant. Do not claim certainty. Never tell users to open a suspicious link."
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ],
                    temperature: 0.2,
                    max_tokens: 180
                })
            }
        );

        const result = await groqResponse.json();

        if (!groqResponse.ok) {
            sendJson(response, 502, { error: "Link Security Monitor request failed" });
            return;
        }

        sendJson(response, 200, {
            analysis: result.choices?.[0]?.message?.content || "No AI review was returned."
        });
    } catch {
        sendJson(response, 502, { error: "Link Security Monitor service unavailable" });
    }
}

function resolveRequestedFile(requestUrl) {
    const pathname = new URL(requestUrl, `http://${host}`).pathname;
    const requestedPath = decodeURIComponent(pathname === "/" ? "/login.html" : pathname);
    const filePath = path.resolve(publicDirectory, `.${requestedPath}`);
    const relativePath = path.relative(publicDirectory, filePath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
        return null;
    }

    return filePath;
}

const server = http.createServer((request, response) => {
    if (request.url === "/api/transaction-intelligence") {
        handleTransactionIntelligence(request, response);
        return;
    }

    if (request.url === "/api/link-security") {
        handleLinkSecurity(request, response);
        return;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
        send(response, 405, "Method Not Allowed", "text/plain; charset=utf-8");
        return;
    }

    if (request.url === "/health") {
        send(response, 200, JSON.stringify({ status: "ok" }), "application/json; charset=utf-8");
        return;
    }

    let filePath;

    try {
        filePath = resolveRequestedFile(request.url);
    } catch {
        send(response, 400, "Bad Request", "text/plain; charset=utf-8");
        return;
    }

    if (!filePath) {
        send(response, 403, "Forbidden", "text/plain; charset=utf-8");
        return;
    }

    fs.stat(filePath, (statError, stats) => {
        if (statError || !stats.isFile()) {
            send(response, 404, "Not Found", "text/plain; charset=utf-8");
            return;
        }

        const contentType = contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";

        if (request.method === "HEAD") {
            response.writeHead(200, {
                "Content-Type": contentType,
                "Content-Length": stats.size,
                "Cache-Control": "no-cache"
            });
            response.end();
            return;
        }

        fs.createReadStream(filePath)
            .on("error", () => send(response, 500, "Internal Server Error", "text/plain; charset=utf-8"))
            .once("open", () => {
                response.writeHead(200, {
                    "Content-Type": contentType,
                    "Cache-Control": "no-cache"
                });
            })
            .pipe(response);
    });
});

server.listen(port, host, () => {
    console.log(`Sentinel AI is running at http://${host}:${port}`);
});

server.on("error", (error) => {
    if (error.code === "EADDRINUSE") {
        console.error(`Port ${port} is already in use. Set PORT to use another port.`);
    } else {
        console.error(error);
    }
    process.exitCode = 1;
});
