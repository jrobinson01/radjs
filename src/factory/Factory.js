var pkg = rad.getPackage("factory");

pkg.Factory = rad.core.RadClass.extend({
	
	className:"Factory",
	name:"Factory",
	_debug:true,
	
	_product:null,//Class reference
	_key:null,//unique key for singletons
	_products:null,//Collection
	
	init:function(product, key ){
		this._product = (product instanceof rad.core.RadClass) ? product : Object;
		this._key = key || null;
		this._products = new rad.collection.Collection([], this._key);
		this._super();
	},
	
	get:function(id) {
		//build our keyed object...
		var oKey = {};
		oKey[this._key] = id;
		var instance = this._products.getItem(oKey);
		if(instance === undefined) {
			instance = new this._product(id);
			this._products.addItem(instance);
		}
		return instance;
	}

});
