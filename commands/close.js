const Discord = require('discord.js')

module.exports = {
    name: "close",
    description: "Close the support ticket",
    async execute(message, args, client) {
        let data = client.modmail.get(message.guild.id)
        if(!data.cat) return message.channel.send("This guild does not have modmail set up ")

        if(message.channel.parentID === data.cat) {
            let user = await client.users.fetch(message.channel.topic).catch(C => {})
            if(!user) return message.channel.send("No user found")

            let threadClosed = new Discord.MessageEmbed()
                .setTitle("THREAD CLOSED")
                .setColor("RED")
                .setDescription(`Your thread to **${message.guild.name}** has been closed by **${message.author.username}**`)
                .setFooter(client.user.username, client.user.displayAvatarURL())
                .setAuthor(user.tag, user.displayAvatarURL())

            client.talkingTo.delete(user.id)
            await user.send(threadClosed).catch(c => {})
            await message.channel.delete().catch(C => {})
        } 
    }
}