const Discord = require('discord.js');
const client = new Discord.Client();
const Enmap = require('enmap')
const fs = require('fs');
const moment = require('moment');
const {
    isEmpty
} = require('lodash');
const {
    prefix,
    token
} = require('./config.json')

client.commands = new Discord.Collection()
client.modmail = new Enmap({
    name: "modmail",
    autoFetch: true,
    fetchAll: true
})
client.talkingTo = new Map()

let cmdFiles = fs.readdirSync('./commands').filter(c => c.endsWith('.js'))

for (let file of cmdFiles) {
    let cmd = require('./commands/' + file)
    client.commands.set(cmd.name, cmd)
}

client.on('ready', () => {
    console.clear()
    console.log(`${client.user.username} is online!`)
})

let mutuals = {},
    original;


client.on('message', async message => {
    if (message.author.bot) return;
    let args = message.content.slice(prefix.length).trim().split(/\s+/g)

    if (message.guild) {
        let commandName = args.shift().toLowerCase()
        let data = client.modmail.ensure(message.guild.id, {
            cat: "",
            support: [],
            count: 1
        })

        if(data.cat && message.channel.parentID === data.cat) {
            let user = await client.users.fetch(message.channel.topic).catch(C => {})
            if(!user) return;

            let embed = new Discord.MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL())
                .setDescription(message.content)
                .setFooter(client.user.username, client.user.displayAvatarURL())

            if(!message.content.startsWith(prefix)) user.send(embed).catch(C => {})
        } 

        let command = client.commands.get(commandName) || client.commands.find(c => c.aliases && c.aliases.includes(commandName)) 

        if (!command) return;

        command.execute(message, args, client)
    } else {

        let index = 0

        for (let guild of client.guilds.cache.values()) {
            index++
            try {
                await guild.members.fetch(message.author.id)
                mutuals[index] = guild
            } catch (e) {
                console.log(e)
            }
        }
        if (isEmpty(mutuals)) return console.log("no mutuals")

        let defaultEmbed = new Discord.MessageEmbed()
            .setTitle("Modmail")
            .setDescription(`Please select the number of the guild you want to send a message to`)

        for (let [index, guild] of Object.entries(mutuals)) {
            defaultEmbed.addField(`Server: ${index}`, guild.name)
        }

        if (!client.talkingTo.get(message.author.id)) {

            original = message.content
            sentMsg = await message.author.send(defaultEmbed).catch(c => {
                console.log(`Can't send messages to ${message.author.username}`)
            })

            client.talkingTo.set(message.author.id, true)
        } else {
            let num = message.content
            if (!Object.keys(mutuals).includes(num)) return message.channel.send("Please provide a valid guild")

            let guild = mutuals[num]

            let data = client.modmail.get(guild.id)
            if (!data.cat) return message.channel.send("This guild does not have modmail set up (category)")
            if (!data.support.length) return message.channel.send("This guild does not have modmail set up (support roles)")
            let channel = guild.channels.cache.find(c => c.parentID === data.cat && c.topic === message.author.id)
            let noExistingChannel = false

            if (!channel) {
                noExistingChannel = true
                client.modmail.inc(guild.id, "count")
                let supNumber = client.modmail.get(guild.id, "count")
                let perms = data.support.map(c => {
                    return {
                        id: c,
                        allow: new Discord.Permissions(['SEND_MESSAGES', 'ADD_REACTIONS', 'VIEW_CHANNEL']).bitfield
                    }
                }).concat({
                    id: guild.id,
                    deny: new Discord.Permissions(['SEND_MESSAGES', 'ADD_REACTIONS', 'VIEW_CHANNEL']).bitfield
                })

                channel = await guild.channels.create(`modmail-${supNumber}`, {
                    parent: data.cat,
                    type: "string",
                    topic: message.author.id,
                    permissionOverwrites: perms
                })
            }

            let member = guild.members.resolve(message.author.id)

            let daysAgo = moment(Date.now()).diff(message.author.createdTimestamp, "days")

            let newThreadEmbed = new Discord.MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL())
                .setTitle("NEW THREAD")
                .setColor("GREEN")
                .setDescription(`${message.author.username}${member.nickname ? `(${member.nickname})`: ""} was created **${daysAgo}** ago`)
                .addField(`Roles`, member.roles.cache.map(c => c.toString()).join(', '), true)
                .setFooter(`ID: ${message.author.id}`)

            let embed = new Discord.MessageEmbed()
                .setAuthor(message.author.username, message.author.displayAvatarURL())
                .setDescription(original)
                .setFooter(client.user.username, client.user.displayAvatarURL())
            if(noExistingChannel) channel.send(newThreadEmbed)
            await channel.send(embed)
        }
    }

})

client.login(token)