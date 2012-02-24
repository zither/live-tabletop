LT.createFilesPanel = function () {
  LT.filesPanel = new LT.Panel('Files', 'Files', 6, 118, 250, 150);
  
  var my_uploader = new LT.Uploader("php/create_image.php", LT.filesPanel.content);
  LT.createElement(my_uploader.form, [["input", {type: "radio", name: "type", value: "piece", checked: ""}], "Piece"]);
  LT.createElement(my_uploader.form, [["input", {type: "radio", name: "type", value: "tile"}], "Tile"]);
  LT.createElement(my_uploader.form, [["input", {type: "radio", name: "type", value: "background"}], "Background"]);
  LT.createElement(my_uploader.form, "input", {type:"submit", value:"upload"});

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

