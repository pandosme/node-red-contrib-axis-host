//Copyright (c) 2023 Fred Juhlin

module.exports = function(RED) {
	
    function AXIS_Events(config) {
		RED.nodes.createNode(this,config);
		this.group = config.group;		
		var node = this;
		
		node.on('input', function(msg) {
			var group = msg.group || node.group;

			switch( group ) {
				case "Group 1":
					msg.payload = "Not yet implemented";
					node.error("Not yet implemented", msg);
				break;
				case "Set":
					msg.payload = "Not yet implemented";
					node.error("Not yet implemented", msg);
				break;
			}
        });
    }
	
    RED.nodes.registerType("Axis Event",AXIS_Events,{
		defaults: {
			group: { type:"text" }
		}		
	});
}
