//* Adloya - 2022. MULTISTAR.
//* Permission is hereby granted, free of charge, to any person obtaining a
//* copy of this software and associated documentation files (the
//* "Software"), to deal in the Software without restriction, including
//* without limitation the rights to use, copy, modify, merge, publish,
//* distribute, sublicense, and/or sell copies of the Software, and to permit
//* persons to whom the Software is furnished to do so, subject to the
//* following conditions:
//*
//* The above copyright notice and this permission notice shall be included
//* in all copies or substantial portions of the Software.
//*
//* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
//* OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//* MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
//* NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
//* DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
//* OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
//* USE OR OTHER DEALINGS IN THE SOFTWARE.

const http = require('http');
const fs = require('fs')
require('dotenv').config();
const { auth, startClient } = require('./clientManager.js');
const PFP_IMG = document.getElementById('pfp')
const packagejson = require("../package.json");
const logincreds = require("../json/login.json");
const lineReader = require('line-reader');
const { ipcRenderer } = require('electron');
const ipc = ipcRenderer;
const axios = require('axios');
const msmc = require("msmc");
const { shell } = require('electron')
// const { exec } = require("child_process");


const loginmsmcButton = document.getElementById('login-msmc')
const startgameButton = document.getElementById('startgame')
const Cmessage = document.getElementById('Message')
const refreshVerBtn = document.getElementById('refreshVerBtn')
const closeBtn = document.getElementById('closeBtn')
const minimizeBtn = document.getElementById('minimizeBtn')
const configDiv = document.getElementById('ConfigPopup');
const configBtn = document.getElementById('configBtn');
const saveOpBtn = document.getElementById('saveOpBtn');
const closeOpBtn = document.getElementById('closeOpBtn');
const configBk = document.getElementById('popup-background')
const mainApp = document.getElementsByClassName('mainApp')[0];
const titleHtml = document.getElementsByClassName('title')[0];
const logoffbtn = document.getElementById('logoffBtn');
const githublink = document.getElementById('githubLink');

let date_ob = new Date();
let date = ("0" + date_ob.getDate()).slice(-2);
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
let year = date_ob.getFullYear();
let hours = date_ob.getHours();
let minutes = date_ob.getMinutes();
let seconds = date_ob.getSeconds();

let logDateTime = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
let logFDateTime = year + "-" + month + "-" + date

/* Used to intercept the console.log() function and save it to a file + show it in the GUI. */
const originalConsoleLog = console.log.bind(console)
console.log = (...args) => {
    // // If console log is more than 55 characters, three dots will be added at the end and the rest will be cut.
    // if (args[0].length > 55) {
    //     args[0] = args[0].substring(0, 55) + "[...]"
    // }

    CSparagraph.innerHTML = "<strong id=\"consolePrefix\"><i class=\"bi bi-terminal-fill\"></i> </strong>" + args;
    mainApp.appendChild(CSparagraph);
    fs.appendFile(__dirname + "/logs/" + logFDateTime + ".log", `(${logDateTime}) : ${args}\n`, err => {
        if (err) {
          console.error(err)
          return
        }
        //file written successfully
      })
    originalConsoleLog(...args);
}


const CSDiv = document.createElement('div')
CSDiv.setAttribute("id", "csps_div");
mainApp.appendChild(CSDiv);
const CSparagraph = document.createElement("p");
CSparagraph.setAttribute("id", "csps");
CSDiv.appendChild(CSparagraph)

var OS="Unknown";
if (navigator.userAgent.indexOf("Win")!=-1) OS="Windows";
if (navigator.userAgent.indexOf("Mac")!=-1) OS="MacOS";
if (navigator.userAgent.indexOf("X11")!=-1) OS="UNIX";
if (navigator.userAgent.indexOf("Linux")!=-1) OS="Linux";
if(OS === "Windows"){
    let pgtitle = document.createElement("title")
    pgtitle.innerText = `Multistar Launcher (${packagejson.version} - ${OS})`;
    document.head.appendChild(pgtitle);
    titleHtml.innerHTML = `Multistar Launcher (${packagejson.version} - <i class="bi bi-microsoft"></i> ${OS})`;
}else{
    let pgtitle = document.createElement("title")
    pgtitle.innerText = `Multistar Launcher (${packagejson.version} - ${OS})`;
    document.head.appendChild(pgtitle);
    titleHtml.innerHTML = `Multistar Launcher (${packagejson.version} - ${OS})`;
}

function SaveLogin() {
    fs.writeFile(__dirname + "/../json/login.json", JSON.stringify(logincreds, null, 4), (err) => {
        if (err) console.log(`[MULTISTAR] : Une erreur est survenue (` + err + ")");
    });
}

//! CAN'T LAUNCH MINECRAFT WHEN BUILT

