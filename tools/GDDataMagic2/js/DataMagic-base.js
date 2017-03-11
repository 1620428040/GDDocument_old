"use strict";
/* DataMagic  一个实现自定义列表、表单、表格等功能的框架
 * 
 * 修改说明2017-1-22
 * 这次修改，希望能使用MVC设计模式，将原来的代码解构，并且实现只替换View部分就能适应不同的UI框架
 * 
 * 依赖关系
 * 基础功能只需要jQuery
 * 样式需要导入对应的css样式表
 * 
 */

//================================================================
//polyfills补充一些JavaScript引擎不提供的功能
//================================================================

/*Object.create作用与高版本的JavaScript中的Object.create相同*/
if(!Object.create) {
	Object.create = function(parentPrototype) {
		var empty = function() {}
		empty.prototype = parentPrototype;
		return new Function.empty();
	}
}

/* Class  用来定义类的一个基类
 * 
 * Class.create  生成一个新类
 * var Animal = Class.create();//生成一个Animal类
 * 
 * Class.inherit  生成一个继承当前类的类
 * var Cat = Animal.inherit();//生成一个继承父类Animal类的新类 Cat类
 * 
 * this.getClass().base.call(this,...)  如果需要调用父类的构造函数
 * 
 * 参数
 * title类名，可以是任意字符串，在调试时很有用。可省略
 * parentClass父类，如果省略该参数，则继承Class类
 * constructor构造函数，如果省略该参数，则构造函数是一个自动生成的、调用父类的构造函数的函数
 * classMethods类方法
 * methods方法
 */
var Class = function() {};
Class.inherit = function(title, constructor, classMethods, methods) {
	var parentClass=this;
	//生成默认的构造函数
	var newClass = typeof constructor === "function" ? constructor : function() {
		parentClass.apply(this, arguments);
	}
	//继承原型
	newClass.prototype = Object.create(parentClass.prototype);
	//复制父类的类方法
	for(var kn in parentClass) {
		newClass[kn] = parentClass[kn];
	}
	//添加新的类方法
	if(classMethods) {
		for(var kn in classMethods) {
			newClass[kn] = classMethods[kn];
		}
	}
	//添加新的方法
	if(methods) {
		for(var kn in methods) {
			newClass.prototype[kn] = methods[kn];
		}
	}
	//设置各种参数
	newClass.prototype.constructor = newClass;
	newClass.classTitle = title;
	newClass.base = parentClass;
	return newClass;
}
//当调用obj.toString时，显示当前类或者对象的介绍
Class.classTitle = "基础类";
Class.toString = function() {
	if(this.base && this.classTitle == null) {
		return this.base.toString() + " 的子类";
	}
	return this.classTitle;
}
Class.prototype.toString = function() {
	return this.getClass().toString() + " 的实例";
}
//获取当前实例所在的类
Class.prototype.getClass = function() {
	return Object.getPrototypeOf(this).constructor;
}

/* Date.prototype.format	将 Date 转化为指定格式的String
 * 
 * 参数：
 * fmt  字符串    可以使用的符号：年(y)、月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、毫秒(S)、周(E)、季度(q)
 * yyyy表示四位数的年份;yy表示两位数的年份
 * MM表示有前导零;M表示没有前导零的月份
 * 
 * eg:
 * (new Date()).format("yyyy-MM-dd hh:mm:ss.S")==> 2006-07-02 08:09:04.423
 * 
 * TODO:有个bug，如果使用12小时制，没办法确认是上午还是下午
 */
