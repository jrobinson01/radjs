
/**
 * @author John Robinson
 * @description Closure to enclose the Rad library
 */
(function(scope, undefined) {

	//create the rad and rad core namespace
	
	//if exports exists, we're running in node.
	if(typeof exports !== 'undefined') {
		 rad = exports;//Backbone does this, but I'm not sure what it actually does?
	 } else {
		 rad = scope.rad = {};
	 }

	//var rad = {};
	//window.rad = rad;
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
		scope.rad = window.rad;
		delete window.rad;
	};
	
	//include all class files (ANT)
	//closure end is in close.js	