/** should we package tests? **/
var ACTest = rad.util.test.Test.extend({
	
	_className:"ACTest",
	name:"ACTest",
	_debug:true,
	
	_data:[],
	
	setup:function(asserts, data, key) {
		this._super(asserts);
		this._data = data;
		this._ac = new rad.collection.Collection(this._data, key);
		this._ac.addListener("Collection.add", this._onAddEvent, this);
	},
	
	_run:function() {
		this.log("running add test.");
		this._ac.addItem({test:"whoa"});
	},
	
	_onAddEvent:function(event) {
		this.log("got event!", event);
		this._result.itemAdded = true;
	}
});

var asserts = {itemAdded:true};
var acTest = new ACTest();
acTest.setup(asserts,[], 'test');
acTest.run();