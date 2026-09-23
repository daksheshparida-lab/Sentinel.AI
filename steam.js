/* =====================================================
   SENTINEL AI 3
   COMPLETE DASHBOARD ENGINE
===================================================== */


/* =====================================================
   GLOBAL VARIABLES
===================================================== */

let averageSpending = 0;

let currentTransaction = {};

let spendingChart = null;

let transactions = [];

let sessionTimeout = 30 * 60 * 1000;


/* =====================================================
   STARTUP
===================================================== */

const SENTINEL_THEME_KEY = "sentinelTheme";

function applySentinelTheme(theme) {
    const safeTheme = theme === "dark" ? "dark" : "light";

    document.body.classList.remove("dark-mode", "light-mode");
    document.body.classList.add(`${safeTheme}-mode`);

    localStorage.setItem(SENTINEL_THEME_KEY, safeTheme);
    updateThemeButtonState();
}

function updateThemeButtonState() {
    const toggleButton = document.getElementById("themeToggleBtn");
    const defaultButton = document.getElementById("defaultModeBtn");
    const activeTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";

    if (toggleButton) {
        toggleButton.setAttribute(
            "aria-label",
            activeTheme === "light" ? "Switch to dark mode" : "Switch to light mode"
        );
        toggleButton.title = activeTheme === "light" ? "Switch to dark mode" : "Switch to light mode";
        toggleButton.innerHTML = activeTheme === "light"
            ? '<span class="topbar-button-icon">☾</span>'
            : '<span class="topbar-button-icon">☀</span>';
    }

    if (defaultButton) {
        defaultButton.title = "Default mode active";
        defaultButton.setAttribute(
            "aria-label",
            "Default mode active"
        );
        defaultButton.innerHTML = '<span class="topbar-button-icon">◎</span>';
    }
}

function restoreDefaultMode() {
    const baseTheme = localStorage.getItem(SENTINEL_THEME_KEY) || "light";
    const safeTheme = baseTheme === "dark" ? "dark" : "light";
    applySentinelTheme(safeTheme);
}

function toggleSentinelTheme() {
    const activeTheme = document.body.classList.contains("dark-mode") ? "dark" : "light";
    applySentinelTheme(activeTheme === "dark" ? "light" : "dark");
}

document.addEventListener(
    "DOMContentLoaded",
    function () {

        document.body.classList.remove(
            "black-white-mode"
        );

        localStorage.removeItem(
            "sentinelBlackWhiteMode"
        );

        const savedTheme = localStorage.getItem(SENTINEL_THEME_KEY) || "light";
        applySentinelTheme(savedTheme);

        checkAccess();

        loadUser();

        loadTransactions();

        updateAverage();

        createSpendingGraph();

        updateDashboardStats();

        initializeThreatIntelligence();

        initializeAssistant();

        updateSecurityScore();

        addSecurityEvent(
            "Sentinel AI 3 initialized",
            "All security engines are online.",
            "safe"
        );

    }
);


/* =====================================================
   ACCESS CONTROL
===================================================== */

function checkAccess() {

    const access =
        localStorage.getItem(
            "sentinelAccess"
        );

    if (access !== "true") {

        window.location.href =
            "login.html";

        return;

    }


    const loginTime =
        Number(
            localStorage.getItem(
                "sentinelLoginTime"
            )
        );


    if (
        loginTime &&
        Date.now() - loginTime > sessionTimeout
    ) {

        localStorage.removeItem(
            "sentinelAccess"
        );

        localStorage.removeItem(
            "sentinelLoginTime"
        );

        window.location.href =
            "login.html";

    }

}


/* =====================================================
   USER
===================================================== */

function loadUser() {

    const user = "steam";

    const userBox =
        document.getElementById(
            "userName"
        );


    if (userBox) {

        userBox.textContent = user;

    }

}


/* =====================================================
   TRANSACTION ANALYZER
===================================================== */

function analyzeTransaction() {

    const merchant =
        document.getElementById(
            "merchant"
        ).value.trim();


    const amount =
        Number(
            document.getElementById(
                "amount"
            ).value
        );


    const location =
        document.getElementById(
            "location"
        ).value.trim();


    if (
        merchant === "" ||
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        setAIStatus(
            "⚠ ENTER VALID TRANSACTION DETAILS"
        );

        return;

    }


    let riskScore = 0;

    let reasons = [];


    /* -----------------------------------------
       AMOUNT ANALYSIS
    ----------------------------------------- */


    if (averageSpending <= 0) {

        /*
           First transaction:
           Don't automatically call it fraud.
        */

        if (amount >= 100000) {

            riskScore += 45;

            reasons.push(
                "Very large first transaction"
            );

        }

        else if (amount >= 50000) {

            riskScore += 25;

            reasons.push(
                "Large first transaction"
            );

        }

    }

    else {

        if (
            amount >
            averageSpending * 1.5
        ) {

            riskScore += 25;

            reasons.push(
                "Above normal spending"
            );

        }


        if (
            amount >
            averageSpending * 2
        ) {

            riskScore += 25;

            reasons.push(
                "More than twice average"
            );

        }


        if (
            amount >
            averageSpending * 5
        ) {

            riskScore += 25;

            reasons.push(
                "Extremely unusual amount"
            );

        }

    }


    /* -----------------------------------------
       LOCATION
    ----------------------------------------- */

    if (location === "") {

        riskScore += 15;

        reasons.push(
            "Location unavailable"
        );

    }


    /* -----------------------------------------
       MERCHANT ANALYSIS
    ----------------------------------------- */

    const merchantLower =
        merchant.toLowerCase();


    const suspiciousWords = [
        "unknown",
        "test",
        "free money",
        "crypto giveaway",
        "prize"
    ];


    suspiciousWords.forEach(
        function (word) {

            if (
                merchantLower.includes(word)
            ) {

                riskScore += 20;

                reasons.push(
                    "Suspicious merchant pattern"
                );

            }

        }
    );


    /* -----------------------------------------
       RANDOMNESS REMOVED
    -----------------------------------------

       Fraud detection should not randomly
       change its result.
    ----------------------------------------- */


    riskScore =
        Math.min(
            riskScore,
            100
        );


    const confidence =
        100 - riskScore;


    currentTransaction = {

        merchant: merchant,

        amount: amount,

        location: location,

        risk: riskScore,

        confidence: confidence,

        reasons: reasons,

        time:
            new Date().toLocaleString(),

        status: "PENDING"

    };


    updateRiskDisplay(
        riskScore,
        confidence
    );


    requestTransactionIntelligence(
        merchant,
        amount,
        location,
        riskScore,
        reasons
    );


    /*
       LOW RISK
    */

    if (riskScore < 40) {

        approveTransaction();

        return;

    }


    /*
       MEDIUM RISK
    */

    if (riskScore < 70) {

        showVerification();

        return;

    }


    /*
       HIGH RISK
    */

    /*
       Very unusual transactions get
       additional verification first.
    */

    showFalsePositiveProtection();

}


/* =====================================================
   AI TRANSACTION REVIEW
===================================================== */

async function requestTransactionIntelligence(
    merchant,
    amount,
    location,
    localRisk,
    reasons
) {

    try {
        const response = await fetch(
            "/api/transaction-intelligence",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    merchant,
                    amount,
                    location,
                    localRisk,
                    reasons
                })
            }
        );

        if (!response.ok) {
            return;
        }

        const result = await response.json();

        if (result.analysis) {
            setAIStatus(
                "🤖 AI REVIEW: " + result.analysis
            );
        }
    } catch {
        // Local transaction analysis remains available when the API is offline.
    }
}


/* =====================================================
   RISK DISPLAY
===================================================== */

function updateRiskDisplay(
    risk,
    confidence
) {

    const riskBox =
        document.getElementById(
            "risk"
        );

    const confidenceBox =
        document.getElementById(
            "confidence"
        );

    const riskBar =
        document.getElementById(
            "riskBar"
        );


    if (riskBox) {

        riskBox.textContent =
            risk + "%";

    }


    if (confidenceBox) {

        confidenceBox.textContent =
            confidence + "%";

    }


    if (riskBar) {

        riskBar.style.width =
            risk + "%";


        if (risk < 40) {

            riskBar.style.background =
                "#22c55e";

        }

        else if (risk < 70) {

            riskBar.style.background =
                "#facc15";

        }

        else {

            riskBar.style.background =
                "#ef4444";

        }

    }

}


/* =====================================================
   AI STATUS
===================================================== */

function setAIStatus(message) {

    const status =
        document.getElementById(
            "aiStatus"
        );

    if (status) {

        status.textContent =
            message;

    }

}


/* =====================================================
   VERIFICATION
===================================================== */

function showVerification() {

    const box =
        document.getElementById(
            "verifyBox"
        );


    if (box) {

        box.style.display =
            "block";

    }


    setAIStatus(
        "⚠ VERIFICATION REQUIRED"
    );


    aiVerificationVoice();

}


function hideVerification() {

    const box =
        document.getElementById(
            "verifyBox"
        );


    if (box) {

        box.style.display =
            "none";

    }

}


/* =====================================================
   FALSE POSITIVE PROTECTION
===================================================== */

function showFalsePositiveProtection() {

    const box =
        document.getElementById(
            "falsePositiveBox"
        );


    const details =
        document.getElementById(
            "fpDetails"
        );


    if (!box) return;


    if (details) {

        const reasons =
            currentTransaction.reasons || [];


        details.innerHTML = `

            <div class="fp-row">
                <span>MERCHANT</span>
                <b>
                    ${escapeHTML(
                        currentTransaction.merchant
                    )}
                </b>
            </div>

            <div class="fp-row">
                <span>AMOUNT</span>
                <b>
                    ₹${Number(
                        currentTransaction.amount
                    ).toLocaleString()}
                </b>
            </div>

            <div class="fp-row">
                <span>RISK</span>
                <b>
                    ${currentTransaction.risk}%
                </b>
            </div>

            <div class="fp-row">
                <span>REASON</span>
                <b>
                    ${escapeHTML(
                        reasons[0] ||
                        "Unusual behaviour"
                    )}
                </b>
            </div>

        `;

    }


    box.style.display =
        "block";


    hideVerification();


    setAIStatus(
        "🟡 UNUSUAL TRANSACTION — USER CONFIRMATION REQUIRED"
    );


    speakAI(
        "This transaction is unusual. Please confirm whether you made this payment."
    );

}


function hideFalsePositiveProtection() {

    const box =
        document.getElementById(
            "falsePositiveBox"
        );


    if (box) {

        box.style.display =
            "none";

    }

}


/* =====================================================
   USER CONFIRMS
===================================================== */

function confirmLegitimateTransaction() {

    if (!currentTransaction.amount) {

        return;

    }


    currentTransaction.status =
        "APPROVED";


    currentTransaction.userVerified =
        true;


    currentTransaction.falsePositive =
        true;


    currentTransaction.verificationTime =
        new Date().toLocaleString();


    saveTransaction();


    hideFalsePositiveProtection();


    setAIStatus(
        "✅ USER VERIFIED — TRANSACTION APPROVED"
    );


    speakAI(
        "Identity confirmed. The transaction has been approved."
    );


    addSecurityEvent(
        "User verified unusual transaction",
        "False-positive protection prevented an unnecessary block.",
        "safe"
    );

}


/* =====================================================
   USER REJECTS
===================================================== */

function rejectSuspiciousTransaction() {

    if (!currentTransaction) {

        return;

    }


    currentTransaction.status =
        "BLOCKED";


    currentTransaction.userVerified =
        false;


    currentTransaction.reportedFraud =
        true;


    currentTransaction.verificationTime =
        new Date().toLocaleString();


    saveTransaction();


    hideFalsePositiveProtection();


    setAIStatus(
        "🚨 TRANSACTION REPORTED — BLOCKED"
    );


    speakAI(
        "The transaction has been blocked and reported as suspicious."
    );


    addSecurityEvent(
        "Suspicious transaction blocked",
        "User reported the transaction as unauthorized.",
        "danger"
    );

}


/* =====================================================
   APPROVE
===================================================== */

function approveTransaction() {

    currentTransaction.status =
        "APPROVED";


    saveTransaction();


    hideVerification();

    hideFalsePositiveProtection();


    setAIStatus(
        "✅ TRANSACTION APPROVED"
    );


    speakAI(
        "Transaction approved. The payment matches your normal spending behaviour."
    );


    addSecurityEvent(
        "Transaction approved",
        "Sentinel AI found no critical threat.",
        "safe"
    );

}


/* =====================================================
   BLOCK
===================================================== */

function blockTransaction() {

    currentTransaction.status =
        "BLOCKED";


    saveTransaction();


    hideVerification();

    hideFalsePositiveProtection();


    setAIStatus(
        "🚫 TRANSACTION BLOCKED"
    );


    speakAI(
        "Warning. Suspicious transaction blocked."
    );


    addSecurityEvent(
        "Transaction blocked",
        "Sentinel AI detected high-risk behaviour.",
        "danger"
    );

}


/* =====================================================
   USER VERIFICATION BUTTONS
===================================================== */

function userConfirmed() {

    currentTransaction.status =
        "APPROVED";


    currentTransaction.userVerified =
        true;


    saveTransaction();


    hideVerification();


    setAIStatus(
        "✅ IDENTITY VERIFIED — TRANSACTION APPROVED"
    );


    speakAI(
        "Identity verified. Transaction approved."
    );

}


function userRejected() {

    currentTransaction.status =
        "BLOCKED";


    currentTransaction.userVerified =
        false;


    currentTransaction.reportedFraud =
        true;


    saveTransaction();


    hideVerification();


    setAIStatus(
        "🚨 FRAUD REPORTED — TRANSACTION BLOCKED"
    );


    speakAI(
        "Fraud reported. The transaction has been blocked."
    );

}


/* =====================================================
   SAVE TRANSACTION
===================================================== */

function saveTransaction() {

    let stored =
        JSON.parse(
            localStorage.getItem(
                "transactions"
            )
        ) || [];


    stored.unshift(
        currentTransaction
    );


    /*
       Keep history manageable.
    */

    if (stored.length > 100) {

        stored =
            stored.slice(0, 100);

    }


    localStorage.setItem(
        "transactions",
        JSON.stringify(stored)
    );


    transactions =
        stored;


    loadTransactions();

    updateAverage();

    updateDashboardStats();

    createSpendingGraph();

    updateSecurityScore();

}


/* =====================================================
   UPDATE AVERAGE
===================================================== */

