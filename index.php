<?php 
require_once("inc/config.php");

$example_variable_declaration = '//example variable declarations

//String from res file
String hello_world;

//array from res file
public int[] androidVersionNums;

//TextView from layout.xml
private TextView userInstructions;

/*multiple variables*/
String one, two, three;

//button
Button someButton;
'; 

$example_variable_declaration_short = 'String hello_world;';

$example_xml_placeholder = 'Paste a layout or resources (e.g. strings.xml) xml file here';
$example_xml_input = '<?xml version="1.0" encoding="utf-8"?><resources><string name="hello_world">Hello world</string></resources>';
$example_xml_input = file_get_contents(ROOT_PATH . 'test_data/layout.xml');
$example_xml_input = file_get_contents(ROOT_PATH . 'test_data/resources.xml');
?>

<!DOCTYPE html>
<html ng-app="AndroidInflater"> 
    <head>
        <meta charset="utf-8"/>
        <title>Android UI Inflater</title>
        <meta name="description" content=""/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="stylesheet" type="text/css" href="<?= BASE_URL?>stylesheets/bootstrap.min.css"/>
        <link rel="stylesheet" type="text/css" href="<?= BASE_URL?>stylesheets/bootstrap-theme.min.css"/>
        <link rel="stylesheet" type="text/css" href="<?= BASE_URL?>stylesheets/android_inflate.css"/>
        <script src="<?= BASE_URL?>scripts/js_util.js"></script>
        <script src="<?= BASE_URL?>scripts/angular.min.js"></script>
        <script src="<?= BASE_URL?>scripts/app.js"></script>
        <!-- Place favicon.ico and apple-touch-icon.png in the root directory -->
    </head>
    <body ng-controller="TabController as tabCtlr">
        <header><h1>Android Inflater</h1></header>
        <div>
            <ul class="nav nav-tabs">
                <li ng-class="{'active' : showTab(0)}"><a href="#" ng-click="setTab(0)">From XML File</a></li>
                <li ng-class="{'active' : showTab(1)}"><a href="#" ng-click="setTab(1)">From Variable Declaration</a></li>
            </ul>
        </div>
        <main>
            <section ng-show="showTab(0)">
                <form class='form-inline'>
                    <div class="textareas">
                        <div class="textarea_container input_container">
                            <label for="xml_input">Android XML File</label>
                            <textarea id="xml_input" class="input" placeholder="<?php echo $example_xml_placeholder; ?>"><?php echo $example_xml_input; ?></textarea>
                        </div>
                        <div class="textarea_container results_container">
                            <label for="results2">Generated Code</label>
                            <textarea class="results" id="results2" wrap="off" ng-model='xml_output'></textarea>
                        </div>
                    </div>
                    <div class="control-panel">
                        <div class="checkbox controls">
                            <input type="checkbox" id="xml_opt_convert_to_camelCase" ng-model="xml_options.camelCase" />
                            <label class="checkbox-inline" for="xml_opt_convert_to_camelCase">Convert to camelCase</label>
                        </div>
                        <div class="checkbox controls">
                            <input type="checkbox" id="xml_opt_addButtonOnClickListener" ng-model="xml_options.addButtonOnClickListener" />
                            <label class="checkbox-inline" for="xml_opt_addButtonOnClickListener">Add Button OnClickListener</label>
                        </div>
                        <div class="checkbox controls">
                            <input type="checkbox" id="xml_opt_make_final" ng-model="xml_options.makeFinal" />
                            <label class="checkbox-inline" for="xml_opt_make_final">Make Final</label>
                        </div>

                        <div class="radio-inline controls">
                            <label class='label-inline'>Visibility</label>
                            <label class="radio-inline"><input type="radio" name="xml_opt_visibility" ng-model="xml_opt_visibility" value="private">private</label>
                            <label class="radio-inline"><input type="radio" name="xml_opt_visibility" ng-model="xml_opt_visibility" value="public">public</label>
                            <label class="radio-inline"><input type="radio" name="xml_opt_visibility" ng-model="xml_opt_visibility" value="">none</label>
                        </div>
                        <div class="button_group">
                            <button type="button" class='btn btn-primary' ng-disabled="!xml_output" ng-click="selectResults()">Select Output</button>
                            <button type="button" class='btn btn-success' ng-click="inflate()">Inflate</button>
                        </div>
                    </div>
                </form>
            </section>

            <section ng-show="showTab(1)">
            	<form class="form-inline">
                    <div class="textareas">
                        <div class="textarea_container input_container">
                            <label for="java_input">Android Variable Declarations</label>
                    		<textarea id="java_input" class="input" wrap="off" placeholder="<?php echo $example_variable_declaration_short; ?>"><?php echo $example_variable_declaration; ?></textarea>
                        </div>
                        <div class="textarea_container results_container">
                            <label for="results">Generated Code</label>
                    		<textarea class="results" id="results" wrap="off" ng-model='var_declaration_output'></textarea>
                        </div>
                    </div>
                    <div class="control-panel">
                        <div class="checkbox">
                            <input type="checkbox" id="var_declaration_opt_addButtonOnClickListener" ng-model="var_declaration_options.addButtonOnClickListener" />
                            <label class="checkbox-inline" for="var_declaration_opt_addButtonOnClickListener">Add Button OnClickListener</label>
                        </div>
                        <div class="button_group">
                            <button type="button" class='btn btn-primary' ng-disabled="!var_declaration_output" ng-click="selectResults()">Select Output</button>
                            <button type="button" class='btn btn-success' ng-click="inflate()">Inflate</button>
                        </div>
                    </div>
            	</form>
            </section>
            
        </main>
    	<script type="text/javascript" src="<?= BASE_URL?>scripts/android_inflate.js"></script>
        <script type="text/javascript" src="<?= BASE_URL?>scripts/android_inflate_xml.js"></script>
        <script type="text/javascript">select_textarea('xml_input');
            //console.log(parseXML('<foo><something></something><string>hello</string></foo>').documentElement.childNodes[0].nodeName);
            //console.log(parseXML('<foo><something></something><string>hello</string></foo>').documentElement.childNodes);
            // android_inflate_xml.inflate_xml('<?xml version="1.0" encoding="utf-8"?><resources><string-array name="jokes"><item>If at first you don&#8217;t succeed, call it version 1.0.</item></string-array><string name="app_name">Card</string><string name="name">Allen Garvey</string><string name="dream_job">UX Designer</string><string name="address">136 Redmont Rd.\nStamford, CT\n06903</string><string name="action_settings">Settings</string></resources>',{camelCase : true, visibility : 'public', 'makeFinal' : true});
            //android_inflate_xml.inflate_xml('<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android" xmlns:tools="http://schemas.android.com/tools" android:layout_width="match_parent" android:layout_height="match_parent" android:paddingLeft="@dimen/activity_horizontal_margin" android:paddingRight="@dimen/activity_horizontal_margin" android:paddingTop="@dimen/activity_vertical_margin" android:paddingBottom="@dimen/activity_vertical_margin" tools:context=".MainActivity"><TextView android:layout_width="wrap_content" android:layout_height="wrap_content" android:textAppearance="?android:attr/textAppearanceLarge" android:text="@string/name" android:id="@+id/nameTextView" android:layout_alignParentTop="true" android:layout_alignParentStart="true" android:layout_marginTop="22dp" android:textSize="50sp"/></RelativeLayout>', {camelCase: true, visibility : 'private'});
        </script>
    </body>
</html>