const RPC = require('discord-rpc');
const client = new RPC.Client({ transport: 'ipc'});
const packagejson = require("../package.json");

const rpcActivity = {
  details: "Multistar Launcher " + packagejson.RLtype + packagejson.version,
  assets: {
    large_image: "multistar",
  },
  instance: true
};

function disconnect(){
  client.destroy()
}

function connect(){
  // Init DiscordRPC
  client.login({
    clientId: "945276405644685412"
  }).catch(err => {
    console.log("[MULTISTAR] : Error : Couldn't connect to DiscordRPC (" + err + ")");
  });
  client.on("ready", () => {
    client.request("SET_ACTIVITY", {
      pid: process.pid,
      activity: rpcActivity
    })
  })
}

connect()

module.exports = {connect, disconnect}