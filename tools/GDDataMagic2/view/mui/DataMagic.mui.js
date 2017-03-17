//================================================================
//以下适配MUI框架的内容
//================================================================
DataMagic.initViewWithMeta = function(meta) {
	$(".mui-title").html(meta.describe);
}
DataMagic.dialog = function(mess) {
	mui.toast(mess);
}
DataMagic.alert = function(mess) {
	mui.alert(mess);
}
//当发送ajax请求时，显示一个进度条
DataMagic.ajaxSend=function(){
	var progressbar = mui('body').progressbar();
	if(progressbar.show) {
		progressbar.show();
	} else {
		$(function() {
			mui('body').progressbar().show();
		});
	}
}
DataMagic.ajaxStop=function(){
	mui('body').progressbar().hide();
}
DataMagic.View.Toolbar.prototype.executeEvent="tap";
DataMagic.View.Toolbar.prototype.buildButton=function(command) {
	return $('<a class="mui-tab-item DMButton" data-command="' + command + '"><span class="mui-icon mui-icon-plus"></span><span class="mui-tab-label">' + command + '</span></a>');
}
DataMagic.View.List.prototype.buildItem=function(){
	return $('<li class="mui-table-view-cell mui-media DMItem">'
		+'<div><span data-field="title"></span></div>'
		+'<div style="font-size: 14px;color: gray;font-family: kaiti;">'
		+'<span data-field="people" class="mui-pull-left"></span>'
		+'<span data-field="date" class="mui-pull-right"></span></div></li>');
}
DataMagic.Field.Base.prototype.buildField=function(name, meta, data) {
	return $('<div class="mui-input-row"><label for="' + name + '">' + meta.title + '</label><input class="mui-input-clear DMInput" type="text" id="' + name + '" placeholder="' + (meta.describe||"") + '"/></div>');
}
DataMagic.Field.LongText.prototype.buildField=function(name, meta, data) {
	return $('<div class="mui-input-row" style="height: 120px;"><label for="' + name + '">' + (meta.describe||"") + '</label><textarea id="' + name + '" class="DMInput" rows="5" placeholder="' + (meta.describe||"") + '"></textarea></div>');
}
DataMagic.Field.Number.prototype.buildSearchField=function(name, meta, data){
	return $('<div class="mui-input-row"><label for="' + name + '">' + meta.title +
		'</label><input class="mui-input-clear DMInput" type="text" id="' +
		name + '" placeholder="' + (meta.describe||"") + '"/></div><div class="mui-input-row"><label>' +
		'</label><input class="mui-input-clear DMInput" type="text"/></div>');
}

/* 日期类型输入框
   * 属性
   * format  用在picker中的时间格式，跟默认的格式不一样
   * option  调用picker时的设置
   * */
DataMagic.Field.Date = DataMagic.Field.Number.inherit("日期类型输入框", null, null, {
	format:"yyyy-MM-dd",
	option:{"type": "date"},
	buildField: function(name, meta, data) {
		return $('<div class="mui-input-row"><label for="' + name + '">' + meta.title + '</label><label id="' + name + '" class="DMInput picker-input"></label></div>');
	},
	buildSearchField: function(name, meta, data) {
		return $('<div class="mui-input-row"><label for="' + name + '">' + meta.title +
			'</label><label class="DMInput picker-input" id="' +
			name + '"></label></div><div class="mui-input-row" data-show="search"><label>' +
			'</label><label class="DMInput picker-input"></label></div>');
	},
	//输入框被点击，弹出picker
	onInputClicked: function(input) {
		var option = this.option;
		var value = input.text();
		if(value) {
			option["value"]=Date.changeFormat(this.dataType.format,this.format,value);
		}
		var picker = new mui.DtPicker(option);
		var self=this;
		picker.show(function(rs) {
			input.text(Date.changeFormat(self.format,self.dataType.format,rs.text));
			picker.dispose();
		});
	},
	setValue: function(input, value) {
		if(value != null) {
			var str = this.dataType.tranToString(value);
			input.text(str);
		}
	},
	getValue: function(input) {
		var value = input.text();
		return value === "" || value === null ? null : value;
	}
});
DataMagic.DataType.Date.prototype.inputField = DataMagic.Field.Date;

/*时间日期类型输入框*/
DataMagic.Field.DateTime = DataMagic.Field.Date.inherit("时间日期类型输入框", null, null, {
	format:"yyyy-MM-dd HH:mm",
	option:{}
});
DataMagic.DataType.DateTime.prototype.inputField = DataMagic.Field.DateTime;


/* 单选类型的输入框
   * 
   * 属性
   * picker 从底部弹出的选择器
   * options选项
   */
DataMagic.Field.Select = DataMagic.Field.Date.inherit("单选类型的输入框", function(dataType) {
	this.dataType = dataType;
	this.picker = this.createPicker();
	this.options = this.dataType.options;
}, null, {
	createPicker: function() {
		var picker = $("#popover-select");
		if(picker.length === 0) {
			picker = $('<div id="popover-select" class="mui-popover mui-popover-action mui-popover-bottom">' +
				'<ul class="mui-table-view" id="select-options"></ul>' +
				'<ul class="mui-table-view">' +
				'<li class="mui-table-view-cell"><a id="confirm"><b>确认</b></a></li>' +
				'<li class="mui-table-view-cell"><a id="cancel"><b>取消</b></a></li>' +
				'</ul></div>');
			$("body").append(picker);
		}
		return picker;
	},
	onInputClicked: function() {
		var html = '';
		for(var kn in this.options) {
			var kv = this.options[kn];
			html += '<li class="mui-table-view-cell" data-value="' + kn + '">' + kv + '</li>';
		}
		var self = this;
		this.items = this.picker.find("#select-options").html(html).children("li");
		this.items.click(function() {
			self.onselect($(this));
		});
		this.picker.find("#confirm").click(function() {
			self.onconfirm();
		});
		this.picker.find("#cancel").click(function() {
			self.oncancel();
		});
		mui("#popover-select").popover("show");
	},
	//当picker中的选项被点击时
	onselect: function(item) {
		this.input.text(item.text());
		mui("#popover-select").popover("hide");
	},
	onconfirm: function() {
		mui("#popover-select").popover("hide");
	},
	oncancel: function() {
		mui("#popover-select").popover("hide");
	},
	createSearchField: function(name, meta, data) {
		this.options[-1] = this.dataType.any;
		this.createField(name, meta, data);
		delete this.options[-1];
	}
});
DataMagic.DataType.Select.prototype.inputField = DataMagic.Field.Select;

/*多选类型的输入框*/
DataMagic.Field.Multiple = DataMagic.Field.Select.inherit("多选类型的输入框", null, null, {
	//多选跟单选的区别是，选中后不会立即关闭picker，直到用户点击确认
	onselect: function(item) {
		item.toggleClass("selected");
	},
	onconfirm: function() {
		var items = this.picker.find(".selected");
		var values = [];
		for(var i = 0; i < items.length; i++) {
			values.push(items.eq(i).text());
		}
		this.input.text(values.join(","));
		mui("#popover-select").popover("hide");
	}
});
DataMagic.DataType.Multiple.prototype.inputField = DataMagic.Field.Multiple;