module.exports = {
    name: "guildCreate",
    once: false,
    run: async(client, guild) => {
      await client.db.set(`guild_${guild.id}`, JSON.parse(JSON.stringify(client.guildData)));
    }
};