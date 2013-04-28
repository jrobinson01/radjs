var pkg = rad.getPackage("model");

pkg.CachableModel = pkg.Model.extend({
	
	_className:"CachableModel",
	name:"CachableModel",
	_expiration:null,//time in milliseconds before this model should expire.
	_modified:new Date().getTime(),
	
	_defaults:{},
	
	init:function(name, expiration) {
		this._super(name);
		this._cacheKey = this.name+"-"+this._className;
		this._restore();
	},
	
	set:function(key, value) {
		this._super(key, value);
		localStorage.setItem(this._cacheKey+"-"+key, JSON.stringify(value));
		this._modified = new Date().getTime();
		//TODO: store modified time in cache as well?
	},
	
	get:function(key) {
		var tv = this._super(key);
		if(tv == undefined) {
			//this doesn't solve another window changing the property...
			tv = JSON.parse(localStorage.getItem(this._cacheKey+"-"+key));
			this[key] = tv;
		}
		return tv;
	},
	
	_restore:function(defaults) {
		//we need to loop through a list of known properties
		//and fetch them from localStorage
		//...or lazy load stuff from cache as 'get' is called?
		for(var i in this._defaults) {
			//
			this.set(i, this.get(i));
		}
	},
	
	reset:function() {
		this._super();
		this._restore();
	}
});
