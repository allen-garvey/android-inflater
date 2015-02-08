<?php 
require_once("inc/config.php");

$example_variable_declaration = file_get_contents(ROOT_PATH . 'test_data/variable_declarations.txt'); 

$example_variable_declaration_short = 'String hello_world;';

$example_xml_placeholder = 'Paste a layout or resources (e.g. strings.xml) xml file here';
$example_xml_input = '<?xml version="1.0" encoding="utf-8"?><resources><string name="hello_world">Hello world</string></resources>';
$example_xml_input = file_get_contents(ROOT_PATH . 'test_data/layout.xml');
//$example_xml_input = file_get_contents(ROOT_PATH . 'test_data/resources.xml');
?>

<!DOCTYPE html>
<html ng-app="AndroidInflater"> 
    <head>
        <meta charset="utf-8"/>
        <title>Android Inflater</title>
        <meta name="description" content=""/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link href='http://fonts.googleapis.com/css?family=Fredoka+One&amp;text=AndroidIflate' rel='stylesheet' type='text/css' />
        <?php include(ROOT_PATH. 'inc/stylesheets_hosted.php') ?>
        <link rel="stylesheet" type="text/css" href="<?= BASE_URL?>stylesheets/android_inflate.css"/>
        <script src="<?= BASE_URL?>scripts/android_inflater_lib/android_inflater_util.js"></script>
        <?php include(ROOT_PATH. 'inc/scripts_hosted.php') ?>
        <script src="<?= BASE_URL?>scripts/app.js"></script>
        <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->
    </head>
    <body ng-controller="TabController as tabCtlr">
        <header>
            <div class="jumbotron">
                <h1 class="android_inflater_title">Android Inflater</h1>
                <p class="lead">An app to inflate your Android XML files to Java code</p>
                <p class="instructions">Replace the example with your own Android XML file and press inflate!
                    <span class="github_link"><a href="https://github.com/allen-garvey/android-inflater">View source on github</a></span></p>
            </div>
            <ul class="nav nav-tabs">
                <li ng-class="{'active' : showTab(0)}"><a href="#" ng-click="setTab(0)">From XML File</a></li>
                <li ng-class="{'active' : showTab(1)}"><a href="#" ng-click="setTab(1)">From Variable Declaration</a></li>
            </ul>
        </header>
        <main>
            <section ng-show="showTab(0)">
                <form class='form-inline'>
                    <div class="row textareas">
                        <div class="col-lg-5">
                            <label for="xml_input">Android XML File</label>
                            <textarea id="xml_input" class="input" placeholder="<?php echo $example_xml_placeholder; ?>"><?php echo $example_xml_input; ?></textarea>
                        </div>
                        <div class="col-lg-7">
                            <label for="results2">Generated Code</label>
                            <textarea class="results" id="results2" wrap="off" ng-model='xml_output'></textarea>
                        </div>
                    </div>
                    <div class="align_right">
                        <button type="button" class='btn btn-default btn-lg' ng-disabled="!xml_output" ng-click="selectResults()">Select Output</button>
                        <button type="button" class='btn btn-success btn-lg' ng-click="inflate()">Inflate</button>
                    </div>

                    <div class="options_control_group">
                        <div class="control_inline">
                            <input type="checkbox" id="xml_opt_convert_to_camelCase" ng-model="xml_options.camelCase" />
                            <label for="xml_opt_convert_to_camelCase">Convert to camelCase</label>
                        </div>
                        <div class="control_inline">
                            <input type="checkbox" id="xml_opt_declare_inline" ng-model="xml_options.declareInline" />
                            <label for="xml_opt_declare_inline">Declare inline</label>
                        </div>
                        <div class="control_inline">
                            <input type="checkbox" id="xml_opt_addButtonOnClickListener" ng-model="xml_options.addButtonOnClickListener" />
                            <label for="xml_opt_addButtonOnClickListener">Add Button OnClickListener</label>
                        </div>
                        <div class="control_inline">
                            <input type="checkbox" id="xml_opt_make_final" ng-model="xml_options.makeFinal" />
                            <label for="xml_opt_make_final">Make Final</label>
                        </div>
                        <div>
                            <label class='label-inline'>Visibility</label>
                            <label class="radio-inline"><input type="radio" name="xml_opt_visibility" ng-model="xml_opt_visibility" value="private">private</label>
                            <label class="radio-inline"><input type="radio" name="xml_opt_visibility" ng-model="xml_opt_visibility" value="public">public</label>
                            <label class="radio-inline"><input type="radio" name="xml_opt_visibility" ng-model="xml_opt_visibility" value="">none</label>
                        </div>
                    </div>
                </form>
            </section>

            <section ng-show="showTab(1)">
            	<form class="form-inline">
                    <div class="row textareas">
                        <div class="col-lg-5">
                            <label for="java_input">Android Variable Declarations</label>
                    		<textarea id="java_input" class="input" wrap="off" placeholder="<?php echo $example_variable_declaration_short; ?>"><?php echo $example_variable_declaration; ?></textarea>
                        </div>
                        <div class="col-lg-7">
                            <label for="results">Generated Code</label>
                    		<textarea class="results" id="results" wrap="off" ng-model='var_declaration_output'></textarea>
                        </div>
                    </div>
                    <div class="align_right">
                            <button type="button" class='btn btn-default btn-lg' ng-disabled="!var_declaration_output" ng-click="selectResults()">Select Output</button>
                            <button type="button" class='btn btn-success btn-lg' ng-click="inflate()">Inflate</button>
                        </div>
                    <div class="options_control_group">
                        <div class="control_inline">
                            <input type="checkbox" id="var_declaration_opt_convert_to_camelCase" ng-model="var_declaration_options.camelCase" />
                            <label for="var_declaration_opt_convert_to_camelCase">Convert to camelCase</label>
                        </div>
                        <div class="control_inline">
                            <input type="checkbox" id="var_declaration_opt_declare_inline" ng-model="var_declaration_options.declareInline" />
                            <label for="var_declaration_opt_declare_inline">Declare inline</label>
                        </div>
                        <div class="control_inline">
                            <input type="checkbox" id="var_declaration_opt_addButtonOnClickListener" ng-model="var_declaration_options.addButtonOnClickListener" />
                            <label for="var_declaration_opt_addButtonOnClickListener">Add Button OnClickListener</label>
                        </div>
                        <div class="control_inline">
                            <input type="checkbox" id="var_declaration_opt_make_final" ng-model="var_declaration_options.makeFinal" />
                            <label for="var_declaration_opt_make_final">Make Final</label>
                        </div>
                    </div>
            	</form>
            </section>
            
        </main>
    	<script type="text/javascript" src="<?= BASE_URL?>scripts/android_inflater_lib/java_declaration_parser.js"></script>
        <script type="text/javascript" src="<?= BASE_URL?>scripts/android_inflater_lib/android_inflate_xml.js"></script>
        <script type="text/javascript">
            select_textarea('xml_input');
        </script>
    </body>
</html>