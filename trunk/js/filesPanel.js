LT.createFilesPanel = function () {
  LT.filesPanel = new LT.Panel('Files', 'Files', 6, 118, 250, 150);  
  var my_uploader = new LT.Uploader("php/create_image.php", LT.filesPanel.content);
  LT.element(my_uploader.form, [["input", {type: "radio", 'name': "type", checked: ""}, ["piece"]], "Piece"]);
  LT.element(my_uploader.form, [["input", {type: "radio", 'name': "type"}, ["tile"]], "Tile"]);
  LT.element(my_uploader.form, [["input", {type: "radio", 'name': "type"}, ["background"]], "Background"]);
  LT.element(my_uploader.form, "input", {type:"submit", value:"upload"});
//  my_uploader.form.onsubmit = function () {alert('sending');};
//  my_uploader.onload = function (result) {alert(result);};
};

