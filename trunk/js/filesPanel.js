LT.createFilesPanel = function () {
  LT.filesPanel = new LT.Panel( 'Files', 'Files', 6, 118, 250, 150);
  
  var my_uploader = new LT.Uploader("php/create_image.php", LT.filesPanel.content);
  my_uploader.setArgument("type", "tile");
  LT.element("input", {type:"submit", value:"upload"}, my_uploader.form);

/*
  my_uploader.form.onsubmit = function () {
    alert('sending');
  }
*/

/*
  my_uploader.onload = function (result) {
    alert(result);
  }
*/
};

