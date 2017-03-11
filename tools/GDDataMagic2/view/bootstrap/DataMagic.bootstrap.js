////================================================================
////DataMagic-MUI
////以下部分是UI方面的代码，负责显示，可以根据UI框架的不同替换
////================================================================
//DataMagic.initViewWithMeta=function(meta){
//	$(".mui-title").html(meta.describe);
//}
//DataMagic.dialog=function(mess){
//	mui.toast(mess);
//}
//DataMagic.alert=function(mess){
//	mui.alert(mess);
//}
////当发送ajax请求时，显示一个进度条
//$(document).ajaxSend(function(event,xhr,options){
//	var progressbar=mui('body').progressbar();
//	if(progressbar.show){
//		progressbar.show();
//	}
//	else{
//		$(function(){
//			mui('body').progressbar().show();
//		});
//	}
//});
//$(document).ajaxStop(function(){
//	mui('body').progressbar().hide();
//});
//
//
///*view类的基类*/
//DataMagic.View.Base=DataMagic.View.Abstract.inherit("视图类的基类",null,null,{
//	clearAll:function(){
//		this.container.empty();
//	},
//	append:function(view){
//		if(!view.container){
//			console.warn(view);
//		}
//		this.container.append(view.container);
//	},
//	show:function(){
//		this.container.show();
//	},
//	hide:function(){
//		this.container.hide();
//	}
//});
//
//
///*工具栏类*/
//DataMagic.View.Toolbar=DataMagic.View.Base.inherit("工具栏类",null,null,{
//	onDOMLoad:function(){
//		this.container=$(".DMToolbar");
//	},
//	refresh:function(buttons){
//		this.container.find(".DMButton").remove();
//		for (var i in buttons) {
//			var self=this;
//			var butt=this.getButton(buttons[i]).appendTo(this.container);
//			butt[0].addEventListener("tap",function(){
//				self.controller.execute($(this).data("command"));
//			});
//		}
//	},
//	getButton:function(command){
//		if(this.buttonPoor[command]==null){
//			this.buttonPoor[command]='<a class="mui-tab-item DMButton" data-command="'+command+'"><span class="mui-icon mui-icon-plus"></span><span class="mui-tab-label">'+command.translate()+'</span></a>';
//		}
//		return $(this.buttonPoor[command]);
//	},
//	buttonPoor:{
//		"browse":'<a class="mui-tab-item DMButton" data-command="browse"><span class="mui-icon mui-icon-more-filled"></span><span class="mui-tab-label">浏览</span></a>',
//		"insert":'<a class="mui-tab-item DMButton" data-command="insert"><span class="mui-icon mui-icon-plus"></span><span class="mui-tab-label">新建</span></a>',
//		"delete":'<a class="mui-tab-item DMButton" data-command="delete"><span class="mui-icon mui-icon-trash"></span><span class="mui-tab-label">删除</span></a>',
//		"update":'<a class="mui-tab-item DMButton" data-command="update"><span class="mui-icon mui-icon-compose"></span><span class="mui-tab-label">修改</span></a>',
//		"search":'<a class="mui-tab-item DMButton" data-command="search"><span class="mui-icon mui-icon-search"></span><span class="mui-tab-label">查找</span></a>',
//		"save":'<a class="mui-tab-item DMButton" data-command="save"><span class="mui-icon mui-icon-search"></span><span class="mui-tab-label">确认</span></a>',
//		"cancel":'<a class="mui-tab-item DMButton" data-command="cancel"><span class="mui-icon mui-icon-search"></span><span class="mui-tab-label">取消</span></a>',
//		"refresh":'<a class="mui-tab-item DMButton" data-command="refresh"><span class="mui-icon mui-icon-refresh"></span><span class="mui-tab-label">刷新</span></a>'
//	}
//});
//
//
///* 列表类
// * 属性
// * alias 字段的别名，方便不同格式的数据使用相同的HTML模板用的
// */
//DataMagic.View.List=DataMagic.View.Base.inherit("列表类",null,null,{
//	onDOMLoad:function(){
//		this.container=$(".DMList");
//		this.item=this.container.find(".DMItem").detach();
//		if(this.item.length===0){
//			this.item=this.initItem(this,dm.meta.fieldList);
//		}
//		var self=this;
//		this.item.click(function(ev){
//			$(this).toggleClass("selected");
//		});
//		this.item.dblclick(function(ev){
//	//		self.onCellDblclick.call(this,ev);
//		});
//	},
//	clearAll:function(){
//		this.container.find(".DMItem").remove();
//	},
//	getSelectedItems:function(multiple){
//		var items=this.container.find(".DMItem.selected");
//		return multiple?items:items.eq(0);
//	},
//	getIDWithItems:function(items){
//		var ids=[];
//		for(var i=0;i<items.length;i++){
//			var id=items.eq(i).data("id");
//			ids.push(id);
//		}
//		return ids;
//	},
//	insert:function(data){
//		if(!(data instanceof Array)){
//			data=[data];
//		}
//		for(var i in data){
//			var dataItem=data[i];
//			var cell=this.item.clone(true);
//			this.update(cell,dataItem,this.controller.model.meta.fieldList);
//			cell.data("id",dataItem.id);
//			this.container.append(cell);
//		}
//	},
//	update:function(cell,data,fieldMeta){
//		var self=this;
//		cell.find("[data-field]").each(function(){
//			var current=$(this);
//			var field=current.data("field");
//			
//			//处理字段的别名
//			if(self.alias&&self.alias[field]){
//				field=self.alias[field];
//			}
//			
//			if(data[field]){
//				if(fieldMeta[field]){
//					current.html(fieldMeta[field].dataType.tranToString(data[field]));
//				}
//				else{
//					current.html(data[field]);
//				}
//			}
//		});
//	},
//	remove:function(cells){
//		cells.remove();
//	}
//});
//
//
///*表格类*/
//DataMagic.View.Table=DataMagic.View.List.inherit("表格类");
//
//
///*表单类*/
//DataMagic.View.Form=DataMagic.View.Base.inherit("表单类",null,null,{
//	onDOMLoad:function(){
//		this.container=$(".DMForm");
//		this.container.hide();
//	}
//});
//
//
///* 输入框的基类
// * 
// * 属性
// * input对应输入框
// */
//DataMagic.Field.Base=DataMagic.Field.Abstract.inherit("输入框的基类",null,null,{
//	createField:function(name,meta,data){
//		this.container=$('<div class="mui-input-row"><label for="'+name+'">'+meta.title+'</label></div>');
//		this.input=$('<input class="mui-input-clear" type="text" id="'+name+'"/>').appendTo(this.container);
//		this.setValue(this.input,data);
//		var self=this;
//		this.input.change(function(){
//			self.dataType.validationValue(self.getValue(self.input),self.input);
//		});
//	},
//	setValue:function(input,value){
//		if(value!=null){
//			var str=this.dataType.tranToString(value);
//			input.val(str);
//		}
//	},
//	getValue:function(input){
//		var value=input.val();
//		return value===""||value===null?null:value;
//	},
//	showMistake:function(input){
//		input.addClass("illegal");
//	},
//	hideMistake:function(input){
//		input.removeClass("illegal");
//	}
//});
//DataMagic.DataType.Base.prototype.inputField=DataMagic.Field.Base;
//
//
///*长文本输入框*/
//DataMagic.Field.LongText=DataMagic.Field.Base.inherit("长文本输入框",null,null,{
//	createField:function(name,meta,data){
//		this.container=$('<div class="mui-input-row" style="height: 120px;"><label for="'+name+'">'+meta.title+'</label></div>');
//		this.input=$('<textarea id="'+name+'" rows="5" placeholder="'+meta.title+'"></textarea>').appendTo(this.container);
//		this.setValue(this.input,data);
//		var self=this;
//		this.input.change(function(){
//			self.dataType.validationValue(self.getValue(self.input),self.input);
//		});
//	}
//});
//DataMagic.DataType.LongText.prototype.inputField=DataMagic.Field.LongText;
//
//
///* 数字类型的输入框
// * 注意
// * 如果将input控件改成number类型的，而且用户输入了字符，就无法触发change事件，所以是个坑
// * 
// * 属性
// * input对应正常情况下的输入框
// * minInput/maxInput在搜索状态下，输入最小值和最大值的输入框（数字类型及其子类）
// */
//DataMagic.Field.Number=DataMagic.Field.Base.inherit("数字类型的输入框",null,null,{
//	createSearchField:function(name,meta,data){
//		this.container=$('<div class="mui-input-row"><label for="'+name+'">'+meta.title
//			+'</label><input class="mui-input-clear" type="text" id="'
//			+name+'"/></div><div class="mui-input-row"><label>'
//			+'</label><input class="mui-input-clear" type="text"/></div>');
//		this.inputs=this.container.find("input");
//		this.minInput=this.inputs.eq(0);
//		this.maxInput=this.inputs.eq(1);
//		var self=this;
//		this.inputs.change(function(){
//			var jq=$(this);
//			self.dataType.validationSearchParams(self.getValue(jq),jq);
//		});
//	}
//});
//DataMagic.DataType.Number.prototype.inputField=DataMagic.Field.Number;
//
//
///*日期类型输入框*/
//DataMagic.Field.Date=DataMagic.Field.Number.inherit("日期类型输入框",null,null,{
//	createField:function(name,meta,data){
//		this.container=$('<div class="mui-input-row"><label for="'+name+'">'+meta.title+'</label></div>');
//		this.input=$('<label id="'+name+'" class="picker-input"></label>').appendTo(this.container);
//		this.setValue(this.input,data);
//		var self=this;
//		this.container.click(function(){
//			self.onclick(self.input);
//		});
//	},
//	createSearchField:function(name,meta,data){
//		this.container=$('<div class="mui-input-row"><label for="'+name+'">'+meta.title
//			+'</label><label class="picker-input" id="'
//			+name+'"></label></div><div class="mui-input-row" data-show="search"><label>'
//			+'</label><label class="picker-input"></label></div>');
//		this.inputs=this.container.find("label.picker-input");
//		this.minInput=this.inputs.eq(0);
//		this.maxInput=this.inputs.eq(1);
//		var self=this;
//		this.inputs.click(function(){
//			self.onclick($(this));
//		});
//	},
//	//输入框被点击，弹出picker
//	onclick:function(input){
//		var option={"type":"date"};
//		var value=input.text();
//		if(value){
//			var nums=value.split(/年|月|日/);
//			option["value"]=nums[0]+"-"+(nums[1].length==1?"0":"")+nums[1]+"-"+(nums[2].length==1?"0":"")+nums[2];
//		}
//		var picker=new mui.DtPicker(option);
//		picker.show(function(rs) {
//			input.text(rs.y.text+"年"+rs.m.text.replace(/^0/,"")+"月"+rs.d.text.replace(/^0/,"")+"日");
//			picker.dispose();
//		});
//	},
//	setValue:function(input,value){
//		if(value!=null){
//			var str=this.dataType.tranToString(value);
//			input.text(str);
//		}
//	},
//	getValue:function(input){
//		var value=input.text();
//		return value===""||value===null?null:value;
//	}
//});
//DataMagic.DataType.Date.prototype.inputField=DataMagic.Field.Date;
//
//
///*时间日期类型输入框*/
//DataMagic.Field.DateTime=DataMagic.Field.Date.inherit("时间日期类型输入框",null,null,{
//	onclick:function(input){
//		var option={};
//		var value=input.text();
//		if(value){
//			var nums=value.split(/(?:年|月|日  |时|分)/);
//			option["value"]=nums[0]+"-"+(nums[1].length==1?"0":"")+nums[1]+"-"+(nums[2].length==1?"0":"")+nums[2]+" "+(nums[3].length==1?"0":"")+nums[3]+":"+(nums[4].length==1?"0":"")+nums[4];
//			option["value"].replace("/ $/","");
//		}
//		var picker=new mui.DtPicker(option);
//		picker.show(function(rs) {
//			input.text(rs.y.text+"年"+rs.m.text.replace(/^0/,"")+"月"+rs.d.text.replace(/^0/,"")+"日  "+rs.h.text.replace(/^0/,"")+"时"+rs.i.text.replace(/^0/,"")+"分");
//			picker.dispose();
//		});
//	}
//});
//DataMagic.DataType.DateTime.prototype.inputField=DataMagic.Field.DateTime;
//
//
///* 单选类型的输入框
// * 
// * 属性
// * picker 从底部弹出的选择器
// * options选项
// */
//DataMagic.Field.Select=DataMagic.Field.Date.inherit("单选类型的输入框",function(dataType){
//	this.dataType=dataType;
//	this.picker=this.createPicker();
//	this.options=this.dataType.options;
//},null,{
//	createPicker:function(){
//		var picker=$("#popover-select");
//		if(picker.length===0){
//			picker=$('<div id="popover-select" class="mui-popover mui-popover-action mui-popover-bottom">'+
//				'<ul class="mui-table-view" id="select-options"></ul>'+
//				'<ul class="mui-table-view">'+
//					'<li class="mui-table-view-cell"><a id="confirm"><b>确认</b></a></li>'+
//					'<li class="mui-table-view-cell"><a id="cancel"><b>取消</b></a></li>'+
//				'</ul></div>');
//			$("body").append(picker);
//		}
//		return picker;
//	},
//	onclick:function(){
//		var html='';
//		for(var kn in this.options){
//			var kv=this.options[kn];
//			html+='<li class="mui-table-view-cell" data-value="'+kn+'">'+kv+'</li>';
//		}
//		var self=this;
//		this.items=this.picker.find("#select-options").html(html).children("li");
//		this.items.click(function(){
//			self.onselect($(this));
//		});
//		this.picker.find("#confirm").click(function(){
//			self.onconfirm();
//		});
//		this.picker.find("#cancel").click(function(){
//			self.oncancel();
//		});
//		mui("#popover-select").popover("show");
//	},
//	//当picker中的选项被点击时
//	onselect:function(item){
//		this.input.text(item.text());
//		mui("#popover-select").popover("hide");
//	},
//	onconfirm:function(){
//		mui("#popover-select").popover("hide");
//	},
//	oncancel:function(){
//		mui("#popover-select").popover("hide");
//	},
//	createSearchField:function(name,meta,data){
//		this.options=$.extend({},this.dataType.options);
//		this.options[-1]=this.dataType.any;
//		this.createField(name,meta,data);
//	}
//});
//DataMagic.DataType.Select.prototype.inputField=DataMagic.Field.Select;
//
//
///*多选类型的输入框*/
//DataMagic.Field.Multiple=DataMagic.Field.Select.inherit("多选类型的输入框",null,null,{
//	//多选跟单选的区别是，选中后不会立即关闭picker，直到用户点击确认
//	onselect:function(item){
//		item.toggleClass("selected");
//	},
//	onconfirm:function(){
//		var items=this.picker.find(".selected");
//		var values=[];
//		for (var i=0;i<items.length;i++) {
//			values.push(items.eq(i).text());
//		}
//		this.input.text(values.join(","));
//		mui("#popover-select").popover("hide");
//	}
//});
//DataMagic.DataType.Multiple.prototype.inputField=DataMagic.Field.Multiple;
//
