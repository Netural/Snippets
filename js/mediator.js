var Mediator = function() {
		
	var channels = {};
	
	//
	// Subscribe to a channel
	//
	function subscribe( channel, fn, that ) {
		if ( !channels[channel] ) {
			channels[channel] = [];
		}
    	channels[channel].push({ context: that, callback: fn });	
	}
	
	//
	// Publish a channel (like triggering an event)
	//
	function publish( channel ) {

		if (!channels[channel]) {
			return false;
		}
    	var args = Array.prototype.slice.call(arguments, 1);
    	for (var i = 0, l = channels[channel].length; i < l; i+=1) {
            var subscription = channels[channel][i];
            if(typeof subscription.context === undefined ) {
            	subscription.callback( args );
            } else {
            	subscription.callback.call( subscription.context, args);
            }
        }
	}
	
	return {
		subscribe: subscribe,
		publish: publish
	}
	
};