/**
 * @name FilteredCollection
 */

var pkg = rad.getPackage("collection");
pkg.FilteredCollection = pkg.Collection.extend(/** @lends FilteredCollection.prototype **/{
	
	_className:"FilteredCollection",
	name:"FilteredCollection",
	
	_debug:false,
	
	expression:true,//the expression to use in our default filter Function
	filterFunction:function(item) {return this.expression;},//default filter function
	dp:null,//dataprovider (Collection instance)
	_model:{},//
	
	init:function(dp, filterMap, model) {
		
		if(dp instanceof rad.collection.Collection) {
			this._super([], dp._key);
			this.dp = dp;
			this._key = this.dp._key;//
			//listen for ChangeEvent
			//TODO: rework this to a) listen for add,remove,etc
			// and separate out into distinct handlers for each
			//this.dp.addListener("Change", this._onTargetChange, this);
			this.dp.addListener("Collection.add", this._onTargetAdd, this);
			this.dp.addListener("Collection.remove", this._onTargetRemove, this);
			this.dp.addListener("Collection.update", this._onTargetUpdate, this);
			this.dp.addListener("Collection.reset", this._onTargetReset, this);
			
		} else {
			this.error("dataProvider supplied is not an ArrayCollection : ", arguments);
			return;
		}
		
		this._model = (model) || {};
		this.setFilter(filterMap);
	},
	
	//TODO: take into account generic objects OR models...
	//OR drop support for generic objects and only support Models?
	setFilter:function(filterMap) {
		//this.log("setFilter called:", filterMap);
		var shouldFilter = false;
		var isModel = (this._model.constructor == rad.model.Model);
		this.log("isModel?", isModel);
		if(typeof filterMap == "function") {
			//if a function is passed, use that for the filterfunction
			this.filterFunction = filterMap;
			shouldFilter = true;
			
		} else if(typeof filterMap == "string") {
			
			//if a string is passed, assume we want to compare it to each item directly.
			this.filterFunction = function(item) {
				if((String(item).indexOf(filterMap) > -1) || filterMap =="*"){
					return true;
				} return false;
			};
			shouldFilter = true;
			
		} else if (typeof filterMap == "object") {
			
			//filterMap is an object. loop through the properties
			//of the object and create conditionals..?how do deal with ||?
			//this.log("dealing with an object...")
			this._expression = "";
			shouldFilter = true;
			
			
			for (var i in filterMap) {
				
				if (filterMap[i] instanceof RegExp) {
					//this._expression+=" item."+i+""
					//this.log("regexp not supported yet in filterMap");
					if(isModel) {
						this._expression += " item.get('"+i+"').match("+filterMap[i]+") &&";
					} else {
						this._expression += " item."+i+".match("+filterMap[i]+") &&";
					}
				} else if (typeof filterMap[i] == "string") {
					//string, see if it exists
					if(isModel) {
						this._expression += "(item.get('"+i+"') !== undefined ) && (item.get('"+i+"') !== null) && ( item.get('"+i+"').indexOf( '"+filterMap[i]+"' ) > -1 ) &&";
					} else {
						this._expression += "(item."+i+" !== undefined ) && (item."+i+" !== null) && ( item."+i+".indexOf( '"+filterMap[i]+"' ) > -1 ) &&";
					}
				} else if ( typeof filterMap[i] == "number" || typeof filterMap[i] == "boolean") {
					//numbers.direct comparison
					if(isModel) {
						this._expression += " ( item.get('"+i+"') == "+filterMap[i]+" ) &&";
					} else {
						this._expression += " ( item."+i+" == "+filterMap[i]+" ) &&";
					}
				} else if ( typeof filterMap[i] == "object" ) {
				
					//hmm...
					//we need to use recursion to handle every nested object
					//aka.. createExpFromObject(object);
					//this.log("nested objects not supported in filterMap");
				}
			}
			//strip off the trailing &&.
			var sp = this._expression.substr(this._expression.lastIndexOf("&&")).trimRight();
			if(sp == "&&") {
				this._expression = this._expression.substr(0, this._expression.lastIndexOf("&&"));
			}
			//this.log("what's the expression?:", this._expression);
			
			this.filterFunction = function(item) {
				if(item !== undefined) {
				//this.log("testing item:", item, this._expression);
					if(eval(this._expression)){
						return true;
					}
				} else {
					this.error(this, "item is undefined??", item);//item is undefined?
					//console.trace();
				}
			
				return false;
			}
		}
		
		
		if(shouldFilter) {
			//JR: figure out why I used this.dp.data directly here
			// instead of using the collections methods? getLength(), getItemAt() etc?
			for(var i=0; i<this.dp.data.length;i++) {
				this._processItem(this.dp.data[i]);
			}

		}
	},
	
	_processItem:function(item) {
		this.log("processing an item:", item);
		if( this.filterFunction(item)) {
			this.log("item passes filter. adding:", item, this.expression, this.filterFunction);
			this.addItem(item, true);
		} else {
			this.log("item does NOT pass filter:", item);
			//no need to remove here, since we're processing our target data, and not our own data.
			this.removeItem(item);
		}
	},
	
	//Override setItemAt
	setItemAt:function(item, index) {
		//this.log("setItemAt called:", item, index);
		this.data[index] = item;
		
		if(this._key !== null) {
			this._table[item[this._key]] = index;
		}
		//original dispatches an UPDATE event here.
	},
	
	_onTargetAdd:function(event){
		var newItem, existingIndex;
		newItem = event.item;
		existingIndex = this.indexOf(newItem);
		if(existingIndex == -1 && this.filterFunction(newItem)) {
			this.addItem(newItem);
		}
	},
	
	_onTargetRemove:function(event) {
		this.removeItem(event.item);
	},
	
	_onTargetUpdate:function(event) {
		var newItem, existingItem;
		newItem = event.item;
		existingItem = this.getItem(newItem);
		
		if(this.filterFunction(newItem)) {
			//item passes filter
			//if it already exists, update, otherwise add.
			if(existingItem !== undefined) {
				if(newItem != existingItem) {
					this.setItemAt(newItem, this.indexOf(existingItem));
				}
			} else {
				this.addItem(newItem, true);
			}
		} else if(existingItem !== undefined) {
			this.removeItem(existingItem);
		}
	},
	
	_onTargetReset:function(event) {
		var i, len, item;
		len = this.dp.getLength();
		item = event.item;
		//remove all items first
		this.removeAll();
		
		for(i=len-1; i>=0; i--) {
			item = this.dp.getItemAt(i);
			if(this.filterFunction(item)) {
				this.addItem(item, true);
			}
		}
	},
	
	//
	_onItemChanged: function (event) {
		//
		//this.log("ITEM CHANGED IN FILTERED AC:", event);
		//JR: filteredAC's need to know more about this type of update event... but what do we actually need to know?
		if(this.filterFunction(event.data)) {
			//this._dispatchChange(this.ADD, event.context.data, this.indexOf(event.context.data));
			this.addItem(event.data, true);
		} else {
			//this._dispatchChange(this.REMOVE, event.context.data, this.indexOf(event.context.data));
			this.removeItem(event.data);
		}
		//dispatch an update event?
		this._dispatchChange(this.UPDATE);
	},
	
	
	clearFilter:function() {
		//reset our expression.
		//TODO: test our data again to update?
		this._expression = true;
	},
	
	destroy:function() {
		this.dp.addListener("Collection.add", this._onTargetAdd, this);
		this.dp.addListener("Collection.remove", this._onTargetRemove, this);
		this.dp.addListener("Collection.update", this._onTargetUpdate, this);
		this.dp.addListener("Collection.reset", this._onTargetReset, this);
		this._super();
	}
});