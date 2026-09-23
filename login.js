/* =====================================================
   SENTINEL AI 3
   LOGIN / AUTHENTICATION ENGINE
===================================================== */


/* ==========================================
   VARIABLES
========================================== */

let generatedOTP = null;

let otpAttempts = 0;

let maxOTPAttempts = 5;

let loginLocked = false;


/* ==========================================
   AI MESSAGE
========================================== */

function aiMessage(message){

    const box =
        document.getElementById("aiMessage");

    if(box){

        box.innerHTML =
            "🤖 " + message;

    }

}


/* ==========================================
   SWITCH AUTHENTICATION
========================================== */

function switchAuth(type){

    const phone =
        document.getElementById("phoneAuth");

    const password =
        document.getElementById("passwordAuth");

    const phoneTab =
        document.getElementById("phoneTab");

    const passwordTab =
        document.getElementById("passwordTab");


    if(type === "phone"){

        phone.classList.remove("hidden");

        password.classList.add("hidden");

        phoneTab.classList.add("active");

        passwordTab.classList.remove("active");

        aiMessage(
            "Phone authentication selected."
        );

    }


    else{

        phone.classList.add("hidden");

        password.classList.remove("hidden");

        phoneTab.classList.remove("active");

        passwordTab.classList.add("active");

        aiMessage(
            "Password authentication selected."
        );

    }

}


/* ==========================================
   REQUEST OTP
========================================== */

function requestOTP(){

    if(loginLocked){

        aiMessage(
            "Authentication temporarily locked."
        );

        return;

    }


    const country =
        document.getElementById(
            "country"
        ).value;


    const phone =
        document.getElementById(
            "phone"
        ).value.trim();


    if(phone.length < 6){

        aiMessage(
            "Please enter a valid phone number."
        );

        return;

    }


    /*
       DEMO ONLY:
       A real application must generate
       and send OTP from a secure backend.
    */

    generatedOTP =
        Math.floor(
            100000 +
            Math.random() * 900000
        ).toString();


    otpAttempts = 0;


    document
        .getElementById("otpSection")
        .classList.add("show");


    document
        .getElementById("otpMessage")
        .innerHTML =
        "Demo OTP: " + generatedOTP;


    aiMessage(
        "OTP generated for " +
        country +
        " " +
        phone +
        "."
    );


    console.log(
        "DEMO OTP:",
        generatedOTP
    );

}


/* ==========================================
   VERIFY OTP
========================================== */

function verifyOTP(){

    if(loginLocked){

        aiMessage(
            "Authentication is locked."
        );

        return;

    }


    const enteredOTP =
        document.getElementById(
            "otp"
        ).value.trim();


    if(enteredOTP === ""){

        aiMessage(
            "Enter the OTP first."
        );

        return;

    }


    otpAttempts++;


    if(enteredOTP === generatedOTP){

        loginSuccess();

        return;

    }


    if(otpAttempts >= maxOTPAttempts){

        loginLocked = true;

        aiMessage(
            "Too many incorrect attempts. Authentication locked."
        );

        return;

    }


    document.getElementById(
        "otpMessage"
    ).innerHTML =
        "Incorrect OTP. Attempts remaining: " +
        (maxOTPAttempts - otpAttempts);

}


/* ==========================================
   PASSWORD LOGIN
========================================== */

function passwordLogin(){

    if(loginLocked){

        aiMessage(
            "Authentication temporarily locked."
        );

        return;

    }


    const username =
        document.getElementById(
            "username"
        ).value.trim();


    const password =
        document.getElementById(
            "password"
        ).value;


    if(username === "" || password === ""){

        aiMessage(
            "Enter both username and password."
        );

        return;

    }


    /*
       DEMO AUTHENTICATION ONLY.

       For real security, credentials must
       be verified by a backend.
    */

    const savedUser =
        localStorage.getItem(
            "sentinelUser"
        );


    const savedPassword =
        localStorage.getItem(
            "sentinelPassword"
        );


    if(
        savedUser === null ||
        savedPassword === null
    ){

        localStorage.setItem(
            "sentinelUser",
            username
        );

        localStorage.setItem(
            "sentinelPassword",
            password
        );

        loginSuccess();

        return;

    }


    if(
        username === savedUser &&
        password === savedPassword
    ){

        loginSuccess();

    }

    else{

        aiMessage(
            "Authentication failed."
        );

    }

}


/* ==========================================
   LOGIN SUCCESS
========================================== */

function loginSuccess(){

    localStorage.setItem(
        "sentinelAccess",
        "true"
    );


    localStorage.setItem(
        "sentinelLoginTime",
        Date.now().toString()
    );


    aiMessage(
        "Authentication successful. Welcome to Sentinel AI 3."
    );


    setTimeout(function(){

        window.location.href =
            "steam.html";

    }, 700);

}