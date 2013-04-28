/**
 * @author John Robinson
 */
var pkg = rad.getPackage("event");
pkg.EventDispatcher = rad.core.RadClass.extend({
	
	_className:"EventDispatcher",
	_eventListeners:{},
	_debug:true,
	
	init:function() {
		this._super();
		this._eventListeners={};
	},
	
	//eventName can be a single string (ex: Collection.add, Change, etc)
	//or a list of events (ex: "Collection.add Collection.remove")
	addListener:function(eventName, handler, scope) {
		var names = this._parseEventName(eventName);
		var n;
		for(var i=0; i<names.length; i++) {
			n = names[i];
			//loop and add listeners for each name
			if(this._eventListeners[n] == undefined) {
				this._eventListeners[n] = [];
			}
			//deal with missing scope/handler here (especially handler)!?
			this._eventListeners[n].push({scope:scope, handler:handler});
			}
		return this;
	},
	
	
	removeListener:function(eventName, handler, scope){
		
		if(eventName === null || eventName === undefined) {
			if(handler === null || handler === undefined) {
				if(scope !== null && scope !== undefined) {
					//if both eventName and handler are null but scope is not, remove ALL listeners
					// for the scope object.
					this.log("scope is not null, removing all listeners for scope:", scope, this._eventListeners);
					for(var i in this._eventListeners) {
						for(var a=this._eventListeners[i].length-1; a>=0; a--) {
							
							this.log("removing:", i, a, this._eventListeners[i][a].scope);
							this.removeListener(i, this._eventListeners[i][a].handler, this._eventListeners[i][a].scope);
						}
					}
					return this;
				} else {
					return this;//not much to do here
				}
			}
		}
		var names = this._parseEventName(eventName);
		var n;
		for(var i=0; i<names.length; i++) {
			n = eventName[i];
		if(n !== null && n !== undefined) {
			var el = this._eventListeners[n];
			if( el !== undefined) { 
				for(var i=0; i<el.length; i++) {
					if(el[i].scope == scope && el[i].handler == handler) {
						el.splice(i,1);
						break;
					}
				}
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
			//event.destroy();//egad. this results in the event not being populated.
			//TODO: investigate what cases would causes events to not get GC'd!
			return this;
		} else {
			throw new Error("invalid event passed to _dispatch");
		}
	},
	
	_parseEventName:function(eventName) {
		var names = [];
		if(typeof eventName == "string") {
			names = eventName.split(" ");
		}
		return names;
	}
	
});