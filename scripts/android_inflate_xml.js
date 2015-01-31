//requires js_util.js

var android_inflate_xml = (function(){
	return {'inflate_xml' : function(xmlStr, options){
			return inflated_xml(xmlStr, options);
		},
		'inflate_element_list' : function(element_list, options){
			return element_list_to_inflated_java(element_list, options);
		}
	};

	function element_list_to_inflated_java(element_list, options){
		var inflated_java = get_opening_comment(options);
		element_list.map(function(element){
			if(element.type === 'String'){
				inflated_java = inflated_java + unpack_res_string(element, options);
			}
			else if(element.type.match(/\[\]$/)){
				inflated_java = inflated_java + unpack_res_array(element, options);
			}
			else{
				inflated_java = inflated_java + unpack_ui_element(element, options);
				if(element.type === 'Button' && options.addButtonOnClickListener){
					inflated_java = inflated_java + '\n' + add_button_on_click_listener(element, options);
				}
			}
			inflated_java = inflated_java + '\n';
		});

		return inflated_java;
	}

	function get_opening_comment(options){
		return "//Inflate UI\n";
	}

	function unpack_ui_element(element, options){
		var formatted_name = options.camelCase ? element.id.to_camelCase() : element.id;
		return formatted_name + " = (" + element.type + ") findViewById(R.id." + element.id + ");";
	}

	function add_button_on_click_listener(element, options){
		var formatted_name = options.camelCase ? element.id.to_camelCase() : element.id;
		return formatted_name + '.setOnClickListener(new View.OnClickListener() {\n\tpublic void onClick(View v) {\n\t\t// Perform action on click\n\t}\n});';
	}

	function unpack_res_string(element, options){
		var formatted_name = options.camelCase ? element.name.to_camelCase() : element.name;
		return formatted_name + " = getResources().getString(R.string." + element.name + ");";
	}

	function unpack_res_array(element, options){
		var var_type = element.type.replace("[]", "");
		var_type = var_type.capitalize();
		var formatted_name = options.camelCase ? element.name.to_camelCase() : element.name;
		return formatted_name + " = getResources().get" + var_type + "Array(R.array." + element.name + ");";
	}

	function inflated_xml(xmlStr, options){
		var element_list = get_element_array(xmlStr, options);
		var parent_element_name = get_doc_element_type(xmlStr);
		var declaration_string;
		if(parent_element_name === 'resources'){
			declaration_string = declaration_string_from_resources(element_list, options);
		}
		else{
			declaration_string = declaration_string_from_layout(element_list, options);
		}
		return declaration_string + '\n\n' + element_list_to_inflated_java(element_list, options);
	}

	function get_doc_element_type(xmlStr){
		return parseXML(xmlStr).documentElement.nodeName;
	}

	function get_element_array(xmlStr){
		var parsed_xml = parseXML(xmlStr);
		var parent_element_name = parsed_xml.documentElement.nodeName;
		var node_list = parsed_xml.documentElement.childNodes;
		var element_list = map_collection(node_list, function(node){
			if(node.nodeType === Node.TEXT_NODE){return false;}
			console.log(node.nodeName);
			var type = parent_element_name === 'resources' && node.nodeName.match(/-array$/) ? xml_array_name_to_java(node.nodeName) : node.nodeName;
			type = type === 'string' ? 'String' : type;
			var formatted_id = parent_element_name !== 'resources' ? node.getAttribute('android:id').replace(/@.*\//,'') : '';
			return {
				type : type,
				name : node.getAttribute('name'),
				id : formatted_id
			};
		}).filter(Boolean);
		console.log(element_list);
		return element_list;
	}


	function declaration_string_from_resources(element_list, options){
		var declaration_string = get_string_from_resources_comment(options);
		element_list.map(function(element){
			var visibility = options.visibility ? options.visibility + ' ' : '';
			var name = options.camelCase ? element.name.to_camelCase() : element.name;
			var makeFinal = options.makeFinal ? 'final ' : '';
			declaration_string = declaration_string + visibility + makeFinal + element.type + " " + name + ';\n';
		});
		return declaration_string;
	}

	function declaration_string_from_layout(element_list, options){
		var declaration_string = get_string_from_layout_comment(options);
		element_list.map(function(element){
			var visibility = options.visibility ? options.visibility + ' ' : '';
			var makeFinal = options.makeFinal ? 'final ' : '';
			var id = options.camelCase ? element.id.to_camelCase() : element.id;
			declaration_string = declaration_string + visibility + makeFinal + element.type + " " + id + ';\n';
		});
		return declaration_string;
	}

	//converts string-array to String[]
	function xml_array_name_to_java(array_name){
		var java_array_name = array_name.replace(/-array$/, '');
		java_array_name = java_array_name === 'string' ? 'String' : java_array_name;
		return java_array_name + '[]';
	}


	function get_string_from_layout_comment(options){
		return '//declare ui elements\n';
	}
	function get_string_from_resources_comment(options){
		return '//declare resources\n';
	}



})();