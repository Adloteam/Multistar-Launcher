const { Client,Authenticator } = require('minecraft-launcher-core');
const launcher = new Client();
const msmc = require("msmc");
const fetch = require("node-fetch");
const login = require("../json/login.json");
const fs = require("fs");

let loggedIn = false;

/**
 * It saves the login object to a JSON file.
 */
function SaveLogin() {
    fs.writeFile(__dirname + "/../json/login.json", JSON.stringify(login, null, 4), (err) => {
        if (err) console.log(`[MULTISTAR] : Une erreur est survenue (` + err + ")");
    });
}

/**
 * It logs you into Microsoft.
 */
function auth() {
    // if credentials are stored in the login.json file, it will use them, if err or not, it will microsoft login.
    msmc.setFetch(fetch)
    msmc.fastLaunch("raw",

        (update) => {
            console.log(`[MULTISTAR] : [${update.type}] : ${update.data? "Loading" : "Loading"} (${update.percent? "LoadingEvent" : "%"})`)
            if(!update.data){
                process.env.LOADING = 'true';
            }
        }).then((result) => {
            if(localStorage.MCLCverbose == "true") console.log(result);
            //If the login works
            if (msmc.errorCheck(result)) {
                console.log("[MULTISTAR] : We failed to log someone in because : " + result.reason)
                return;
            }

            login.authInformation.access_token = result.access_token;
            login.authInformation.profile.id = result.profile.id;
            login.authInformation.profile.name = result.profile.name;
            login.authInformation.profile._msmc.refresh = result.profile._msmc.refresh;
            login.authInformation.profile._msmc.expires_by = result.profile._msmc.expires_by;
            login.authInformation.profile._msmc.mcToken = result.profile._msmc.mcToken;
            login.authInformation.profile.xuid = result.profile.xuid;
            login.authInformation.translationString = result.translationString;

            SaveLogin();

            if (result.data = 'Done!') {
                console.log("[MULTISTAR] : Logged in successfully !")
                document.getElementById("content").style.marginTop = "110px"
                loggedIn = true;
                process.env.IS_LOGGED_IN = 'init';
                process.env.MSMC_USERNAME = result.profile.name;
            }
    })
    .catch(reason => {
        console.log("[MULTISTAR] : We failed to log someone in because : " + reason);
    })
}

/**
 * Starts the client
 */
function startClient() {
    let opts = {
        clientPackage: null,
        authorization: msmc.getMCLC().getAuth(login.authInformation.profile) || login.authInformation.profile,
        root: "./client",
        version: {
            number: "1.18.1",
            type: "release",
            arguments: [`-Dorg.lwjgl.util.Debug=${localStorage.MCLCverbose}`],
        },
        memory: {
            max: localStorage.maxRam,
            min: "1G"
        }
    }
    console.log("[MULTISTAR] : Starting!")
    launcher.launch(opts);


    launcher.on('debug', (e) => console.log("[MULTISTAR] : " + e));

    launcher.on('data', (e) => console.log("[MULTISTAR] : " + e));

    launcher.on('ready', (e) => console.log("[MULTISTAR] : " + e))
}

module.exports = { auth, startClient, loggedIn }