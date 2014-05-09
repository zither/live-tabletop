/*
ASYNCHRONOUS UPLOADER

EXAMPLE USAGE (CLIENT SIDE):

<script type="text/javascript">
onload = function () {
	var my_uploader = new LT.Uploader("create_image.php", $("body"));
	my_uploader.form.onsubmit = function () {
		$("body").append($("<div>STARTING ...</div>"));
	}
	my_uploader.onload = function (result) {
		$("body").append($("<div>FINISHED ...</div>"));
	}
	my_uploader.form.submit();
}
</script>

EXAMPLE USAGE (SERVER SIDE):

<?php
$uploader = $_REQUEST['uploader'];
$result = move_uploaded_file($_FILES['file']['tmp_name'], getcwd()
	. DIRECTORY_SEPARATOR . 'upload'
	. DIRECTORY_SEPARATOR . basename($_FILES['file']['name']));
?>
<script language="javascript" type="text/javascript">
	window.top.window.LT.Uploader.finish(<?php
		echo $uploader . ", " . json_encode($result); 
	?>);
</script>
*/

// UPLOADER CONSTRUCTOR
LT.Uploader = function (url, container) {

	// psuedo-event-handler callback you can set
	this.onload = null;

	// internal arrays you should not modify
	this.perm_args = {};
	this.temp_args = [];

	// uploader indices are used as unique ids - do not modify them
	this.index = LT.Uploader.uploaders.length;
	LT.Uploader.uploaders.push(this);

	// the target name is set automatically by uploader index
	var target_name = "uploader_target_" + this.index;

	// you can add elements to the form if you want
	this.form = $("<form>").appendTo($(container)).attr({
		action: url,
		method: "POST",
		enctype: "multipart/form-data",
		target: target_name
	}).append(
		// file selection widget
		$("<input>").attr({type: "file", name: "file"}),
		// hidden input with uploader id
		$("<input>").attr({type: "hidden", name: "uploader", value: this.index}),
		// hidden iframe that recieves the result of the upload action
		this.iframe = $("<iframe>").attr({name: target_name, src: "about:blank",})
			.css({border: "0", height: "0", width: "0"})[0]
	);
};

// GLOBAL VARIABLES

// do not modify
LT.Uploader.uploaders = [];

// STATIC METHODS OF THE UPLOADER CLASS

// do not modify
LT.Uploader.finish = function (index, result) {
	var uploader = LT.Uploader.uploaders[index];
	if (uploader.onload) uploader.onload(result);
};

// METHODS OF UPLOADER OBJECTS

LT.Uploader.prototype = {

	// submit the form with optional arguments
	// if you want to submit the form without arguments
	// and 
	submit: function (args) {
		// remove old temporary arguments
		$(this.temp_args).remove();
		// create new temporary arguments
		this.temp_args = [];
		for (var arg_name in args)
			this.temp_args.push($("<input>").appendTo(this.form)
				.attr({type: "hidden", name: arg_name, value: args[arg_name]}));
		// submit form
		this.form.submit();
	},

	setArguments: function (args) {
		for (var arg_name in args)
			this.setArgument(arg_name, args[arg_name]);
	},

	setArgument: function (arg_name, arg_value) {
		if (this.perm_args[arg_name])
			$(this.perm_args[arg_name]).remove();
		this.perm_args[arg_name] = $("<input>").appendTo(this.form)
			attr({type: "hidden", name: arg_name, value: arg_value});
	},

	deleteArguments: function (arg_names) {
		for (var i = 0; i < args.length; i++)
			this.deleteArgument(args[i]);
	},

	deleteArgument: function (arg_name) {
		$(this.perm_args[arg_name]).remove();
		delete this.perm_args[arg_name];
	},

};

