module.exports = {
    name: "ping",
    description: "Sends your ping",
    execute(message, args, client) {
        message.channel.send("Pong!")
    }
}