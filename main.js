const Discord = require('discord.js');
const axios = require('axios');

const client = new Discord.Client();

const BOT_TOKEN = 'NjU1NDI1NzYxNDczMzMxMjIw.XfUmVQ.B5jp0fPjwAZdMVbxnS9LUzV12FQ';
const mcCommand = '!statut'; // Command for triggering
const mcIP = 'mc.dieperink-hosting.ch'; // MC server IP or hostname address
const mcPort = 25566; // MC server port (default=25565)

const presenceUpdateDelay = 120;
let presenceUpdateTimer;

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	updatePresence();
	startPresenceUpdateTimer();
});

client.on('message', message => {
	if (message.content === mcCommand) {
		fetchServerData(mcIP, mcPort).then(data => {
			const status = getStatusMessage(
				data,
				'Minecraft server is currently offline',
				'Minecraft server is online  -  ',
				' player(s) connected!',
				'Nobody is playing!'
			);
			console.log(status);
			message.reply(status);
		});
	}
});

client.login(BOT_TOKEN);

function fetchServerData(ip, port) {
	return new Promise((resolve, reject) => {
		var URI = 'http://mcapi.us/server/status';
		axios
			.get(URI, { params: { ip, port } })
			.then(res => {
				if (res.status !== 200)
					reject(`${res.status} • ${res.statusText}`);
				resolve(res.data);
			})
			.catch(err => reject());
	});
}

function getStatusMessage(
	data,
	offMsg,
	onMsg,
	onMsgNumPlayers,
	onMsgNoPlayers
) {
	if (!data.online) return offMsg;
	return `${onMsg}${
		data.players.now ? data.players.now + onMsgNumPlayers : onMsgNoPlayers
	}`;
}

function startPresenceUpdateTimer() {
	presenceUpdateTimer = setInterval(
		updatePresence,
		presenceUpdateDelay * 1000
	);
}

function updatePresence() {
	fetchServerData(mcIP, mcPort).then(data => {
		const status = getStatusMessage(
			data,
			'Offline',
			'Online  -  ',
			' player(s)!',
			'No Players!'
		);
		console.log(status);
		client.user.setActivity(status);
	});
}