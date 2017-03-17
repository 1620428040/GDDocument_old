DataMagic.initViewWithMeta=function(meta){
				$(".panel-title").html(meta.describe);
}
DataMagic.View.Toolbar.prototype.buildButton=function(command) {
	return $('<a class="btn btn-default DMButton" data-command="'+command+'"><span>'+command+'</span></a>');
}
DataMagic.View.List.prototype.buildItem=function(){
	return $('<li class="list-group-item DMItem">'
				+'<!--span class="badge">新</span>-->'
				+'<div>'
					+'<span data-field="title"></span>'
				+'</div>'
				+'<div style="font-size: 14px;color: gray;font-family: kaiti;">'
					+'<span data-field="people"></span>'
					+'<span data-field="date" class="pull-right"></span>'
				+'</div>'
			+'</li>');
}
DataMagic.Field.Base.prototype.buildField=function(name, meta, data) {
	return $('<div class="form-group"><label for="' + name + '">' + meta.title + '</label><input class="form-control DMInput" type="text" id="' + name + '"/><p class="help-block">' + (meta.describe||"") + '</p></div>');
}
DataMagic.Field.LongText.prototype.buildField=function(name, meta, data) {
	return $('<div class="form-group"><label for="' + name + '">' + meta.title + '</label><textarea id="' + name + '" class="form-control DMInput" rows="5"></textarea><p class="help-block">' + (meta.describe||"") + '</p></div>');
}
DataMagic.Field.Number.prototype.buildSearchField=function(name, meta, data){
	return $('<div class="form-group"><label for="' + name + '">' + meta.title +
		'</label><span class="input-group-addon">最小</span><input class="form-control DMInput" type="text" id="' +
		name + '"/><label>' +
		'</label><span class="input-group-addon">最大</span><input class="form-control DMInput" type="text"/>'+
		'<p class="help-block">' + (meta.describe||"") + '</p></div>');
}


$.fn.datetimepicker.dates['zh-CN'] = {
	days: ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六", "星期日"],
	daysShort: ["周日", "周一", "周二", "周三", "周四", "周五", "周六", "周日"],
	daysMin:  ["日", "一", "二", "三", "四", "五", "六", "日"],
	months: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
	monthsShort: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
	today: "今天",
	suffix: [],
	meridiem: ["上午", "下午"]
};
/* 日期类型输入框
   * 属性
   * format  用在picker中的时间格式，跟默认的格式不一样
   * option  调用picker时的设置
   * */
DataMagic.Field.Date = DataMagic.Field.Number.inherit("日期类型输入框", null, null, {
	option:{
		format: 'yyyy年M月d日',
        language:  'zh-CN',
        weekStart: 1,
        todayBtn:  1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 4,
		minView: 2,
		forceParse: 0
    },
	listenInputChange:function(input){
		var self = this;
		input.change(function(){
			var jq=$(this);
			self.dataType.validationValue(self.getValue(jq),jq);
		});
		input.datetimepicker(this.option);
	}
});
DataMagic.DataType.Date.prototype.inputField = DataMagic.Field.Date;

/*时间日期类型输入框*/
DataMagic.Field.DateTime = DataMagic.Field.Date.inherit("时间日期类型输入框", null, null, {
	option:{
		format: 'yyyy年M月d日  H时i分',
        language:  'zh-CN',
        weekStart: 1,
        todayBtn:  1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 4,
		minView: 0,
		forceParse: 0,
		minuteStep:1
    }
});
DataMagic.DataType.DateTime.prototype.inputField = DataMagic.Field.DateTime;

/* 单选类型的输入框
   * 
   * 属性
   * picker 从底部弹出的选择器
   * options选项
   */
DataMagic.Field.Select = DataMagic.Field.Base.inherit("单选类型的输入框", function(dataType) {
	this.dataType = dataType;
	this.options = this.dataType.options;
}, null, {
	buildField:function(name, meta, data) {
		var html='<div class="form-group"><label for="' + name + '">' + meta.title + '</label><div class="btn-group" id="' + name + '">';
		for(var kn in this.options) {
			var kv = this.options[kn];
			html += '<a class="btn btn-default" data-value="' + kn + '"><span>' + kv + '</span></a>';
		}
		html+='</div>';
		if(meta.describe){
			html+='<p class="help-block">' + meta.describe + '</p>';
		}
		html+='</div>';
		this.picker=$(html);
		var self = this;
		this.items = this.picker.find(".btn").click(function() {
			self.onselect($(this));
		});
		return this.picker;
	},
	createSearchField: function(name, meta, data) {
		this.options[-1] = this.dataType.any;
		this.createField(name, meta, data);
		delete this.options[-1];
	},
	//当picker中的选项被点击时
	onselect: function(item) {
		this.items.removeClass("selected");
		item.addClass("selected");
	},
	setValue: function(input, value) {
		this.items.removeClass("selected");
		if(value != null) {
			this.items.filter("[data-value=" + value + "]").addClass("selected");
		}
	},
	getValue: function(input) {
		var items = this.picker.find(".selected");
		return items.length ? items.eq(0).text() : null;
	}
});
DataMagic.DataType.Select.prototype.inputField = DataMagic.Field.Select;

/*多选类型的输入框*/
DataMagic.Field.Multiple = DataMagic.Field.Select.inherit("多选类型的输入框", null, null, {
	//多选跟单选的区别是，选中后不会立即关闭picker，直到用户点击确认
	onselect: function(item) {
		item.toggleClass("selected");
	},
	setValue: function(input, value) {
		this.items.removeClass("selected");
		if(value != null) {
			var valueList=value.split(",");
			for(var i in valueList){
				this.items.filter("[data-value=" + value[i] + "]").addClass("selected");
			}
		}
	},
	getValue: function(input) {
		var items = this.picker.find(".selected");
		var values = [];
		for(var i = 0; i < items.length; i++) {
			values.push(items.eq(i).text());
		}
		return items.length ? values.join(",") : null;
	}
});
DataMagic.DataType.Multiple.prototype.inputField = DataMagic.Field.Multiple;