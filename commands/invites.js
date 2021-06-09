const { MessageEmbed } = require("discord.js");
const { MessageActionRow, MessageButton, SlashCommand } = require("gcommands");

module.exports = {
    name: "invites",
    description: "Check invites",
    clientRequiredPermissions: ["SEND_MESAGES","EMBED_LINKS"],
    expectedArgs: [
      {
        name: "add",
        type: SlashCommand.SUB_COMMAND,
        description: "add invites",
        options: [
          {
            name: "member",
            type: 6,
            description: "Member invites",
            required: true
          },
          {
            name: "value",
            type: SlashCommand.INTEGER,
            description: "value lol",
            required: true
          },
        ]
      },
      {
        name: "set",
        type: SlashCommand.SUB_COMMAND,
        description: "set invites",
        options: [
          {
            name: "member",
            type: 6,
            description: "Member invites",
            required: true
          },
          {
            name: "value",
            type: SlashCommand.INTEGER,
            description: "value lol",
            required: true
          },
        ]
      },
      {
        name: "remove",
        type: SlashCommand.SUB_COMMAND,
        description: "remove invites",
        options: [
          {
            name: "member",
            type: 6,
            description: "Member invites",
            required: true
          },
          {
            name: "value",
            type: SlashCommand.INTEGER,
            description: "value lol",
            required: true
          },
        ]
      },
      {
        name: "get",
        type: SlashCommand.SUB_COMMAND,
        description: "get invites",
        options: [
          {
            name: "member",
            type: 6,
            description: "Member invites",
            required: false
          }
        ]
      },
    ],
    guildOnly: "747526604116459691",
    run: async({client, member, guild, channel, message, respond}, args, objargs) => {
      let checkingMember = member;
      if(args[1]) checkingMember = guild.members.cache.get(args[1]) || member;
      
      let totalData = await client.db.get(`guild_${guild.id}`);
      let invites = totalData.invites.find((v) => v.userId === checkingMember.id);
      console.log(invites)

      if (args[0] === "add") {
        invites.bonus = parseInt(invites.bonus) + parseInt(args[2]);
        totalData.invites[totalData.invites.findIndex((a) => a.userId === invites.userId)] = invites;
        console.log(totalData)
        await client.db.set(`guild_${guild.id}`, totalData);

        respond(`${checkingMember} +${args[2]} invites`);
      } else if (args[0] === "remove") {
        invites.bonus = parseInt(invites.bonus) - parseInt(args[2]);
        totalData.invites[totalData.invites.findIndex((a) => a.userId === invites.userId)] = invites;
        await client.db.set(`guild_${guild.id}`, totalData);

        respond(`${checkingMember} -${args[2]} invites`);
      } else if (args[0] === "set") {
        invites.bonus = parseInt(args[2]);
        totalData.invites[totalData.invites.findIndex((a) => a.userId === invites.userId)] = invites;
        await client.db.set(`guild_${guild.id}`, totalData);

        respond(`${checkingMember} ${args[2]} invites`);
      } else if (args[0] === "get") {
        let embed = new MessageEmbed()
        .setAuthor(checkingMember.user.username)
        .setFooter(checkingMember.user.tag, checkingMember.user.avatarURL({dynamic:true}))
        .setColor(client.config.embedColor)

        if(checkingMember.id != member.id) embed.setDescription(`${checkingMember} has **${client.calculateInvites(invites)}** invites!`)
        else embed.setDescription(`You have **${client.calculateInvites(invites)}** invites!`)

        embed.setDescription([
          `${embed.description}`,
          ``,
          `✅ ${invites.regular ? invites.regular.length : "0"} regular`,
          `✨ ${invites.bonus || "0"} bonus`,
          `💩 ${invites.fake ? invites.fake.length : "0"} fake`,
          `❌ ${invites.leaves ? invites.leaves.length : "0"} leaves`
        ].join("\n"));

        respond(embed);
      }

      /*let embed = new MessageEmbed()
        .setAuthor(checkingMember.user.username)
        .setFooter(checkingMember.user.tag, checkingMember.user.avatarURL({dynamic:true}))
        .setColor(client.config.embedColor)

      if(checkingMember.id != member.id) embed.setDescription(`${checkingMember} has **${client.calculateInvites(invites)}** invites!`)
      else embed.setDescription(`You have **${client.calculateInvites(invites)}** invites!`)

      embed.setDescription([
        `${embed.description}`,
        ``,
        `✅ ${invites.regular ? invites.regular.length : "UNKNOWN"} regular`,
        `✨ ${invites.bonus ? invites.bonus.length : "UNKNOWN"} bonus`,
        `💩 ${invites.fake ? invites.fake.length : "UNKNOWN"} fake`,
        `❌ ${invites.leaves ? invites.leaves.length : "UNKNOWN"} leaves`
      ].join("\n"));

      respond(embed);*/
  }
};