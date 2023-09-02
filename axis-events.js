//Copyright (c) 2023 Fred Juhlin

const { spawn } = require('child_process');

module.exports = function(RED) {
	
    function AXIS_Events(config) {
		RED.nodes.createNode(this,config);
		this.group = config.group;		
		var node = this;

        const eventlistner = spawn('eventlistener');

        eventlistner.stdout.on('data', (data) => {
			var rows = data.toString().split("\n");
			for( var i = 0; i < rows.length; i++) {
			}
			var topic0 = null;
			var topic1 = null;
			var topic2 = null;
			var topic3 = null;
			var event = false;
			var search = false;
			var payload = {};

			for( var i = 0; i < msg.payload.length; i++ ) {
				var row = rows[i].substr(27);
				rows = row.replace(/'/g,"");
				
				search = false;
				if (row.search('- Event -') >= 0 ){ //New event
					topic0 = null;
					topic1 = null;
					topic2 = null;
					topic3 = null;
					payload = {};
				} else {
					if (row.search('-------------------------') >= 0) {
						if(topic0 && topic1 ) {
							var topic = topic0 + "/" + topic1;
							if( topic2 )
								topic += "/" + topic2;
							if (topic3)
								topic += "/" + topic3;
							var send = true;

							//Ignore events
							if( node.group && node.group.length && topic.search(node.group) < 0 )
								send = false

							if( send )
								node.send({
									topic: topic,
									payload: payload
								});
						}
					}  else {
						var brackets = row.match(/\[(.*?)\]/);
						var bracket = (brackets && brackets.length > 0) ? brackets[1]:null;
						if (bracket) {
							if (bracket.search("topic0") >= 0) {
								topic0 = bracket.split(" = ")[1].split(" ")[0].toLowerCase();
								search = true;
							}
							if (search == false && bracket.search("topic1") >= 0) {
								topic1 = bracket.split(" = ")[1].split(" ")[0].toLowerCase();
								search = true;
							}
							if (search == false && bracket.search("topic2") >= 0) {
								topic2 = bracket.split(" = ")[1].split(" ")[0].toLowerCase();
								search = true;
							}
							if (search == false && bracket.search("topic3") >= 0) {
								topic3 = bracket.split(" = ")[1].split(" ")[0].toLowerCase();
								search = true;
							}
							if (search == false ) {
								if (bracket && bracket.length) {
									var items = bracket.split(' ');
									if(items.length > 1) {
										var property = items[0].replace(/[^\w\s]/g, '').toLowerCase();
										var value = items[items.length - 1];

										//Make number and cleanup
										if( isNaN(value) === false )
											value = parseInt(value);
										else
											value = value.replace(/[^\w\s]/g, '');

										//Make boolean
										if (property === "active")
											value = value !== 0;
										if (property === "state")
											value = value !== 0;
										if (property === "ready")
											value = value !== 0;
										if (property === "failed")
											value = value !== 0;
										if (property === "connected")
											value = value !== 0;
										if (property === "day")
											value = value !== 0;
										if (property === "running")
											value = value !== 0;
										if (property === "disruption")
											value = value !== 0;
										if (property === "logicalstate") {
											property = "state";
											value = value !== 0;
										}
										//Remove properties
										if (property === "relaytoken")
											value = null;
										if (property === "inputtoken")
											value = null;
										if (property === "videosourceconfigurationtoken")
											value = null;

										if(value !== null )
											payload[property] = value;
									}
								}
							}
						}
					}
				}
			}
        });

        eventlistner.on('error', (error) => {
            node.error("Eventlistener failed",error );
        });

        eventlistner.stderr.on('data', (data) => {
            node.error("Eventlistener failed",{topic:"Error",payload:data.toString()} );
        });

        eventlistner.on('close', (code) => {
            node.log('Child process exited with code ${code}');
        });

        node.on('close', (done) => {
            // Clean up when the node is closed
            if (eventlistner) {
                eventlistner.kill(); // Terminate the child process
            }
            done();
        });
    }
	
    RED.nodes.registerType("Device Events",AXIS_Events,{
		defaults: {
			group: { type:"text" }
		}		
	});
}
