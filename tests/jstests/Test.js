/**
 * @author John Robinson
 */

var pkg = rad.getPackage("util.test");

pkg.Test = rad.core.RadClass.extend({
	
	_className:"Test",
	name:"Test",
	_assert:{}, //object you expect to match against _result 
	_result:{},
	
	//Events
	//..
	
	//override in subclasses for additional setup code.
	setup:function(asserts) {
		this._asserts = asserts;
		this._result = {};
		console.groupEnd();
	},
	
	//override run completely to handle yourself.
	run:function() {
		
		console.group(this.name);
		console.profile(this.name);
		console.time(this.name);
		try {
			this._run();//override in subclasses
		} catch(e) {
			//debugger;
			this.error("ERROR! ", e.message, e);
			console.trace();
		}
		this.done();
		console.timeEnd(this.name);
		console.profileEnd();
		console.groupEnd();
	},
	
	// override (@private) _run to inject logic before .done()
	_run:function() {
		//...
	},
	//TODO: provide a better 'deep compare' function.
	done:function() {
		for(var i in this._asserts) {
			if(typeof this._asserts[i] == "object") {
				//need to do a deeper compare here...
				for(var a in this._asserts[i]) {
					if(this._asserts[i][a] !== this._result[i][a]) {
						return;
					}
				}
			} else if(this._asserts[i] != this._result[i]) {
				this.fail(i, this._asserts[i], this._result[i]);
				return;
			}
		}
		//if we make it here, we passed!
		this.pass();
	},
	
	pass:function() {
		this.log("test passed!", this._asserts, this._result);
	},
	
	fail:function(prop, assertProp, resultProp) {
		this.error("test failed. property:", prop, "result value:",resultProp, "didn't match assert value:", assertProp);
	},
	
	_deepCompare:function(a,b) {
		//...
	}
});