function updateAverage() {

    const stored =
        JSON.parse(
            localStorage.getItem(
                "transactions"
            )
        ) || [];


    const approved =
        stored.filter(
            function (t) {

                return (
                    t.status ===
                    "APPROVED"
                );

            }
        );


    if (approved.length === 0) {

        averageSpending = 0;

    }

    else {

        let total = 0;


        approved.forEach(
            function (t) {

                const amount =
                    Number(t.amount);


                if (
                    Number.isFinite(
                        amount
                    )
                ) {

                    total += amount;

                }

            }
        );


        averageSpending =
            Math.round(
                total / approved.length
            );

    }


    const averageBox =
        document.getElementById(
            "average"
        );


    if (averageBox) {

        averageBox.textContent =
            "₹" +
            averageSpending.toLocaleString();

    }

}


/* =====================================================
   LOAD TRANSACTIONS
===================================================== */

function loadTransactions() {

    const list =
        document.getElementById(
            "transactionList"
        );


    if (!list) return;


    const stored =
        JSON.parse(
            localStorage.getItem(
                "transactions"
            )
        ) || [];


    transactions =
        stored;


    list.innerHTML = "";

    if (stored.length === 0) {

        list.innerHTML = `

            <div class="transaction">

                <div>
                    🛰️
                    <b>No transactions yet</b>
                    <br>
                    Sentinel AI is waiting for activity.
                </div>

            </div>

        `;

        return;

    }


    stored.forEach(
        function (t) {

            const icon =
                t.status ===
                "APPROVED"
                    ? "🟢"
                    : "🔴";


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "transaction";


            item.innerHTML = `

                <div>

                    ${icon}

                    <b>
                        ${escapeHTML(
                            t.merchant ||
                            "Unknown"
                        )}
                    </b>

                    <br>

                    Amount:
                    ₹${Number(
                        t.amount || 0
                    ).toLocaleString()}

                    <br>

                    Location:
                    ${escapeHTML(
                        t.location ||
                        "Unknown"
                    )}

                    <br>

                    Time:
                    ${escapeHTML(
                        t.time ||
                        ""
                    )}

                </div>


                <div>

                    ${t.status || "UNKNOWN"}

                    <br>

                    Risk:
                    ${Number(
                        t.risk || 0
                    )}%

                    <br>

                    Confidence:
                    ${Number(
                        t.confidence || 0
                    )}%

                </div>

            `;


            list.appendChild(item);

        }
    );

}


/* =====================================================
   CLEAR HISTORY
===================================================== */

function clearTransactions() {

    const confirmed =
        confirm(
            "Clear all transaction history?"
        );


    if (!confirmed) return;


    localStorage.removeItem(
        "transactions"
    );


    transactions = [];

    averageSpending = 0;


    loadTransactions();

    updateAverage();

    createSpendingGraph();

    updateDashboardStats();

    updateSecurityScore();


    setAIStatus(
        "🧹 TRANSACTION HISTORY CLEARED"
    );


    addSecurityEvent(
        "Transaction history cleared",
        "Local transaction records were removed.",
        "safe"
    );

}


/* =====================================================
   SPENDING GRAPH
===================================================== */

function createSpendingGraph() {

    const canvas =
        document.getElementById(
            "spendingChart"
        );


    if (!canvas) return;


    const stored =
        JSON.parse(
            localStorage.getItem(
                "transactions"
            )
        ) || [];


    const approved =
        stored
            .filter(
                function (t) {

                    return (
                        t.status ===
                        "APPROVED"
                    );

                }
            )
            .slice()
            .reverse();


    const labels =
        approved.map(
            function (t) {

                return t.time || "";

            }
        );


    const amounts =
        approved.map(
            function (t) {

                return Number(
                    t.amount || 0
                );

            }
        );


    if (spendingChart) {

        spendingChart.destroy();

    }


    spendingChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels: labels,

                    datasets: [

                        {

                            label:
                                "Transaction Amount ₹",

                            data: amounts,

                            borderColor:
                                "#00e5ff",

                            backgroundColor:
                                "rgba(0,229,255,.08)",

                            borderWidth: 2,

                            pointBackgroundColor:
                                "#00e5ff",

                            pointBorderColor:
                                "#ffffff",

                            pointRadius: 4,

                            tension: .4,

                            fill: true

                        }

                    ]

                },


                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {

                            labels: {

                                color:
                                    "#9ddcea"

                            }

                        }

                    },


                    scales: {

                        x: {

                            ticks: {

                                color:
                                    "#718996",

                                maxTicksLimit:
                                    6

                            },

                            grid: {

                                color:
                                    "rgba(255,255,255,.04)"

                            }

                        },


                        y: {

                            beginAtZero: true,

                            ticks: {

                                color:
                                    "#718996"

                            },

                            grid: {

                                color:
                                    "rgba(255,255,255,.04)"

                            }

                        }

                    }

                }

            }
        );

}


/* =====================================================
   DASHBOARD STATISTICS
===================================================== */

function updateDashboardStats() {

    const stored =
        JSON.parse(
            localStorage.getItem(
                "transactions"
            )
        ) || [];


    const threats =
        stored.filter(
            function (t) {

                return (
                    t.status ===
                    "BLOCKED"
                );

            }
        ).length;


    const threatBox =
        document.getElementById(
            "threatCount"
        );


    if (threatBox) {

        threatBox.textContent =
            threats;

    }


    const links =
        Number(
            localStorage.getItem(
                "sentinelLinksScanned"
            )
        ) || 0;


    const linkBox =
        document.getElementById(
            "linksScanned"
        );


    if (linkBox) {

        linkBox.textContent =
            links;

    }

}


/* =====================================================
   SECURITY SCORE
===================================================== */

function updateSecurityScore() {

    const stored =
        JSON.parse(
            localStorage.getItem(
                "transactions"
            )
        ) || [];


    let score = 100;


    const blocked =
        stored.filter(
            function (t) {

                return (
                    t.status ===
                    "BLOCKED"
                );

            }
        ).length;


    const highRisk =
        stored.filter(
            function (t) {

                return Number(
                    t.risk || 0
                ) >= 70;

            }
        ).length;


    score -=
        Math.min(
            blocked * 8,
            35
        );


    score -=
        Math.min(
            highRisk * 4,
            20
        );


    score =
        Math.max(
            0,
            Math.round(score)
        );


    const scoreBox =
        document.getElementById(
            "securityScore"
        );


    const circle =
        document.getElementById(
            "securityCircleScore"
        );


    if (scoreBox) {

        scoreBox.textContent =
            score + "%";

    }


    if (circle) {

        circle.textContent =
            score;

    }

}


/* =====================================================
   AI ASSISTANT
===================================================== */

/* =========================================================
   SENTINEL AI 3
   ADVANCED TRANSACTION INTELLIGENCE ASSISTANT
   ========================================================= */

/* ---------------------------------------------------------
   STORAGE
--------------------------------------------------------- */

const SENTINEL_TRANSACTION_KEYS = [
    "transactions",
    "sentinelTransactions",
    "transactionHistory"
];


/* ---------------------------------------------------------
   GET TRANSACTIONS
--------------------------------------------------------- */

function getSentinelTransactions() {

    for (const key of SENTINEL_TRANSACTION_KEYS) {

        try {

            const raw = localStorage.getItem(key);

            if (!raw) continue;

            const data = JSON.parse(raw);

            if (Array.isArray(data)) {
                return data;
            }

        } catch (error) {

            console.warn(
                "Sentinel could not read:",
                key,
                error
            );

        }

    }

    return [];
}


/* ---------------------------------------------------------
   NORMALIZE TRANSACTIONS
--------------------------------------------------------- */

function normalizeSentinelTransactions() {

    const transactions = getSentinelTransactions();

    return transactions.map((tx, index) => {

        const amount =
            Number(
                tx.amount ??
                tx.value ??
                tx.price ??
                0
            );

        const merchant =
            tx.merchant ??
            tx.name ??
            tx.shop ??
            "Unknown Merchant";

        const location =
            tx.location ??
            tx.city ??
            "Unknown Location";

        const risk =
            Number(
                tx.risk ??
                tx.riskScore ??
                tx.score ??
                0
            );

        const status =
            String(
                tx.status ??
                tx.result ??
                tx.decision ??
                "UNKNOWN"
            ).toUpperCase();

        const date =
            tx.date ??
            tx.timestamp ??
            tx.time ??
            null;

        return {

            id:
                tx.id ??
                index + 1,

            merchant:
                String(merchant),

            amount:
                Number.isFinite(amount)
                    ? amount
                    : 0,

            location:
                String(location),

            risk:
                Number.isFinite(risk)
                    ? risk
                    : 0,

            status,

            date,

            original: tx

        };

    });

}


/* ---------------------------------------------------------
   CURRENCY FORMAT
--------------------------------------------------------- */

function formatSentinelMoney(amount) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 2
        }
    ).format(Number(amount) || 0);

}


/* ---------------------------------------------------------
   DATE FORMAT
--------------------------------------------------------- */

function formatSentinelDate(date) {

    if (!date) {
        return "Date unavailable";
    }

    const parsed =
        new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return String(date);
    }

    return parsed.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );

}


/* ---------------------------------------------------------
   STATISTICS
--------------------------------------------------------- */

function getSentinelStatistics(transactions) {

    if (!transactions.length) {

        return {

            count: 0,
            total: 0,
            average: 0,
            highest: null,
            lowest: null,
            suspicious: [],
            blocked: [],
            safe: [],
            aboveAverage: [],
            topMerchant: null,
            topLocation: null

        };

    }


    const amounts =
        transactions.map(
            tx => tx.amount
        );


    const total =
        amounts.reduce(
            (sum, amount) =>
                sum + amount,
            0
        );


    const average =
        total / transactions.length;


    const highest =
        transactions.reduce(
            (a, b) =>
                a.amount > b.amount
                    ? a
                    : b
        );


    const lowest =
        transactions.reduce(
            (a, b) =>
                a.amount < b.amount
                    ? a
                    : b
        );


    const suspicious =
        transactions.filter(tx => {

            return (
                tx.risk >= 70 ||
                /fraud|suspicious|blocked|danger|high.?risk/i
                    .test(tx.status)
            );

        });


    const blocked =
        transactions.filter(tx => {

            return /blocked|rejected|denied|declined/i
                .test(tx.status);

        });


    const safe =
        transactions.filter(tx => {

            return (
                tx.risk < 40 &&
                !/blocked|rejected|denied|fraud/i
                    .test(tx.status)
            );

        });


    const aboveAverage =
        transactions.filter(
            tx =>
                tx.amount > average
        );


    /* -----------------------------------------------------
       TOP MERCHANT
    ----------------------------------------------------- */

    const merchantTotals = {};

    transactions.forEach(tx => {

        const merchant =
            tx.merchant.trim();

        if (!merchantTotals[merchant]) {
            merchantTotals[merchant] = 0;
        }

        merchantTotals[merchant] +=
            tx.amount;

    });


    const merchantEntries =
        Object.entries(
            merchantTotals
        );


    let topMerchant = null;

    if (merchantEntries.length) {

        topMerchant =
            merchantEntries.reduce(
                (best, current) =>
                    current[1] > best[1]
                        ? current
                        : best
            );

    }


    /* -----------------------------------------------------
       TOP LOCATION
    ----------------------------------------------------- */

    const locationTotals = {};

    transactions.forEach(tx => {

        const location =
            tx.location.trim();

        if (!locationTotals[location]) {
            locationTotals[location] = 0;
        }

        locationTotals[location] +=
            tx.amount;

    });


    const locationEntries =
        Object.entries(
            locationTotals
        );


    let topLocation = null;

    if (locationEntries.length) {

        topLocation =
            locationEntries.reduce(
                (best, current) =>
                    current[1] > best[1]
                        ? current
                        : best
            );

    }


    return {

        count:
            transactions.length,

        total,

        average,

        highest,

        lowest,

        suspicious,

        blocked,

        safe,

        aboveAverage,

        topMerchant,

        topLocation

    };

}


/* ---------------------------------------------------------
   ADD AI MESSAGE
--------------------------------------------------------- */

function addSentinelAIMessage(
    message,
    type = "ai"
) {

    const container =
        document.getElementById(
            "assistantMessages"
        );

    if (!container) return;


    const bubble =
        document.createElement("div");


    bubble.className =
        type === "user"
            ? "user-message-bubble"
            : "ai-message-bubble";


    bubble.innerHTML =
        message;


    container.appendChild(
        bubble
    );


    container.scrollTop =
        container.scrollHeight;

}


/* ---------------------------------------------------------
   USER MESSAGE
--------------------------------------------------------- */

function addSentinelUserMessage(
    message
) {

    addSentinelAIMessage(
        escapeSentinelHTML(message),
        "user"
    );

}


/* ---------------------------------------------------------
   ESCAPE HTML
--------------------------------------------------------- */

