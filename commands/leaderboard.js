const { MessageEmbed } = require("discord.js")
const { MessageActionRow, MessageButton } = require("gcommands")

module.exports = {
    name: "leaderboard",
    description: "Check top",
    clientRequiredPermissions: ["SEND_MESAGES","EMBED_LINKS"],
    guildOnly: "747526604116459691",
    run: async({client, member, guild, channel, message, respond, edit}, args) => {
      let embed = new MessageEmbed()
        .setAuthor(`${guild.name} | Invite LeaderBoard`)
        .setColor("#5865F2");

      let invites = await client.db.get(`guild_${guild.id}`);

      let strings = invites.invites
        .filter(xd => client.calculateInvites(xd) !== 0)
        .sort((a, b) => client.calculateInvites(b) - client.calculateInvites(a))
        .map((a, i) => `${a.userId === member.id ? "**" : ""}#${i + 1}⼁${client.users.cache.get(a.userId).tag} — ${client.calculateInvites(a)} invites${a.userId === member.id ? "**" : ""}`);

      if (strings.length === 0) strings.push("```Noone has any invites! Strange...```");
      let pages = [];
      let page = 0;
      let perPage = 10;
      for (let i = 0; true; i += perPage) {
        if (i >= strings.length) break;
        pages.push(strings.slice(i, i + perPage));
      }

      embed.setTitle(`Page ${page + 1}/${pages.length}`);
      embed.setDescription(pages[page].join("\n"));
      let pageL = new MessageButton().setLabel("Previous Page").setEmoji("<:left:847841719327260682>").setStyle("gray").setID(`pageL`).setDisabled(page === 0);
      let pageR = new MessageButton().setLabel("Next Page").setEmoji("<:right:847841719303012403>").setStyle("gray").setID(`pageR`).setDisabled(page === pages.length - 1);

      let mapButtons = (btns) => {
        let row = new MessageActionRow();
        btns.map((a) => row.addComponent(a));
        return row;
      }
      let msg = await respond({
        content: embed,
        components: mapButtons([pageL, pageR])
      });

      const filter = (button) => button.clicker.user.id === member.id;
      const collector = msg.createButtonCollector(filter, {time: 120000, errors: ['time'] });

      collector.on("collect", async(button) => {
        if (button.id === "pageL") {
          page--;
        } else if (button.id === "pageR") {
          page++;
        }

        if (page < 0) page = 0;
        if (page >= pages.length) page = pages.length - 1;
        
        embed.setTitle(`Page ${page + 1}/${pages.length}`);
        embed.setDescription(pages[page].join("\n"));

        pageL.setDisabled(page === 0);
        pageR.setDisabled(page === pages.length - 1);

        button.edit({
          content: embed,
          components: mapButtons([pageL, pageR])
        })
      });
  }
};