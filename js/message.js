LT.Message = function (element) {
  this.user_id = parseInt(element.getAttribute("user_id"));
  this.time = parseInt(element.getAttribute("time"));
  this.element = document.createElement("div");
  this.element.innerHTML = decodeURI(element.getAttribute("text"));
};

