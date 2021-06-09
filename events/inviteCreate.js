module.exports = {
    name: "inviteCreate",
    once: false,
    run: async(client, invite) => {
      client.cachedInvites = await client.cacheInvites();
    }
};