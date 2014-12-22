
var TreeDropDown =  Function(opts){
		this.treeData	  = opts.treeData;
		this.container 	= typeof opts.container === 'string' ? $(opts.container) : opts.container;
		this.hideEmpty 	= opts.hideEmpty;
		this.classDom 	= opts.classDom || 'tree-dropdown';
		this.emptyVal 	= opts.emptyVal || '';
		this.onChange 	= opts.onChange || null;
		this.ajaxLoader	= opts.ajaxLoader || '<i class="fa fa-spinner fa-spin icon-small"></i>';
		this._name 		= 'TreeDropDown';
		
		this.levels 	= [];
//		
//		//test example data
//		var tree = [
//		{
//			"data":		{"id":"122","label":"Ladybird","parent_id":null,"custom_field_id":"22","name":"22"},
//			"childs":	[]
//		},
//		{
//			"data":		{"id":"75","label":"Silentnight","parent_id":null,"custom_field_id":"22","name":"22"},
//			"childs":	[
//			         	 	{
//			         	 		"data": 	{"id":"76","label":"Arrows","parent_id":"75","custom_field_id":"22","name":"22"},
//			         	 		"childs":[]
//			         	 	},
//			         	 	{
//			         	 		"data": 	{"id":"83","label":"Pillows","parent_id":"75","custom_field_id":"22","name":"22"},
//			         	 		"childs":[
//			                      {
//			                        "data": 	{"id":"100","label":"child of Pillows","parent_id":"83","custom_field_id":"22","name":"22"},
//			                        "childs":[]
//			                      },
//			                      {
//			                        "data": 	{"id":"101","label":"child of Pillows 2","parent_id":"83","custom_field_id":"22","name":"22"},
//			                        "childs":[
//			                          {
//			                            "data": 	{"id":"102","label":"child of child of Pillows 2","parent_id":"101","custom_field_id":"22","name":"22"},
//			                            "childs":[]
//			                          }
//			                        ]
//			                      }
//			                     ]
//			         	 	}
//			         	 ]
//		}];
//		
		//start plugin here
		this.container.html(this.ajaxLoader);
		if(typeof this.treeData === 'string'){
			var self = this;
			$.get(this.treeData).done(function(tree){
				self.intialize(tree);
			});
		} else if( typeof this.treeData === 'object') {
			this.intialize(this.treeData);
		}

	};
	TreeDropDown.prototype= {
	
	intialize: function(tree){
		this.createTreeData(tree, -1);
		this.renderHtml();
		this.bindEvents();
	},
	createTreeData: function(tree, level){
		level++;
	    for(var j = 0; j<tree.length; j++){
    		if(this.levels[level] === undefined) this.levels[level] = [];
    		this.levels[level].push(tree[j].data);
    		this.createTreeData(tree[j].childs, level);
	    }
	},
	renderHtml: function(){
		this.container.html('');
		for(var i = 0; i < this.levels.length; i++) {
			var select = $('<select class="'+this.classDom+'" />').data('level', i);
			select.appendTo(this.container);
			
			//populate the first dropdown that will trigger the first change
			if(i == 0) {
				select.append('<option value="'+this.emptyVal+'"></option>');
				for(var j = 0; j < this.levels[i].length; j++) {
					var data = this.levels[i][j];
					select.append('<option value="'+data.id+'">'+data.label+'</option>');
				}
			} else if(this.hideEmpty) {
				select.hide();
			}
		}
	},
	populateSelect: function(level, parentId){
		if(this.levels[level] !== undefined) {
			var select 		= this.container.find('select.'+this.classDom).eq(level);//il levels exists then even select should be there
			var nextSelects = this.container.find('select.'+this.classDom).filter(function(i){return i>=level});
			nextSelects.html('');//clean all selects after me
			
			select.html('<option value="'+this.emptyVal+'"></option>').show();
			var hasChilds = false;
			for(var i = 0; i<this.levels[level].length; i++) {
				var data = this.levels[level][i];
				if(data.parent_id == parentId) {
					select.append('<option value="'+data.id+'">'+data.label+'</option>');
					hasChilds = true;
				}
			}
			
			if(!hasChilds && this.hideEmpty) {
				nextSelects.hide();
			}
		}
	},
	populateInverse: function(level, val) {
		if(level>=0) {
			var select 		= this.container.find('select.'+this.classDom).eq(level).val(val).show();
			var levelData 	= this.levels[level];
			for(var i = 0; i<levelData.length; i++) { 
				if(levelData[i].id == val){
					var parent_id = levelData[i].parent_id;
					return this.populateInverse(level-1, parent_id);
				}
			}
		}
	},
	bindEvents: function(){
		this.container.on('change', 'select', this, function(e){
			var $this = $(this);
			var level = $this.data('level');
			e.data.populateSelect(level+1, $this.val());
			if( typeof e.data.onChange === 'function' ) {
				e.data.onChange.call(e.data, $this.val() );
			}
		});
	},
	getSelects: function() {
		return this.container.find('select.'+this.classDom);
	},
	getValues: function(){
		var vals = [];
		var self = this;
		this.getSelects().each(function(){
			var val = $(this).val();
			if( val !== self.emptyVal && val !==null){
				vals.push( $(this).val() );
			}
		});
		
		return vals;
	},
	getValue: function(){
		var vals = this.getValues();
		return vals[vals.length-1];
	},
	getValueOf: function(level){
		return this.container.find('select.'+this.classDom).eq(level).val();
	},
	setValueOf: function(level, val) {
		return this.container.find('select.'+this.classDom).eq(level).show().val(val).trigger('change');
	},
	setValue: function(value){
		var self = this;
		if( Array.isArray(value) ){
			this.getSelects().each(function(i){
				if(value[i] !== undefined) self.setValueOf(i, value[i]);
			});
		} else {
			var found = null;
			_loop1:
			for(var i = this.levels.length - 1; i>=0; i--) {
				var dataLevel = this.levels[i];
				for(var j = 0; j<dataLevel.length; j++) {
					var data = dataLevel[j];
					if(id == value) {
						found = i;
						break _loop1;
					}
				}
			}
			
			if( found ) {
				this.populateInverse(found, value);
			}
		}
	}
}
};
