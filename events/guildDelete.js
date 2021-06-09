module.exports = {
    name: "guildDelete",
    once: false,
    run: async(client, guild) => {
      await client.db.delete(`guild_${guild.id}`);
    }
};