Date.prototype.format = function(fmt) {
	var o = {
		"M+": this.getMonth() + 1, //月份
		"d+": this.getDate(), //日
		"h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, //小时
		"H+": this.getHours(), //小时
		"m+": this.getMinutes(), //分
		"s+": this.getSeconds(), //秒
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度
		"S": this.getMilliseconds() //毫秒
	};
	var week = {
		"0": "/u65e5",
		"1": "/u4e00",
		"2": "/u4e8c",
		"3": "/u4e09",
		"4": "/u56db",
		"5": "/u4e94",
		"6": "/u516d"
	};
	if(/(y+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	}
	if(/(E+)/.test(fmt)) {
		fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "/u661f/u671f" : "/u5468") : "") + week[this.getDay() + ""]);
	}
	for(var k in o) {
		if(new RegExp("(" + k + ")").test(fmt)) {
			fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		}
	}
	return fmt;
}
Date.createFormFormatString = function(fmt, str) {
	var formatSign = ["y", "M", "d", "H", "h", "m", "s", "S"];
	var list = [];
	var time = new Date(0);
	for(var i in formatSign) {
		var sign = formatSign[i];
		if(new RegExp("(" + sign + "+)").test(fmt)) {
			list.push({
				sign: sign,
				length: RegExp.$1.length,
				index: fmt.indexOf(RegExp.$1)
			});
		}
	}
	list.sort(function(a, b) {
		return a.index - b.index;
	});
	var parts = str.match(new RegExp("([0-9]{1,4})", "g"));
	for(var i in list) {
		var kn = list[i];
		var kv = parts[i];
		if(kn.sign === "y") {
			time.setYear(parseInt("2000".substr(0, 4 - kn.length) + kv));
		} else if(kn.sign === "M") {
			time.setMonth(parseInt(kv) - 1);
		} else if(kn.sign === "d") {
			time.setDate(parseInt(kv));
		} else if(kn.sign === "H") {
			time.setHours(parseInt(kv));
		} else if(kn.sign === "h") {
			time.setHours(parseInt(kv));
		} else if(kn.sign === "m") {
			time.setMinutes(parseInt(kv));
		} else if(kn.sign === "s") {
			time.setSeconds(parseInt(kv));
		} else if(kn.sign === "S") {
			time.setMilliseconds(parseInt(kv));
		}
	}
	return time;
}
Date.changeFormat=function(from,to,value){
	return Date.createFormFormatString(from,value).format(to);
}

//================================================================
//相关的功能都定义在DataMagic类中
//================================================================
var DataMagic = {
	Model: null, //模型
	Controller: null, //控制器
	View: {}, //View类组
	DataType: {}, //数据类型类组
	Field: {}, //输入框类组
	//当DOM和meta都加载完后，初始化视图
	initViewWithMeta: function(meta) {
	},
	//输出警告信息
	warning: function(mess) {
		console.log(mess);
	},
	//弹出警告框
	alert: function(mess) {
		alert(mess);
	},
	//弹出提示信息
	dialog: function(mess) {
		alert(mess);
	},
	//数据发送之前，进行的操作
	ajaxSend:function(data) {
	},
	//数据接收结束，进行的操作
	ajaxStop:function() {
	}
};
//================================================================
//数据类型
//================================================================
/* 基本数据类型。比如文字
 * 
 * 属性
 * field  对应的输入控件实例
 * inputField  对应的输入框的类。定义输入框类之后在这个属性上注册一下，就能在创建输入框时自动调用
 * pattern  该数据类型要求的正则表达式
 */
DataMagic.DataType.Base = Class.inherit("基础数据类型", function(fieldName, fieldMeta) {
	this.fieldName = fieldName;
	this.fieldMeta = fieldMeta;
	var regexp = fieldMeta.regexp || this.defaultRegExp;
	if(regexp) {
		this.regexp = new RegExp(regexp);
	}
}, null, {
	tranToString: function(data) {
		return(data == null || data === "") ? "" : data.toString();
	},
	tranToData: function(str) {
		return str;
	},
	//验证数据是否符合该类型的要求，比如说Number类型的数据必须全部由数字组成
	typeValidation: function(value) {
		return this.pattern ? this.pattern.test(value) : true;
	},
	createInputField: function(data) {
		if(this.field == null) {
			this.field = new this.inputField(this);
		}
		this.field.createField(this.fieldName, this.fieldMeta, data);
		return this.field;
	},
	validationValue: function(value, input) {
		var validated = true;
		//检查是否为空
		if(validated && value === null) {
			validated = this.fieldMeta.notNull ? false : true;
		}
		//检查是否符合正则表达式
		if(validated && this.regexp) {
			validated = this.regexp.test(value);
		}
		//检查是否符合数据类型的要求
		validated = validated && this.typeValidation(value);
		//错误提示
		if(validated) {
			this.field.hideMistake(input);
		} else {
			this.field.showMistake(input);
		}
		return validated;
	},
	getValue: function() {
		var value = this.field.getValue(this.field.input);
		this.validated = this.validationValue(value, this.field.input);
		return this.tranToData(value);
	},
	createSearchField: function() {
		if(this.field == null) {
			this.field = new this.inputField(this);
		}
		this.field.createSearchField(this.fieldName, this.fieldMeta, null);
		return this.field;
	},
	validationSearchParams: function(value,input) {
		var validated = (value === null) ? true : this.typeValidation(value);
		if(validated) {
			this.field.hideMistake(input);
		} else {
			this.field.showMistake(input);
		}
		return validated;
	},
	getSearchParams: function() {
		var value = this.field.getValue(this.field.input);
		this.validated = this.validationSearchParams(value, this.field.input);
		return this.tranToData(value);
	}
});

