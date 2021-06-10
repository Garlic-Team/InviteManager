const express=require("express"),app=express();app.get("/",function(e,p){p.send("Hello World")}),app.listen(3e3);

require("./commands/invites.js");
const { Client } = require("discord.js");
const { GCommands } = require("gcommands");
const Keyv = require("keyv");

const client = new Client({
  disableMentions: "everyone"
});

client.db = new Keyv();
client.config = require("./config.json");
client.cachedInvites = {};
client.findDefChannel = (guild, type) => {
  let finalChannel = null;
  if(type == "system_channel") {
    let allSystemChannels = client.config.allWelcomeChannels
    finalChannel = guild.channels.cache.find(c => allSystemChannels.find(a => c.name.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(c.name.toLowerCase())));
  }

  return finalChannel;
}
client.guildData = {
  invites: [],
  systemChannel: null
};
client.guildMemberData = {
  userId: null,
  invitedById: null,
  regular: [],
  bonus: 0,
  fake: [],
  leaves: []
}
client.cacheInvites = async () => {
  let data = {};
  let guilds = client.guilds.cache.array();
  for (let i = 0; i < guilds.length; i++) {
    let g = guilds[i];
    if (g.me.hasPermission("MANAGE_SERVER")) {
      let invites;
      try {
        invites = (await g.fetchInvites()).array();
      } catch { /* ¯\_(ツ)_/¯ */ }
      if (invites) {
        data[g.id] = [];
        for (let i = 0; i < invites.length; i++) {
          let inv = invites[i];
          data[g.id].push({
            code: inv.code,
            maxAge: inv.maxAge,
            maxUses: inv.maxUses,
            temporary: inv.temporary,
            channel: inv.channel,
            user: inv.inviter,
            uses: inv.uses,
            expiresAt: inv.expiresAt
          });
        }
      }
    }
  }

  return data;
}
client.calculateInvites = (invs) => {
  let f = 0;
  f += invs.regular.length;
  f += parseInt(invs.bonus);
  f -= invs.fake.length;
  f -= invs.leaves.length;
  if (f < 0) return 0;
  return f;
}
client.updateDatabase = async () => {
  let guilds = client.guilds.cache.array();

  for (let i = 0; i < guilds.length; i++) {
    let g = guilds[i];
    let gdb = await client.db.get(`guild_${g.id}`);
    let members = g.members.cache.array();
    let forceSet = false;
    if (!gdb) {
      let data = JSON.parse(JSON.stringify(client.guildData));
      data.systemChannel = client.findDefChannel(g, "system_channel");
      gdb = data;
      forceSet = true;
    }
    let addShit = [];
    for (let j = 0; j < members.length; j++) {
      if (!gdb.invites.find(a => a.userId === members[j].id) && !members[j].user.bot) {
        let dt = JSON.parse(JSON.stringify(client.guildMemberData));
        dt.userId = members[j].id;
        addShit.push(dt);
      }
    }

    if (addShit.length > 0 || forceSet) {
      if (addShit.length > 0) gdb.invites.push(...addShit);
      await client.db.set(`guild_${g.id}`, gdb);
    }
  }
}

client.on("ready", async () => {
  new GCommands(client, {
    cmdDir: "commands/",
    eventDir: "events/",
    language: "english",
    unkownCommandMessage: false,
    slash: {
      slash: 'both',
      prefix: '!',
    },
    defaultCooldown: 3
  });

  client.cachedInvites = await client.cacheInvites();
  await client.updateDatabase();
});

client.login(process.env.token);
"Garlic-Team <3";