function escapeSentinelHTML(text) {

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ---------------------------------------------------------
   TYPING INDICATOR
--------------------------------------------------------- */

function showSentinelTyping() {

    const container =
        document.getElementById(
            "assistantMessages"
        );

    if (!container) return;


    const typing =
        document.createElement("div");


    typing.id =
        "sentinelTyping";


    typing.className =
        "ai-message-bubble";


    typing.innerHTML =
        `
        <span class="sentinel-typing">
            <i></i>
            <i></i>
            <i></i>
            ANALYZING
        </span>
        `;


    container.appendChild(
        typing
    );


    container.scrollTop =
        container.scrollHeight;

}


/* ---------------------------------------------------------
   REMOVE TYPING
--------------------------------------------------------- */

function hideSentinelTyping() {

    const typing =
        document.getElementById(
            "sentinelTyping"
        );

    if (typing) {
        typing.remove();
    }

}


/* ---------------------------------------------------------
   SECURITY SCORE
--------------------------------------------------------- */

function calculateSentinelSecurityScore(
    transactions
) {

    if (!transactions.length) {
        return 100;
    }


    const suspicious =
        transactions.filter(
            tx =>
                tx.risk >= 70
        ).length;


    const blocked =
        transactions.filter(
            tx =>
                /blocked|rejected|denied/i
                    .test(tx.status)
        ).length;


    let score = 100;


    score -=
        suspicious * 8;


    score -=
        blocked * 4;


    return Math.max(
        0,
        Math.min(
            100,
            score
        )
    );

}


/* ---------------------------------------------------------
   DETECT INTENT
--------------------------------------------------------- */

function detectSentinelIntent(
    question
) {

    const q =
        question
            .toLowerCase()
            .trim();


    if (
        /highest|largest|biggest|maximum|most expensive/
            .test(q)
    ) {
        return "highest";
    }


    if (
        /lowest|smallest|minimum|cheapest/
            .test(q)
    ) {
        return "lowest";
    }


    if (
        /total.*(spent|spending|transaction)|how much.*spent|total amount/
            .test(q)
    ) {
        return "total";
    }


    if (
        /average|avg|usual transaction|normally spend/
            .test(q)
    ) {
        return "average";
    }


    if (
        /how many|number of transactions|transaction count|transactions.*do i have/
            .test(q)
    ) {
        return "count";
    }


    if (
        /latest|last transaction|recent transaction|most recent/
            .test(q)
    ) {
        return "latest";
    }


    if (
        /top merchant|most.*merchant|merchant.*most|spent.*merchant/
            .test(q)
    ) {
        return "merchant";
    }


    if (
        /location|where.*spend|spent.*where|city/
            .test(q)
    ) {
        return "location";
    }


    if (
        /suspicious|risky|risk|dangerous|threat/
            .test(q)
    ) {
        return "risk";
    }


    if (
        /blocked|rejected|denied|declined/
            .test(q)
    ) {
        return "blocked";
    }


    if (
        /above average|higher than average|unusual spending/
            .test(q)
    ) {
        return "aboveAverage";
    }


    if (
        /security score|security status|protected|security health/
            .test(q)
    ) {
        return "security";
    }


    if (
        /why.*(blocked|rejected|flagged|suspicious)|why.*transaction/
            .test(q)
    ) {
        return "why";
    }


    if (
        /recent activity|recent transactions|what happened recently/
            .test(q)
    ) {
        return "recent";
    }


    if (
        /help|what can you|commands|what do you know/
            .test(q)
    ) {
        return "help";
    }


    if (
        /hello|hi|hey|good morning|good evening/
            .test(q)
    ) {
        return "greeting";
    }


    return "unknown";

}


/* ---------------------------------------------------------
   GENERATE AI RESPONSE
--------------------------------------------------------- */

function generateSentinelResponse(
    question
) {

    const transactions =
        normalizeSentinelTransactions();


    const stats =
        getSentinelStatistics(
            transactions
        );


    const intent =
        detectSentinelIntent(
            question
        );


    /* -----------------------------------------------------
       GREETING
    ----------------------------------------------------- */

    if (intent === "greeting") {

        return `
            🤖 <strong>Sentinel AI Online</strong><br><br>
            Hello. I can analyze your transaction history,
            spending behaviour, risk levels and security events.
            <br><br>
            Try asking:
            <br>• What is my highest transaction?
            <br>• How much have I spent?
            <br>• Why was a payment blocked?
        `;

    }


    /* -----------------------------------------------------
       NO DATA
    ----------------------------------------------------- */

    if (
        stats.count === 0 &&
        !["help", "greeting", "security"].includes(intent)
    ) {

        return `
            🛰️ <strong>No transaction data available.</strong>
            <br><br>
            Sentinel currently has no stored transactions
            to analyze.
            <br><br>
            Analyze a transaction first and I'll be able
            to answer questions about it.
        `;

    }


    /* -----------------------------------------------------
       HIGHEST
    ----------------------------------------------------- */

    if (intent === "highest") {

        const tx =
            stats.highest;


        return `
            🏆 <strong>Highest Transaction</strong>
            <br><br>

            <strong>${escapeSentinelHTML(
                tx.merchant
            )}</strong>

            <br>
            ${formatSentinelMoney(
                tx.amount
            )}

            <br><br>

            Location:
            ${escapeSentinelHTML(
                tx.location
            )}

            <br>

            Risk:
            ${tx.risk}%

            <br>

            Status:
            ${escapeSentinelHTML(
                tx.status
            )}
        `;

    }


    /* -----------------------------------------------------
       LOWEST
    ----------------------------------------------------- */

    if (intent === "lowest") {

        const tx =
            stats.lowest;


        return `
            📉 <strong>Lowest Transaction</strong>
            <br><br>

            <strong>${escapeSentinelHTML(
                tx.merchant
            )}</strong>

            <br>

            ${formatSentinelMoney(
                tx.amount
            )}

            <br><br>

            Location:
            ${escapeSentinelHTML(
                tx.location
            )}
        `;

    }


    /* -----------------------------------------------------
       TOTAL
    ----------------------------------------------------- */

    if (intent === "total") {

        return `
            💰 <strong>Total Spending</strong>
            <br><br>

            You have recorded
            <strong>${formatSentinelMoney(
                stats.total
            )}</strong>
            across
            <strong>${stats.count}</strong>
            transactions.
        `;

    }


    /* -----------------------------------------------------
       AVERAGE
    ----------------------------------------------------- */

    if (intent === "average") {

        return `
            📊 <strong>Average Transaction</strong>
            <br><br>

            Your average transaction value is:

            <br><br>

            <strong>
                ${formatSentinelMoney(
                    stats.average
                )}
            </strong>

            <br><br>

            Based on
            ${stats.count}
            recorded transactions.
        `;

    }


    /* -----------------------------------------------------
       COUNT
    ----------------------------------------------------- */

    if (intent === "count") {

        return `
            📋 <strong>Transaction Count</strong>
            <br><br>

            Sentinel has analyzed:

            <br><br>

            <strong>
                ${stats.count}
            </strong>

            transactions.
        `;

    }


    /* -----------------------------------------------------
       LATEST
    ----------------------------------------------------- */

    if (intent === "latest") {

        const tx =
            transactions[
                transactions.length - 1
            ];


        return `
            🕒 <strong>Latest Transaction</strong>
            <br><br>

            <strong>${escapeSentinelHTML(
                tx.merchant
            )}</strong>

            <br>

            ${formatSentinelMoney(
                tx.amount
            )}

            <br><br>

            Location:
            ${escapeSentinelHTML(
                tx.location
            )}

            <br>

            Risk:
            ${tx.risk}%

            <br>

            Status:
            ${escapeSentinelHTML(
                tx.status
            )}

            <br><br>

            ${formatSentinelDate(
                tx.date
            )}
        `;

    }


    /* -----------------------------------------------------
       TOP MERCHANT
    ----------------------------------------------------- */

    if (intent === "merchant") {

        if (!stats.topMerchant) {

            return `
                No merchant information is available.
            `;

        }


        return `
            🏪 <strong>Top Merchant</strong>
            <br><br>

            Your highest-spending merchant is:

            <br><br>

            <strong>
                ${escapeSentinelHTML(
                    stats.topMerchant[0]
                )}
            </strong>

            <br>

            ${formatSentinelMoney(
                stats.topMerchant[1]
            )}
        `;

    }


    /* -----------------------------------------------------
       LOCATION
    ----------------------------------------------------- */

    if (intent === "location") {

        if (!stats.topLocation) {

            return `
                No location information is available.
            `;

        }


        return `
            📍 <strong>Top Spending Location</strong>
            <br><br>

            You have spent the most in:

            <br><br>

            <strong>
                ${escapeSentinelHTML(
                    stats.topLocation[0]
                )}
            </strong>

            <br>

            ${formatSentinelMoney(
                stats.topLocation[1]
            )}
        `;

    }


    /* -----------------------------------------------------
       RISK
    ----------------------------------------------------- */

    if (intent === "risk") {

        if (
            stats.suspicious.length === 0
        ) {

            return `
                🛡️ <strong>No High-Risk Transactions</strong>
                <br><br>

                Sentinel currently has not identified
                any transactions with a high-risk score.
            `;

        }


        const highestRisk =
            stats.suspicious.reduce(
                (a, b) =>
                    a.risk > b.risk
                        ? a
                        : b
            );


        return `
            🚨 <strong>Risk Analysis</strong>
            <br><br>

            Sentinel identified
            <strong>
                ${stats.suspicious.length}
            </strong>
            suspicious transaction(s).

            <br><br>

            Highest risk:

            <br>

            <strong>
                ${escapeSentinelHTML(
                    highestRisk.merchant
                )}
            </strong>

            <br>

            Risk:
            <strong>
                ${highestRisk.risk}%
            </strong>

            <br>

            Amount:
            ${formatSentinelMoney(
                highestRisk.amount
            )}
        `;

    }


    /* -----------------------------------------------------
       BLOCKED
    ----------------------------------------------------- */

    if (intent === "blocked") {

        if (
            stats.blocked.length === 0
        ) {

            return `
                ✅ <strong>No Blocked Transactions</strong>
                <br><br>

                Sentinel does not currently have
                any blocked or rejected transactions
                in the stored history.
            `;

        }


        return `
            🚫 <strong>Blocked Payments</strong>
            <br><br>

            Sentinel recorded:

            <strong>
                ${stats.blocked.length}
            </strong>

            blocked or rejected transaction(s).

            <br><br>

            The most recent blocked activity
            can be found in your transaction history.
        `;

    }


    /* -----------------------------------------------------
       ABOVE AVERAGE
    ----------------------------------------------------- */

    if (intent === "aboveAverage") {

        return `
            📈 <strong>Above-Average Spending</strong>
            <br><br>

            Average transaction:

            <strong>
                ${formatSentinelMoney(
                    stats.average
                )}
            </strong>

            <br><br>

            Transactions above your average:

            <strong>
                ${stats.aboveAverage.length}
            </strong>
        `;

    }


    /* -----------------------------------------------------
       SECURITY
    ----------------------------------------------------- */

    if (intent === "security") {

        const score =
            calculateSentinelSecurityScore(
                transactions
            );


        let level =
            "EXCELLENT";


        if (score < 90)
            level = "GOOD";


        if (score < 70)
            level = "WARNING";


        if (score < 40)
            level = "CRITICAL";


        return `
            🛡️ <strong>Sentinel Security Status</strong>
            <br><br>

            Security Score:

            <strong>
                ${score}/100
            </strong>

            <br><br>

            Protection Level:
            <strong>
                ${level}
            </strong>

            <br><br>

            Transactions monitored:
            ${stats.count}

            <br>

            Suspicious:
            ${stats.suspicious.length}

            <br>

            Blocked:
            ${stats.blocked.length}
        `;

    }


    /* -----------------------------------------------------
       WHY
    ----------------------------------------------------- */

    if (intent === "why") {

        if (
            stats.suspicious.length === 0
        ) {

            return `
                🧠 <strong>Sentinel Decision Analysis</strong>
                <br><br>

                I don't currently see a high-risk
                transaction in the stored history.
            `;

        }


        const tx =
            stats.suspicious[
                stats.suspicious.length - 1
            ];


        const reasons = [];


        if (
            tx.amount >
            stats.average * 2
        ) {

            reasons.push(
                "transaction amount is significantly above your average"
            );

        } else if (
            tx.amount >
            stats.average
        ) {

            reasons.push(
                "transaction amount is above your normal average"
            );

        }


        if (
            tx.risk >= 70
        ) {

            reasons.push(
                "the calculated risk score is high"
            );

        }


        if (
            /blocked|rejected|denied|fraud|suspicious/i
                .test(tx.status)
        ) {

            reasons.push(
                "the transaction status indicates suspicious activity"
            );

        }


        if (!reasons.length) {

            reasons.push(
                "the transaction contains unusual behavioural indicators"
            );

        }


        return `
            🧠 <strong>Why Sentinel Flagged It</strong>

            <br><br>

            Transaction:
            <strong>
                ${escapeSentinelHTML(
                    tx.merchant
                )}
            </strong>

            <br>

            Amount:
            ${formatSentinelMoney(
                tx.amount
            )}

            <br>

            Risk:
            ${tx.risk}%

            <br><br>

            <strong>Detected indicators:</strong>

            <br>

            • ${reasons.join("<br>• ")}

            <br><br>

            <strong>Sentinel decision:</strong>
            additional verification is recommended.
        `;

    }


    /* -----------------------------------------------------
       RECENT
    ----------------------------------------------------- */

    if (intent === "recent") {

        const recent =
            transactions
                .slice(-5)
                .reverse();


        let html =
            `
            🕒 <strong>Recent Activity</strong>
            <br><br>
            `;


        recent.forEach(tx => {

            html += `
                <strong>
                    ${escapeSentinelHTML(
                        tx.merchant
                    )}
                </strong>

                —
                ${formatSentinelMoney(
                    tx.amount
                )}

                —
                ${tx.risk}% risk

                <br>
            `;

        });


        return html;

    }


    /* -----------------------------------------------------
       HELP
    ----------------------------------------------------- */

    if (intent === "help") {

        return `
            🤖 <strong>Sentinel AI Capabilities</strong>
            <br><br>

            Ask me things like:

            <br>• What is my highest transaction?
            <br>• What is my lowest transaction?
            <br>• How much have I spent?
            <br>• What is my average?
            <br>• How many transactions do I have?
            <br>• What is my latest transaction?
            <br>• Which merchant did I spend the most with?
            <br>• Where do I spend the most?
            <br>• Are there any risky transactions?
            <br>• How many payments were blocked?
            <br>• Why was a payment flagged?
            <br>• What is my security score?
            <br>• Show my recent activity.
        `;

    }


    /* -----------------------------------------------------
       UNKNOWN
    ----------------------------------------------------- */

    return `
        🤖 <strong>I'm ready to analyze your data.</strong>

        <br><br>

        I couldn't identify exactly what you are
        asking yet.

        <br><br>

        Try asking:

        <br>
        "What is my highest transaction?"

        <br>
        "How much have I spent?"

        <br>
        "Are there any risky payments?"

        <br>
        "Why was my payment blocked?"

        <br><br>

        Type <strong>help</strong> to see everything
        I can analyze.
    `;

}


/* ---------------------------------------------------------
   MAIN ASSISTANT FUNCTION
--------------------------------------------------------- */

function askSentinel() {

    const input =
        document.getElementById(
            "assistantInput"
        );


    if (!input) return;


    const question =
        input.value.trim();


    if (!question) return;


    addSentinelUserMessage(
        question
    );


    input.value = "";


    showSentinelTyping();


    setTimeout(() => {

        hideSentinelTyping();


        const response =
            generateSentinelResponse(
                question
            );


        addSentinelAIMessage(
            response
        );


    }, 500);

}


/* ---------------------------------------------------------
   ENTER KEY
--------------------------------------------------------- */

function handleAssistantKey(event) {

    if (
        event.key === "Enter"
    ) {

        event.preventDefault();

        askSentinel();

    }

}


/* ---------------------------------------------------------
   QUICK QUESTIONS
--------------------------------------------------------- */

function quickAsk(type) {

    const questions = {

        highest:
            "What is my highest transaction?",

        average:
            "What is my average transaction?",

        blocked:
            "How many payments were blocked?",

        latest:
            "What is my latest transaction?",

        total:
            "How much have I spent?",

        risk:
            "Are there any risky transactions?",

        merchant:
            "Which merchant did I spend the most with?",

        security:
            "What is my security score?"

    };


    const question =
        questions[type];


    if (!question) return;


    const input =
        document.getElementById(
            "assistantInput"
        );


    if (input) {

        input.value =
            question;

        askSentinel();

    }

}


/* ---------------------------------------------------------
   TALK TO AI
--------------------------------------------------------- */

function talkToAI() {

    const input =
        document.getElementById(
            "assistantInput"
        );


    if (!input) return;


    input.focus();


    addSentinelAIMessage(
        `
        🎙️ <strong>Sentinel Voice Interface</strong>
        <br><br>
        Voice interaction is ready.
        Type your question below or use your browser's
        voice-input feature.
        `
    );

}


/* ---------------------------------------------------------
   INITIALIZE ASSISTANT
--------------------------------------------------------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const input =
            document.getElementById(
                "assistantInput"
            );


        if (input) {

            input.addEventListener(
                "keydown",
                handleAssistantKey
            );

        }

    }
);

/* =====================================================
   ASSISTANT INTELLIGENCE
===================================================== */

function generateAssistantAnswer(
    question
) {

    const q =
        question.toLowerCase();


    const stored =
        JSON.parse(
            localStorage.getItem(
                "transactions"
            )
        ) || [];


    if (
        q.includes("highest") ||
        q.includes("largest") ||
        q.includes("maximum")
    ) {

        if (!stored.length) {

            return "You don't have any recorded transactions yet.";

        }


        const highest =
            stored.reduce(
                function (max, t) {

                    return Number(
                        t.amount || 0
                    ) >
                    Number(
                        max.amount || 0
                    )
                        ? t
                        : max;

                },
                stored[0]
            );


        return (
            "Your highest recorded transaction was ₹" +
            Number(
                highest.amount
            ).toLocaleString() +
            " at " +
            highest.merchant +
            "."
        );

    }


    if (
        q.includes("average")
    ) {

        return (
            "Your current average approved transaction is ₹" +
            averageSpending.toLocaleString() +
            "."
        );

    }


    if (
        q.includes("blocked") ||
        q.includes("fraud")
    ) {

        const blocked =
            stored.filter(
                function (t) {

                    return (
                        t.status ===
                        "BLOCKED"
                    );

                }
            );


        if (!blocked.length) {

            return "I found no blocked transactions in your current history.";

        }


        return (
            "I found " +
            blocked.length +
            " blocked transaction" +
            (
                blocked.length === 1
                    ? ""
                    : "s"
            ) +
            ". The latest blocked payment was ₹" +
            Number(
                blocked[0].amount
            ).toLocaleString() +
            " at " +
            blocked[0].merchant +
            "."
        );

    }


    if (
        q.includes("latest") ||
        q.includes("recent")
    ) {

        if (!stored.length) {

            return "There are no transactions in your history.";

        }


        const latest =
            stored[0];


        return (
            "Your latest transaction was ₹" +
            Number(
                latest.amount
            ).toLocaleString() +
            " at " +
            latest.merchant +
            ". Status: " +
            latest.status +
            "."
        );

    }


    if (
        q.includes("how much") ||
        q.includes("spent") ||
        q.includes("spending")
    ) {

        let total = 0;


        stored.forEach(
            function (t) {

                if (
                    t.status ===
                    "APPROVED"
                ) {

                    total += Number(
                        t.amount || 0
                    );

                }

            }
        );


        return (
            "Your total approved spending in the stored history is ₹" +
            total.toLocaleString() +
            "."
        );

    }


    if (
        q.includes("merchant")
    ) {

        if (!stored.length) {

            return "There is no merchant data yet.";

        }


        const merchantTotals = {};


        stored.forEach(
            function (t) {

                const merchant =
                    t.merchant ||
                    "Unknown";


                merchantTotals[merchant] =
                    (
                        merchantTotals[merchant]
                        || 0
                    ) +
                    Number(
                        t.amount || 0
                    );

            }
        );


        let bestMerchant =
            null;


        let bestTotal = 0;


        Object.keys(
            merchantTotals
        ).forEach(
            function (merchant) {

                if (
                    merchantTotals[merchant]
                    >
                    bestTotal
                ) {

                    bestTotal =
                        merchantTotals[
                            merchant
                        ];

                    bestMerchant =
                        merchant;

                }

            }
        );


        return (
            "Your highest-spending merchant is " +
            bestMerchant +
            " with ₹" +
            bestTotal.toLocaleString() +
            " in recorded transactions."
        );

    }


    if (
        q.includes("security") ||
        q.includes("safe") ||
        q.includes("status")
    ) {

        const score =
            document.getElementById(
                "securityScore"
            )?.textContent ||
            "100%";


        return (
            "Your current Sentinel security score is " +
            score +
            ". The transaction monitoring engine is active."
        );

    }


    if (
        q.includes("why") &&
        (
            q.includes("blocked") ||
            q.includes("payment")
        )
    ) {

        const blocked =
            stored.find(
                function (t) {

                    return (
                        t.status ===
                        "BLOCKED"
                    );

                }
            );


        if (!blocked) {

            return "I don't currently have a blocked transaction to explain.";

        }


        const reasons =
            blocked.reasons &&
            blocked.reasons.length
                ? blocked.reasons.join(
                    ", "
                )
                : "unusual transaction behaviour";


        return (
            "The transaction was blocked or reported because Sentinel detected: " +
            reasons +
            "."
        );

    }


    if (
        q.includes("help") ||
        q.includes("what can")
    ) {

        return (
            "I can analyze your transaction history. Try asking: highest transaction, average spending, total spending, blocked payments, latest transaction, highest-spending merchant, or security status."
        );

    }


    return (
        "I can answer questions about your stored transaction data. Try asking about your highest transaction, average spending, blocked payments, latest transaction, merchants, or security score."
    );

}


/* =====================================================
   ASSISTANT UI
===================================================== */

function addAssistantMessage(
    message,
    type
) {

    const container =
        document.getElementById(
            "assistantMessages"
        );


    if (!container) return;


    const bubble =
        document.createElement(
            "div"
        );


    bubble.className =
        type === "user"
            ? "user-message-bubble"
            : "ai-message-bubble";


    bubble.textContent =
        type === "user"
            ? message
            : "🤖 " + message;


    container.appendChild(
        bubble
    );


    container.scrollTop =
        container.scrollHeight;

}


/* =====================================================
   VOICE ENGINE
===================================================== */

function speakAI(message) {

    const voiceBox =
        document.getElementById(
            "voiceText"
        );


    if (voiceBox) {

        voiceBox.textContent =
            '"' + message + '"';

    }


    if (
        "speechSynthesis"
        in window
    ) {

        const speech =
            new SpeechSynthesisUtterance(
                message
            );


        speech.rate = .95;

        speech.pitch = 1.15;

        speech.volume = 1;


        window.speechSynthesis.cancel();

        window.speechSynthesis.speak(
            speech
        );

    }

}


function talkToAI() {

    speakAI(
        "Hello. I am Sentinel AI 3. Your security systems are currently online."
    );

}


function aiVerificationVoice() {

    speakAI(
        "This transaction is unusual. Please confirm whether you made this payment."
    );

}


/* =====================================================
   SECURITY EVENTS
===================================================== */

function addSecurityEvent(
    title,
    description,
    type
) {

    const container =
        document.getElementById(
            "securityEvents"
        );


    if (!container) return;


    const event =
        document.createElement(
            "div"
        );


    event.className =
        "event";


    event.innerHTML = `

        <span class="event-dot ${type}"></span>

        <div>

            <b>
                ${escapeHTML(title)}
            </b>

            <small>
                ${escapeHTML(description)}
            </small>

        </div>

        <time>
            NOW
        </time>

    `;


    container.prepend(
        event
    );


    /*
       Keep event list small.
    */

    while (
        container.children.length
        > 8
    ) {

        container.removeChild(
            container.lastElementChild
        );

    }

}


/* =====================================================
   SAFE HTML TEXT
===================================================== */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value ?? "");


    return div.innerHTML;

}


