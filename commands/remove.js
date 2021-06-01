const Discord = require('discord.js')
const {
    pullAt
} = require('lodash')

module.exports = {
    name: "remove",
    description: "Remove support roles for modmail",
    execute(message, args, client) {
        if (!message.member.permissions.has("MANAGE_GUILD")) return;

        let role = this.parseRole(message, args[0])
        if (!role) return message.channel.send("Please provide a valid role")

        let data = client.modmail.get(message.guild.id)

        let index = data.support.indexOf(role.id)
        let updatedSupport = pullAt(data.support, index)

        client.modmail.set(message.guild.id, updatedSupport)
        return message.channel.send(`I have removed **${role.name}** to support roles`)
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