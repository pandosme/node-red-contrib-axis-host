//Copyright (c) 2023 Fred Juhlin

module.exports = function(RED) {
	
    function AXIS_JEPG(config) {
		RED.nodes.createNode(this,config);
		this.resolution = config.resolution;
		var node = this;

		node.on('input', function(msg) {
			var resolution = msg.resolution || node.resolution;
			node.error("Not yet implemented",msg);
		});
    }
	
    RED.nodes.registerType("Camera JPEG",AXIS_JPEG,{
		defaults: {
			resolution: { type:"text" }
		}		
	});
}
