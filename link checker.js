/* ============================================================
   SENTINEL AI 3
   LINK SECURITY SCANNER
   DEBUGGED + IMPROVED VERSION
   ============================================================ */


/* ============================================================
   GLOBAL CONFIGURATION
   ============================================================ */

const SENTINEL_LINK_CONFIG = {

    latestScanKey:
        "sentinelLatestLinkScan",

    historyKey:
        "sentinelLinkHistory",

    scanCountKey:
        "sentinelLinksScanned",

    maximumHistory:
        50,

    scanDelay:
        1800

};


/* ============================================================
   GLOBAL STATE
   ============================================================ */

let totalScans =
    Number(
        localStorage.getItem(
            SENTINEL_LINK_CONFIG.scanCountKey
        )
    ) || 0;

let scanInProgress = false;


/* ============================================================
   TOP BAR CONTROLS
   ============================================================ */

const SENTINEL_THEME_KEY = "sentinelTheme";

function updateThemeButtonState() {

    const toggleButton = getElement("themeToggleBtn");
    const activeTheme = document.body.classList.contains("dark-mode")
        ? "dark"
        : "light";

    if (!toggleButton) {
        return;
    }

    toggleButton.setAttribute(
        "aria-label",
        activeTheme === "light" ? "Switch to dark mode" : "Switch to light mode"
    );
    toggleButton.title = activeTheme === "light"
        ? "Switch to dark mode"
        : "Switch to light mode";
    toggleButton.innerHTML = activeTheme === "light"
        ? '<span class="topbar-button-icon">☾</span>'
        : '<span class="topbar-button-icon">☀</span>';
}

function applySentinelTheme(theme) {

    const safeTheme = theme === "dark" ? "dark" : "light";

    document.body.classList.remove("dark-mode", "light-mode");
    document.body.classList.add(`${safeTheme}-mode`);
    localStorage.setItem(SENTINEL_THEME_KEY, safeTheme);
    updateThemeButtonState();
}

function toggleSentinelTheme() {

    const activeTheme = document.body.classList.contains("dark-mode")
        ? "dark"
        : "light";

    applySentinelTheme(activeTheme === "dark" ? "light" : "dark");
}

function restoreDefaultMode() {

    applySentinelTheme(localStorage.getItem(SENTINEL_THEME_KEY) || "light");
}

function talkToAI() {

    window.alert("Sentinel AI is ready to help with your link security scan.");
}

function toggleSentinelNotifications() {

    const notifications = JSON.parse(
        localStorage.getItem("sentinelNotifications") || "[]"
    );

    window.alert(
        notifications.length
            ? `You have ${notifications.length} security notification${notifications.length === 1 ? "" : "s"}.`
            : "No new security notifications."
    );
}

function logout() {

    localStorage.removeItem("sentinelAccess");
    localStorage.removeItem("sentinelLoginTime");
    window.location.href = "login.html";
}

function initializeTopBar() {

    const user = localStorage.getItem("sentinelUser") || "User";
    const userName = getElement("userName");
    const topbarUserName = getElement("topbarUserName");
    const profileAvatar = getElement("topbarProfileAvatar");

    if (userName) {
        userName.textContent = user;
    }

    if (topbarUserName) {
        topbarUserName.textContent = user;
    }

    if (profileAvatar) {
        profileAvatar.textContent = user.charAt(0).toUpperCase();
    }

    const updateClock = () => {
        const clock = getElement("sentinelClock");

        if (clock) {
            clock.textContent = new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            });
        }
    };

    updateClock();
    window.setInterval(updateClock, 1000);
    applySentinelTheme(localStorage.getItem(SENTINEL_THEME_KEY) || "light");
}


/* ============================================================
   SAFE DOM HELPER
   ============================================================ */

function getElement(id) {

    return document.getElementById(id);

}


/* ============================================================
   SAFE LOCAL STORAGE JSON READER
   ============================================================ */

function readJSON(key, fallback) {

    try {

        const value =
            localStorage.getItem(key);

        if (!value) {
            return fallback;
        }

        const parsed =
            JSON.parse(value);

        return parsed;

    }

    catch (error) {

        console.warn(
            "Sentinel AI storage read failed:",
            key,
            error
        );

        return fallback;

    }

}


/* ============================================================
   NORMALIZE URL
   ============================================================ */

