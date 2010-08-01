/*
EXAMPLE USAGE (CLIENT SIDE):

<script type="text/javascript">
onload = function () {
  var my_uploader = new LT.Uploader("create_image.php", document.body);
  my_uploader.form.onsubmit = function () {
    LT.element("div", {}, document.body, "STARTING ...");
  }
  my_uploader.onload = function (result) {
    LT.element("div", {}, document.body, "... FINISHED");
  }
  my_uploader.form.submit();
}
</script>

EXAMPLE USAGE (SERVER SIDE):

<?php
$uploader = $_REQUEST['uploader'];
$result = move_uploaded_file($_FILES['file']['tmp_name'], getcwd()
  . DIRECTORY_SEPARATOR . 'upload'
  . DIRECTORY_SEPARATOR . basename( $_FILES['file']['name']));
?>
<script language="javascript" type="text/javascript">
  window.top.window.LT.Uploader.finish(<?php
    echo $uploader . ", " . json_encode($result); 
  ?>);
</script>
*/

// asynchronous uploader class
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
  this.form = LT.element("form", {
      action: url,
      method: "POST",
      enctype: "multipart/form-data",
      target: target_name
    }, container);

  // file selection widget
  this.fileInput = LT.element("input", {
      type: "file",
      name: "file"
    }, this.form);

  // hidden input with uploader id
  LT.element("input", {
      type: "hidden",
      name: "uploader",
      value: this.index
    }, this.form);

  // hidden iframe that recieves the result of the upload action
  this.iframe = LT.element("iframe", {
      name: target_name,
      src: "about:blank",
    }, this.form);
  this.iframe.style.border = "0";
  this.iframe.style.height = "0";
  this.iframe.style.width = "0";
};

// submit the form with optional arguments
// if you want to submit the form without arguments
// and 
LT.Uploader.prototype.submit = function (args) {

  // remove old temporary arguments
  for (var i = 0; i < this.temp_args.length; i++) {
    this.form.removeChild(this.temp_args[i]);
  }

  // create new temporary arguments
  this.temp_args = [];
  for (var arg_name in args) {
    this.temp_args.push(
      LT.element("input", {
          type: "hidden",
          name: arg_name,
          value: args[arg_name]
        }, this.form));
  }

  // submit form
  this.form.submit();
};

LT.Uploader.prototype.setArguments = function (args) {
   for (var arg_name in args) {
     this.setArgument(arg_name, args[arg_name]);
   }
};

LT.Uploader.prototype.setArgument = function (arg_name, arg_value) {
  this.form.removeChild(this.perm_args[arg_name]);
  this.perm_args[arg_name] = LT.element("input", {
      type: "hidden",
      name: arg_name,
      value: arg_value
    }, this.form);
};

LT.Uploader.prototype.deleteArguments = function (arg_names) {
  for (var i = 0; i < args.length; i++) {
    this.deleteArgument(args[i]);
  }
};

LT.Uploader.prototype.deleteArgument = function (arg_name) {
  this.form.removeChild(this.perm_args[arg_name]);
  delete (this.perm_args[arg_name]);
};

// do not modify
LT.Uploader.uploaders = [];

// do not modify
LT.Uploader.finish = function (index, result) {
  var uploader = LT.Uploader.uploaders[index];
  if (uploader.onload) {
    uploader.onload(result);
  }
}


