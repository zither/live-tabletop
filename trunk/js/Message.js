// TODO: this class is no longer used, so remove it
LT.Message = function (data) {
	this.user_id = data.user_id;
	this.id      = data.id;
	this.time    = data.time;
	this.element = $("<span>").html(data.text)[0];
};