/*长文本类型*/
DataMagic.DataType.LongText = DataMagic.DataType.Base.inherit("长文本数据类型");

/*数字类型*/
DataMagic.DataType.Number = DataMagic.DataType.Base.inherit("数字数据类型", null, null, {
	pattern: /^[0-9]{0,}$/,
	tranToData: function(str) {
		return str == null ? null : parseInt(str);
	},
	getSearchParams: function() {
		var values = {};

		var min = this.field.getValue(this.field.minInput);
		var validated1 = this.validationSearchParams(min, this.field.minInput);
		values.start = this.tranToData(min);

		var max = this.field.getValue(this.field.maxInput);
		var validated2 = this.validationSearchParams(max, this.field.maxInput);
		values.end = this.tranToData(max);

		this.validated = validated1 && validated2;
		if(values.start === null && values.end === null) {
			return null;
		}
		return values;
	}
});

/*日期类型*/
DataMagic.DataType.Date = DataMagic.DataType.Number.inherit("日期数据类型", null, null, {
	format: "yyyy年M月d日",
	pattern: /^[0-9]{4}年[0-9]{1,2}月[0-9]{1,2}日$/,
	tranToString: function(s) {
		if(s == null || s === "") {
			return "";
		}
		if(typeof s === "string") {
			s = parseInt(s);
		}
		var dat = new Date(s * 1000);
		return dat.format(this.format);
	},
	tranToData: function(str) {
		if(str === null) {
			return null;
		}
		var date = Date.createFormFormatString(this.format, str);
		return date.getTime() / 1000;
	}
});

/*日期时间类型*/
DataMagic.DataType.DateTime = DataMagic.DataType.Date.inherit("日期加时间数据类型", null, null, {
	format: "yyyy年M月d日  H时m分",
	pattern: /^[0-9]{4}年[0-9]{1,2}月[0-9]{1,2}日  [0-9]{1,2}时[0-9]{1,2}分$/
});

/* 单选类型
 * 属性
 * options  选项
 * any 当进行搜索时，表示任意选项的字符串
 */
DataMagic.DataType.Select = DataMagic.DataType.Base.inherit("单选数据类型", function(fieldName, fieldMeta) {
	this.getClass().base.call(this, fieldName, fieldMeta);
	this.options = {};
	this.any = "任意";
	var titles = [];
	var splited = fieldMeta.valueRange.split(";");
	for(var i in splited) {
		var kvp = splited[i].split(",");
		this.options[kvp[0]] = kvp[1];
		titles.push(kvp[1]);
	}
	this.pattern = new RegExp("^(?:" + titles.join("|") + "|" + this.any + ")$");
}, null, {
	typeValidation: function(value) {
		return this.pattern.test(value);
	},
	tranToString: function(value) {
		return this.options[value] || "";
	},
	tranToData: function(str) {
		for(var kn in this.options) {
			var kv = this.options[kn];
			if(kv === str) {
				return kn;
			}
		}
	}
});

/*多选类型*/
DataMagic.DataType.Multiple = DataMagic.DataType.Select.inherit("多选数据类型", null, null, {
	typeValidation: function(value) {
		var values = value.split(",");
		for(var i in values) {
			if(!this.pattern.test(values[i])) {
				return false;
			}
		}
		return true;
	},
	tranToString: function(value) {
		var str = [];
		var values = value.split(",");
		for(var i in values) {
			str.push(this.options[value]);
		}
		return str.length > 0 ? str.join(",") : null;
	},
	tranToData: function(str) {
		var str = str.split(",");
		var values = [];
		for(var i in str) {
			for(var kn in this.options) {
				var kv = this.options[kn];
				if(kv = str[i]) {
					values.push(kn);
				}
			}
		}
		return values.length > 0 ? values.join(",") : null;
	}
});

/*布尔类型*/
DataMagic.DataType.Bool = DataMagic.DataType.Select.inherit("布尔数据类型", function(fieldName, fieldMeta) {
	DataMagic.DataType.Base.call(this, fieldName, fieldMeta);
	this.options = { "0": "是", "1": "否" };
	this.any = "任意";
}, null, {
	typeValidation: function(value) {
		return value === this.any ? true : /^[是否]$/.test(value);
	},
	tranToString: function(bool) {
		return bool == null ? null : (bool === "1" ? "是" : "否");
	},
	tranToData: function(str) {
		var value = null;
		if(str === "是") {
			value = "1";
		} else if(str === "否") {
			value = "0";
		}
		return value;
	}
});

