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
		//recursively get and push child nodes
		if(node.childNodes){
			map_collection(node.childNodes, function(node1){create_element_array_recursive(node1, master_array, parent_element_name)});
		}
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