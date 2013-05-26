/**
 * @author John Robinson
 * @description Base Class for all classes in the Rad Library
 */
 
var pkg = rad.getPackage("core");

pkg.RadClass = Class.extend({
	 
	_className:"RadClass",//reflects the name of our class
	name:"RadClass",//instance name (optional, used in logging)
	
	_uniqueId:null,
	_debug:false,//whether or not we want to log to the console
	
	init:function() {
		//should NOT call _super in our first class's init.
		this._uniqueId = Math.round(Math.random()*10000)+new Date().getTime();
	},
	
	/** handy utility methods */
	// returns true if the parameter is undefined
	undef:function(o) {
		if(typeof o === "undefined") {
			return true;
		}
		return false;
	},
	
	//returns true if this has the desired property
	has:function(prop) {
		return !this.undef(this[prop]);
	},
	
	/** handy logging methods */
	log:function(){
		if(rad.core.debug && this._debug) {
			if(console !== undefined && console.log) {
				arguments[0] = this.name+":"+arguments[0];
				return console.log.apply(console, arguments);
			}
		}
	},
	
	error:function() {
		if(rad.core.debug && this._debug) {
			if(console !== undefined && console.error !== undefined) {
				arguments[0] = this.name+":"+arguments[0];
				return console.error.apply(console, arguments);
			}
		}
	},
	
	destroy:function() {
		//hmm..
		//this *should* just delete our references to a property we've assigned
		// if the reference has other things referencing it.
		// if the property doesn't have any more references, it should
		// be deleted.
		for(var i in this) {
			delete this[i];
		}
	}
});
