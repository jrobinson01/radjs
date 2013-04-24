/**
 * @author John Robinson
 */
var pkg = rad.getPackage("event");
pkg.EventDispatcher = rad.core.RadClass.extend({
	
	_className:"EventDispatcher",
	_eventListeners:{},
	
	init:function() {
		this._super();
		this._eventListeners={};
	},
	
	addListener:function(eventName, handler, scope) {
		if(this._eventListeners[eventName] == undefined) {
			this._eventListeners[eventName] = [];
		}
		//deal with missing scope/handler here (especially handler)!?
		this._eventListeners[eventName].push({scope:scope, handler:handler});
		return this;
	},
	
	removeListener:function(eventName, handler, scope){
		var el = this._eventListeners[eventName];
		if( el !== undefined) { 
			for(var i=0; i<el.length; i++) {
				if(el[i].scope == scope && el[i].handler == handler) {
					el.splice(i,1);
					break;
				}
			}
		}
		return this;
	},
	
	_dispatch:function(event) {
		if(event instanceof rad.event.Event) {
			var eName = event._ns;
			if(this._eventListeners[eName] !== undefined) {
				var el = this._eventListeners[eName];
				for(var i=0; i<el.length; i++) {
					
					if(!event.isPropagationStopped()) {
						var item = el[i];
						var scope = (item.scope === undefined || item.scope === null) ? undefined : item.scope;
						
						//this allows for multiple arguments to be passed, not sure if that's good or bad, but I think, BAD.
						//JSPerf the difference?
						//el[i].handler.apply(el[i].scope, arguments);
						//or
						if(scope != undefined) {
							item.handler.apply(scope, arguments);
						} else{
							//scope is nada, try handler directly.
							item.handler(event);
						}
						
					} else {
						break;
					}
				}
			}
			//event.destroy();//egad. I wonder if events will get GC'd??
			return this;
		} else {
			throw new Error("invalid event passed to _dispatch");
		}
	}
	
});