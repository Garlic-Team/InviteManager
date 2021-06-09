const { MessageEmbed } = require("discord.js");

module.exports = {
    name: "guildMemberAdd",
    once: false,
    run: async(client, member) => {
      if (member.user.bot) return;

      let guild = member.guild;
      let nData = JSON.parse(JSON.stringify(client.guildMemberData));
      nData.userId = member.id;

      let oldInvites = client.cachedInvites[guild.id];
      let newInvites = (await client.cacheInvites())[guild.id];
      let invite;
      for (let i = 0; i < oldInvites.length; i++) {
        let oldI = oldInvites[i];
        let newI = newInvites[i];

        if (newI && oldI && newI.uses > oldI.uses) invite = newI;
      }

      let inviteData = await client.db.get(`guild_${guild.id}`);
      let systemChannel = inviteData.systemChannel || client.findDefChannel(guild, "system_channel");

      if (systemChannel) {
        systemChannel = client.channels.cache.get(systemChannel);

        if (invite) invite.data = inviteData.invites.find((v) => v.userId === invite.user.id);
        systemChannel.send(new MessageEmbed()
          .setTitle("New Member")
          .setColor(client.config.embedColor)
          .setDescription(`New member, **${member.user.tag}**! ${invite && invite.data ? `Invited by **${invite.user.tag}**. (${client.calculateInvites(invite.data) + 1} invites)` : "I couldn't figure out who invited them."}`)).catch(() => {});
      }
      if (invite && invite.data) {
        let month = 1000 * 60 * 60 * 24 * 30;
        let isFake = false;
        if (Date.now() < (member.user.createdTimestamp + month)) isFake = true;
        if (Date.now() < (invite.user.createdTimestamp + month)) isFake = true;
        if (isFake) invite.data.fake.push(member.user.id);
        else invite.data.regular.push(member.user.id);
        nData.invitedById = invite.user.id

        inviteData.invites[inviteData.invites.findIndex(a => a.userId === invite.user.id)] = invite.data;
      }

      inviteData.invites[inviteData.invites.findIndex(a => a.userId === nData.userId)] = nData;

      await client.db.set(`guild_${guild.id}`, inviteData);
    }
};