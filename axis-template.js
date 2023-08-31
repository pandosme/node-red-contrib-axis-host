//Copyright (c) 2023 Fred Juhlin
const HTTP_digest = require('./axis-digest');

module.exports = function(RED) {
	
    function AXIS_Template(config) {
		RED.nodes.createNode(this,config);
		this.preset = config.preset;		
		this.action = config.action;
		this.options = config.options;
		var node = this;
		
		node.on('input', function(msg) {
			node.status({});
			var preset = RED.nodes.getNode(node.preset);
			var device = {
				address: msg.address || preset.address,
				user: msg.user || preset.credentials.user,
				password: msg.password || preset.credentials.password,
				protocol: preset.protocol || "http"
			}
			
			var action = msg.action || node.action;
			var options = node.options || msg.payload;

			console.log(action);

			switch( action ) {
				case "Get":
					var cgi = "/axis-cgi/param.cgi?action=list&group=properties";
					HTTP_digest.get( device, cgi, "text", function( error, response ) {
						msg.payload = response;
						if( error ) {
							node.error(response.statusMessage, msg);
							return;							
						}
						msg.payload = msg.payload.split("\n");  //Return array;
						node.send(msg);
					});
				break;
				case "Set":
					msg.payload = "Set not yet implemented";
					node.error("Set not yet implemented", msg);
				break;
			}
        });
    }
	
    RED.nodes.registerType("Axis Template",AXIS_Template,{
		defaults: {
			preset: {type:"Axis Device"},
			action: { type:"text" },
			options: { type:"text" }
		}		
	});
}
