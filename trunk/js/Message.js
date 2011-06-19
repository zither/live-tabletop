LT.Message = function (element) {
  this.user_id = parseInt(element.getAttribute("user_id"));
  this.id = parseInt(element.getAttribute("id"));
  this.time = parseInt(element.getAttribute("time"));
  this.element = document.createElement("span");
  this.element.innerHTML = decodeURIComponent(element.textContent);
};

