
/**
 * @author John Robinson
 * @description provides scope for the Rad library
 */

(function() {
	
	var rad, scope, orig;
	
	scope = this;
	
	orig = scope.rad;
	
	//if exports exists, we're running in node.
	if(typeof exports !== 'undefined') {
		 rad = exports;
	 } else {
		 rad = scope.rad = {};
	 }
	
	//create the rad core namespace manually
	rad.core = {};
	rad.core.debug = true;//flag for debugging
	
	//utility to create namespaced packages
	rad.getPackage = function(ns) {
		var sp = String(ns).split(".");//example: 'event.arrayCollection'
		var current = rad;
		for(var i=0; i<sp.length; i++) {
			if(current[sp[i]] === undefined) {
				current[sp[i]] = {};
			}
			current = current[sp[i]];
		}
		return current;
	};
	
	//avoid conflicts
	rad.noConflicts = function(scope) {
		scope.rad = orig;
		return this;
	};
	
	//include all class files (ANT)
	//end is in close.js	