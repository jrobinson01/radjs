var pkg = rad.getPackage("model");

pkg.Model = rad.event.EventDispatcher.extend({
	
	_className:"Model",
	name:"Model",
	
	_data:null,
	
	init:function(name, defaults) {
		this._data = defaults || {};
		this.name = name;
		//this._data = {};
		this._super();
	},
	
	set:function(key, value){
		var tv = this._data[key];
		if(tv != value) {
			this._data[key] = value;
			//dispatch a unique event for this property
			this._dispatch(new rad.event.PropertyChangeEvent(key, value, tv));
			//dispatch a more generic event that doesn't take the property into account.
			this._dispatch(new rad.event.ChangeEvent(this));
		}
	},
	
	get:function(key) {
		return this._data[key];
	},
	
	reset:function() {
		this._data = {};//ugh?
		//this._dispatch(new rad.event.ChangeEvent(this),)
	}
});