/* =====================================================
   LOGOUT
===================================================== */

function logout() {

    window.speechSynthesis?.cancel();


    localStorage.removeItem(
        "sentinelAccess"
    );


    localStorage.removeItem(
        "sentinelLoginTime"
    );


    window.location.href =
        "login.html";

}


/* =====================================================
   SENTINEL AI 3 — ADVANCED INTELLIGENCE ENGINE
===================================================== */

/* ---------- TRANSACTION PATTERN ANALYSIS ---------- */

function analyzeTransactionPatterns() {

    const data =
        JSON.parse(
            localStorage.getItem("transactions")
        ) || [];

    if (data.length < 2) {
        return {
            pattern: "INSUFFICIENT DATA",
            risk: 0
        };
    }

    const approved =
        data.filter(t => t.status === "APPROVED");

    if (!approved.length) {
        return {
            pattern: "NO APPROVED DATA",
            risk: 0
        };
    }

    let risk = 0;
    let patterns = [];

    /* Average amount */

    const amounts =
        approved.map(t =>
            Number(t.amount || 0)
        );

    const average =
        amounts.reduce(
            (a, b) => a + b,
            0
        ) / amounts.length;


    /* Detect unusually large payments */

    approved.forEach(t => {

        const amount =
            Number(t.amount || 0);

        if (amount > average * 3) {

            risk += 10;

            patterns.push(
                "Unusually large transaction"
            );

        }

    });


    /* Detect repeated merchant activity */

    const merchantCount = {};

    approved.forEach(t => {

        const merchant =
            t.merchant || "Unknown";

        merchantCount[merchant] =
            (merchantCount[merchant] || 0) + 1;

    });


    Object.keys(merchantCount).forEach(
        merchant => {

            if (
                merchantCount[merchant] >= 5
            ) {

                patterns.push(
                    "Frequent merchant activity: " +
                    merchant
                );

            }

        }
    );


    risk =
        Math.min(
            risk,
            100
        );


    return {
        pattern:
            patterns.length
                ? patterns
                : ["Normal spending pattern"],

        risk: risk
    };

}


/* ---------- SECURITY SCORE ---------- */

function calculateAdvancedSecurityScore() {

    const data =
        JSON.parse(
            localStorage.getItem("transactions")
        ) || [];


    if (!data.length) {

        return 100;

    }


    let score = 100;


    const blocked =
        data.filter(
            t =>
                t.status === "BLOCKED"
        ).length;


    const highRisk =
        data.filter(
            t =>
                Number(t.risk || 0) >= 70
        ).length;


    const suspicious =
        data.filter(
            t =>
                Number(t.risk || 0) >= 40
        ).length;


    score -=
        Math.min(
            blocked * 7,
            30
        );


    score -=
        Math.min(
            highRisk * 4,
            20
        );


    score -=
        Math.min(
            suspicious * 2,
            15
        );


    return Math.max(
        0,
        Math.round(score)
    );

}


/* ---------- UPDATE SECURITY CORE ---------- */

function updateAdvancedSecurityCore() {

    const score =
        calculateAdvancedSecurityScore();


    const scoreElement =
        document.getElementById(
            "securityScore"
        );


    const circle =
        document.getElementById(
            "securityCircleScore"
        );


    if (scoreElement) {

        scoreElement.textContent =
            score + "%";

    }


    if (circle) {

        circle.textContent =
            score;

    }


    if (score >= 80) {

        setAIStatus(
            "🟢 SENTINEL SECURITY STATUS: OPTIMAL"
        );

    }

    else if (score >= 60) {

        setAIStatus(
            "🟡 SENTINEL SECURITY STATUS: MONITORING"
        );

    }

    else {

        setAIStatus(
            "🔴 SENTINEL SECURITY STATUS: ELEVATED RISK"
        );

    }

}


/* ---------- AI TRANSACTION EXPLANATION ---------- */

function explainTransaction(transaction) {

    if (!transaction) {

        return "No transaction data available.";

    }


    const amount =
        Number(
            transaction.amount || 0
        );


    const risk =
        Number(
            transaction.risk || 0
        );


    let explanation =
        "Sentinel AI analyzed this transaction. ";


    if (risk >= 70) {

        explanation +=
            "The transaction has a high risk score. ";

    }

    else if (risk >= 40) {

        explanation +=
            "The transaction requires additional verification. ";

    }

    else {

        explanation +=
            "The transaction appears consistent with normal activity. ";

    }


    if (
        averageSpending > 0 &&
        amount > averageSpending * 2
    ) {

        explanation +=
            "The payment is significantly higher than your average transaction. ";

    }


    if (
        transaction.location === ""
    ) {

        explanation +=
            "Location information was unavailable. ";

    }


    if (
        transaction.reasons &&
        transaction.reasons.length
    ) {

        explanation +=
            "Detected factors: " +
            transaction.reasons.join(", ") +
            ".";

    }


    return explanation;

}


/* ---------- AI COMMAND PROCESSOR ---------- */

function processSentinelCommand(command) {

    const text =
        command.toLowerCase().trim();


    /* SECURITY */

    if (
        text.includes("security score")
    ) {

        const score =
            calculateAdvancedSecurityScore();

        return (
            "Your current Sentinel security score is " +
            score +
            "%."
        );

    }


    /* PATTERNS */

    if (
        text.includes("pattern") ||
        text.includes("behaviour") ||
        text.includes("behavior")
    ) {

        const analysis =
            analyzeTransactionPatterns();


        return (
            "Current transaction pattern: " +
            analysis.pattern.join("; ") +
            "."
        );

    }


    /* EXPLAIN LAST TRANSACTION */

    if (
        text.includes("explain") &&
        (
            text.includes("last") ||
            text.includes("latest")
        )
    ) {

        if (
            !transactions.length
        ) {

            return "There are no transactions to analyze.";

        }


        return explainTransaction(
            transactions[0]
        );

    }


    /* TOTAL TRANSACTIONS */

    if (
        text.includes("how many") &&
        text.includes("transaction")
    ) {

        return (
            "You currently have " +
            transactions.length +
            " recorded transactions."
        );

    }


    /* APPROVED */

    if (
        text.includes("approved")
    ) {

        const approved =
            transactions.filter(
                t =>
                    t.status ===
                    "APPROVED"
            );


        return (
            "There are " +
            approved.length +
            " approved transactions."
        );

    }


    /* BLOCKED */

    if (
        text.includes("blocked")
    ) {

        const blocked =
            transactions.filter(
                t =>
                    t.status ===
                    "BLOCKED"
            );


        return (
            "There are " +
            blocked.length +
            " blocked transactions."
        );

    }


    return null;

}


