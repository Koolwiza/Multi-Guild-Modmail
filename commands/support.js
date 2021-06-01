const Discord = require('discord.js')

module.exports = {
    name: "support",
    description: "Config support roles for modmail",
    execute(message, args, client) {
        if (!message.member.permissions.has("MANAGE_GUILD")) return;

        let role = this.parseRole(message, args[0])
        if(!role) return message.channel.send("Please provide a valid role")
        client.modmail.push(message.guild.id, role.id, "support")
        return message.channel.send(`I have added **${role.name}** to support roles`)
    },


    /**
     * 
     * @param {Discord.Message} message 
     * @param {string} role 
     * @returns {Discord.Role} 
     */

    parseRole(message, role) {
        let reg = /^<@&(\d+)>$/
        let response = null;
        if (!role || typeof role !== "string") return;
        if (role.match(reg)) {
            const id = role.match(reg)[1];
            response = message.guild.roles.cache.get(id)
            if (response) return response;
        }
        response = message.guild.roles.cache.get(role)
        if (!response) throw new Error("Couldn't find role")
        return response;
    }
}