//================================================================
//数据模型
//================================================================
/* 数据模型类，负责联系后台进行增删改查等操作，本地存储数据等
 * 
 * 属性
 * name给Model命名
 * meta是指元数据
 * data是指数据
 * storage是sessionStorage或者localStorage
 * host服务器地址
 * server进行不同的操作时，具体的URL链接，如果没有定义，则通过host生成。
 */
DataMagic.Model = Class.inherit("基础model", function(name, storage, host, controller, filter) {
	this.name = name;
	this.storage = storage;
	this.server = {
//		getMeta:null,
//		insert:null,
//		delete:null,
//		update:null,
//		search:null
	};
	if(host) {
		this.host = host;
	}
	this.controller = controller;
	if(filter) {
		this.filter = filter;
	}
	if(host || this.server.getMeta) {
		this.downloadMeta();
	}
}, {
	request: function(url, params, callback) {
		if(url == null) {
			return;
		}
		DataMagic.ajaxSend(params);
		$.ajax({
			type: "post",
			url: url,
			async: true,
			cache:false,
			data: params,
			success: function(data,status,xhr) {
				if(data == null || data === "") {
					console.error("服务器返回的内容为空");
					return;
				}
				try {
					if(typeof data==="string"){
						data = JSON.parse(data);
					}
					if(data.status === "error") {
						console.error(data.reason);
						return;
					}
				} catch(e) {
					console.error("解析数据失败:" + e);
				}
				callback(data);
			},
			crossDomain: true,
			complete:function(xhr,status){
				DataMagic.ajaxStop();
			}
		});


//		$.ajax({
//			type: "get",
//			url: url,
//			async: true,
//			cache:false,
//			data: params,
//			dataType:'jsonp',
//			success: function(data,status,xhr) {
//				if(data == null || data === "") {
//					console.error("服务器返回的内容为空");
//					return;
//				}
//				try {
//					if(data.status === "error") {
//						console.error(data.reason);
//						return;
//					}
//				} catch(e) {
//					console.error("解析数据失败:" + e);
//				}
//				callback(data);
//			},
//			complete:function(xhr,status){
//				DataMagic.ajaxStop();
//			}
//		});
	}
}, {
	//设置服务器为标准的接口
	getServerUrl: function(action) {
		if(this.server[action]) {
			return this.server[action];
		}
		if(this.host) {
			var url = this.host;
			var sign = url.indexOf("?") < 0 ? "?" : "&";
			return url + sign + "name=" + this.name + "&action=" + action;
		} else {
			console.log("需要指定服务器地址或者提供meta")
		}
	},
	//从指定的地址下载元数据
	downloadMeta: function(callback) {
		var self = this;
		DataMagic.Model.request(this.getServerUrl("getMeta"), { where: this.filter }, function(data) {
			self.initWithMeta(data);
			if(callback) {
				callback.call(this);
			}
		});
	},
	//使用指定的元数据初始化
	initWithMeta: function(meta) {
		this.meta = meta;
		//		meta.showIndex=(meta.showIndex==="1"||meta.showIndex===1);
		//		meta.allowMove=(meta.allowMove==="1"||meta.allowMove===1);
		for(var key in this.meta.fieldList) {
			var value = this.meta.fieldList[key];
			var dataType = DataMagic.DataType[value.type || "Base"] || DataMagic.DataType.Base;
			value.dataType = new dataType(key, value);
			//			value.notNull=(value.notNull==="1"||value.notNull===1);
		}
		this.controller.onMetaLoad();

		if(meta.data) {
			this.data = this.changeDataIndex(meta.data);
			this.controller.onDataLoad();
		} else if(this.host || this.server.search) {
			var self = this;
			this.search(function() {
				self.controller.onDataLoad();
			});
		}
	},
	//将data数组的索引改成使用id索引
	changeDataIndex: function(data) {
		var newData = [];
		for(var i in data) {
			newData[data[i].id] = data[i];
		}
		return newData;
	},
	//从服务器获取
	request: function(url, params, callback) {
		var self = this;
		DataMagic.Model.request(url, params, function(data) {
			callback(data);
		});
	},
	//保存到本地存储
	save: function() {
		if(this.storage) {
			this.storage.setItem(this.name + "_meta", JSON.stringify(this.meta));
			this.storage.setItem(this.name, JSON.stringify(this.data));
		}
	},
	//从本地存储读取
	read: function() {
		if(this.storage) {
			this.meta = JSON.parse(this.storage.getItem(this.name + "_meta"));
			this.data = JSON.parse(this.storage.getItem(this.name));
			return this.data;
		}
	},
	//清空
	clear: function() {
		if(this.storage) {
			this.storage.removeItem(this.name + "_meta");
			this.storage.removeItem(this.name);
		}
		this.data = null;
	},
	//获取其中的一条
	detail: function(id) {
		return this.data[id];
	},
	//TODO:等写完增删改查，需要再改一下。读取数据，如果没有就下载
	readOrLoad: function(url, params, callback) {
		var data = this.read();
		if(data == null) {
			data = this.request(url, params, callback);
		} else {
			callback(data);
		}
	},
	//插入一条数据，data指要插入的数据，callback是回调函数，参数是包含新的ID的数据
	insert: function(data, callback) {
		var self = this;
		var newData = $.extend({}, data);
		if(newData.id) {
			delete newData.id;
		}
		this.request(this.getServerUrl("insert"), { data: newData }, function(result) {
			newData.id = result;
			self.data[newData.id] = newData;
			if(callback) {
				callback(newData);
			}
		});
	},
	//删除若干条数据，data指要删除的数据的索引组成的数组;callback是回调函数，参数是被删除的ID
	delete: function(ids, callback) {
		var self = this;
		this.request(this.getServerUrl("delete"), { where: { id: ids } }, function(result) {
			for(var i in ids) {
				delete self.data[ids[i]];
			}
			if(callback) {
				callback(ids);
			}
		});
	},
	//修改一条数据，data指要修改后的数据(包含在this.data的)
	update: function(id, data, callback) {
		var self = this;
		var newData = $.extend({}, data);
		if(newData.id) {
			delete newData.id;
		}
		this.request(this.getServerUrl("update"), { where: { id: id }, data: newData }, function(result) {
			data.id = id;
			self.data[id] = data;
			if(callback) {
				callback(data);
			}
		});
	},
	//搜索，where指搜索条件，callback指回调函数，参数为搜索到的数据数组
	search: function(where, callback) {
		where = where || {};
		if(this.filter) {
			$.extend(where, this.filter);
		}
		var self = this;
		this.request(this.getServerUrl("search"), { where: where }, function(result) {
			if(callback) {
				self.data = self.changeDataIndex(result);
				callback(result);
			}
		});
	}
});
//================================================================
//控制器
//================================================================
/* 控制器类，负责接收用户的操作请求，调用model，然后更新view
 * 
 * 属性
 * model指当前控制器对应的model
 * list指当前控制器对应的列表(或者表格)对象
 * toolbar工具栏
 * form表单对象
 * ready布尔值，是否准备完成，可以加载数据了
 */
