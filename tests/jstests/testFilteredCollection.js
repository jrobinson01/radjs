/**
 * @author John Robinson
 */
var FCTest = rad.util.test.Test.extend({
	
	_className:"FCTest",
	name:"FCTest",
	_debug:true,
	
	_data:[],
	
	setup:function(asserts, data, key) {
		this._super(asserts);
		this._data = data;
		this._ac = new rad.collection.Collection(this._data, key);
		this._fac = new rad.collection.FilteredCollection(this._ac, "", rad.model.Model);
	},
	
	_run:function() {
		this.log("running add test.");
		this._ac.addItem(new rad.model.Model("testModel",{test:"whoa"}));
		this._fac.setFilter({test:"whoa"});
		this._result.fcLength = this._fac.getLength();
	}
	
});
//TODO: genericize FCTest and subclass for each type of interaction
// adds, removes, updates, etc.
var asserts = {fcLength:1};
var fcTest = new FCTest();
fcTest.setup(asserts,[], 'test');
fcTest.run();