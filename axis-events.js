//Copyright (c) 2023 Fred Juhlin
//Updated: 2025-11-30 - Error resilience improvements

const { spawn } = require('child_process');

module.exports = function(RED) {

    function AXIS_Events(config) {
		RED.nodes.createNode(this, config);
		this.group = config.group;
		this.initialization = config.initialization;
		var node = this;
		var suppress = false;
		var restart = true;  // Fixed: Declare restart variable
		var eventlistner = null;
		var dataBuffer = '';  // Fixed: Buffer for incomplete lines

		if(node.initialization) {
			suppress = true;
			setTimeout(function(){
				suppress = false;
			}, 5000);
		}

		// Fixed: Extract setup logic to reusable function
		function setupEventListener() {
			const listener = spawn('eventlistener');
			node.status({fill:"green", shape:"dot", text:"Running"});

			// Reset data buffer for new listener
			dataBuffer = '';

			listener.stdout.on('data', (data) => {
				if(suppress)
					return;

				// Fixed: Handle partial messages with buffer accumulator
				dataBuffer += data.toString();
				var lines = dataBuffer.split("\n");
				dataBuffer = lines.pop() || '';  // Keep incomplete line in buffer

				var topic0 = null;
				var topic1 = null;
				var topic2 = null;
				var topic3 = null;
				var payload = {};

				for(var i = 0; i < lines.length; i++) {
					var line = lines[i];

					// Fixed: Validate line length before slicing
					if(line.length < 27)
						continue;

					var row = line.slice(27);  // Fixed: Use slice instead of deprecated substr
					row = row.replace(/'/g, "");

					if(row.search('- Event -') >= 0) {  // New event
						topic0 = null;
						topic1 = null;
						topic2 = null;
						topic3 = null;
						payload = {};
						continue;
					}

					if(row.search('-------------------------') >= 0) {
						var send = true;

						// Fixed: Validate meaningful payload exists
						if(topic0 && topic1 && Object.keys(payload).length > 0) {
							var topic = topic0 + "/" + topic1;
							if(topic2) {
								topic += "/" + topic2;
								if(topic2 === "xinternal_data")
									send = false;
							}
							if(topic3)
								topic += "/" + topic3;

							// Ignore events
							if(node.group !== "All events" && topic.search(node.group) < 0)
								send = false;

							if(send && topic0 === "audiocontrol")
								send = false; 

							if(send)
								node.send({
									topic: topic,
									payload: payload
								});
						}
						continue;
					}

					var brackets = row.match(/\[(.*?)\]/);
					var bracket = (brackets && brackets.length > 0) ? brackets[1] : null;

					if(!bracket)
						continue;

					// Parse topics with defensive checks
					if(bracket.search("topic0") >= 0) {
						var parts = bracket.split(" = ");
						if(parts.length >= 2) {
							var value = parts[1].split(" ");
							topic0 = value.length > 0 ? value[0].toLowerCase() : null;
						}
						continue;
					}
					if(bracket.search("topic1") >= 0) {
						var parts = bracket.split(" = ");
						if(parts.length >= 2) {
							var value = parts[1].split(" ");
							topic1 = value.length > 0 ? value[0].toLowerCase() : null;
						}
						continue;
					}
					if(bracket.search("topic2") >= 0) {
						var parts = bracket.split(" = ");
						if(parts.length >= 2) {
							var value = parts[1].split(" ");
							topic2 = value.length > 0 ? value[0].toLowerCase() : null;
						}
						continue;
					}
					if(bracket.search("topic3") >= 0) {
						var parts = bracket.split(" = ");
						if(parts.length >= 2) {
							var value = parts[1].split(" ");
							topic3 = value.length > 0 ? value[0].toLowerCase() : null;
						}
						continue;
					}

					// Fixed: Validate split results
					var items = bracket.split(' = ');
					if(items.length < 2)
						continue;

					var property = items[0].split(" ")[0].replace(/[^\w\s]/g, '').toLowerCase();
					var value = items[1];

					// Fixed: Validate parseInt results
					if(isNaN(value) === false) {
						var parsed = parseInt(value);
						if(!isNaN(parsed))
							value = parsed;
					}

					// Make boolean conversions
					if(property === "active")
						value = value !== 0;
					if(property === "state")
						value = value !== 0;
					if(property === "ready")
						value = value !== 0;
					if(property === "failed")
						value = value !== 0;
					if(property === "connected")
						value = value !== 0;
					if(property === "day")
						value = value !== 0;
					if(property === "running")
						value = value !== 0;
					if(property === "disruption")
						value = value !== 0;
					if(property === "logicalstate") {
						property = "state";
						value = value !== 0;
					}
					if(value === "Yes")
						value = true;
					if(value === "No")
						value = false;

					// Remove unwanted properties
					if(property === "relaytoken")
						continue;
					if(property === "inputtoken")
						continue;
					if(property === "videosourceconfigurationtoken")
						continue;
					if(property === "diskmountpoint")
						continue;

					payload[property] = value;
				}
			});

			// Fixed: Kill process on error
			listener.on('error', (error) => {
				node.error("Events not available", {payload: "Unable to locate service: " + error.message});
				node.status({fill:"red", shape:"dot", text:"Stopped"});
				if(listener) {
					listener.kill();
				}
			});

			listener.stderr.on('data', (data) => {
				node.error("Device Event error", {topic: "Error", payload: data.toString()});
			});

			listener.on('close', (code) => {
				if(restart) {
					node.warn("Events process exited", {payload: "Exit code: " + code + ", restarting in 2s"});
					setTimeout(function(){
						if(restart) {  // Double-check restart flag
							eventlistner = setupEventListener();  // Fixed: Properly setup new listener
						}
					}, 2000);
				} else {
					node.status({fill:"red", shape:"dot", text:"Stopped"});
				}
			});

			return listener;
		}

		// Initialize the event listener
		eventlistner = setupEventListener();

		node.on('close', (done) => {
			restart = false;
			node.status({fill:"red", shape:"dot", text:"Stopped"});
			if(eventlistner) {
				eventlistner.kill();  // Terminate the child process
			}
			done();
		});
	}

	RED.nodes.registerType("Events", AXIS_Events, {
		defaults: {
			group: { type: "text" },
			initialization: { type: "boolean" }
		}		
	});
}