if(logincreds.authInformation.access_token){
    console.log("[MULTISTAR] : Logged in successfully !")
    document.getElementById("content").style.marginTop = "110px"
    loggedIn = true;
    process.env.IS_LOGGED_IN = 'init';
    process.env.MSMC_USERNAME = logincreds.authInformation.profile.name;
    var initCheck = setInterval(async () => {
        if (process.env.IS_LOGGED_IN == "init") {
            console.log("[MULTISTAR] : Getting account information...")
            // Downloading Profile Picture (based on mc skin)
            setPFP(process.env.MSMC_USERNAME)
            // Logged In
            process.env.IS_LOGGED_IN = "true";
        }
        if(process.env.IS_LOGGED_IN == "true"){
            // Changing menu
            startgameButton.style.visibility = "visible";
            startgameButton.style.fontSize = "30px";
            startgameButton.style.padding = "20px";
            startgameButton.style.margin = "20px";
            logoffbtn.classList = "functionbtn bg-red-600 hover:bg-red-500"
            loginmsmcButton.innerHTML = "<i class=\"fa fa-user\" aria-hidden=\"true\"></i> Switch Account";
            Cmessage.innerHTML = `👋 Welcome back <strong>${process.env.MSMC_USERNAME}</strong>`
            process.env.LOADING = 'false';
            clearInterval(initCheck);
        }
        if(process.env.LOADING == "true") {
            Cmessage.innerHTML = `<i class="fa fa-circle-o-notch fa-spin fa-1x fa-fw"></i> Loading ...`
        }
        console.log("[MULTISTAR] : Logged In !")
    }, 1000)
    
}else{
    console.log("[MULTISTAR] : Not logged in ! Please log in !")
}

/**
 * It gets the latest version of Multistar from the server and compares it to your current version
 */


function getMultistarVersion() {
    console.log("[MULTISTAR] : Getting current version on the server...")
    const clientver = packagejson.version;
    axios.get('http://45.77.63.91:3050/latest_version')
    .then(res => {
        // check if theres a new version
        console.log(res);
        if (res.data.content.version > clientver) {
            console.log("[MULTISTAR] : There is a new version available!")
            const updateBtn = document.createElement('button')
            updateBtn.setAttribute("id", "updateBtn")
            updateBtn.innerHTML = "Update"
            updateBtn.addEventListener("click", () => {
                // Launch the updater
                ipc.send('update-app')
            })
        } else {
            console.log("[MULTISTAR] : You are up to date!")
        }
    })
    .catch(error => {
        console.error(error);
    });
}
console.log("=====================(NEW EXECUTION OF MULTISTAR)=====================\n")

getMultistarVersion()

loginmsmcButton.addEventListener('click', () => {
    auth();
    var initCheck = setInterval(async () => {
        if (process.env.IS_LOGGED_IN == "init") {
            console.log("[MULTISTAR] : Getting account information...")
            // Downloading Profile Picture (based on mc skin)
            setPFP(process.env.MSMC_USERNAME)
            // Logged In
            process.env.IS_LOGGED_IN = "true";
        }
        if(process.env.IS_LOGGED_IN == "true"){
            // Changing menu
            startgameButton.style.visibility = "visible";
            startgameButton.style.fontSize = "30px";
            startgameButton.style.padding = "20px";
            startgameButton.style.margin = "20px";
            logoffbtn.classList = "functionbtn bg-red-600 hover:bg-red-500"
            loginmsmcButton.innerHTML = "<i class=\"fa fa-user\" aria-hidden=\"true\"></i> Switch Account";
            Cmessage.innerHTML = `👋 Welcome back <strong>${process.env.MSMC_USERNAME}</strong>`
            process.env.LOADING = 'false';
            clearInterval(initCheck);
        }
        if(process.env.LOADING == "true") {
            Cmessage.innerHTML = `<i class="fa fa-circle-o-notch fa-spin fa-1x fa-fw"></i> Loading ...`
        }
    }, 1000)
});

startgameButton.addEventListener('click', () => {
    if (process.env.IS_LOGGED_IN == 'false') return console.log("[MULTISTAR] : Error : You are not logged in");
    startClient();
});

/**
 * It sets the profile picture of the user.
 * @param username - The username of the player you want to get the profile picture of.
 */
function setPFP(username) {
    // Downloading Profile Picture (based on mc skin)
    process.env.EXO_API_PFP_URL = `https://cravatar.eu/helmhead/${username}/50.png`
    
    PFP_IMG.src = process.env.EXO_API_PFP_URL;
    PFP_IMG.style.width = "50px";
    PFP_IMG.style.height = "50px";
    PFP_IMG.style.visibility = "visible";
}

refreshVerBtn.addEventListener('click', () => {
    setInterval(getMultistarVersion(), 1000)
});

// Closing app
closeBtn.addEventListener('click', () => {
    ipc.send('closeApp');
});

// Minimizing app
minimizeBtn.addEventListener('click', () => {
    ipc.send('minimizeApp');
});

configBtn.addEventListener('click', () => {
    configDiv.style.display = 'block'
    configBk.style.opacity = '0.5'
    configDiv.style.opacity = "1"
    configBk.style.pointerEvents = 'all'
});

closeOpBtn.addEventListener("click", function () {
    configDiv.style.display = "none";
    configBk.style.opacity = '0'
    configDiv.style.opacity = "1"
    configBk.style.pointerEvents = 'none'
});

logoffbtn.addEventListener("click", function () {
    logincreds.authInformation.access_token = "";
    logincreds.authInformation.profile.id = "";
    logincreds.authInformation.profile.name = "";
    logincreds.authInformation.profile._msmc.refresh = ""
    logincreds.authInformation.profile._msmc.expires_by = 0
    logincreds.authInformation.profile._msmc.mcToken = ""
    logincreds.authInformation.profile.xuid = ""
    logincreds.authInformation.translationString = ""

    SaveLogin()
    ipc.send("restartApp")
})

githublink.addEventListener("click", function () {
    shell.openExternal("https://github.com/Adloya/Multistar-Launcher")
})

/* Console functions */

function flip_a_coin(){
    var flip = Math.floor(Math.random() * 2);
    if(flip == 0) return "Heads";
    else return "Tails";
}

function reload(){
    ipc.send("restartApp")
}

// FUCKING PATCH THE LOCALSTORAGE AND UPDATE SHIT