DataMagic.Controller = Class.inherit("基础控制器", function(name, storage, host, filter) {
	DataMagic.Controller.instanceList.push(this);
	this.model = new DataMagic.Model(name, storage, host, this, filter);
	this.list = new DataMagic.View.List(this);
	this.toolbar = new DataMagic.View.Toolbar(this);
	this.form = new DataMagic.View.Form(this);
}, {
	instanceList: []
}, {
	onDOMLoad: function() {
		console.log("DOM加载完成");
		this.list.onDOMLoad();
		this.toolbar.onDOMLoad();
		this.form.onDOMLoad();
		if(this.model.meta) {
			this.initViewWithMeta();
		}
	},
	onMetaLoad: function() {
		console.log("meta加载完成");
		if(document.readyState === "complete") {
			this.initViewWithMeta();
		}
	},
	onDataLoad: function() {
		console.log("data加载完成");
		if(this.ready) {
			this.list.insert(this.model.data);
		}
	},
	onReady: null,
	initViewWithMeta: function() {
		console.log("开始初始化视图");
		this.ready = true;
		DataMagic.initViewWithMeta(this.model.meta);
		if(this.list) {
			this.list.clearAll();
			this.list.alias = this.model.meta.alias;
			if(this.model.data) {
				this.list.insert(this.model.data);
			}
		}
		this.toolbar.refresh(this.model.meta.feature);
		if(this.onReady) {
			this.onReady();
		}
	},
	execute: function(action) {
		if(this[action]) {
			this[action]();
		} else {
			console.log(this);
			console.error("调用的方法不存在:" + action);
		}
	},
	/*控制表单*/
	showForm: function(mode, data) {
		this.form.mode = mode;
		this.form.clearAll();
		if(mode === "insert") {
			for(var key in this.model.meta.fieldList) {
				var value = this.model.meta.fieldList[key];
				var field = value.dataType.createInputField(value.defaultValue);
				this.form.append(field);
			}
		} else if(mode === "search") {
			for(var key in this.model.meta.fieldList) {
				var value = this.model.meta.fieldList[key];
				var field = value.dataType.createSearchField();
				this.form.append(field);
			}
		} else {
			for(var key in this.model.meta.fieldList) {
				var value = this.model.meta.fieldList[key];
				var field = value.dataType.createInputField(data[key]);
				this.form.append(field);
			}
		}
		this.form.show();
	},
	showFormForDetails: function(mode) { //在表单中显示一条数据的详情，进行查看或修改
		var cells = this.list.getSelectedItems();
		if(cells.length == 0) {
			DataMagic.dialog("请选择一条数据");
		} else {
			var id = this.list.getIDWithItems(cells)[0];
			var data = this.model.data[id];
			this.list.hide();
			if(mode === "update") {
				this.toolbar.refresh(["save", "cancel"]);
			} else {
				this.toolbar.refresh(["cancel"]);
			}
			this.showForm(mode, data);
			this.currentID = id;
			this.currentItem = cells;
		}
	},
	getFormData: function() {
		var getter = this.form.mode === "search" ? "getSearchParams" : "getValue";
		var result = {};
		var validated = true; //数据是否通过了验证
		for(var kn in this.model.meta.fieldList) {
			var kv = this.model.meta.fieldList[kn];
			var value = kv.dataType[getter]();
			if(value) {
				result[kn] = value;
			}
			validated = kv.dataType.validated && validated;
			if(!validated) {
//				DataMagic.dialog(kn);
			}
		}
		if(!validated) {
			DataMagic.dialog("您输入的数据格式不正确！");
			return;
		}
		return result;
	},
	save: function() {
		var result = this.getFormData();
		if(result == null) {
			return;
		}
		delete result.id;

		var self = this;
		if(this.form.mode === "insert") {
			this.model.insert(result, function(data) {
				self.list.insert(data);
			});
		} else if(this.form.mode === "update") {
			var self = this;
			this.model.update(this.currentID, result, function(data) {
				self.list.update(self.currentItem, data, self.model.meta.fieldList);
			});
		} else if(this.form.mode === "search") {
			this.model.search(result, function(data) {
				self.list.clearAll();
				self.list.insert(data);
			});
		}
		this.cancel();
	},
	cancel: function() {
		this.toolbar.refresh(this.model.meta.feature);
		this.list.show();
		this.form.hide();
	},
	/*控制列表*/
	insert: function() {
		this.list.hide();
		this.showForm("insert");
		this.toolbar.refresh(["save", "cancel"]);
	},
	delete: function() {
		var cells = this.list.getSelectedItems(true);
		if(cells.length == 0) {
			DataMagic.dialog("至少选择一条数据");
		} else {
			var ids = this.list.getIDWithItems(cells);
			var self = this;
			this.model.delete(ids, function() {
				self.list.remove(cells);
			});
		}
	},
	update: function() {
		this.showFormForDetails("update");
	},
	browse: function() {
		this.showFormForDetails("browse");
	},
	search: function() {
		this.list.hide();
		this.showForm("search");
		this.toolbar.refresh(["save", "cancel"]);
	},
	refresh: function() {
		var self = this;
		this.model.search(null, function(data) {
			self.list.clearAll();
			self.list.insert(data);
		});
	}
});
//当DOM加载完成时，通知控制器，初始化视图对象
$(function() {
	for(var i in DataMagic.Controller.instanceList) {
		DataMagic.Controller.instanceList[i].onDOMLoad();
	}
});