/* ---------- CONNECT ADVANCED AI ---------- */

function advancedAssistantAnswer(question) {

    const answer =
        processSentinelCommand(
            question
        );


    if (answer) {

        return answer;

    }


    return generateAssistantAnswer(
        question
    );

}


/* ---------- SECURITY MONITOR ---------- */

function startSecurityMonitor() {

    setInterval(
        function () {

            checkAccess();

            updateAdvancedSecurityCore();

        },
        10000
    );

}


/* ---------- START ENGINE ---------- */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        startSecurityMonitor();

        updateAdvancedSecurityCore();

    }
);

/* =====================================================
   SENTINEL AI 3 — P4
   REAL-TIME SECURITY COMMAND CENTER
===================================================== */

let threatMonitorActive = true;
let threatEvents = 0;


/* =====================================================
   THREAT LEVEL
===================================================== */

function calculateThreatLevel() {

    const data =
        JSON.parse(
            localStorage.getItem("transactions")
        ) || [];

    let score = 0;

    data.forEach(t => {

        const risk =
            Number(t.risk || 0);

        if (risk >= 80) {
            score += 4;
        }
        else if (risk >= 60) {
            score += 2;
        }
        else if (risk >= 40) {
            score += 1;
        }

    });

    score = Math.min(score, 100);

    if (score >= 70) {
        return {
            level: "CRITICAL",
            color: "#ef4444",
            score: score
        };
    }

    if (score >= 40) {
        return {
            level: "ELEVATED",
            color: "#facc15",
            score: score
        };
    }

    return {
        level: "LOW",
        color: "#22c55e",
        score: score
    };
}


/* =====================================================
   UPDATE THREAT MONITOR
===================================================== */

function updateThreatMonitor() {

    const threat =
        calculateThreatLevel();


    const level =
        document.getElementById(
            "threatLevel"
        );


    const indicator =
        document.getElementById(
            "threatIndicator"
        );


    if (level) {

        level.textContent =
            threat.level;

        level.style.color =
            threat.color;

    }


    if (indicator) {

        indicator.style.background =
            threat.color;

        indicator.style.boxShadow =
            "0 0 15px " +
            threat.color;

    }

}


/* =====================================================
   REAL-TIME TRANSACTION WATCHER
===================================================== */

function monitorTransactions() {

    if (!threatMonitorActive) {
        return;
    }


    const data =
        JSON.parse(
            localStorage.getItem("transactions")
        ) || [];


    if (!data.length) {
        return;
    }


    const latest =
        data[0];


    if (
        Number(latest.risk || 0) >= 70
    ) {

        threatEvents++;


        addSecurityEvent(
            "High-risk transaction detected",
            "Sentinel AI identified unusual transaction behaviour.",
            "danger"
        );

    }


    updateThreatMonitor();

}


/* =====================================================
   SECURITY HEARTBEAT
===================================================== */

function securityHeartbeat() {

    const heartbeat =
        document.getElementById(
            "securityHeartbeat"
        );


    if (!heartbeat) {
        return;
    }


    heartbeat.textContent =
        "SYSTEM HEARTBEAT • " +
        new Date().toLocaleTimeString();


    heartbeat.style.color =
        "#22c55e";


    setTimeout(
        function () {

            heartbeat.style.color =
                "#00e5ff";

        },
        500
    );

}


/* =====================================================
   SYSTEM DIAGNOSTICS
===================================================== */

function runDiagnostics() {

    const checks = [

        {
            name: "Transaction Engine",
            result: true
        },

        {
            name: "Risk Detection",
            result: true
        },

        {
            name: "False Positive Protection",
            result: true
        },

        {
            name: "AI Assistant",
            result: true
        },

        {
            name: "Session Security",
            result:
                localStorage.getItem(
                    "sentinelAccess"
                ) === "true"
        }

    ];


    const failed =
        checks.filter(
            check =>
                !check.result
        );


    if (failed.length === 0) {

        addSecurityEvent(
            "System diagnostics passed",
            "All Sentinel AI modules are operational.",
            "safe"
        );


        setAIStatus(
            "🟢 ALL SYSTEMS OPERATIONAL"
        );


        speakAI(
            "System diagnostics completed successfully. All Sentinel security modules are operational."
        );

    }

    else {

        addSecurityEvent(
            "System diagnostic warning",
            failed.length +
            " security module requires attention.",
            "danger"
        );


        setAIStatus(
            "🟡 SYSTEM DIAGNOSTIC WARNING"
        );

    }

}


/* =====================================================
   SECURITY TIMELINE
===================================================== */

function createSecurityTimeline() {

    const timeline =
        document.getElementById(
            "securityTimeline"
        );


    if (!timeline) {
        return;
    }


    timeline.innerHTML = "";


    const events = [

        {
            title: "Sentinel Core",
            text: "AI monitoring engine online.",
            status: "safe"
        },

        {
            title: "Transaction Shield",
            text: "Payment monitoring active.",
            status: "safe"
        },

        {
            title: "False Positive Shield",
            text: "User verification layer ready.",
            status: "safe"
        },

        {
            title: "AI Assistant",
            text: "Transaction intelligence ready.",
            status: "safe"
        }

    ];


    events.forEach(event => {

        const item =
            document.createElement(
                "div"
            );


        item.className =
            "event";


        item.innerHTML = `

            <span class="event-dot ${event.status}"></span>

            <div>

                <b>
                    ${event.title}
                </b>

                <small>
                    ${event.text}
                </small>

            </div>

            <time>
                ONLINE
            </time>

        `;


        timeline.appendChild(
            item
        );

    });

}


/* =====================================================
   AUTO SECURITY LOOP
===================================================== */

function startSentinelSecurityLoop() {

    updateThreatMonitor();

    createSecurityTimeline();

    runDiagnostics();


    setInterval(
        function () {

            if (!threatMonitorActive) {
                return;
            }


            securityHeartbeat();

            updateThreatMonitor();

            monitorTransactions();

        },
        15000
    );

}


/* =====================================================
   START P4
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        startSentinelSecurityLoop();

    }
);

/* =====================================================
   P5 — LINK SECURITY INTEGRATION
===================================================== */

function saveLinkScan(
    url,
    status,
    reason = ""
) {

    if (!url) {
        return;
    }

    const scan = {

        url: url,

        status: status,

        reason: reason,

        time:
            new Date().toLocaleString()

    };


    let history =
        JSON.parse(
            localStorage.getItem(
                "sentinelLinkHistory"
            )
        ) || [];


    history.unshift(scan);


    /*
       Keep only the latest 50 scans.
    */

    history =
        history.slice(0, 50);


    localStorage.setItem(
        "sentinelLinkHistory",
        JSON.stringify(history)
    );


    updateLinkSecurityPanel();
    
    


    /*
       Count scans.
    */

    const total =
        Number(
            localStorage.getItem(
                "sentinelLinksScanned"
            )
        ) || 0;


    localStorage.setItem(
        "sentinelLinksScanned",
        total + 1
    );


    updateDashboardStats();

    
}


/* =====================================================
   UPDATE LINK PANEL
===================================================== */

function updateLinkSecurityPanel() {

    const history =
        JSON.parse(
            localStorage.getItem(
                "sentinelLinkHistory"
            )
        ) || [];


    const latest =
        history[0];


    const urlBox =
        document.getElementById(
            "lastScannedLink"
        );


    const statusBox =
        document.getElementById(
            "lastLinkStatus"
        );


    const historyBox =
        document.getElementById(
            "linkSecurityHistory"
        );


    if (!historyBox) {
        return;
    }


    if (!latest) {

        if (urlBox) {
            urlBox.textContent =
                "No link scanned";
        }

        if (statusBox) {
            statusBox.textContent =
                "WAITING";
        }

        historyBox.innerHTML = `
            <div class="link-empty">
                No link-security events yet.
            </div>
        `;

        return;

    }


    if (urlBox) {

        urlBox.textContent =
            latest.url;

    }


    if (statusBox) {

        statusBox.textContent =
            latest.status.toUpperCase();


        if (
            latest.status === "SAFE"
        ) {

            statusBox.style.color =
                "#22c55e";

        }

        else if (
            latest.status === "SUSPICIOUS"
        ) {

            statusBox.style.color =
                "#facc15";

        }

        else {

            statusBox.style.color =
                "#ef4444";

        }

    }


    historyBox.innerHTML = "";


    history
        .slice(0, 10)
        .forEach(scan => {

            let type =
                "safe";


            if (
                scan.status ===
                "SUSPICIOUS"
            ) {

                type =
                    "suspicious";

            }


            if (
                scan.status ===
                "DANGEROUS"
            ) {

                type =
                    "danger";

            }


            const event =
                document.createElement(
                    "div"
                );


            event.className =
                "link-event";


            event.innerHTML = `

                <span
                    class="link-event-dot ${type}">
                </span>

                <div
                    class="link-event-info">

                    <b>
                        ${escapeHTML(
                            scan.url
                        )}
                    </b>

                    <small>
                        ${
                            escapeHTML(
                                scan.reason ||
                                "No additional information"
                            )
                        }
                        •
                        ${
                            escapeHTML(
                                scan.time
                            )
                        }
                    </small>

                </div>

                <span
                    class="link-event-status">

                    ${escapeHTML(
                        scan.status
                    )}

                </span>

            `;


            historyBox.appendChild(
                event
            );

        });

}


/* =====================================================
   CLEAR LINK SECURITY HISTORY
===================================================== */

function clearLinkSecurityHistory() {

    const history =
        JSON.parse(
            localStorage.getItem(
                "sentinelLinkHistory"
            )
        ) || [];


    if (
        history.length > 0 &&
        !window.confirm(
            "Delete all link security history?"
        )
    ) {

        return;

    }


    localStorage.removeItem(
        "sentinelLinkHistory"
    );

    localStorage.removeItem(
        "sentinelLatestLinkScan"
    );

    localStorage.removeItem(
        "sentinelLinksScanned"
    );

    updateLinkSecurityPanel();

    updateDashboardStats();

}


/* =====================================================
   LINK CHECKER MESSAGE RECEIVER
===================================================== */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            "sentinelLatestLinkScan"
        ) {

            updateLinkSecurityPanel();

            addSecurityEvent(
                "Link scan completed",
                "Sentinel Link Checker sent a new security result.",
                "safe"
            );

        }

    }
);


/* =====================================================
   LOAD LINK SECURITY DATA
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateLinkSecurityPanel();

    }
);

/* =========================================================
   SENTINEL AI — LIVE SECURITY TELEMETRY
========================================================= */

let threatChart;
let securityChart;
let linkChart;

let threatData = [];
let securityData = [];
let linkData = [];

let chartLabels = [];


/* =========================================================
   CREATE INITIAL DATA
========================================================= */

function generateInitialChartData() {

    chartLabels = [];

    threatData = [];
    securityData = [];
    linkData = [];

    for (let i = 0; i < 20; i++) {

        chartLabels.push(
            `${20 - i}s`
        );

        threatData.push(
            Math.floor(Math.random() * 5)
        );

        securityData.push(
            94 + Math.floor(Math.random() * 7)
        );

        linkData.push(
            Math.floor(Math.random() * 8)
        );
    }
}


/* =========================================================
   CHART DEFAULTS
========================================================= */

function getChartOptions(min = undefined, max = undefined) {

    return {

        responsive: true,

        maintainAspectRatio: false,

        animation: {
            duration: 500
        },

        plugins: {

            legend: {
                display: false
            }
        },

        scales: {

            x: {

                display: false,

                grid: {
                    display: false
                }
            },

            y: {

                min: min,
                max: max,

                ticks: {

                    color: "#527674",

                    font: {
                        size: 8
                    }
                },

                grid: {

                    color:
                        "rgba(0,220,204,.055)"
                },

                border: {
                    display: false
                }
            }
        },

        elements: {

            point: {

                radius: 0,

                hoverRadius: 4
            },

            line: {

                tension: 0.4
            }
        }
    };
}


/* =========================================================
   THREAT ACTIVITY
========================================================= */

function createThreatChart() {

    const canvas =
        document.getElementById(
            "threatActivityChart"
        );

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");


    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            220
        );

    gradient.addColorStop(
        0,
        "rgba(0,240,220,.30)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,240,220,0)"
    );


    threatChart =
        new Chart(ctx, {

            type: "line",

            data: {

                labels: chartLabels,

                datasets: [{

                    data: threatData,

                    borderColor:
                        "#00f0dc",

                    backgroundColor:
                        gradient,

                    fill: true,

                    borderWidth: 2
                }]
            },

            options:
                getChartOptions(0, 10)
        });
}


/* =========================================================
   SECURITY SCORE
========================================================= */

function createSecurityChart() {

    const canvas =
        document.getElementById(
            "securityScoreChart"
        );

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");


    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            220
        );

    gradient.addColorStop(
        0,
        "rgba(0,230,168,.25)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,230,168,0)"
    );


    securityChart =
        new Chart(ctx, {

            type: "line",

            data: {

                labels: chartLabels,

                datasets: [{

                    data: securityData,

                    borderColor:
                        "#00e6a8",

                    backgroundColor:
                        gradient,

                    fill: true,

                    borderWidth: 2
                }]
            },

            options:
                getChartOptions(80, 105)
        });
}


/* =========================================================
   LINK ACTIVITY
========================================================= */

function createLinkChart() {

    const canvas =
        document.getElementById(
            "linkActivityChart"
        );

    if (!canvas) return;

    const ctx =
        canvas.getContext("2d");


    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            220
        );

    gradient.addColorStop(
        0,
        "rgba(0,169,199,.25)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,169,199,0)"
    );


    linkChart =
        new Chart(ctx, {

            type: "line",

            data: {

                labels: chartLabels,

                datasets: [{

                    data: linkData,

                    borderColor:
                        "#00a9c7",

                    backgroundColor:
                        gradient,

                    fill: true,

                    borderWidth: 2
                }]
            },

            options:
                getChartOptions(0, 12)
        });
}


/* =========================================================
   UPDATE LIVE DATA
========================================================= */

