//Copyright (c) 2023 Fred Juhlin

const { exec } = require('child_process');

module.exports = function(RED) {
	
    function Axis_Trigger(config) {
		RED.nodes.createNode(this,config);
		this.eventID = config.eventId;
		this.value = config.value;
		var node = this;

		node.on('input', function(msg) {
			var eventId = node.eventID;
			var value = node.value || msg.payload;

			var command = "/usr/local/packages/Nodered/opt/eventcli";
			switch( eventId ) {
				case "event":
					if( typeof value === "string" )
						value = parseInt(value);
					if( isNaN(value) ) {
						msg.payload = "Value must be a number";
						node.error("Invlid input",msg);
						return;
					}
					command += " -t 0 -v " + value;
					break;
				case "state":
					if( value === "true" )
						value = 1;
					if( value === "false" )
						value = 1;
					if( typeof value === "string" )
						value = parseInt(value);
					if( value === true )
						value = 1;
					if( value === false )
						value = 0;
					if( isNaN(value) ) {
						msg.payload = "Value must be a boolean";
						node.error("Invlid input",msg);
						return;
					}
					command += " -t 1 -s " + value;
					break;
				case "data":
					if( typeof value === "number" )
						value = value.toString();
					if( typeof value === "object" )
						value = JSON.stringify(value);
					if( typeof value !== "string" ) {
						msg.payload = "Value must be a string";
						node.error("Invlid input",msg);
						return;
					}
					command += " -t 2 -d " + value;
					break;
			}
			exec(command,(error, stdout, stderr) => {
				if (error) {
					node.error("Trigger not available",{payload:"Trigger service not found"});
					return;
				}
				if (stderr) {
					node.error("Trigger failed",{payload:stderr});
					return;
				}
			});
		});
    }
	
    RED.nodes.registerType("Trigger",Axis_Trigger,{
		defaults: {
			eventId: { type:"text" },
			value: { type: "text" }
		}				
	});
}
