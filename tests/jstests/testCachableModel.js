/**
 * @author John Robinson
 */

//create a subclass of Test to test the EventDispatcher
var CachableModelTest = rad.util.test.Test.extend({
	
	_className:"CachableModelTest",
	name:"CachableModelTest",
	_debug:true,
	
	setup:function(asserts) {
		this._super(asserts);
		this.model = new rad.model.CachableModel("test");
	},
	
	_run:function() {
		this.model.addListener("PropertyChange.myProp", this.onMyPropChange, this);
		this.model.set("myProp", "bubbles");
		this.model.removeListener("Event.event", this.onMyPropChange, this);
		this.model.destroy();
	},
	
	onMyPropChange:function(event) {
		this.log("onEvent", event._type);
		this._result.oldValue = event.oldValue;
		this._result.newValue = event.newValue;
	}
	
});

//run it!
var myTest = new CachableModelTest();
myTest.setup({oldValue:undefined, newValue:"bubbles"});
myTest.run();//call public run