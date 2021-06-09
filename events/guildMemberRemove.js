const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "guildMemberRemove",
    once: false,
    run: async(client, member) => {
      if (member.user.bot) return;

      let guild = member.guild;

      let inviteData = await client.db.get(`guild_${guild.id}`);
      let systemChannel = inviteData.systemChannel || client.findDefChannel(guild, "system_channel");
      let membDat = inviteData.invites.find(a => a.userId === member.id);

      if (systemChannel) {
        systemChannel = client.channels.cache.get(systemChannel);
        console.log(membDat, membDat.invitedBy);

        systemChannel.send(new MessageEmbed()
          .setTitle("Member Left")
          .setColor(client.config.embedColor)
          .setDescription(`Member left, **${member.user.tag}**. ${client.users.cache.has(membDat.invitedBy) ? `Invited by **${client.users.cache.get(membDat.invitedBy).tag}**` : "I couldn't figure out who invited them"}`)
        );
      }

      if (membDat && client.users.cache.has(membDat.invitedBy)) {
        let inviteDat = inviteData.invites.find(a => a.userId === membDat.invitedBy);

        if (inviteDat) {
          inviteDat.leaves++;
          inviteData.invites[inviteData.invites.findIndex(a => a.userId === inviteDat.userId)] = inviteDat;
        }
        
        inviteData = inviteData.filter(a => a.userId !== membDat.userId);
      }
      
      await client.db.set(`guild_${guild.id}`, inviteData);
    }
};