function normalizeURLInput(value) {

    let text =
        String(value || "").trim();

    if (!text) {
        return "";
    }

    /*
       Allow users to enter:

       example.com

       instead of requiring:

       https://example.com
    */

    if (
        !text.startsWith("http://") &&
        !text.startsWith("https://")
    ) {

        text =
            "https://" + text;

    }

    return text;

}


/* ============================================================
   SCAN LINK
   ============================================================ */

function scanLink() {

    const input =
        getElement("urlInput");

    const button =
        getElement("scanButton");

    const animation =
        getElement("scanAnimation");

    const result =
        getElement("resultBox");


    /* --------------------------------------------------------
       ELEMENT CHECK
       -------------------------------------------------------- */

    if (!input) {

        console.error(
            "Sentinel AI: #urlInput was not found."
        );

        return;

    }


    /* --------------------------------------------------------
       PREVENT DOUBLE SCANNING
       -------------------------------------------------------- */

    if (scanInProgress) {
        return;
    }


    /* --------------------------------------------------------
       READ INPUT
       -------------------------------------------------------- */

    const rawText =
        input.value.trim();


    /* --------------------------------------------------------
       EMPTY INPUT
       -------------------------------------------------------- */

    if (!rawText) {

        showResult(

            "WARNING",

            "Please enter a link to scan.",

            0,

            "",

            "warning"

        );

        updateCheckerStatus(
            "ONLINE",
            "online"
        );

        return;

    }


    /* --------------------------------------------------------
       NORMALIZE URL
       -------------------------------------------------------- */

    const normalizedURL =
        normalizeURLInput(rawText);


    /* --------------------------------------------------------
       URL VALIDATION
       -------------------------------------------------------- */

    let url;

    try {

        url =
            new URL(normalizedURL);

    }

    catch (error) {

        showResult(

            "INVALID LINK",

            "Please enter a valid web address.",

            0,

            rawText,

            "danger"

        );

        updateCheckerStatus(
            "ONLINE",
            "online"
        );

        return;

    }


    /* --------------------------------------------------------
       ONLY HTTP / HTTPS
       -------------------------------------------------------- */

    if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
    ) {

        showResult(

            "BLOCKED",

            "Only HTTP and HTTPS links can be scanned.",

            100,

            url.href,

            "danger"

        );

        updateCheckerStatus(
            "BLOCKED",
            "danger"
        );

        return;

    }


    /* --------------------------------------------------------
       START SCAN
       -------------------------------------------------------- */

    scanInProgress = true;


    if (result) {

        result.classList.add(
            "hidden"
        );

    }


    if (animation) {

        animation.classList.remove(
            "hidden"
        );

    }


    if (button) {

        button.disabled = true;

        button.textContent =
            "ANALYZING...";

    }


    updateCheckerStatus(
        "SCANNING",
        "scanning"
    );


    /* --------------------------------------------------------
       SCANNING ANIMATION
       -------------------------------------------------------- */

    setTimeout(
        function () {

            let analysis;

            try {

                analysis =
                    analyzeURL(url);

            }

            catch (error) {

                console.error(
                    "Sentinel AI URL analysis error:",
                    error
                );

                analysis = {

                    status:
                        "ERROR",

                    message:
                        "The local scanner encountered an unexpected error.",

                    risk:
                        0,

                    type:
                        "danger"

                };

            }


            /* ---------------------------------------------
               FINISH ANIMATION
            --------------------------------------------- */

            if (animation) {

                animation.classList.add(
                    "hidden"
                );

            }


            if (button) {

                button.disabled = false;

                button.textContent =
                    "SCAN LINK";

            }


            /* ---------------------------------------------
               INCREMENT SCAN COUNT
            --------------------------------------------- */

            totalScans++;

            try {

                localStorage.setItem(

                    SENTINEL_LINK_CONFIG.scanCountKey,

                    String(totalScans)

                );

            }

            catch (error) {

                console.warn(
                    "Could not save scan counter.",
                    error
                );

            }


            updateScanCounter();


            /* ---------------------------------------------
               DISPLAY RESULT
            --------------------------------------------- */

            showResult(

                analysis.status,

                analysis.message,

                analysis.risk,

                url.href,

                analysis.type

            );


            /* ---------------------------------------------
               STATUS
            --------------------------------------------- */

            if (
                analysis.type === "danger"
            ) {

                updateCheckerStatus(
                    "THREAT DETECTED",
                    "danger"
                );

            }

            else if (
                analysis.type === "warning"
            ) {

                updateCheckerStatus(
                    "ELEVATED",
                    "warning"
                );

            }

            else {

                updateCheckerStatus(
                    "ONLINE",
                    "online"
                );

            }


            /* ---------------------------------------------
               SAVE RESULT
            --------------------------------------------- */

            saveLinkResult(

                url.href,

                analysis.status,

                analysis.message,

                analysis.risk

            );


            requestLinkSecurityIntelligence(
                url.href,
                analysis.risk,
                analysis.message
            );


            /* ---------------------------------------------
               RELEASE SCANNER
            --------------------------------------------- */

            scanInProgress = false;

        },

        SENTINEL_LINK_CONFIG.scanDelay

    );

}