//================================================================
//抽象类，定义了UI部分应该有的一些功能的接口
//为了避免出现调用到null的情况，所以默认值是空函数
//尽量避免在非view部分调用跟UI框架相关的代码。比如直接调用jQuery对象的show、hide、append等
//================================================================

//抽象函数，用在抽象类中，防止调用到null导致的报错
Function.abstract = function() {
	console.warn("abstract function");
}

/* view类的抽象类
 * 
 * 属性
 * container UI对象对应的jQuery对象
 */
DataMagic.View.Abstract = Class.inherit("抽象视图", function(controller) {
	this.controller = controller;
}, null, {
	onDOMLoad: Function.abstract, //当页面的OM加载完成后进行的操作
	clearAll: Function.abstract, //清除所有内容
	append: Function.abstract, //将控件添加到当前控件上
	show: Function.abstract, //显示
	hide: Function.abstract //隐藏
});

/* 输入框的抽象类
 * 
 * 属性
 * input对应正常情况下的input元素
 * minInput/maxInput对应搜索模式下，数字类型及其子类用的，用来输入最小值和最大值的输入框
 */
DataMagic.Field.Abstract = DataMagic.View.Abstract.inherit("输入框的抽象类", function(dataType) {
	this.dataType = dataType;
}, null, {
	setValue: Function.abstract, //设置值
	getValue: Function.abstract, //获取值
	createField: function(name, meta, data) {}, //创建输入框
	//创建搜索框
	createSearchField: function(name, meta, data) {
		this.createField(name, meta, data);
	},
	showMistake: Function.abstract, //显示错误标记
	hideMistake: Function.abstract, //隐藏错误标记
	onInputClicked:function(input){}//输入框被点击
});
DataMagic.DataType.Base.prototype.inputField = DataMagic.Field.Abstract; //注册为Base类型数据的输入框

