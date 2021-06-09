module.exports = {
    name: "inviteDelete",
    once: false,
    run: async(client, invite) => {
      client.cachedInvites = await client.cacheInvites();
    }
};