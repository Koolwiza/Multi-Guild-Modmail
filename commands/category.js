module.exports = {
    name: "category",
    description: "Config server modmail category",
    execute(message, [id], client) {
        if(!message.member.permissions.has("MANAGE_GUILD")) return;
        let channel = message.guild.channels.cache.get(id)

        if(!channel) return message.channel.send("Please provide a valid category")
        client.modmail.set(message.guild.id, channel.id, "cat")
        return message.channel.send(`Set modmail category as ${channel.id}`)
    }
}