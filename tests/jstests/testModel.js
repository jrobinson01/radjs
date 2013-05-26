/**
 * @author John Robinson
 */

//create a subclass of Test to test the EventDispatcher
var ModelTest = rad.util.test.Test.extend({
	
	_className:"ModelTest",
	name:"ModelTest",
	_debug:true,
	
	setup:function(asserts) {
		this._super(asserts);
		this.model = new rad.model.Model("test");
	},
	
	_run:function() {
		this.model.addListener("PropertyChange.myProp", this.onMyPropChange, this);
		this.model.set("myProp", "bubbles");
		this.model.removeListener("Event.event", this.onMyPropChange, this);
		this.model.destroy();
	},
	
	onMyPropChange:function(event) {
		this.log("onEvent", event.type);
		this._result.oldValue = event.oldValue;
		this._result.newValue = event.newValue;
	}
	
});

//run it!
var myTest = new ModelTest();
myTest.setup({oldValue:undefined, newValue:"bubbles"});
myTest.run();//call public run