//================================================================
//视图部分
//只使用jQuery的情况下，实现对页面元素的操作逻辑，只有基本的样式
//================================================================

/*view类的基类*/
DataMagic.View.Base = DataMagic.View.Abstract.inherit("视图类的基类", null, null, {
	clearAll: function() {
		this.container.empty();
	},
	append: function(view) {
		if(!view.container) {
			console.warn(view);
		}
		this.container.append(view.container);
	},
	show: function() {
		this.container.show();
	},
	hide: function() {
		this.container.hide();
	}
});

/*工具栏类*/
DataMagic.View.Toolbar = DataMagic.View.Base.inherit("工具栏类", null, null, {
	executeEvent:"click",//当发生什么事件时，触发操作，在手机版上是"tap"，在电脑版上是"click"
	buttonPoor: {},
	onDOMLoad: function() {
		this.container = $(".DMToolbar");
		var self=this;
		this.container.find(".DMButton").each(function(index,element){
			var item=$(element);
			var command=item.data("command");
			self.buttonPoor[command]=item;
		}).remove();
	},
	refresh: function(buttons) {
		this.container.find(".DMButton").remove();
		for(var i in buttons) {
			var self = this;
			var command = buttons[i];
			var button=this.buttonPoor[command]||this.buildButton(command);
			button.appendTo(this.container);
			button[0].addEventListener(this.executeEvent, function() {
				self.controller.execute($(this).data("command"));
			});
		}
	},
	buildButton: function(command) {
		return $('<a class="DMButton" data-command="' + command + '"><span>' + command + '</span></a>');
	}
});

/* 列表类
 * 属性
 * alias 字段的别名，方便不同格式的数据使用相同的HTML模板用的
 */
DataMagic.View.List = DataMagic.View.Base.inherit("列表类", null, null, {
	onDOMLoad: function() {
		this.container = $(".DMList");
		this.item = this.container.find(".DMItem").detach();
		if(this.item.length === 0) {
			this.item = this.buildItem();
		}
		var self = this;
		this.item.click(function(ev) {
			$(this).toggleClass("selected");
		});
		this.item.dblclick(function(ev) {
			self.container.find(".selected").removeClass("selected");
			$(this).addClass("selected");
			self.controller.browse();
		});
	},
	buildItem:function(){
		return $('<li class="DMItem">'
			+'<div><span data-field="title"></span></div>'
			+'<div style="font-size: 14px;color: gray;font-family: kaiti;">'
			+'<span data-field="people"></span>'
			+'<span data-field="date"></span></div></li>');
	},
	clearAll: function() {
		this.container.find(".DMItem").remove();
	},
	getSelectedItems: function(multiple) {
		var items = this.container.find(".DMItem.selected");
		return multiple ? items : items.eq(0);
	},
	getIDWithItems: function(items) {
		var ids = [];
		for(var i = 0; i < items.length; i++) {
			var id = items.eq(i).data("id");
			ids.push(id);
		}
		return ids;
	},
	insert: function(data) {
		if(!(data instanceof Array)) {
			data = [data];
		}
		for(var i in data) {
			var dataItem = data[i];
			var cell = this.item.clone(true);
			this.update(cell, dataItem, this.controller.model.meta.fieldList);
			cell.data("id", dataItem.id);
			this.container.append(cell);
		}
	},
	update: function(cell, data, fieldMeta) {
		var self = this;
		cell.find("[data-field]").each(function() {
			var current = $(this);
			var field = current.data("field");

			//处理字段的别名
			if(self.alias && self.alias[field]) {
				field = self.alias[field];
			}

			if(data[field]) {
				if(fieldMeta[field]) {
					current.html(fieldMeta[field].dataType.tranToString(data[field]));
				} else {
					current.html(data[field]);
				}
			}
		});
	},
	remove: function(cells) {
		cells.remove();
	}
});

