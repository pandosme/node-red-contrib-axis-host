//Copyright (c) 2023 Fred Juhlin
//Updated: 2025-12-01 - Complete filtering with group selection

const { spawn } = require('child_process');

module.exports = function(RED) {

    function AXIS_Events(config) {
		RED.nodes.createNode(this, config);
		this.group = config.group;
		this.initialization = config.initialization;
		var node = this;
		var suppress = false;
		var restart = true;
		var eventlistner = null;
		var dataBuffer = '';

		// Event state
		var currentEvent = null;
		var inEvent = false;

		if(node.initialization) {
			suppress = true;
			setTimeout(function(){
				suppress = false;
			}, 5000);
		}

		// Helper: Strip ANSI escape codes and MESSAGE prefix
		function stripPrefix(line) {
			// Remove ANSI color codes (e.g., \x1b[32;01m or \u001b[32;01m)
			var cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '');
			cleanLine = cleanLine.replace(/\u001b\[[0-9;]*m/g, '');

			// Match and extract after <MESSAGE >
			var match = cleanLine.match(/^<MESSAGE\s*>\s*(.*)$/);
			return match ? match[1].trim() : cleanLine.trim();
		}

		// Helper: Parse timestamp to EPOCH with milliseconds
		function parseTimestamp(value) {
			// Check if already a valid number (including decimals)
			if(/^-?\d+\.?\d*$/.test(value)) {
				return parseFloat(value);
			}

			// Otherwise try to parse as ISO 8601 date string
			try {
				var date = new Date(value);
				if(!isNaN(date.getTime())) {
					return date.getTime() / 1000;  // Convert to seconds with decimals
				}
			} catch(e) {
				// Parsing failed
			}

			// Return as-is if both methods fail
			return value;
		}

		// Helper: Extract bracket content from line
		function extractBracket(line) {
			var match = line.match(/\[([^\]]+)\]/);
			return match ? match[1] : null;
		}

		// Helper: Parse topic line
		function parseTopic(bracketContent) {
			// Match topicX in various formats
			var topicMatch = bracketContent.match(/topic(\d+)/);
			if(!topicMatch) return null;

			var topicNumber = topicMatch[1];
			var topicValue = null;

			// First, try parentheses immediately after topicX: topic1 (value)
			var parenMatch = bracketContent.match(/topic\d+\s*\(([^)]+)\)/);
			if(parenMatch) {
				topicValue = parenMatch[1];
			} else {
				// Otherwise extract after = with optional quotes
				var valueMatch = bracketContent.match(/=\s*['"]?([^'"\s()]+)['"]?/);
				if(valueMatch) {
					topicValue = valueMatch[1];
				}
			}

			if(topicValue) {
				return {
					number: topicNumber,
					value: topicValue
				};
			}
			return null;
		}

		// Helper: Parse property line
		function parseProperty(bracketContent) {
			// Split on first = sign
			var eqIndex = bracketContent.indexOf('=');
			if(eqIndex < 0) return null;

			var key = bracketContent.substring(0, eqIndex).trim();
			var value = bracketContent.substring(eqIndex + 1).trim();

			// Remove any parentheses from key
			key = key.replace(/\s*\([^)]*\)/g, '');
			key = key.toLowerCase();

			// Remove quotes and take first token from value
			value = value.replace(/^['"]|['"]$/g, '');
			value = value.split(/\s/)[0];

			return { key: key, value: value };
		}

		// Helper: Convert property to appropriate type
		function convertProperty(key, value) {
			// State properties - all become 'state' with boolean value
			var stateProperties = [
				'active', 'state', 'ready', 'failed', 'connected', 
				'day', 'running', 'disruption', 'logicalstate',
				'alert', 'systeminitializing'
			];

			if(stateProperties.indexOf(key) >= 0) {
				var boolValue = (value === '1' || value === 'Yes');
				return { key: 'state', value: boolValue };
			}

			// Timestamp properties - handle both EPOCH numbers and ISO strings
			var timestampProperties = [
				'triggertime', 'stoptime', 'starttime', 'resettime'
			];

			if(timestampProperties.indexOf(key) >= 0) {
				return { key: key, value: parseTimestamp(value) };
			}

			// Try to convert to number (integer or float)
			if(/^-?\d+\.?\d*$/.test(value)) {
				var num = parseFloat(value);
				// Return integer if no decimal part
				return { key: key, value: (num % 1 === 0) ? parseInt(value) : num };
			}

			// Keep as string
			return { key: key, value: value };
		}

		// Helper: Emit complete event
		function emitEvent(event) {
			// Validate we have at least topic0 and topic1
			if(!event.topics[0] || !event.topics[1]) {
				return;
			}

			// Build topic string
			var topic = event.topics[0];
			if(event.topics[1]) topic += '/' + event.topics[1];
			if(event.topics[2]) {
				// Filter out internal data events
				if(event.topics[2] === 'xinternal_data') {
					return;
				}
				topic += '/' + event.topics[2];
			}
			if(event.topics[3]) {
				topic += '/' + event.topics[3];
			}

			// Filter out audiocontrol events (always)
			if(event.topics[0].toLowerCase() === 'audiocontrol') {
				return;
			}

			// Filter by group (case-insensitive search)
			if(node.group !== "All events") {
				var topicLower = topic.toLowerCase();
				if(topicLower.search(node.group.toLowerCase()) < 0) {
					return;
				}
			}

			// Only send if we have payload data
			if(Object.keys(event.payload).length === 0) {
				return;
			}

			node.send({
				topic: topic,
				payload: event.payload
			});
		}

		// Helper: Process a single line
		function processLine(line) {
			// Strip ANSI codes and MESSAGE prefix
			var content = stripPrefix(line);

			// Skip empty lines
			if(!content || content.length === 0) {
				return;
			}

			// Check for event start: must contain 'Event' with dashes
			// Pattern: '---- Event ------------------------'
			if(content.search(/----\s*Event\s*----/) >= 0) {
				// Emit previous event if exists
				if(inEvent && currentEvent) {
					emitEvent(currentEvent);
				}
				// Start new event
				currentEvent = {
					topics: [null, null, null, null],
					payload: {}
				};
				inEvent = true;
				return;
			}

			// Check for event end: only dashes (no 'Event' text)
			// Pattern: '-----------------------------------' (30+ dashes, no other text)
			if(/^-{30,}$/.test(content)) {
				if(inEvent && currentEvent) {
					emitEvent(currentEvent);
					currentEvent = null;
				}
				inEvent = false;
				return;
			}

			// Skip metadata lines
			if(content.search(/^<\s*(Property|Internal)\s*>/) >= 0) {
				return;
			}
			if(content.search(/^(Global|Local|Producer|Timestamp)\s*(Declaration)?\s*Id/i) >= 0) {
				return;
			}

			// Skip if not in event
			if(!inEvent || !currentEvent) {
				return;
			}

			// Extract bracketed content
			var bracketContent = extractBracket(content);
			if(!bracketContent) {
				return;
			}

			// Try parsing as topic
			var topicData = parseTopic(bracketContent);
			if(topicData) {
				var idx = parseInt(topicData.number);
				if(idx >= 0 && idx <= 3) {
					currentEvent.topics[idx] = topicData.value;
				}
				return;
			}

			// Try parsing as property
			var propertyData = parseProperty(bracketContent);
			if(!propertyData) {
				return;
			}

			// Skip unwanted properties
			var skipKeys = [
				'relaytoken', 'inputtoken', 'videosourceconfigurationtoken', 
				'diskmountpoint', 'source', 'token', 'channel', 'port',
				'disk_id', 'name', 'status', 'temperature', 'overall_health',
				'wear', 'diskreadwritefailure', 'disktype', 'diskremoved',
				'diskavailable', 'diskunmountedsafely', 'diskreadonly',
				'timestamp', 'diskrecipientdisk', 'diskid', 'diskrecordingmaxage',
				'diskcleanuppolicy', 'eventname', 'diskdisruption', 'diskstatus',
				'category', 'diskstoragedisk', 'diskfull', 'diskmountpoint',
				'diskboundshareid', 'disklocked'
			];

			if(skipKeys.indexOf(propertyData.key) >= 0) {
				return;
			}

			// Convert property
			var converted = convertProperty(propertyData.key, propertyData.value);
			currentEvent.payload[converted.key] = converted.value;
		}

		// Setup event listener
		function setupEventListener() {
			const listener = spawn('eventlistener');
			node.status({fill:"green", shape:"dot", text:"Running"});

			// Reset state
			dataBuffer = '';
			currentEvent = null;
			inEvent = false;

			listener.stdout.on('data', (data) => {
				if(suppress) {
					return;
				}

				try {
					// Accumulate data
					dataBuffer += data.toString();
					var lines = dataBuffer.split("\n");
					dataBuffer = lines.pop() || '';

					// Process each line
					for(var i = 0; i < lines.length; i++) {
						processLine(lines[i]);
					}
				} catch(error) {
					node.error("Parser error: " + error.message);
				}
			});

			listener.on('error', (error) => {
				node.error("Events not available: " + error.message);
				node.status({fill:"red", shape:"dot", text:"Error"});
				if(listener) {
					listener.kill();
				}
			});

			listener.stderr.on('data', (data) => {
				node.error("stderr: " + data.toString());
			});

			listener.on('close', (code) => {
				if(restart) {
					setTimeout(function(){
						if(restart) {
							eventlistner = setupEventListener();
						}
					}, 2000);
				} else {
					node.status({fill:"red", shape:"dot", text:"Stopped"});
				}
			});

			return listener;
		}

		// Initialize
		eventlistner = setupEventListener();

		node.on('close', (done) => {
			restart = false;
			node.status({fill:"red", shape:"dot", text:"Stopped"});
			if(eventlistner) {
				eventlistner.kill();
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
