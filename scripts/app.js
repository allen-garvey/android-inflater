(function(){
	var app = angular.module('AndroidInflater', []);
	app.controller('TabController', ['$scope', function($scope) {
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
			addButtonOnClickListener : true
		};
		$scope.xml_output = '';
		$scope.var_declaration_output = '';

		$scope.setTab = function(num){
			$scope.currentTab = num;
			$scope.selectInput();
			$scope.is_output_data = num === 0 ? $scope.xml_output : $scope.var_declaration_output;
		};
		$scope.showTab = function(num){return num === $scope.currentTab;};
		$scope.inflate = function(input_id, output_id) {
				if($scope.currentTab === 0)  {
					var options = $scope.xml_options;
					options.visibility = $scope.xml_opt_visibility;
					var input_val = document.getElementById('xml_input').value;
					try{
						var inflated_xml = android_inflate_xml.element_list_from_xml(input_val, options);
						$scope.xml_output = inflated_xml.declaration + '\n\n' + inflated_xml.inflated_java;
					}
					catch(err){
						$scope.xml_output = input_val + " could not be parsed.";	
					}
				}
				else{
					var options = $scope.var_declaration_options;
					var element_array = java_declaration_parser.element_array_from_declaration(document.getElementById('java_input').value, options);
					$scope.var_declaration_output = android_inflate_xml.inflate_element_list(element_array, options);
				}
				$scope.isSelectEnabled = true;
			};
		
		$scope.selectResults = function(){
				if($scope.currentTab === 0)  {
					select_textarea('results2');
				}
				else{
					select_textarea('results');
				}
			};
		$scope.selectInput = function(){
				if($scope.currentTab === 0)  {
					select_textarea('xml_input');
				}
				else{
					select_textarea('java_input');
				}
			};


	}]);


	
})();