String.prototype.capitalize = String.prototype.capitalize || function(){
	var split = this.split(' ').filter(Boolean);
	var len = split.length;
	var capitalized_string = '';
	for (var i=0;i<len;i++) {
		capitalized_string = capitalized_string + split[i].charAt(0).toUpperCase() + split[i].slice(1).toLowerCase() + " ";
	}
	return capitalized_string.slice(0, capitalized_string.length-1);
}
//converts string with underscores to camelCase. string is the same if the string doesn't contain underscores or only contains a leading underscore e.g. _hello
String.prototype.to_camelCase = String.prototype.convert_to_camelCase || function(){
    var split = this.split('_').filter(Boolean);
    var len = split.length;
    var camelCaseString = '';
    for (var i=0;i<len;i++) {
        if(i===0){
            camelCaseString = camelCaseString + split[i].toLowerCase();
        }
        else{
            camelCaseString = camelCaseString + split[i].capitalize();    
        }
    }
    return camelCaseString;
}
//to map array-like objects such as collections- returns array with function applied
function map_collection(collection, callback){
    var len = collection.length;
    var newArray = [];
    for(var i=0; i<len;i++){
        newArray.push(callback(collection[i]));
    }
    return newArray;
}

//returns cross browser compatible (back to i.e. 6) xml dom object from xml string
var parseXML = (function(){

    if (typeof window.DOMParser != "undefined") {
        return function(xmlStr) {
            return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
        };
    } else if (typeof window.ActiveXObject != "undefined" &&
           new window.ActiveXObject("Microsoft.XMLDOM")) {
        return function(xmlStr) {
            var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
            xmlDoc.async = "false";
            xmlDoc.loadXML(xmlStr);
            return xmlDoc;
        };
    } else {
        throw new Error("No XML parser found");
    }
})();
(function(){
	var app = angular.module('AndroidInflater', []);
	app.controller('TabController', ['$scope', function($scope) {
		var tabCtlr = this;
		$scope.currentTab = 0;
		this.visibility_options = [{label : 'private', value : 'private'}, {label : 'public', value : 'public'}, {label : 'none', value : ''}];
  		$scope.xml_opt_visibility = this.visibility_options[0].value;
		$scope.xml_options = {
			camelCase : false,
			declareInline : false,
			visibility : $scope.xml_opt_visibility,
			makeFinal : false,
			addButtonOnClickListener : false
		};
		$scope.var_declaration_options = {
			declareInline : false,
			addButtonOnClickListener : true,
			camelCase : false,
			makeFinal : false
		};
		$scope.xml_output = '';
		$scope.var_declaration_output = '';

		$scope.setTab = function(num){
			$scope.currentTab = num;
			var output_data = num === 0 ? $scope.xml_output : $scope.var_declaration_output;
			if(!output_data){
				$scope.$apply();
				tabCtlr.selectInput();
			}
		};
		$scope.showTab = function(num){return num === $scope.currentTab;};
		$scope.inflate = function(input_id, output_id) {
				var no_input_error_xml = 'Paste into the input box an Android layout or resource xml file';
				var no_input_error_java = 'Paste into the input box Java variable declarations';
				if($scope.currentTab === 0)  {
					var options = $scope.xml_options;
					options.visibility = $scope.xml_opt_visibility;
					var input_val = document.getElementById('xml_input').value;
					if(input_val.match(/^$|^[\s\t\n]+$/)){
						$scope.xml_output = no_input_error_xml;
					}
					else{
						try{
							var inflated_xml = android_inflate_xml.element_list_from_xml(input_val, options);
							$scope.xml_output = inflated_xml.declaration + '\n\n' + inflated_xml.inflated_java;
						}
						catch(err){
							$scope.xml_output = "Could not be parsed:\n" + input_val;	
						}	
					}
				}
				else{
					var options = $scope.var_declaration_options;
					var input_val = document.getElementById('java_input').value;
					if(input_val.match(/^$|^[\s\t\n]+$/)){
						$scope.var_declaration_output = no_input_error_java;
					}
					else{
						var element_array = java_declaration_parser.element_array_from_declaration(input_val, options);
						$scope.var_declaration_output = android_inflate_xml.inflate_element_list(element_array, options);
					}
				}
			};

		$scope.inline_checked_action = function(){
			//set visibility options to none if declare inline is selected on xml tab since that is most likely what the user wants
			if($scope.xml_options.declareInline){
				$scope.xml_opt_visibility = '';
			}
		};
		
		$scope.selectResults = function(){
				var id_to_by_selected = $scope.currentTab === 0 ? 'xml_output' : 'java_output';
				tabCtlr.select_textarea(id_to_by_selected);
			};
		this.selectInput = function(){
				var id_to_by_selected = $scope.currentTab === 0 ? 'xml_input' : 'java_input';
				tabCtlr.select_textarea(id_to_by_selected);
			};
		this.select_textarea = function(id_to_by_selected){
			document.getElementById(id_to_by_selected).select();
		};
		this.init = function(){
			tabCtlr.selectInput();
		};
		this.init();


	}]);


	
})();
/***element_array_from_declaration is used to turn string of java variable declarations into an array of objects
//e.g. takes "public final String one; private static TextView two;" and returns [{type : 'TextView', identifier : 'one'}, {type : 'String', identifier : 'one'},  {type : 'String', identifier : 'two'},  {type : 'String', identifier : 'three'}]

//***the options object is used for formatting and code generation options
//an empty object {} will work if you have no options
//the full options example:
	{
	addButtonOnClickListener : true, //generates OnClickListener for button objects - values are true or false
	declareInline : true //declares java inline e.g. returns final String one = etResources().getString(R.string.one);
	}
*/
var java_declaration_parser = (function(){
	//main driver function
	return {
		element_array_from_declaration: function (input, options){
		return get_element_array(input, options);
		}
	};

	//generates inflated code string based on variable type
	function get_element_array(java_text, options){
		var var_array = java_string_to_array_sans_comments(java_text);
		var hash_array = var_array_to_hash_array(var_array);
		return hash_array;
	}

	//takes string of java text and returns array of cleaned up variables with comments removed
	//e.g. "public final String one; private static TextView two;" and returns ['String one', 'TextView two']
	function java_string_to_array_sans_comments(java_text){
		//1.strips multi-line comments (see http://ostermiller.org/findcomment.html) 2.strips beginning space, single-line comments and reserved words as they are unneeded and make parsing later easier 3. removes extra white-space between variables; 4. removes extra white-space within variables; 5. splits variables on semi-colon 6.filters out empty strings in array; 
		var split_text = java_text.replace(/\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\//g, ' ').replace(/\/\/(.)*\n|\/\/(.)*$|\bstatic\b|\bfinal\b|\bpublic\b|\bprivate\b|\bprotected\b|^\s+/g, "").replace(/[\s]*;[^A-Z\/]*/gi, ';').replace(/\s+/g, ' ').split(';').filter(Boolean);
		return split_text;
	} 
	//takes array of split java variable e.g. ['TextView one', 'String one, two, three'] and returns [{type : 'TextView', identifier : 'one'}, {type : 'String', identifier : 'one'},  {type : 'String', identifier : 'two'},  {type : 'String', identifier : 'three'}]
	function var_array_to_hash_array(var_array){
		var hash_array = var_array.map(function(var_string){
			return var_string_to_hash(var_string);
		});
		//String one, two, three is returned as [{type : 'String', identifier : 'one'}, {type : 'String', identifier : 'two'},  {type : 'String', identifier : 'three'}] within list so this flattens the list
		var merged = [];
		return merged.concat.apply(merged, hash_array);
	}

	//creates object by parsing string for name and data-type 
	//e.g. 'String one' returns {'type' : 'String', 'identifier' : 'one'}
	function var_string_to_hash(var_string){
		var var_hash = {};
		if(var_string.match(/^\/\//)){
			var_hash.comment = true;
			var_hash.identifier = var_string;
			return var_hash;
		}
		var var_split = var_string.split(' ').filter(Boolean);
		//test for String one, two, three;
		var nested_array_dec = split_nested_var_declarations([var_split.shift(), var_split.join('')]);
		if(nested_array_dec){
			return nested_array_dec;
		}
		var_split = var_string.split(' ').filter(Boolean); //because was mutilated earlier
		if(var_split.length === 2){
			//e.g. String name;
			var_hash.type = var_split[0];
			var_hash.identifier = var_split[1];
		}
		else{
			var_hash.invalid = true;	
			var_hash.identifier = var_string;
		}

		return var_hash;
	}

	//splits String one, two, three into:
	//String one; String two; String three;
	//return array of objects [{type:'String', name:'one'}, {type:'String', name:'two'}, {type:'String', name:'three'}]
	function split_nested_var_declarations(var_array){
		if(var_array.length < 2){
			return false;
		}
		var name_split = var_array[1].split(',').filter(Boolean);
		if(name_split.length === 1){
			return false;
		}
		else{
			var type = var_array[0];
			var var_hash_array = name_split.map(function(var_sub_array_element){
				return {
					'type': type,
					'identifier' : var_sub_array_element
				};
			});
		}
		return var_hash_array;
	}

})();

/*
//***element_list_form_xml returns a list of parsed variables from an Android layout or resources xml string
//e.g. returns [{type : 'TextView', identifier : 'one'}, {type : 'String', identifier : 'one'},  {type : 'String', identifier : 'two'},  {type : 'String', identifier : 'three'}]

//***inflate_element_list returns java code from an element list
//e.g. from [{type : 'String', identifier : 'one'}] returns one = getResources().getString(R.string.one);

//***the options object is used for formatting and code generation options
//an empty object {} will work if you have no options
//the full options example:
	{
	camelCase : true,  //converts underscore variable names to camelCase, ignores if only leading underscore _hello - values are true or false
	makeFinal : true   //adds final to variable declaration - values are true or false
	addButtonOnClickListener : true, //generates OnClickListener for button objects - values are true or false
	visibility : 'private' //adds visibility to variable declaration - values are 'private', 'public', '' or null for no visibility
	declareInline : true //declares java inline e.g. returns final String one = etResources().getString(R.string.one);
	}
*/
var android_inflate_xml = (function(){
	return {'element_list_from_xml' : function(xmlStr, options){
			return inflated_xml(xmlStr, options);
		},
		'inflate_element_list' : function(element_list, options){
			return options.declareInline ? element_list_to_inflated_java_inline(element_list, options, 'RelativeLayout') : element_list_to_inflated_java(element_list, options);
		}
	};

	function element_list_to_inflated_java_inline(element_list, options, parent_element_name){
		var inflated_java = parent_element_name === 'resources' ? get_string_from_resources_comment(options) : get_inflation_start_comment(options);
		element_list.map(function(element){
			inflated_java = inflated_java + get_element_declaration_string(element, options).replace(';', '') + ' =' + get_unpacked_element_string(element, options).replace(/^.*=/, '');
			if(element.type === 'Button' && options.addButtonOnClickListener){
				inflated_java = inflated_java + '\n' + add_button_on_click_listener(element, options);
			}
			inflated_java = inflated_java + '\n';
		});

		return inflated_java;
	}

	function element_list_to_inflated_java(element_list, options){
		var inflated_java = get_inflation_start_comment(options);
		element_list.map(function(element){
			inflated_java = inflated_java + get_unpacked_element_string(element, options);
			if(element.type === 'Button' && options.addButtonOnClickListener){
				inflated_java = inflated_java + '\n' + add_button_on_click_listener(element, options);
			}
			inflated_java = inflated_java + '\n';
		});

		return inflated_java;
	}
	//used by element_list_to_inflated_java and element_list_to_inflated_java_inline
	function get_unpacked_element_string(element, options){
		if(element.invalid){
				return unpack_invalid_data(element, options);
			}
			else if(element.type === 'String'){
				return unpack_res_string(element, options);
			}
			else if(element.type === 'int'

				){
				return unpack_res_int(element, options);
			}
			else if(element.type === 'bool'){
				return unpack_res_bool(element, options);
			}
			else if(element.type === 'double'){
				return unpack_res_double(element, options);
			}
			else if(element.type.match(/\[\]$/)){
				return unpack_res_array(element, options);
			}
			else{
				return unpack_ui_element(element, options);
			}
	}

	//used for constants
	function get_inflation_start_comment(options){
		return "//Inflate UI\n";
	}
	function get_string_from_layout_comment(options){
		return '//Declare UI elements\n';
	}
	function get_string_from_resources_comment(options){
		return '//Declare resources\n';
	}
	function get_formatted_name(element, options){
		var formatted_name = options.camelCase ? element.identifier.to_camelCase() : element.identifier;
		return formatted_name;
	}
	//methods unpack elements based on type
	function unpack_ui_element(element, options){
		return get_formatted_name(element, options) + " = (" + element.type + ") findViewById(R.id." + element.identifier + ");";
	}

	function add_button_on_click_listener(element, options){
		return get_formatted_name(element, options) + '.setOnClickListener(new View.OnClickListener() {\n\tpublic void onClick(View v) {\n\t\t// Perform action on click\n\t}\n});';
	}

	function unpack_res_string(element, options){
		return get_formatted_name(element, options) + " = getResources().getString(R.string." + element.identifier + ");";
	}
	//there is no res double type so we have to convert it from a string
	function unpack_res_double(element, options){
		return get_formatted_name(element, options) + " = Double.parseDouble(getResources().getString(R.string." + element.identifier + "));";
	}

	function unpack_res_int(element, options){
		return get_formatted_name(element, options) + " = getResources().getInteger(R.integer." + element.identifier +  ");";
	}

	function unpack_res_bool(element, options){
		return get_formatted_name(element, options) + " = getResources().getBoolean(R.bool." + element.identifier +  ");";
	}

	function unpack_res_array(element, options){
		var var_type = element.type.replace("[]", "");
		var_type = var_type.capitalize();
		return get_formatted_name(element, options) + " = getResources().get" + var_type + "Array(R.array." + element.identifier + ");";
	}

	function unpack_invalid_data(element, options){
		return "//" + element.identifier + " is not a valid declaration";
	}

	//takes android xml string and returns object with variable declarations and full java code inflation
	function inflated_xml(xmlStr, options){
		var element_list = get_element_array(xmlStr, options);
		var parent_element_name = get_doc_element_type(xmlStr);
		if(options.declareInline){
			return {'declaration' : element_list_to_inflated_java_inline(element_list, options, parent_element_name), 'inflated_java' : ''};
		}
		else{
			var declaration_string = declaration_string_from_element_list(element_list, options, parent_element_name);
			return {'declaration' : declaration_string, 'inflated_java' : element_list_to_inflated_java(element_list, options)};
		}
	}
	//returns name of parent element of xml document
	function get_doc_element_type(xmlStr){
		return parseXML(xmlStr).documentElement.nodeName;
	}
	//returns an array of parsed elements from xml string
	//e.g. returns [{type : 'TextView', identifier : 'one'}, {type : 'String', identifier : 'one'},  {type : 'String', identifier : 'two'},  {type : 'String', identifier : 'three'}]
	function get_element_array(xmlStr){
		var parsed_xml = parseXML(xmlStr);
		var parent_element_name = parsed_xml.documentElement.nodeName;
		var node_list = parsed_xml.documentElement.childNodes;
		var element_list = [];
		map_collection(node_list, function(node){
			create_element_array_recursive(node, element_list, parent_element_name);
		});
		element_list.filter(Boolean); //just to be sure there is no garbage in array
		return element_list;
	}
	//creates elements array from child nodes by pushing to reference to array passed into function (master_array) -  adds all child nodes of the child nodes using recursion
	function create_element_array_recursive(node, master_array, parent_element_name){
		if(node.nodeType === Node.TEXT_NODE || node.nodeType === Node.COMMENT_NODE){return;} //we don't want comments or text nodes inside parent node
		var type = parent_element_name === 'resources' && node.nodeName.match(/-array$/) ? xml_array_name_to_java(node.nodeName) : node.nodeName; //formats array name correctly if element is array
		//format type because xml resources store type as lowercase
		switch(type){
			case 'string':
				type = 'String';
				break;
			case 'integer':
				type = 'int';
				break;
			default:
				break;
		}
		//recursively get and push child nodes
		if(node.childNodes){
			map_collection(node.childNodes, function(node1){create_element_array_recursive(node1, master_array, parent_element_name)});
		}
		//test for valid android elements
		try{
			var id = node.getAttribute('android:id');
			var name = node.getAttribute('name');
			if(!(id || name)){
				throw "no id or name - not valid android xml element";
			}
		}
		catch(err){
			return;
		}
		//ui elements use id while resources use name
		var formatted_id = id ? id.replace(/@.*\//,'') : '';
		var identifier = name || formatted_id;
		master_array.push({
			'type' : type,
			'identifier' : identifier
		});
	}

	//returns string of java variable declarations from element list
	function declaration_string_from_element_list(element_list, options, parent_element_name){
		var declaration_string = parent_element_name === 'resources' ? get_string_from_resources_comment(options) : get_string_from_layout_comment(options);
		element_list.map(function(element){
			declaration_string = declaration_string + get_element_declaration_string(element, options) + '\n';
		});
		return declaration_string;	
	}
	//used by element_list_to_inflated_java_inline and declaration_string_from_element_list
	function get_element_declaration_string(element, options){
		var visibility = options.visibility ? options.visibility + ' ' : '';
		var makeFinal = options.makeFinal ? 'final ' : '';
		var formatted_identifier = options.camelCase ? element.identifier.to_camelCase() : element.identifier;
		return visibility + makeFinal + element.type + " " + formatted_identifier + ';';
	}

	//converts string-array to String[]
	function xml_array_name_to_java(array_name){
		var java_array_name = array_name.replace(/-array$/, '');
		java_array_name = java_array_name === 'string' ? 'String' : java_array_name;
		return java_array_name + '[]';
	}

})();
//# sourceMappingURL=app.js.map