/* ============================================================
   AI LINK SECURITY REVIEW
   ============================================================ */

async function requestLinkSecurityIntelligence(
    url,
    localRisk,
    localReason
) {

    try {
        const response = await fetch(
            "/api/link-security",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    url,
                    localRisk,
                    reasons: [localReason]
                })
            }
        );

        if (!response.ok) {
            return;
        }

        const result = await response.json();
        const history = readJSON(
            SENTINEL_LINK_CONFIG.historyKey,
            []
        );

        if (
            result.analysis &&
            Array.isArray(history) &&
            history.length > 0 &&
            history[0].url === url
        ) {
            history[0].reason =
                localReason + " | AI review: " + result.analysis;

            localStorage.setItem(
                SENTINEL_LINK_CONFIG.historyKey,
                JSON.stringify(history)
            );

            localStorage.setItem(
                SENTINEL_LINK_CONFIG.latestScanKey,
                JSON.stringify(history[0])
            );
        }
    } catch {
        // The local URL scanner remains available when the API is offline.
    }
}


/* ============================================================
   URL ANALYSIS ENGINE
   ============================================================ */

function analyzeURL(url) {

    let risk = 0;

    const reasons = [];


    /* --------------------------------------------------------
       BASIC URL DATA
       -------------------------------------------------------- */

    const hostname =
        url.hostname.toLowerCase();

    const fullURL =
        url.href.toLowerCase();


    /* ========================================================
       1. IP ADDRESS DETECTION
       ======================================================== */

    const ipPattern =
        /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;


    if (
        ipPattern.test(hostname)
    ) {

        risk += 25;

        reasons.push(
            "URL uses a direct IP address"
        );

    }


    /* ========================================================
       2. HTTPS CHECK
       ======================================================== */

    if (
        url.protocol !== "https:"
    ) {

        risk += 15;

        reasons.push(
            "Connection does not use HTTPS"
        );

    }


    /* ========================================================
       3. @ SYMBOL
       ======================================================== */

    if (
        fullURL.includes("@")
    ) {

        risk += 25;

        reasons.push(
            "URL contains an @ symbol"
        );

    }


    /* ========================================================
       4. USERNAME / PASSWORD IN URL
       ======================================================== */

    if (
        url.username ||
        url.password
    ) {

        risk += 20;

        reasons.push(
            "URL contains embedded credentials"
        );

    }


    /* ========================================================
       5. EXCESSIVE SUBDOMAINS
       ======================================================== */

    const parts =
        hostname.split(".");

    if (
        parts.length >= 5
    ) {

        risk += 15;

        reasons.push(
            "Unusually large number of subdomains"
        );

    }


    /* ========================================================
       6. SUSPICIOUS SECURITY KEYWORDS
       ======================================================== */

    const suspiciousWords = [

        "login",
        "log-in",
        "signin",
        "sign-in",

        "verify",
        "verification",

        "authenticate",
        "authentication",

        "secure",
        "security",

        "account",
        "account-verification",

        "update",
        "password",
        "reset-password",

        "wallet",

        "payment",
        "pay",

        "bank",
        "banking",

        "confirm",
        "confirmation",

        "recover",
        "recovery",

        "unlock",

        "authorization",

        "urgent",

        "security-alert",

        "claim-prize"

    ];


    const matchedWords = [];


    suspiciousWords.forEach(
        function (word) {

            if (
                fullURL.includes(word)
            ) {

                if (
                    !matchedWords.includes(word)
                ) {

                    matchedWords.push(
                        word
                    );

                }

            }

        }
    );


    if (
        matchedWords.length > 0
    ) {

        risk += Math.min(
            matchedWords.length * 8,
            24
        );

        reasons.push(
            "Contains security-sensitive keywords"
        );

    }


    /* ========================================================
       7. VERY LONG URL
       ======================================================== */

    if (
        fullURL.length > 180
    ) {

        risk += 10;

        reasons.push(
            "URL is unusually long"
        );

    }


    /* ========================================================
       8. VERY LONG HOSTNAME
       ======================================================== */

    if (
        hostname.length > 60
    ) {

        risk += 10;

        reasons.push(
            "Hostname is unusually long"
        );

    }


    /* ========================================================
       9. MANY HYPHENS
       ======================================================== */

    const hyphens =
        (
            hostname.match(/-/g) || []
        ).length;


    if (
        hyphens >= 3
    ) {

        risk += 10;

        reasons.push(
            "Domain contains many hyphens"
        );

    }


    /* ========================================================
       10. ENCODED CHARACTERS
       ======================================================== */

    if (
        /%[0-9a-f]{2}/i.test(
            fullURL
        )
    ) {

        risk += 10;

        reasons.push(
            "URL contains encoded characters"
        );

    }


    /* ========================================================
       11. PUNYCODE
       ======================================================== */

    if (
        hostname.includes("xn--")
    ) {

        risk += 20;

        reasons.push(
            "Domain uses Punycode encoding"
        );

    }


    /* ========================================================
       12. NON-STANDARD PORT
       ======================================================== */

    if (
        url.port &&
        !["80", "443"].includes(
            url.port
        )
    ) {

        risk += 10;

        reasons.push(
            "URL uses a non-standard port"
        );

    }


    /* ========================================================
       13. SUSPICIOUS DOUBLE SLASH IN PATH
       ======================================================== */

    const pathAndQuery =
        (
            url.pathname +
            url.search
        ).toLowerCase();


    if (
        pathAndQuery.includes("//")
    ) {

        risk += 8;

        reasons.push(
            "URL path contains unusual repeated slashes"
        );

    }


    /* ========================================================
       14. EXCESSIVE DOTS IN HOSTNAME
       ======================================================== */

    const dotCount =
        (
            hostname.match(/\./g) || []
        ).length;


    if (
        dotCount >= 5
    ) {

        risk += 10;

        reasons.push(
            "Hostname contains an unusually large number of segments"
        );

    }


    /* ========================================================
       15. SUSPICIOUS DOMAIN SEPARATORS
       ======================================================== */

    if (
        /-{2,}/.test(hostname)
    ) {

        risk += 8;

        reasons.push(
            "Domain contains repeated hyphens"
        );

    }


    /* ========================================================
       16. MULTIPLE SECURITY TERMS
       ======================================================== */

    if (
        matchedWords.length >= 3
    ) {

        risk += 15;

        reasons.push(
            "Multiple security-sensitive terms appear together"
        );

    }


    /* ========================================================
       FINAL SCORE
       ======================================================== */

    risk =
        Math.min(
            Math.max(
                risk,
                0
            ),
            100
        );


    /* ========================================================
       CLASSIFICATION
       ======================================================== */

    if (
        risk >= 60
    ) {

        return {

            status:
                "DANGEROUS",

            message:
                reasons.length > 0
                    ? reasons.join(". ") + "."
                    : "Multiple suspicious indicators were detected.",

            risk:
                risk,

            type:
                "danger",

            reasons:
                reasons

        };

    }


    if (
        risk >= 30
    ) {

        return {

            status:
                "SUSPICIOUS",

            message:
                reasons.length > 0
                    ? reasons.join(". ") + "."
                    : "Some unusual indicators were detected.",

            risk:
                risk,

            type:
                "warning",

            reasons:
                reasons

        };

    }


    return {

        status:
            "SAFE",

        message:
            "No obvious suspicious indicators were detected by the local scanner.",

        risk:
            risk,

        type:
            "safe",

        reasons:
            reasons

    };

}