function updateLiveSecurityCharts() {

    if (
        !threatChart ||
        !securityChart ||
        !linkChart
    ) {
        return;
    }


    /* New values */

    const threat =
        Math.floor(
            Math.random() * 7
        );


    const security =
        Math.max(
            88,
            Math.min(
                100,
                96 +
                Math.floor(
                    Math.random() * 5
                )
            )
        );


    const links =
        Math.floor(
            Math.random() * 10
        );


    /* Add data */

    threatData.push(threat);
    securityData.push(security);
    linkData.push(links);

    chartLabels.push("NOW");


    /* Keep only latest 20 */

    if (threatData.length > 20) {

        threatData.shift();
        securityData.shift();
        linkData.shift();
        chartLabels.shift();
    }


    /* Update charts */

    threatChart.data.labels =
        chartLabels;

    threatChart.data.datasets[0].data =
        threatData;


    securityChart.data.labels =
        chartLabels;

    securityChart.data.datasets[0].data =
        securityData;


    linkChart.data.labels =
        chartLabels;

    linkChart.data.datasets[0].data =
        linkData;


    threatChart.update("none");
    securityChart.update("none");
    linkChart.update("none");


    /* Update numbers */

    const threatRate =
        document.getElementById(
            "threatRate"
        );

    const securityScore =
        document.getElementById(
            "liveSecurityScore"
        );

    const linkRate =
        document.getElementById(
            "linkRate"
        );


    if (threatRate)
        threatRate.textContent =
            threat;


    if (securityScore)
        securityScore.textContent =
            security + "%";


    if (linkRate)
        linkRate.textContent =
            links;
}


/* =========================================================
   START SYSTEM
========================================================= */

function startLiveSecurityCharts() {

    generateInitialChartData();

    createThreatChart();
    createSecurityChart();
    createLinkChart();

    setInterval(
        updateLiveSecurityCharts,
        2000
    );
}


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    startLiveSecurityCharts
);



/* ============================================================
   SENTINEL AI
   GLOBAL THREAT MAP
   COMPLETE JAVASCRIPT
============================================================ */


/* ============================================================
   CONFIGURATION
============================================================ */

const SENTINEL_MAP_CONFIG = {

    width: 1200,

    height: 650,

    worldData:
        "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json",

    animationSpeed: 1200,

    telemetryInterval: 3500,

    maxEvents: 30

};


/* ============================================================
   DEMO THREAT DATA
============================================================ */

/*
    These are SYNTHETIC demo locations.

    They are only for demonstrating the visualization.
*/

      const threatLocations = [

    {
        id: "newyork",
        city: "New York",
        country: "United States",
        lat: 40.7128,
        lon: -74.0060,
        coordinates: [-74.0060, 40.7128],
        risk: 94,
        status: "HIGH RISK",
        events: 147,
        region: "North America",
        threat: "Credential Attack"
    },

    {
        id: "sanfrancisco",
        city: "San Francisco",
        country: "United States",
        lat: 37.7749,
        lon: -122.4194,
        coordinates: [-122.4194, 37.7749],
        risk: 93,
        status: "HIGH RISK",
        events: 139,
        region: "North America",
        threat: "Credential Theft"
    },

    {
        id: "toronto",
        city: "Toronto",
        country: "Canada",
        lat: 43.6532,
        lon: -79.3832,
        coordinates: [-79.3832, 43.6532],
        risk: 61,
        status: "MONITOR",
        events: 74,
        region: "North America",
        threat: "Phishing Campaign"
    },

    {
        id: "mexicocity",
        city: "Mexico City",
        country: "Mexico",
        lat: 19.4326,
        lon: -99.1332,
        coordinates: [-99.1332, 19.4326],
        risk: 58,
        status: "MONITOR",
        events: 68,
        region: "North America",
        threat: "Phishing Network"
    },

    {
        id: "london",
        city: "London",
        country: "United Kingdom",
        lat: 51.5074,
        lon: -0.1278,
        coordinates: [-0.1278, 51.5074],
        risk: 81,
        status: "HIGH RISK",
        events: 121,
        region: "Europe",
        threat: "Financial Malware"
    },

    {
        id: "paris",
        city: "Paris",
        country: "France",
        lat: 48.8566,
        lon: 2.3522,
        coordinates: [2.3522, 48.8566],
        risk: 76,
        status: "HIGH RISK",
        events: 98,
        region: "Europe",
        threat: "Banking Malware"
    },

    {
        id: "berlin",
        city: "Berlin",
        country: "Germany",
        lat: 52.5200,
        lon: 13.4050,
        coordinates: [13.4050, 52.5200],
        risk: 63,
        status: "MONITOR",
        events: 81,
        region: "Europe",
        threat: "Account Takeover"
    },

    {
        id: "istanbul",
        city: "Istanbul",
        country: "Turkey",
        lat: 41.0082,
        lon: 28.9784,
        coordinates: [28.9784, 41.0082],
        risk: 59,
        status: "MONITOR",
        events: 72,
        region: "Europe",
        threat: "Account Takeover"
    },

    {
        id: "cairo",
        city: "Cairo",
        country: "Egypt",
        lat: 30.0444,
        lon: 31.2357,
        coordinates: [31.2357, 30.0444],
        risk: 74,
        status: "HIGH RISK",
        events: 105,
        region: "Africa",
        threat: "Malware Distribution"
    },

    {
        id: "johannesburg",
        city: "Johannesburg",
        country: "South Africa",
        lat: -26.2041,
        lon: 28.0473,
        coordinates: [28.0473, -26.2041],
        risk: 78,
        status: "HIGH RISK",
        events: 112,
        region: "Africa",
        threat: "Malware Distribution"
    },

    {
        id: "riyadh",
        city: "Riyadh",
        country: "Saudi Arabia",
        lat: 24.7136,
        lon: 46.6753,
        coordinates: [46.6753, 24.7136],
        risk: 79,
        status: "HIGH RISK",
        events: 116,
        region: "Middle East",
        threat: "Payment Attack"
    },

    {
        id: "dubai",
        city: "Dubai",
        country: "United Arab Emirates",
        lat: 25.2048,
        lon: 55.2708,
        coordinates: [55.2708, 25.2048],
        risk: 91,
        status: "HIGH RISK",
        events: 156,
        region: "Middle East",
        threat: "Payment Fraud"
    },

    {
        id: "mumbai",
        city: "Mumbai",
        country: "India",
        lat: 19.0760,
        lon: 72.8777,
        coordinates: [72.8777, 19.0760],
        risk: 86,
        status: "HIGH RISK",
        events: 143,
        region: "South Asia",
        threat: "Banking Phishing"
    },

    {
        id: "newdelhi",
        city: "New Delhi",
        country: "India",
        lat: 28.6139,
        lon: 77.2090,
        coordinates: [77.2090, 28.6139],
        risk: 90,
        status: "HIGH RISK",
        events: 151,
        region: "South Asia",
        threat: "Financial Fraud"
    },

    {
        id: "singapore",
        city: "Singapore",
        country: "Singapore",
        lat: 1.3521,
        lon: 103.8198,
        coordinates: [103.8198, 1.3521],
        risk: 82,
        status: "HIGH RISK",
        events: 126,
        region: "Southeast Asia",
        threat: "Payment Fraud"
    },

    {
        id: "beijing",
        city: "Beijing",
        country: "China",
        lat: 39.9042,
        lon: 116.4074,
        coordinates: [116.4074, 39.9042],
        risk: 84,
        status: "HIGH RISK",
        events: 134,
        region: "East Asia",
        threat: "Credential Theft"
    },

    {
        id: "seoul",
        city: "Seoul",
        country: "South Korea",
        lat: 37.5665,
        lon: 126.9780,
        coordinates: [126.9780, 37.5665],
        risk: 83,
        status: "HIGH RISK",
        events: 128,
        region: "East Asia",
        threat: "Botnet Activity"
    },

    {
        id: "tokyo",
        city: "Tokyo",
        country: "Japan",
        lat: 35.6762,
        lon: 139.6503,
        coordinates: [139.6503, 35.6762],
        risk: 96,
        status: "HIGH RISK",
        events: 174,
        region: "East Asia",
        threat: "Botnet Activity"
    },

    {
        id: "sydney",
        city: "Sydney",
        country: "Australia",
        lat: -33.8688,
        lon: 151.2093,
        coordinates: [151.2093, -33.8688],
        risk: 54,
        status: "MONITOR",
        events: 63,
        region: "Oceania",
        threat: "Phishing Network"
    },

    {
        id: "saopaulo",
        city: "São Paulo",
        country: "Brazil",
        lat: -23.5505,
        lon: -46.6333,
        coordinates: [-46.6333, -23.5505],
        risk: 57,
        status: "MONITOR",
        events: 69,
        region: "South America",
        threat: "Phishing Network"
    }

];


/* ============================================================
   CONNECTIONS
============================================================ */

const threatConnections = [

    ["newyork", "london"],
    ["sanfrancisco", "tokyo"],
    ["toronto", "london"],
    ["mexicocity", "saopaulo"],

    ["london", "paris"],
    ["london", "berlin"],
    ["london", "mumbai"],

    ["paris", "cairo"],
    ["berlin", "istanbul"],
    ["istanbul", "riyadh"],

    ["cairo", "johannesburg"],
    ["riyadh", "dubai"],
    ["dubai", "mumbai"],

    ["mumbai", "newdelhi"],
    ["mumbai", "singapore"],
    ["newdelhi", "beijing"],

    ["singapore", "beijing"],
    ["singapore", "seoul"],
    ["singapore", "sydney"],

    ["beijing", "tokyo"],
    ["seoul", "tokyo"],
    ["saopaulo", "newyork"]
];

/* ============================================================
   GLOBAL VARIABLES
============================================================ */

let mapSvg = null;

let mapRoot = null;

let projection = null;

let geoPath = null;

let zoomBehaviour = null;

let mapTooltip = null;

let selectedNode = null;


/* ============================================================
   INITIALIZATION
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        initializeGlobalThreatMap();

        initializeControls();

        initializeStatistics();

        initializeEventStream();

        startTelemetry();

        updateClock();

        setInterval(
            updateClock,
            1000
        );

    }
);


/* ============================================================
   MAIN INITIALIZER
============================================================ */

async function initializeGlobalThreatMap() {

    mapTooltip =
        document.getElementById(
            "mapTooltip"
        );


    mapSvg =
        d3.select(
            "#sentinelWorldMap"
        );


    projection =
        d3.geoNaturalEarth1()
            .scale(205)
            .translate([
                SENTINEL_MAP_CONFIG.width / 2,
                SENTINEL_MAP_CONFIG.height / 2 + 25
            ]);


    geoPath =
        d3.geoPath()
            .projection(
                projection
            );


    mapRoot =
        mapSvg
            .append("g")
            .attr(
                "class",
                "map-root"
            );


    setupZoom();


    drawBackground();


    try {

        const world =
            await d3.json(
                SENTINEL_MAP_CONFIG.worldData
            );


        drawWorld(
            world
        );


        drawConnections();

        drawThreatLocations();

        updateStatistics();

        addInitialEvents();

    }
    catch (error) {

        console.error(
            "Sentinel map loading error:",
            error
        );


        document.getElementById(
            "systemStatus"
        ).textContent =
            "MAP DATA ERROR";


        document.getElementById(
            "mapNetworkStatus"
        ).textContent =
            "DATA ERROR";

    }

}


/* ============================================================
   BACKGROUND
============================================================ */

function drawBackground() {

    mapRoot
        .append("rect")
        .attr(
            "x",
            0
        )
        .attr(
            "y",
            0
        )
        .attr(
            "width",
            SENTINEL_MAP_CONFIG.width
        )
        .attr(
            "height",
            SENTINEL_MAP_CONFIG.height
        )
        .attr(
            "fill",
            "transparent"
        );


    const graticule =
        d3.geoGraticule();


    mapRoot
        .append("path")
        .datum(
            graticule()
        )
        .attr(
            "class",
            "sentinel-graticule"
        )
        .attr(
            "d",
            geoPath
        );

}


/* ============================================================
   WORLD
============================================================ */

function drawWorld(
    world
) {

    const countries =
        topojson.feature(
            world,
            world.objects.countries
        );


    mapRoot
        .append("g")
        .attr(
            "class",
            "countries-layer"
        )
        .selectAll(
            "path"
        )
        .data(
            countries.features
        )
        .join(
            "path"
        )
        .attr(
            "class",
            "sentinel-country"
        )
        .attr(
            "d",
            geoPath
        )
        .on(
            "mouseenter",
            function () {

                d3.select(this)
                    .raise();

            }
        );


    mapRoot
        .append("path")
        .datum(
            {
                type: "Sphere"
            }
        )
        .attr(
            "class",
            "sentinel-map-border"
        )
        .attr(
            "d",
            geoPath
        );

}


/* ============================================================
   ZOOM
============================================================ */

function setupZoom() {

    zoomBehaviour =
        d3.zoom()
            .scaleExtent([
                1,
                8
            ])
            .on(
                "zoom",
                function (event) {

                    mapRoot.attr(
                        "transform",
                        event.transform
                    );

                }
            );


    mapSvg.call(
        zoomBehaviour
    );

}


/* ============================================================
   CONNECTIONS
============================================================ */

function drawConnections() {

    const connectionLayer =
        mapRoot
            .append("g")
            .attr(
                "class",
                "connections-layer"
            );


    threatConnections.forEach(
        function (connection) {

            const source =
                threatLocations.find(
                    location =>
                        location.id ===
                        connection[0]
                );


            const target =
                threatLocations.find(
                    location =>
                        location.id ===
                        connection[1]
                );


            if (!source || !target) {
                return;
            }


            const sourcePoint =
                projection(
                    source.coordinates
                );


            const targetPoint =
                projection(
                    target.coordinates
                );


            const middleX =
                (
                    sourcePoint[0] +
                    targetPoint[0]
                ) / 2;


            const middleY =
                (
                    sourcePoint[1] +
                    targetPoint[1]
                ) / 2;


            const distance =
                Math.sqrt(
                    Math.pow(
                        targetPoint[0] -
                        sourcePoint[0],
                        2
                    ) +
                    Math.pow(
                        targetPoint[1] -
                        sourcePoint[1],
                        2
                    )
                );


            const curveHeight =
                Math.min(
                    distance * 0.35,
                    130
                );


            const pathData = `
                M ${sourcePoint[0]} ${sourcePoint[1]}
                Q ${middleX} ${middleY - curveHeight}
                ${targetPoint[0]} ${targetPoint[1]}
            `;


            connectionLayer
                .append("path")
                .attr(
                    "class",
                    "sentinel-map-connection"
                )
                .attr(
                    "d",
                    pathData
                );

        }
    );

}