/*表格类*/
DataMagic.View.Table = DataMagic.View.List.inherit("表格类");

/*表单类*/
DataMagic.View.Form = DataMagic.View.Base.inherit("表单类", null, null, {
	onDOMLoad: function() {
		this.container = $(".DMForm");
		this.container.hide();
	}
});

/* 输入框的基类
 * 
 * 属性
 * input对应输入框
 */
DataMagic.Field.Base = DataMagic.Field.Abstract.inherit("输入框的基类", null, null, {
	buildField: function(name, meta, data) {
		return $('<div><label for="' + name + '">' + meta.title + '</label><input class="DMInput" type="text" id="' + name + '"/></div>');
	},
	createField: function(name, meta, data) {
		this.container = this.buildField(name,meta,data);
		this.input=this.container.find(".DMInput");
		this.setValue(this.input, data);
		var self = this;
		this.input.change(function(){
			this.dataType.validationValue(self.getValue(this.input),this.input);
		});
		this.input.click(function(){
			self.onInputClicked($(this));
		});
	},
	setValue: function(input, value) {
		if(value != null) {
			var str = this.dataType.tranToString(value);
			input.val(str);
		}
	},
	getValue: function(input) {
		var value = input.val();
		return value === "" || value === null ? null : value;
	},
	showMistake: function(input) {
		input.addClass("illegal");
	},
	hideMistake: function(input) {
		input.removeClass("illegal");
	}
});
DataMagic.DataType.Base.prototype.inputField = DataMagic.Field.Base;

/*长文本输入框*/
DataMagic.Field.LongText = DataMagic.Field.Base.inherit("长文本输入框", null, null, {
	buildField: function(name, meta, data) {
		return $('<div style="height: 120px;"><label for="' + name + '">' + meta.title + '</label><textarea id="' + name + '" class="DMInput" rows="5" placeholder="' + meta.title + '"></textarea></div>');
	}
});
DataMagic.DataType.LongText.prototype.inputField = DataMagic.Field.LongText;

/* 数字类型的输入框
 * 注意
 * 如果将input控件改成number类型的，而且用户输入了字符，就无法触发change事件，所以是个坑
 * 
 * 属性
 * input对应正常情况下的输入框
 * minInput/maxInput在搜索状态下，输入最小值和最大值的输入框（数字类型及其子类）
 */
DataMagic.Field.Number = DataMagic.Field.Base.inherit("数字类型的输入框", null, null, {
	buildSearchField:function(name, meta, data){
		return $('<div><label for="' + name + '">' + meta.title +
			'</label><input class="DMInput" type="text" id="' +name + '"/></div><div><label>' +
			'</label><input class="DMInput" type="text"/></div>');
	},
	createSearchField: function(name, meta, data) {
		this.container = this.buildSearchField(name, meta, data);
		this.inputs = this.container.find(".DMInput");
		this.minInput = this.inputs.eq(0);
		this.maxInput = this.inputs.eq(1);
		var self = this;
		this.inputs.change(function() {
			var jq = $(this);
			self.dataType.validationSearchParams(self.getValue(jq), jq);
		});
		this.inputs.click(function() {
			var jq = $(this);
			self.onInputClicked(jq);
		});
	}
});
DataMagic.DataType.Number.prototype.inputField = DataMagic.Field.Number;


//================================================================
//以下部分是方便测试用的函数
//================================================================
//用给定的数据填充表单
function fill() {
	var data = {
		"id": 1232,
		"duty_name": "ergre",
		"duty_content": "ergre",
		"duty_userid": 442124,
		"duty_username": "ergre",
		"inputuserid": 4241,
		"inputusername": "ergre",
		"duty_data": "2017年10月10日",
		"begin_time": "2017年10月10日",
		"end_time": "2017年10月10日",
		"visitor": 1,
		"visitor_name": "ergre",
		"file": 1,
		"file_name": "ergre"
	}
	for(var kn in data) {
		var node = $('[id=' + kn + ']');
		if(node.is("input")||node.is("textarea")){
			node.val(data[kn]);
		}
		else{
			node.text(data[kn]);
		}
	}
}