/* ============================================================
   DISPLAY RESULT
   ============================================================ */

function showResult(

    status,
    message,
    risk,
    url,
    type

) {

    const result =
        getElement("resultBox");

    const title =
        getElement("resultTitle");

    const text =
        getElement("resultText");

    const score =
        getElement("riskScore");

    const resultURL =
        getElement("resultURL");

    const icon =
        getElement("resultIcon");


    if (!result) {

        console.error(
            "Sentinel AI: #resultBox was not found."
        );

        return;

    }


    /* --------------------------------------------------------
       RESULT TYPE
       -------------------------------------------------------- */

    const validTypes = [
        "safe",
        "warning",
        "danger"
    ];

    const safeType =
        validTypes.includes(type)
            ? type
            : "warning";


    /* --------------------------------------------------------
       SHOW RESULT
       -------------------------------------------------------- */

    result.classList.remove(
        "hidden"
    );


    /*
       Preserve the base class.
    */

    result.className =
        "result-box " +
        safeType;


    /* --------------------------------------------------------
       TITLE
       -------------------------------------------------------- */

    if (title) {

        title.textContent =
            status || "UNKNOWN";

    }


    /* --------------------------------------------------------
       MESSAGE
       -------------------------------------------------------- */

    if (text) {

        text.textContent =
            message || "";

    }


    /* --------------------------------------------------------
       SCORE
       -------------------------------------------------------- */

    if (score) {

        score.textContent =
            Math.round(
                Number(risk) || 0
            ) + "/100";

    }


    /* --------------------------------------------------------
       URL
       -------------------------------------------------------- */

    if (resultURL) {

        resultURL.textContent =
            url || "-";

        resultURL.title =
            url || "";

    }


    /* --------------------------------------------------------
       ICON
       -------------------------------------------------------- */

    if (icon) {

        if (
            safeType === "safe"
        ) {

            icon.textContent =
                "✓";

        }

        else if (
            safeType === "warning"
        ) {

            icon.textContent =
                "⚠";

        }

        else {

            icon.textContent =
                "✕";

        }

    }

}