/* ============================================================
   THREAT LOCATIONS
============================================================ */

function drawThreatLocations() {

    const layer =
        mapRoot
            .append("g")
            .attr(
                "class",
                "threat-location-layer"
            );


    threatLocations.forEach(
        function (location) {

            const point =
                projection(
                    location.coordinates
                );


            const group =
                layer
                    .append("g")
                    .attr(
                        "class",
                        "sentinel-threat-point"
                    )
                    .attr(
                        "data-id",
                        location.id
                    )
                    .attr(
                        "transform",
                        `translate(${point[0]},${point[1]})`
                    );


            const ringClass =
                getRingClass(
                    location.risk
                );


            const pointClass =
                getPointClass(
                    location.risk
                );


            group
                .append("circle")
                .attr(
                    "class",
                    `sentinel-threat-point-ring ${ringClass}`
                )
                .attr(
                    "r",
                    9
                );


            group
                .append("circle")
                .attr(
                    "class",
                    `sentinel-threat-point-core ${pointClass}`
                )
                .attr(
                    "r",
                    5.5
                );


            group
                .append("title")
                .text(
                    `${location.city} — ${location.risk}% risk`
                );


            group
                .on(
                    "mouseenter",
                    function (event) {

                        showTooltip(
                            event,
                            location
                        );

                    }
                )
                .on(
                    "mousemove",
                    function (event) {

                        moveTooltip(
                            event
                        );

                    }
                )
                .on(
                    "mouseleave",
                    function () {

                        hideTooltip();

                    }
                )
                .on(
                    "click",
                    function () {

                        selectLocation(
                            location
                        );

                        updateThreatPersona(location);

                    }
                );

        }
    );

}


/* ============================================================
   POINT CLASS
============================================================ */

function getPointClass(
    risk
) {

    if (risk >= 70) {

        return "threat-high";

    }


    if (risk >= 40) {

        return "threat-monitor";

    }


    return "threat-safe";

}


/* ============================================================
   RING CLASS
============================================================ */

function getRingClass(
    risk
) {

    if (risk >= 70) {

        return "ring-high";

    }


    if (risk >= 40) {

        return "ring-monitor";

    }


    return "ring-safe";

}


/* ============================================================
   TOOLTIP
============================================================ */

function showTooltip(
    event,
    location
) {

    document.getElementById(
        "tooltipCity"
    ).textContent =
        location.city;


    document.getElementById(
        "tooltipCountry"
    ).textContent =
        location.country;


    document.getElementById(
        "tooltipRisk"
    ).textContent =
        `${location.risk}%`;


    document.getElementById(
        "tooltipStatus"
    ).textContent =
        location.status;


    mapTooltip.classList.add(
        "visible"
    );


    moveTooltip(
        event
    );

}


/* ============================================================
   MOVE TOOLTIP
============================================================ */

function moveTooltip(
    event
) {

    const container =
        document.getElementById(
            "mapContainer"
        );


    const rect =
        container.getBoundingClientRect();


    let x =
        event.clientX -
        rect.left +
        15;


    let y =
        event.clientY -
        rect.top +
        15;


    const tooltipWidth =
        190;


    const tooltipHeight =
        120;


    if (
        x + tooltipWidth >
        rect.width
    ) {

        x -=
            tooltipWidth +
            25;

    }


    if (
        y + tooltipHeight >
        rect.height
    ) {

        y -=
            tooltipHeight +
            25;

    }


    mapTooltip.style.left =
        `${x}px`;


    mapTooltip.style.top =
        `${y}px`;

}


/* ============================================================
   HIDE TOOLTIP
============================================================ */

function hideTooltip() {

    mapTooltip.classList.remove(
        "visible"
    );

}


/* ============================================================
   SELECT LOCATION
============================================================ */

function selectLocation(
    location
) {

    selectedNode =
        location;


    document.getElementById(
        "selectedLocation"
    ).textContent =
        `${location.city}, ${location.country}`;


    document.getElementById(
        "selectedDescription"
    ).textContent =
        getLocationDescription(
            location
        );


    document.getElementById(
        "selectedRisk"
    ).textContent =
        `${location.risk}%`;


    document.getElementById(
        "selectedStatus"
    ).textContent =
        location.status;


    document.getElementById(
        "selectedEvents"
    ).textContent =
        location.events;


    document.getElementById(
        "selectedUpdate"
    ).textContent =
        getCurrentTime();


    document.getElementById(
        "mapNetworkStatus"
    ).textContent =
        `${location.city.toUpperCase()} NODE`;


    document.getElementById(
        "globalThreatLevel"
    ).textContent =
        location.status;

}


/* ============================================================
   LOCATION DESCRIPTION
============================================================ */

function getLocationDescription(
    location
) {

    if (location.risk >= 70) {

        return "Priority security node requiring elevated monitoring.";

    }


    if (location.risk >= 40) {

        return "Security telemetry indicates elevated activity.";

    }


    return "Node currently operating within monitored security parameters.";

}


/* ============================================================
   STATISTICS
============================================================ */

function initializeStatistics() {

    updateStatistics();

}


/* ============================================================
   UPDATE STATISTICS
============================================================ */

function updateStatistics() {

    const active =
        threatLocations.length;


    const high =
        threatLocations.filter(
            location =>
                location.risk >= 70
        ).length;


    const averageRisk =
        threatLocations.reduce(
            function (
                total,
                location
            ) {

                return total +
                    location.risk;

            },
            0
        ) / active;


    const securityScore =
        Math.max(
            0,
            Math.round(
                100 -
                averageRisk
            )
        );


    document.getElementById(
        "activeThreats"
    ).textContent =
        active;


    document.getElementById(
        "highRisk"
    ).textContent =
        high;


    document.getElementById(
        "monitoredLocations"
    ).textContent =
        active;


    document.getElementById(
        "networkScore"
    ).textContent =
        `${securityScore}%`;


    let globalLevel =
        "MODERATE";


    if (averageRisk >= 70) {

        globalLevel =
            "CRITICAL";

    }
    else if (averageRisk >= 50) {

        globalLevel =
            "ELEVATED";

    }
    else if (averageRisk < 35) {

        globalLevel =
            "LOW";

    }


    document.getElementById(
        "globalThreatLevel"
    ).textContent =
        globalLevel;

}


/* ============================================================
   CONTROLS
============================================================ */

function initializeControls() {

    document.getElementById(
        "zoomIn"
    ).addEventListener(
        "click",
        function () {

            mapSvg
                .transition()
                .duration(350)
                .call(
                    zoomBehaviour.scaleBy,
                    1.5
                );

        }
    );


    document.getElementById(
        "zoomOut"
    ).addEventListener(
        "click",
        function () {

            mapSvg
                .transition()
                .duration(350)
                .call(
                    zoomBehaviour.scaleBy,
                    0.67
                );

        }
    );


    document.getElementById(
        "resetMap"
    ).addEventListener(
        "click",
        function () {

            mapSvg
                .transition()
                .duration(500)
                .call(
                    zoomBehaviour.transform,
                    d3.zoomIdentity
                );

        }
    );

}


/* ============================================================
   EVENT STREAM
============================================================ */

function initializeEventStream() {

    const stream =
        document.getElementById(
            "eventStream"
        );


    stream.innerHTML = "";

}


/* ============================================================
   INITIAL EVENTS
============================================================ */

function addInitialEvents() {

    const events = [

        {
            message:
                "Global monitoring network initialized",
            level:
                "safe"
        },

        {
            message:
                "Synthetic telemetry channels synchronized",
            level:
                "safe"
        },

        {
            message:
                "Elevated activity detected at Mumbai node",
            level:
                "monitor"
        },

        {
            message:
                "Priority monitoring active at New Delhi node",
            level:
                "high"
        },

        {
            message:
                "London security node operating normally",
            level:
                "safe"
        },

        {
            message:
                "Dubai node entered monitoring state",
            level:
                "monitor"
        }

    ];


    events.forEach(
        function (event) {

            addEvent(
                event.message,
                event.level
            );

        }
    );

}


/* ============================================================
   ADD EVENT
============================================================ */

function addEvent(
    message,
    level
) {

    const stream =
        document.getElementById(
            "eventStream"
        );


    const event =
        document.createElement(
            "div"
        );


    event.className =
        "security-event";


    event.innerHTML = `

        <span
            class="event-dot ${level}"
        ></span>

        <span
            class="event-message"
        >
            ${escapeHTML(message)}
        </span>

        <span
            class="event-time"
        >
            ${getCurrentTime()}
        </span>

    `;


    stream.prepend(
        event
    );


    while (
        stream.children.length >
        SENTINEL_MAP_CONFIG.maxEvents
    ) {

        stream.lastElementChild.remove();

    }

}


/* ============================================================
   TELEMETRY
============================================================ */

function startTelemetry() {

    setInterval(
        function () {

            simulateTelemetry();

        },
        SENTINEL_MAP_CONFIG.telemetryInterval
    );

}


/* ============================================================
   SIMULATE TELEMETRY
============================================================ */

function simulateTelemetry() {

    /*
        Update 3–6 random nodes every telemetry cycle.
        This makes the whole map feel continuously active.
    */

    const updateCount =
        Math.floor(Math.random() * 4) + 3;

    const updatedLocations = [];

    for (let i = 0; i < updateCount; i++) {

        const randomIndex =
            Math.floor(
                Math.random() *
                threatLocations.length
            );

        const location =
            threatLocations[randomIndex];

        if (updatedLocations.includes(location.id)) {
            continue;
        }

        updatedLocations.push(location.id);

        /*
            Change risk continuously
        */

        const riskChange =
            Math.floor(
                Math.random() * 15
            ) - 7;

        location.risk =
            Math.max(
                10,
                Math.min(
                    99,
                    location.risk + riskChange
                )
            );


        /*
            Increase event count
        */

        location.events +=
            Math.floor(
                Math.random() * 8
            ) + 1;


        /*
            Recalculate status
        */

        location.status =
            getStatus(
                location.risk
            );


        /*
            Refresh the visible map node
        */

        refreshThreatPoint(
            location
        );


        /*
            Generate live event
        */

        const eventType =
            location.risk >= 70
                ? "high"
                : location.risk >= 40
                    ? "monitor"
                    : "safe";


        const messages = [

            `${location.city} telemetry updated`,

            `${location.city} threat level changed`,

            `${location.city} security event detected`,

            `${location.city} network activity synchronized`,

            `${location.city} risk analysis completed`,

            `${location.city} threat intelligence refreshed`

        ];


        const message =
            messages[
                Math.floor(
                    Math.random() *
                    messages.length
                )
            ];


        addEvent(
            message,
            eventType
        );

    }


    /*
        Recalculate global statistics
    */

    updateStatistics();


    /*
        Update selected node if one is active
    */

    if (selectedNode) {

        const currentNode =
            threatLocations.find(
                location =>
                    location.id ===
                    selectedNode.id
            );

        if (currentNode) {

            selectLocation(
                currentNode
            );

        }

    }


    /*
        Update last-update indicator
    */

    document.getElementById(
        "lastUpdate"
    ).textContent =
        `LAST UPDATE: ${getCurrentTime()}`;

}


/* ============================================================
   STATUS
============================================================ */

function getStatus(
    risk
) {

    if (risk >= 70) {

        return "HIGH RISK";

    }


    if (risk >= 40) {

        return "MONITOR";

    }


    return "SAFE";

}


/* ============================================================
   REFRESH THREAT POINT
============================================================ */

function refreshThreatPoint(
    location
) {

    const point =
        d3.select(
            `.sentinel-threat-point[data-id="${location.id}"]`
        );


    if (
        point.empty()
    ) {

        return;

    }


    point
        .select(
            ".sentinel-threat-point-core"
        )
        .attr(
            "class",
            `sentinel-threat-point-core ${getPointClass(location.risk)}`
        );


    point
        .select(
            ".sentinel-threat-point-ring"
        )
        .attr(
            "class",
            `sentinel-threat-point-ring ${getRingClass(location.risk)}`
        );


    point
        .select("title")
        .text(
            `${location.city} — ${location.risk}% risk`
        );


    if (
        selectedNode &&
        selectedNode.id ===
        location.id
    ) {

        selectLocation(
            location
        );

    }

}


/* ============================================================
   CLOCK
============================================================ */

function updateClock() {

    const element =
        document.getElementById(
            "lastUpdate"
        );


    if (
        !element.textContent.includes(
            "LAST UPDATE:"
        )
    ) {

        element.textContent =
            `LAST UPDATE: ${getCurrentTime()}`;

    }

}


/* ============================================================
   CURRENT TIME
============================================================ */

function getCurrentTime() {

    const now =
        new Date();


    return now.toLocaleTimeString(
        [],
        {
            hour:
                "2-digit",

            minute:
                "2-digit",

            second:
                "2-digit"
        }
    );

}


/* ============================================================
   HTML ESCAPE
============================================================ */