/* ============================================================
   SAVE LINK RESULT
   ============================================================ */

function saveLinkResult(

    url,
    status,
    reason,
    risk = 0

) {

    const scan = {

        url:
            String(url || ""),

        status:
            String(status || "UNKNOWN"),

        reason:
            String(reason || ""),

        risk:
            Number(risk) || 0,

        time:
            new Date().toLocaleString(),

        timestamp:
            Date.now()

    };


    /* --------------------------------------------------------
       LATEST SCAN
       -------------------------------------------------------- */

    try {

        localStorage.setItem(

            SENTINEL_LINK_CONFIG.latestScanKey,

            JSON.stringify(scan)

        );

    }

    catch (error) {

        console.warn(
            "Could not save latest link scan.",
            error
        );

    }


    /* --------------------------------------------------------
       HISTORY
       -------------------------------------------------------- */

    let history =
        readJSON(
            SENTINEL_LINK_CONFIG.historyKey,
            []
        );


    if (
        !Array.isArray(history)
    ) {

        history = [];

    }


    history.unshift(scan);


    history =
        history.slice(
            0,
            SENTINEL_LINK_CONFIG.maximumHistory
        );


    try {

        localStorage.setItem(

            SENTINEL_LINK_CONFIG.historyKey,

            JSON.stringify(history)

        );

    }

    catch (error) {

        console.warn(
            "Could not save link history.",
            error
        );

    }

}


/* ============================================================
   UPDATE CHECKER STATUS
   ============================================================ */

function updateCheckerStatus(

    status,
    type

) {

    const statusText =
        getElement(
            "checkerStatus"
        );

    const statusDot =
        getElement(
            "checkerStatusDot"
        );

    const threatMode =
        getElement(
            "threatMode"
        );


    /* --------------------------------------------------------
       STATUS TEXT
       -------------------------------------------------------- */

    if (statusText) {

        statusText.textContent =
            status;

    }


    /* --------------------------------------------------------
       STATUS DOT
       -------------------------------------------------------- */

    if (statusDot) {

        statusDot.className =
            "checker-status-dot " +
            (type || "online");

    }


    /* --------------------------------------------------------
       THREAT MODE
       -------------------------------------------------------- */

    if (threatMode) {

        switch (type) {

            case "online":

                threatMode.textContent =
                    "MONITORING";

                break;


            case "scanning":

                threatMode.textContent =
                    "ANALYZING";

                break;


            case "warning":

                threatMode.textContent =
                    "ELEVATED";

                break;


            case "danger":

                threatMode.textContent =
                    "THREAT DETECTED";

                break;


            default:

                threatMode.textContent =
                    "MONITORING";

                break;

        }

    }

}