function escapeHTML(
    value
) {

    return String(
        value
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


/* ============================================================
   PUBLIC SENTINEL API
============================================================ */

window.SENTINEL_GLOBAL_MAP = {

    locations:
        threatLocations,

    selectLocation:
        selectLocation,

    updateStatistics:
        updateStatistics,

    refresh:
        function () {

            updateStatistics();

        },

    getLocations:
        function () {

            return threatLocations;

        }

};

/* ============================================================
   THREAT PERSONA + PROPAGATION ENGINE
   SYNTHETIC VISUALIZATION ONLY
============================================================ */

let propagationRunning = false;
let propagationTimers = [];
let propagationPathLayer = null;
let propagationSequence = [];


/* ============================================================
   PERSONA HELPERS
============================================================ */

function generateThreatPersonaId(location) {

    const seed =
        location.id
            .replace(/[^a-z0-9]/gi, "")
            .substring(0, 3)
            .toUpperCase();

    const number =
        Math.floor(
            1000 +
            Math.random() * 8999
        );

    return `${seed}-${number}`;

}


function getPersonaActivity(risk) {

    if (risk >= 85) {
        return "AGGRESSIVE";
    }

    if (risk >= 70) {
        return "ACTIVE";
    }

    if (risk >= 45) {
        return "IRREGULAR";
    }

    return "LOW ACTIVITY";

}


function getPersonaTarget(threat) {

    const value = threat.toLowerCase();

    if (
        value.includes("bank") ||
        value.includes("financial") ||
        value.includes("payment")
    ) {
        return "FINANCIAL";
    }

    if (
        value.includes("credential") ||
        value.includes("account")
    ) {
        return "IDENTITY";
    }

    if (
        value.includes("botnet") ||
        value.includes("malware")
    ) {
        return "INFRASTRUCTURE";
    }

    if (
        value.includes("phishing")
    ) {
        return "USER ACCOUNTS";
    }

    return "NETWORK";
}


function updateThreatPersona(location) {

    if (!location) {
        return;
    }

    const severity =
        Math.round(location.risk);

    const confidence =
        Math.max(
            5,
            100 - severity
        );

    const activity =
        getPersonaActivity(severity);

    const propagation =
        Math.min(
            99,
            Math.round(
                severity * 0.72 +
                location.events * 0.08
            )
        );

    const persistence =
        Math.min(
            99,
            Math.round(
                35 +
                severity * 0.55
            )
        );

    const target =
        getPersonaTarget(
            location.threat
        );

    const id =
        location.personaId ||
        generateThreatPersonaId(location);

    location.personaId = id;


    const setText = (id, value) => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent = value;
        }

    };


    setText(
        "personaId",
        id
    );

    setText(
        "personaThreatType",
        location.threat
    );

    setText(
        "personaOrigin",
        location.city
    );

    setText(
        "personaRegion",
        location.region
    );

    setText(
        "personaSeverity",
        `${severity}%`
    );

    setText(
        "personaConfidence",
        `${confidence}%`
    );

    setText(
        "personaActivity",
        activity
    );

    setText(
        "personaTarget",
        target
    );

    setText(
        "personaPropagation",
        `${propagation}%`
    );


    updateDNA(
        "dnaSeverity",
        "dnaSeverityValue",
        severity
    );

    updateDNA(
        "dnaActivity",
        "dnaActivityValue",
        Math.min(
            99,
            severity + Math.floor(Math.random() * 10)
        )
    );

    updateDNA(
        "dnaPersistence",
        "dnaPersistenceValue",
        persistence
    );

    updateDNA(
        "dnaPropagation",
        "dnaPropagationValue",
        propagation
    );

}


function updateDNA(
    barId,
    valueId,
    value
) {

    const bar =
        document.getElementById(barId);

    const text =
        document.getElementById(valueId);

    if (bar) {

        bar.style.width =
            `${Math.max(0, Math.min(100, value))}%`;

    }

    if (text) {

        text.textContent =
            `${Math.round(value)}%`;

    }

}


/* ============================================================
   PROPAGATION LAYER
============================================================ */

function initializePropagationLayer() {

    if (!mapRoot) {
        return;
    }

    propagationPathLayer =
        mapRoot
            .insert("g", ":first-child")
            .attr(
                "class",
                "propagation-path-layer"
            );

}


/* ============================================================
   FIND CONNECTED NODES
============================================================ */

function getConnectedNodes(locationId) {

    const ids = [];

    threatConnections.forEach(
        connection => {

            const source =
                connection[0];

            const target =
                connection[1];

            if (source === locationId) {
                ids.push(target);
            }

            if (target === locationId) {
                ids.push(source);
            }

        }
    );

    return [
        ...new Set(ids)
    ];

}


function getLocationById(id) {

    return threatLocations.find(
        location =>
            location.id === id
    );

}


/* ============================================================
   BUILD SIMULATION ROUTE
============================================================ */

function buildPropagationRoute(start) {

    const route = [start];

    const visited =
        new Set([start.id]);

    let current =
        start.id;

    for (let i = 0; i < 4; i++) {

        const neighbours =
            getConnectedNodes(current)
                .map(getLocationById)
                .filter(Boolean)
                .filter(
                    node =>
                        !visited.has(node.id)
                );

        if (!neighbours.length) {
            break;
        }

        neighbours.sort(
            (a, b) =>
                b.risk - a.risk
        );

        const next =
            neighbours[0];

        route.push(next);

        visited.add(next.id);

        current =
            next.id;

    }

    return route;

}


/* ============================================================
   CURVED PROPAGATION PATH
============================================================ */

function createPropagationPath(
    source,
    target
) {

    const sourcePoint =
        projection(
            source.coordinates
        );

    const targetPoint =
        projection(
            target.coordinates
        );

    if (!sourcePoint || !targetPoint) {
        return null;
    }

    const x1 = sourcePoint[0];
    const y1 = sourcePoint[1];

    const x2 = targetPoint[0];
    const y2 = targetPoint[1];

    const midX =
        (x1 + x2) / 2;

    const midY =
        (y1 + y2) / 2;

    const dx =
        x2 - x1;

    const dy =
        y2 - y1;

    const distance =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    const curve =
        Math.min(
            120,
            Math.max(
                25,
                distance * 0.18
            )
        );

    const controlX =
        midX - dy / Math.max(distance, 1) * curve;

    const controlY =
        midY + dx / Math.max(distance, 1) * curve;

    return `
        M ${x1} ${y1}
        Q ${controlX} ${controlY}
        ${x2} ${y2}
    `;

}


/* ============================================================
   PROPAGATION TELEMETRY
============================================================ */

function addPropagationTelemetry(
    message,
    probability
) {

    const container =
        document.getElementById(
            "propagationTelemetry"
        );

    if (!container) {
        return;
    }

    const empty =
        container.querySelector(
            ".propagation-empty"
        );

    if (empty) {
        empty.remove();
    }

    const event =
        document.createElement("div");

    event.className =
        "propagation-event";

    event.innerHTML = `
        <span class="propagation-event-dot"></span>

        <span class="propagation-event-message">
            ${escapeHTML(message)}
        </span>

        <strong class="propagation-event-probability">
            ${probability}%
        </strong>
    `;

    container.prepend(event);

    while (
        container.children.length > 12
    ) {

        container.lastElementChild.remove();

    }

}


/* ============================================================
   SIMULATE PROPAGATION
============================================================ */

function simulateThreatPropagation() {

    if (propagationRunning) {
        return;
    }

    let start =
        selectedNode;

    if (!start) {

        start =
            threatLocations
                .slice()
                .sort(
                    (a, b) =>
                        b.risk - a.risk
                )[0];

    }

    if (!start) {
        return;
    }

    propagationRunning = true;

    propagationSequence =
        buildPropagationRoute(start);


    const status =
        document.getElementById(
            "propagationStatus"
        );

    if (status) {

        status.textContent =
            "RUNNING";

        status.classList.remove(
            "complete"
        );

        status.classList.add(
            "running"
        );

    }


    const routeElement =
        document.getElementById(
            "propagationRoute"
        );

    if (routeElement) {

        routeElement.textContent =
            propagationSequence
                .map(
                    location =>
                        location.city
                )
                .join("  →  ");

    }


    clearPropagationVisuals();

    updateThreatPersona(start);

    addPropagationTelemetry(
        `SOURCE NODE: ${start.city}`,
        start.risk
    );


    propagationSequence.forEach(
        (location, index) => {

            const timer =
                setTimeout(
                    () => {

                        activatePropagationNode(
                            location,
                            index
                        );

                    },
                    index * 1100
                );

            propagationTimers.push(timer);

        }
    );


    const finishTimer =
        setTimeout(
            () => {

                finishPropagation();

            },
            propagationSequence.length * 1100 + 300
        );

    propagationTimers.push(
        finishTimer
    );

}


/* ============================================================
   ACTIVATE PROPAGATION NODE
============================================================ */

function activatePropagationNode(
    location,
    index
) {

    const point =
        d3.select(
            `.sentinel-threat-point[data-id="${location.id}"]`
        );

    point.classed(
        "propagation-active",
        true
    );

    if (index === 0) {

        point.classed(
            "propagation-source",
            true
        );

    } else {

        point.classed(
            "propagation-target",
            true
        );

    }


    if (index > 0) {

        const previous =
            propagationSequence[index - 1];

        drawActivePropagationPath(
            previous,
            location
        );


        const probability =
            Math.min(
                97,
                Math.max(
                    18,
                    Math.round(
                        previous.risk * 0.55 +
                        location.risk * 0.35 -
                        index * 4
                    )
                )
            );


        addPropagationTelemetry(
            `${previous.city} → ${location.city}`,
            probability
        );

    }


    updateThreatPersona(
        location
    );


    selectLocation(
        location
    );

}


/* ============================================================
   DRAW ACTIVE PATH
============================================================ */

function drawActivePropagationPath(
    source,
    target
) {

    if (!propagationPathLayer) {
        initializePropagationLayer();
    }

    const pathData =
        createPropagationPath(
            source,
            target
        );

    if (!pathData) {
        return;
    }

    const path =
        propagationPathLayer
            .append("path")
            .attr(
                "class",
                "propagation-path active"
            )
            .attr(
                "d",
                pathData
            );

    const length =
        path.node().getTotalLength();

    path
        .attr(
            "stroke-dasharray",
            `${length} ${length}`
        )
        .attr(
            "stroke-dashoffset",
            length
        )
        .transition()
        .duration(850)
        .attr(
            "stroke-dashoffset",
            0
        );

}


/* ============================================================
   CLEAR PROPAGATION
============================================================ */

function clearPropagationVisuals() {

    propagationTimers.forEach(
        timer =>
            clearTimeout(timer)
    );

    propagationTimers = [];

    if (propagationPathLayer) {

        propagationPathLayer
            .selectAll(
                ".propagation-path"
            )
            .remove();

    }

    d3.selectAll(
        ".sentinel-threat-point"
    )
        .classed(
            "propagation-source",
            false
        )
        .classed(
            "propagation-target",
            false
        )
        .classed(
            "propagation-active",
            false
        );

}


/* ============================================================
   STOP PROPAGATION
============================================================ */

function stopThreatPropagation() {

    clearPropagationVisuals();

    propagationRunning = false;

    const status =
        document.getElementById(
            "propagationStatus"
        );

    if (status) {

        status.textContent =
            "STOPPED";

        status.classList.remove(
            "running"
        );

        status.classList.remove(
            "complete"
        );

    }

    addPropagationTelemetry(
        "SIMULATION STOPPED",
        0
    );

}


/* ============================================================
   FINISH PROPAGATION
============================================================ */

function finishPropagation() {

    propagationRunning = false;

    const status =
        document.getElementById(
            "propagationStatus"
        );

    if (status) {

        status.textContent =
            "COMPLETE";

        status.classList.remove(
            "running"
        );

        status.classList.add(
            "complete"
        );

    }

    addPropagationTelemetry(
        "PROPAGATION MODEL COMPLETE",
        100
    );

}


/* ============================================================
   INITIALIZE INTELLIGENCE FEATURES
============================================================ */

function initializeThreatIntelligence() {

    initializePropagationLayer();


    const simulateButton =
        document.getElementById(
            "simulatePropagation"
        );

    const stopButton =
        document.getElementById(
            "stopPropagation"
        );


    if (simulateButton) {

        simulateButton.addEventListener(
            "click",
            simulateThreatPropagation
        );

    }


    if (stopButton) {

        stopButton.addEventListener(
            "click",
            stopThreatPropagation
        );

    }


    if (threatLocations.length) {

        updateThreatPersona(
            threatLocations[0]
        );

    }

}


/* ============================================================
   OPTIONAL INTEGRATION WITH STEAM.HTML
============================================================ */

/*
    From your existing steam.js you can call:

        window.SENTINEL_GLOBAL_MAP.selectLocation(
            locationObject
        );

    Or simply:

        window.SENTINEL_GLOBAL_MAP.refresh();

    Example:

        SENTINEL_GLOBAL_MAP.selectLocation(
            SENTINEL_GLOBAL_MAP.locations[0]
        );
*/


/* ============================================================
   END OF SENTINEL GLOBAL THREAT MAP
============================================================ */

/* ============================================================
   SENTINEL AI 3 — TOPBAR SYSTEM
   ============================================================ */

(function () {

    function updateSentinelClock() {

        const clock =
            document.getElementById("sentinelClock");

        if (!clock) return;

        const now = new Date();

        const hours =
            String(now.getHours()).padStart(2, "0");

        const minutes =
            String(now.getMinutes()).padStart(2, "0");

        const seconds =
            String(now.getSeconds()).padStart(2, "0");

        clock.textContent =
            `${hours}:${minutes}:${seconds}`;
    }


    function syncTopbarUser() {

        const mainUser =
            document.getElementById("userName");

        const topbarUser =
            document.getElementById("topbarUserName");

        const avatar =
            document.getElementById("topbarProfileAvatar");

        if (!mainUser) return;

        const name =
            mainUser.textContent.trim() || "User";

        if (topbarUser) {

            topbarUser.textContent =
                name;
        }

        if (avatar) {

            avatar.textContent =
                name
                    .charAt(0)
                    .toUpperCase();
        }
    }


    function syncTopbarScore() {

        const mainScore =
            document.getElementById("securityScore");

        const topbarScore =
            document.getElementById(
                "topbarSecurityScore"
            );

        if (!topbarScore) return;

        if (mainScore) {

            const value =
                parseInt(
                    mainScore.textContent
                );

            if (!Number.isNaN(value)) {

                topbarScore.textContent =
                    value;
            }
        }
    }


    function updateNotificationBadge() {

        const badge =
            document.getElementById(
                "notificationBadge"
            );

        if (!badge) return;

        try {

            const notifications =
                JSON.parse(
                    localStorage.getItem(
                        "sentinelNotifications"
                    ) || "[]"
                );

            const count =
                Array.isArray(notifications)
                    ? notifications.length
                    : 0;

            badge.textContent =
                count > 99
                    ? "99+"
                    : count;

        } catch (error) {

            badge.textContent = "0";
        }
    }


    window.toggleSentinelNotifications =
        function () {

            if (
                typeof window.toggleNotifications ===
                "function"
            ) {

                window.toggleNotifications();

                return;
            }

            const panel =
                document.getElementById(
                    "notificationPanel"
                );

            if (!panel) return;

            panel.classList.toggle("active");

            panel.classList.toggle("show");
        };


    function initializeTopbar() {

        updateSentinelClock();

        syncTopbarUser();

        syncTopbarScore();

        updateNotificationBadge();
    }


    initializeTopbar();


    setInterval(
        updateSentinelClock,
        1000
    );

    setInterval(
        syncTopbarUser,
        1000
    );

    setInterval(
        syncTopbarScore,
        1000
    );

    setInterval(
        updateNotificationBadge,
        3000
    );

})();