/* ============================================================
   UPDATE SCAN COUNTER
   ============================================================ */

function updateScanCounter() {

    const counter =
        getElement(
            "scanCount"
        );


    if (counter) {

        counter.textContent =
            totalScans;

    }

}


/* ============================================================
   CLEAR LINK HISTORY
   ============================================================ */

function clearLinkHistory() {

    const hasHistory =
        Array.isArray(
            readJSON(
                SENTINEL_LINK_CONFIG.historyKey,
                []
            )
        ) &&
        readJSON(
            SENTINEL_LINK_CONFIG.historyKey,
            []
        ).length > 0;


    if (
        hasHistory &&
        !window.confirm(
            "Delete all saved link scan history?"
        )
    ) {

        return;

    }


    localStorage.removeItem(
        SENTINEL_LINK_CONFIG.historyKey
    );

    localStorage.removeItem(
        SENTINEL_LINK_CONFIG.latestScanKey
    );

    localStorage.removeItem(
        SENTINEL_LINK_CONFIG.scanCountKey
    );

    totalScans = 0;

    updateScanCounter();

    updateCheckerStatus(
        "HISTORY CLEARED",
        "online"
    );

}


/* ============================================================
   ENTER KEY SUPPORT
   ============================================================ */

function initializeEnterKeySupport() {

    const input =
        getElement(
            "urlInput"
        );


    if (!input) {

        return;

    }


    input.addEventListener(

        "keydown",

        function (event) {

            if (
                event.key === "Enter"
            ) {

                event.preventDefault();

                scanLink();

            }

        }

    );

}


/* ============================================================
   SCAN BUTTON KEYBOARD SUPPORT
   ============================================================ */

function initializeScanButton() {

    const button =
        getElement(
            "scanButton"
        );


    if (!button) {

        return;

    }


    button.addEventListener(

        "click",

        function () {

            /*
               The HTML already has onclick="scanLink()".
               This listener is intentionally NOT used
               to call scanLink(), preventing double scans.
            */

        }

    );

}


/* ============================================================
   INITIALIZE LINK CHECKER
   ============================================================ */

function initializeLinkChecker() {

    updateCheckerStatus(
        "ONLINE",
        "online"
    );

    updateScanCounter();

    initializeEnterKeySupport();

}


/* ============================================================
   DASHBOARD SYNC
   ============================================================ */

function getLatestLinkScan() {

    return readJSON(

        SENTINEL_LINK_CONFIG.latestScanKey,

        null

    );

}


/* ============================================================
   PUBLIC LINK CHECKER API
   ============================================================ */

window.SENTINEL_LINK_CHECKER = {

    scan:
        scanLink,

    analyze:
        analyzeURL,

    save:
        saveLinkResult,

    latest:
        getLatestLinkScan,

    updateStatus:
        updateCheckerStatus,

    getScanCount:
        function () {
            return totalScans;
        }

};


/* ============================================================
   DOM READY
   ============================================================ */

document.addEventListener(

    "DOMContentLoaded",

    function () {

        initializeTopBar();
        initializeLinkChecker();

    }

);


/* ============================================================
   CROSS-TAB / DASHBOARD STORAGE SYNC
   ============================================================ */

window.addEventListener(

    "storage",

    function (event) {

        if (
            event.key ===
            SENTINEL_LINK_CONFIG.scanCountKey
        ) {

            totalScans =
                Number(
                    event.newValue
                ) || 0;

            updateScanCounter();

        }


        if (
            event.key ===
            SENTINEL_LINK_CONFIG.latestScanKey
        ) {

            /*
               Another Sentinel page has
               performed a scan.

               Refresh the scan counter
               and leave the current result
               untouched.
            */

            totalScans =
                Number(
                    localStorage.getItem(
                        SENTINEL_LINK_CONFIG.scanCountKey
                    )
                ) || totalScans;

            updateScanCounter();

        }

    }

);


/* ============================================================
   DEBUG INFORMATION
   ============================================================ */

console.log(
    "SENTINEL AI Link Checker loaded successfully."
);