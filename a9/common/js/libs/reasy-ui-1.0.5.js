/*!
 * reasy-ui.js v1.0.5 2015-07-20
 * Copyright 2015 ET.W
 * Licensed under Apache License v2.0
 *
 * The REasy UI for router, and themes built on top of the HTML5 and CSS3..
 */

if ("undefined" === typeof jQuery && "undefined" === typeof REasy && "undefined" === typeof $) {
	throw new Error("REasy-UI requires jQuery or REasy");
}

(function (win, doc) {
"use strict";

var rnative = /^[^{]+\{\s*\[native code/,
	_ = window._;

// ReasyUI 全局变量对象
$.reasyui = {};

// 记录已加载的 REasy模块
$.reasyui.mod = 'core ';

// ReasyUI 多语言翻译对象
$.reasyui.b28n = {};

// ReasyUI MSG
$.reasyui.MSG = {};

// 全局翻译函数
if (!_) {
	window._ = _ = function (str, replacements) {
		var ret = $.reasyui.b28n[str] || str,
			len = replacements && replacements.length,
			count = 0,
			index;

		if (len > 0) {
			while((index = ret.indexOf('%s')) !== -1) { 
				ret = ret.substring(0,index) + replacements[count] +
						ret.substring(index + 2, ret.length);
				count = ((count + 1) === len) ? count : (count+1);
			}
		}
		
		return ret;
	}
}

// HANDLE: When $ is jQuery extend include function 
if (!$.include) {
	$.include = function(obj) {
		$.extend($.fn, obj);
	};
}

$.extend($, {
	keyCode: {
		ALT: 18,
		BACKSPACE: 8,
		CAPS_LOCK: 20,
		COMMA: 188,
		COMMAND: 91,
		COMMAND_LEFT: 91, // COMMAND
		COMMAND_RIGHT: 93,
		CONTROL: 17,
		DELETE: 46,
		DOWN: 40,
		END: 35,
		ENTER: 13,
		ESCAPE: 27,
		HOME: 36,
		INSERT: 45,
		LEFT: 37,
		MENU: 93, // COMMAND_RIGHT
		NUMPAD_ADD: 107,
		NUMPAD_DECIMAL: 110,
		NUMPAD_DIVIDE: 111,
		NUMPAD_ENTER: 108,
		NUMPAD_MULTIPLY: 106,
		NUMPAD_SUBTRACT: 109,
		PAGE_DOWN: 34,
		PAGE_UP: 33,
		PERIOD: 190,
		RIGHT: 39,
		SHIFT: 16,
		SPACE: 32,
		TAB: 9,
		UP: 38,
		WINDOWS: 91 // COMMAND
	},
	
	//获取输入框中光标位置，ctrl为你要获取的输入框
	getCursorPos: function (ctrl) {
		var Sel,
			CaretPos = 0;
		//IE Support
		if (doc.selection) {
			ctrl.focus();
			Sel = doc.selection.createRange();
			Sel.moveStart ('character', -ctrl.value.length);
			CaretPos = Sel.text.length; 
		} else if (ctrl.selectionStart || parseInt(ctrl.selectionStart, 10) === 0){
			CaretPos = ctrl.selectionStart;
		}
		return CaretPos; 
	},
	
	//设置文本框中光标位置，ctrl为你要设置的输入框，pos为位置
	setCursorPos: function (ctrl, pos){
		var range;
		
		if(ctrl.setSelectionRange){
			ctrl.focus();
			ctrl.setSelectionRange(pos,pos);
		} else if (ctrl.createTextRange) {
			range = ctrl.createTextRange();
			range.collapse(true);
			range.moveEnd('character', pos);
			range.moveStart('character', pos);
			range.select();
		}
		
		return ctrl;
	},
	
	getUtf8Length: function (str) {
		var totalLength = 0,
			charCode,
			len = str.length,
			i;
			
		for (i = 0; i < len; i++) {
			charCode = str.charCodeAt(i);
			if (charCode < 0x007f) {
				totalLength++;
			} else if ((0x0080 <= charCode) && (charCode <= 0x07ff)) {
				totalLength += 2;
			} else if ((0x0800 <= charCode) && (charCode <= 0xffff)) {
				totalLength += 3;
			} else {
				totalLength += 4;
			}
		}
		return totalLength;
	},
	
	/**
	 * For feature detection
	 * @param {Function} fn The function to test for native support
	 */
	isNative: function (fn) {
		return rnative.test(String(fn));
	},
	
	isHidden: function (elem) {
		if (!elem) {
			return;
		}
		
		return $.css(elem, "display") === "none" ||
			$.css(elem, "visibility") === "hidden" ||
			(elem.offsetHeight == 0 && elem.offsetWidth == 0);
	},
	
	getValue: function (elem) {
		if (typeof elem.value !== "undefined") {
			return elem.value;
		} else if ($.isFunction(elem.val)) {
			return elem.val();
		}
	}
});

/* Cookie */
$.cookie = {
	get: function (name) {
		var cookieName = encodeURIComponent(name) + "=",
			cookieStart = doc.cookie.indexOf(cookieName),
			cookieEnd = doc.cookie.indexOf(';', cookieStart),
			cookieValue =  null;
			 
		if (cookieStart > -1) {
			if (cookieEnd === -1) {
				cookieEnd = doc.cookie.length;
			}
			cookieValue = decodeURIComponent(doc.cookie.substring(cookieStart +
					cookieName.length, cookieEnd));
		}
		return cookieValue;
	},
	set: function (name, value, path, domain, expires, secure) {
		var cookieText = encodeURIComponent(name) + "=" +
				encodeURIComponent(value);
				
		if (expires instanceof Date) {
			cookieText += "; expires =" + expires.toGMTString();
		}
		if (path) {
			cookieText += "; path =" + path;
		}
		if (domain) {
			cookieText += "; domain =" + domain;
		}
		if (secure) {
			cookieText += "; secure =" + secure;
		}
		doc.cookie = cookieText;

	},
	unset:function (name, path, domain, secure) {
		this.set(name, '', path, domain, new Date(0), secure);
	}
};


/* 
* rewrite the method "val" of jquery  
* it works once the elem has own method "val"--this.val
* or data("valFuns")
*/
$.prototype.val = function (base) {
  return function () {
	var valArguments = arguments,
		returnVal;
　　
	//调用基类方法
	returnVal = base.apply(this, valArguments); 

	$(this).each(function() {
		var value = null;
		if (typeof(this.val) == "function") {
			value = this.val.apply(this, valArguments);
			if (!returnVal && typeof value !== "undefined") {
				returnVal = value;
			}
		}

		//可以通过$(elem).data("valFuns", [fun1, fun2...])添加自定义取值赋值
		if ($.isArray($(this).data("valFuns"))) {
			$.each($(this).data("valFuns"), function(i, valFun) {

				value = valFun.apply(this, valArguments);
				if (!returnVal && typeof value !== "undefined") {
					returnVal = value;
				}
			});
		}
	});

	return returnVal;
  }
}($.prototype.val);

$.fn.addValFun = function(valFun) {
	return this.each(function() {
		if (typeof valFun !== "function") {
			return;
		}

		var valFuns;

		valFuns = $(this).data("valFuns") || [];
		valFuns.push(valFun);
		$(this).data("valFuns", valFuns);
	});
}

$.fn.disable = function(disabled) {
	return this.each(function() {
		if (typeof this.disable === "function") {
			this.disable(disabled);
		}
	});
}


}(window, document));
var click = typeof window.ontouchstart === "undefined"? "click": "tap";

/*!
 * REasy UI animate @VERSION
 * http://reasyui.com
 *
 * Copyright 2015 reasy Foundation and other contributors
 *
 * Depends:
 *	reasy-ui-core.js
 */

(function (window, document) {"use strict";

function getTransitionEndEventName() {
    var testElem = document.createElement('div'),
	    transEndEventNames = {
			WebkitTransition : 'webkitTransitionEnd',
			MozTransition    : 'transitionend',
			OTransition      : 'oTransitionEnd otransitionend',
			transition       : 'transitionend'
	    };

    for (var name in transEndEventNames) {
      if (testElem.style[name] !== undefined) {
        return  transEndEventNames[name];
      }
    }

    return false;
}

var transitionend = getTransitionEndEventName();

$.fn.animateShow = function(durTime) {

	return this.each(function() {
		var $this = $(this);

		if ($this.data("ani-status") == "show") {
			return;
		}

		$this.data("ani-status", "show");
		var $this = $(this);
		if (transitionend) {
			$this.addClass("ani-init").show();
			setTimeout(function() {$this.addClass("ani-final");}, 10);
		} else {
			$this.show();
		}
	});
}

$.fn.animateHide = function(durTime) {

	var durTime = (durTime || 300);
	return this.each(function() {
		var $this = $(this);
		if ($this.css("display") === "none") {
			return;
		}

		$this.data("ani-status", "hide");
		if (transitionend) {
			$this.addClass("ani-init ani-final");
			$this.removeClass("ani-final");
			$this.one(transitionend, function() { 
				if ($this.data("ani-status") == "hide")
				$this.hide();
			});
			setTimeout(function() {
				if ($this.data("ani-status") == "hide")
				$this.hide();
			}, durTime);
		} else {
			$this.hide();
		}
	});
}

})(window, document);

/*!
 * REasy UI alert @VERSION
 * http://reasyui.com
 *
 * Copyright 2015 reasy Foundation and other contributors
 *
 * Depends:
 *	reasy-ui-core.js
 */

(function (window, document) {"use strict";

/* masktip and alert plugin zzc*/
var wrongWrapEle = null,
	wrongTipEle = null,
	allowHide = false;

$.alert = function(tipTxt, showTime) { 
	var tipTxt = tipTxt + "",
		showTime = showTime || (1200 + tipTxt.length * 40);
	if(wrongTipEle == null) {
		wrongWrapEle = document.createElement("div"),
		wrongTipEle = document.createElement("div"),
		wrongWrapEle.className = "wrong-wrap";
		wrongTipEle.className = "wrong-tip";
		$(wrongWrapEle).append(wrongTipEle).hide();
		document.body.appendChild(wrongWrapEle);	    		
	}
	if ($.trim(tipTxt) == "") {
		return;
	}
    wrongTipEle.innerHTML = tipTxt;
    $(wrongWrapEle).animateShow();

    setTimeout(function() {
        $(wrongWrapEle).animateHide();
    }, showTime);
}

})(window, document);

/*!
 * REasy UI progressbar @VERSION
 * http://reasyui.com
 *
 * Copyright 2015 reasy Foundation and other contributors
 *
 * Depends:
 *	reasy-ui-core.js
 */

(function (window, document) {"use strict";

var progressBarSington = null,
	overlayMaskHTML = '<div class="overlay"></div>',
	progressBoxHTML = '<div class="loading-wrap">' +
							'<span class="loading-percent"></span>' + 
							'<div class="loading-bar-wrap">' + 
								'<div class="loading-bar"></div>' +
							'</div>' +
							'<p class="loading-des"></p>' +
						'</div>';

function ProgressBar() {
	this.handRunTime = 500;//手动设置用500毫秒跳到指定百分比
	this.runT = 0;//自动跑
	this.percent = 0;
	this.tasks = [];
	this.task = null;

	this.$mask = null;
	this.$msg = null;
	this.$percent = null;
	this.$bar = null;
}

ProgressBar.prototype.create = function() {
	var $progressBox = $(progressBoxHTML).appendTo($("body"));

	if (!$(".overlay").length > 0) {
		this.$mask = $(".overlay");
	} else {
		this.$mask = $(overlayMaskHTML).appendTo($("body"));;
	}

	this.$msg = $progressBox.find(".loading-des");
	this.$percent = $progressBox.find(".loading-percent");
	this.$bar = $progressBox.find(".loading-bar");
}

ProgressBar.prototype.run = function(task) {
	if (this.task) {
		this.tasks.push(task);
	} else {
		if (!this.$msg) {
			this.create();
		}
		this.percent = 0;
		this.task = task;
		this.autoRun();
	}
	return this;
}

//根据设置的任务时间自动跑进度条
ProgressBar.prototype.autoRun = function() {
	if (!this.task || !this.task.time) return;

	var basicSpeed = 100/(this.task.time/30),
		speed = 0,
		that = this;

	this.setMessage(this.task.msg);
	clearInterval(this.runT);
	this.percent = parseInt(this.percent);
	this.runT = setInterval(function() {
		if (that.percent < 30) {
			speed = basicSpeed * 0.6;
		} else if (that.percent < 70) {
			speed = basicSpeed;
		} else {
			speed = basicSpeed/0.6;
		}
		that.percent += basicSpeed;
		that.setPercent(that.percent);
	}, 30);
}

//设置提示信息
ProgressBar.prototype.setMessage = function(msg) {
	this.$msg.html(msg);
}


//通过外部API调用设置百分比，用于不确定的，需根据实时情况设置进度的时候。
ProgressBar.prototype.handSetPercent = function(percent, msg, callback) {
	if (!this.task) return;

	var speed = (percent - this.percent)/(this.handRunTime/30),
		great = (percent > this.percent),
		that = this;

	this.setMessage(msg);
	clearInterval(this.runT);
	this.percent = parseInt(this.percent);
	this.runT = setInterval(function() {
		that.percent += speed;
		if ((great && percent < that.percent) || (!great && percent > that.percent)) {
			if (typeof callback === "function") {
				callback();
			}
			clearInterval(that.runT);
			that.percent = percent;
			that.autoRun();
		}
		that.setPercent(that.percent);
	}, 30);
}


//设置百分比, 当百分比到达 100时会触发下一个进度条任务（如果还有）
ProgressBar.prototype.setPercent = function(percent) {
	var that = this;

	this.percent = percent;
	if (this.percent >= 100) {
		this.percent = 100;
		clearInterval(this.runT);

		if (typeof this.task.callback === "function") {
			this.task.callback();
		}

		this.task = null;

		if (this.tasks.length > 0) {
			this.run(this.tasks.shift());
		} else {
			setTimeout(function() {that.distroy();}, 2000);
		}
	}
	this.$percent.html(parseInt(this.percent) + "%");
	this.$bar.css({"width": this.percent + "%"});
}

ProgressBar.prototype.distroy = function() {
	$(".overlay").remove();
	$(".loading-wrap").remove();
	this.$msg = null;
	this.$mask = null;
	this.$percent = null;
	this.$bar = null;
	this.task = null;
	this.tasks = [];
	this.percent = 0;
	clearInterval(this.runT);
}

$.progressBar = function() {
	if (!progressBarSington) {
		var progressBar = new ProgressBar();

		progressBarSington = {};
		progressBarSington.run = function(time, msg, callback) {
			progressBar.run({"time": time, "msg": msg, "callback": callback});
			return progressBarSington;
		}
		progressBarSington.set = function(percent, msg, callback) {
			progressBar.handSetPercent(percent, msg, callback);
			return progressBarSington;
		}
		progressBarSington.distroy = function() {
			progressBar.distroy();
			return progressBarSington;
		}
		progressBarSington.getTaskNum = function() {
			return progressBar.tasks.length;
		}
	}
	return progressBarSington;
}

})(window, document);

/*!
 * REasy UI Message @VERSION
 * http://reasyui.com
 *
 * Copyright 2015 reasy Foundation and other contributors
 *
 * Depends:
 *	reasy-ui-core.js
 */
 
(function (doc) { "use strict";
    var ajaxMessageSington = null;

    function AjaxMsg(msg) {
        this.$mask = null;
        this.$elem = null;
        this.init(msg);
    }
    
    AjaxMsg.prototype = {
        constructor: AjaxMsg,
        
        init: function (msg) {

            this.$mask = $('<div class="overlay-white"></div>').hide().appendTo($("body"));
            this.$txtWrap = $('<div class="message-ajax"><div id="ajax-message" class="message-ajax-txt"></div></div>').hide().appendTo($("body"));
            this.$txtElem = this.$txtWrap.find("#ajax-message");

            this.$mask.css({"display": "none"});
            this.$txtWrap.css({"display": "none"});
        },
        
        show: function (durTime) {
        	var that = this;
            this.$mask.animateShow();
            this.$txtWrap.animateShow();
            if (durTime) {
            	setTimeout(function() {that.hide();}, durTime);
            }
        },
        
        hide: function () {
            var that = this;

            this.$mask.animateHide();
            this.$txtWrap.animateHide();
        },
        
        remove: function () {
            this.$txtWrap.remove();
            this.$mask.remove();
        },
        
        text: function (msg) {
            this.$txtElem.html(msg);
        }
    }
    
    $.ajaxMessage = function (msg, durTime) {
        if (!ajaxMessageSington) {
            ajaxMessageSington = new AjaxMsg(msg);      
        }
        ajaxMessageSington.text((msg||""));
        ajaxMessageSington.show(durTime);
        return ajaxMessageSington;
    }
})(document);

/*!
 * REasy UI Validate @VERSION
 * http://reasyui.com
 *
 * Copyright 2015 reasy Foundation and other contributors
 *
 * Depends:
 *	reasy-ui-core.js
 */

(function (window, document) {"use strict";

function Checker(element) {
	this.hasBeenInit = false;
	this.$element = $(element);
	this.checkOptions = [];
	this.$tipElem = null;
	this.combineOptions = [];
	this.correctType = "";//自动纠正类型
	this.errorMsg = "";

	this.init();

}

//初始验证功能，事件绑定
Checker.prototype.init = function(options) {
	var that = this,
		dataOptions = this.$element[0].getAttribute("data-options"),
		htmlOptions = (dataOptions? $.parseJSON(dataOptions) : null);
		options = options || htmlOptions;

	if (options) {
		this.checkOptions = [];
		//支持多条验证规则
		options = $.isArray(options)? options : (options? [options]: []);


		for (var i = 0; i < options.length; i++) {
			if(!options[i] || typeof options[i] !== 'object') {
				continue
			}
			if (options[i].type) {

				//普通验证规则
				this.checkOptions.push(options[i]);
			} else if (options[i].combineType) {
				//联合验证规则
				this.addCombine(options[i].combineType, $(options[i].relativeElems), options[i].msg);
				//console.log(this.combineOptions)
			}
		};
	} else if (this.hasBeenInit) {
		return;
	}

	this.hasBeenInit = true;
}

/* 
* 普通验证，非关联元素发起
* @ eventType == combineTrigger 的话代表是其关联元素值改变时触发的验证
* @ triggerType 关联元素值改变触发类型，为blur的时候，才提示关联错误系信息，其他时候移除关联错误系信息
*/
Checker.prototype.check = function(eventType, triggerType) {
	var that = this;

	//如果元素不可见，直接通过验证。
	if (this.$element.is(":hidden")) {
		return;
	}

	this.errorMsg = this._selfCheck(eventType);
	
	if (!this.errorMsg && eventType !== "focus" && eventType !== "keyup" && 
		triggerType !== "focus" && triggerType !== "keyup") {

		this.errorMsg = this._combineCheck();
	}
	if (this.errorMsg) {
		this.errorMsg = (this.$element.data("name") || "") + "：" + this.errorMsg
	}
	return this.errorMsg;
}

//自身验证
Checker.prototype._selfCheck = function(eventType) {
	var datas = this.checkOptions, //支持多条验证规则
		thisVal = "",
		valid = $.valid,
		errorMsg = "", //错误信息
		isEmpty,
		args,
		validType;

	thisVal = this.$element.val();

	//如果元素拥有required属性且值为空，且验证不是聚焦和keyup触发的
	isEmpty = thisVal === "" || thisVal === this.$element.attr('placeholder');
	if ((this.$element.attr('required') === 'required' || this.$element[0].required) && isEmpty) {
		if (eventType !== 'keyup'  && eventType !== 'focus') {
			errorMsg = _($.reasyui.MSG["this field is required"]);
		}
		
	} else if (!isEmpty) {

		//对data-options的每一条规则验证，出错就提示
		for (var i = 0; i < datas.length; i++) {
			var data = datas[i];

			args = [thisVal+""].concat(data.args || []);
			validType = valid[data.type];

			// 如果validType为函数，说明错误都很明确
			if (typeof validType === "function") {
				errorMsg = validType.apply(valid, args);
			
			// 错误类型需要分类处理
			} else {
			
				//如果是keyup或focus事件
				if (eventType === 'keyup' || eventType === 'focus') {
				
					// 只验证明确的错误，提示修改方案
					if (validType && typeof validType.specific === 'function') {
						errorMsg = validType.specific.apply(validType, args);
					}
				
				//其他类型事件
				} else {
				
					// 完整性验证，不明确的错误，无法给出修改方案
					if (validType && typeof validType.all === 'function') {
						errorMsg = validType.all.apply(validType, args);
					}
				}
			}	

			//出错，直接报此错误，跳出
			if (errorMsg) {
				errorMsg = (data.msg || errorMsg);
				break;
			}				
		};
	}

	return errorMsg;
}

//联合验证
Checker.prototype._combineCheck = function() {
	var combineOptions = this.combineOptions,
		combineData,
		combineCheckFun,
		errorMsg;

	//遍历每一条联合验证规则
	for (var i = combineOptions.length - 1; i >= 0; i--) {
		combineCheckFun = null;
		if (typeof combineOptions[i].type == "string") {
			combineCheckFun = $.combineValid[combineOptions[i].type];
		} else if (typeof combineOptions[i].type == "function"){
			combineCheckFun = combineOptions[i].type;
		}
		if (combineCheckFun) {
			var args = [];
			combineOptions[i].$elems.each(function() {
				args.push($(this).val());
			});
			args.push(combineOptions[i].msg);
			errorMsg = combineCheckFun.apply($.combineValid, args);
			if (errorMsg) {
				return errorMsg;
			}
		}
	};
}

//解除其验证功能
Checker.prototype.fireCheck = function() {
	this.checkOptions = [];
	this.correctType="";
	this.check();
}


//增加联合验证，第二个参数可是是已有的联合验证类型，或自定义的回调
Checker.prototype.addCombine = function(combineTypeOrCallback, combineElems, str) {
	var that = this,
		$combineElems = $(combineElems[0]);

	for (var i = 0; i < combineElems.length; i++) {
		if (combineElems[i] == "self") {
			$combineElems = $combineElems.add(this.$element);
		} else {
			$combineElems = $combineElems.add($(combineElems[i]));
		}
	}

	this.combineOptions.push({$elems: $combineElems, type: combineTypeOrCallback, msg: str});
}

Checker.prototype.getValue = function() {
	return this.$element.val();
}

//取得自动纠错的类型，首取correctType，没有的话取type
function getCorrectType(options) {
	var type = "";

	$.each(options, function(i, data) {
		if (data.correctType) {
			type = data.correctType;
			return false;
		}
		if ($.corrector[data.type]) {
			type = data.type;
		}
	});
	return type;
}

function addPlugin() {
	$(this).each(function() {
		var $this = $(this),
			data = $this.data("re.checker");

		if (!data) {
			data = $this.data("re.checker", new Checker(this));
		}
	});
}

//手动加入验证，否则只会在validate包含此元素的时候加入验证
//options 缺省的话使用自身属性data-options
$.fn.addCheck = function(options) {
	addPlugin.call(this);
	return this.each(function() {
		$(this).data("re.checker").init(options);
	});
}

$.fn.check = function() {
	addPlugin.call(this);

	var errorStr;
	this.each(function() {
		if ($(this).data("re.checker")) {

			//只要有一个不通过就为false
			errorStr = $(this).data("re.checker").check();
			if (errorStr) {
				return false;
			}
		}		
	});
	return errorStr;
}

$.fn.addCombine = function(options) {
	addPlugin.call(this);

	return this.each(function() {
		if ($(this).data("re.checker")) {
			$(this).data("re.checker").addCombine(options.combineType, options.relativeElems, options.msg);
		}		
	});
}


//解除验证
$.fn.fireCheck = function() {
	if ($(this).data("re.checker")) {
		$(this).data("re.checker").fireCheck();
	}
}

$(function() {
	$(".validatebox").addCheck();
});

})(window, document);

/*!
 * REasy UI Validate @VERSION
 * http://reasyui.com
 *
 * Copyright 2015 reasy Foundation and other contributors
 *
 * Depends:
 *	reasy-ui-core.js
 */

(function (window, document) {"use strict";
var defaults = {
	wrapElem: $('body'),
	custom: null,
	success: function () {},
	error: function () {}
};

function Validate(options) {
	
	this.options = $.extend({}, defaults, options);
	this.$elems = $(this.options.wrapElem).find(".validatebox");
	this.init();
}

Validate.prototype.init = function() {
	this.$elems.addCheck();
}

Validate.prototype.checkAll = function() {
	var errorMsg = true;

	errorMsg = this.$elems.check();
	if (!errorMsg) {
		var customResult;

		if (typeof this.options.custom === 'function') {
			errorMsg = this.options.custom();
		}
		
		if (!errorMsg) {
			if (typeof this.options.success === 'function') {
				this.options.success();
			}			
			return true;
		}
	}
	
	if (typeof this.options.error === 'function') {
		this.options.error(errorMsg);
	}
}

Validate.prototype.check = function($elem) {
	var errorMsg,
		$checkElems = $($elem);

	if ($checkElems.length === 0) {
		$checkElems = this.$elems;
	}

	errorMsg = $checkElems.check();

	if (!errorMsg) {
		var customResult;

		if (typeof this.options.custom === 'function') {
			errorMsg = this.options.custom();
		}
	}

	return errorMsg;
}

Validate.prototype.addElems = function(elems) {
	this.$elems = this.$elems.add($(elems));
}

Validate.prototype.removeElems = function(elems) {
	this.$elems = this.$elems.not($(elems));
}

Validate.prototype.fireValidate = function() {}




/******** 数据验证 *******/
$.validate = function(options) {
	return new Validate(options);
};

$.validate.valid = $.valid;
})(window, document);

/*!
 * REasy UI valid-lib @VERSION
 * http://reasyui.com
 *
 * Copyright 2015 reasy Foundation and other contributors
 *
 * Depends:
 *	reasy-ui-core.js
 */

(function (window, document) {"use strict";

//$.validate.utils = utils;
$.valid = {
	len: function (str, min, max) {
		var len = str.length;
		
		if (typeof min !== "undefined" && typeof max !== "undefined" && (len < min || len > max)) {	
			return _($.reasyui.MSG['String length range is: %s - %s bit'], [min, max]);	
		}
	},

	byteLen: function (str, min, max) {
		var totalLength = $.getUtf8Length(str);

		if (typeof min !== "undefined" && typeof max !== "undefined" && (totalLength < min || totalLength > max)) {	
			return _($.reasyui.MSG['String length range is: %s - %s byte'], [min, max]);	
		}
	},	

	num: function (str, min, max) {
		
		if(!(/^[0-9]{1,}$/).test(str)) {
			return _($.reasyui.MSG["Must be number"]);		
		}
		if (typeof min != "undefined" && typeof max != "undefined") {
			if(parseInt(str, 10) < min || parseInt(str, 10) > max) {
			
				return _($.reasyui.MSG["Input range is: %s - %s"], [min, max]);
			}
		}
	},

	float: function (str, min, max) {
		var floatNum = parseFloat(str, 10);

		if(isNaN(floatNum)) {
			return _($.reasyui.MSG["Must be float"]);		
		}
		if (typeof min != "undefined" && typeof max != "undefined") {
			if(floatNum < min || floatNum > max) {
			
				return _($.reasyui.MSG["Input range is: %s - %s"], [min, max]);
			}
		}
	},
	url: function(str) {
		if (/^[-_~\|\#\?&\\\/\.%0-9a-z\u4e00-\u9fa5]+$/ig.test(str)) {
            if (/.+\..+/ig.test(str) || str == "localhost") {

            } else {
                return _($.reasyui.MSG['Invalid Url']);
            }
        } else {
            return _($.reasyui.MSG['Invalid Url']);
        }
	},
	mac: {
		all: function (str) {
			var ret = this.specific(str);
			
			if (ret) {
				return ret;
			}
			
			if(!(/^([0-9a-fA-F]{2}:){5}[0-9a-fA-F]{2}$/).test(str)) {
				return _($.reasyui.MSG["Please input a validity MAC address"]);
			}
		},
		
		specific: function (str) {
			var subMac1 = str.split(':')[0];
			
			if (subMac1.charAt(1) && parseInt(subMac1.charAt(1), 16) % 2 !== 0) {
				return _($.reasyui.MSG['The second character must be even number.']);
			}
			if (str === "00:00:00:00:00:00") {
				return _($.reasyui.MSG['Mac can not be 00:00:00:00:00:00']);
			}
		}
	},
	
	ip: {
		all: function (str) {
			var ret = this.specific(str);
			
			if (ret) {
				return ret;
			}
			
			if(!(/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-4])$/).test(str)) {
				return _($.reasyui.MSG["Please input a validity IP address"]);
			}
		},
		
		specific: function (str) {
			var ipArr = str.split('.'),
				ipHead = ipArr[0];
			
			if(ipArr[0] === '127') {
				return _($.reasyui.MSG["IP address first input don't be 127, becuse it is loopback address."]);
			}
			if (ipArr[0] > 223) {
				return _($.reasyui.MSG["First input %s greater than 223."], [ipHead]);
			}
		}
	},

	ipSegment: {
		all: function(str) {
			if(!(/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}0$/).test(str)) {
				return _($.reasyui.MSG["please enter a valid IP segment"]);
			}
		}
	},
	
	dns: function () {},
	
	mask: function (str) {
		var rel = /^(254|252|248|240|224|192|128)\.0\.0\.0$|^(255\.(254|252|248|240|224|192|128|0)\.0\.0)$|^(255\.255\.(254|252|248|240|224|192|128|0)\.0)$|^(255\.255\.255\.(254|252|248|240|224|192|128|0))$/;
		if(!rel.test(str)) {
			return _($.reasyui.MSG["Please input a validity subnet mask"]);
		}
	},
	
	email: function (str) {
		var rel = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/ ;
		if(!rel.test(str)) {
			return _($.reasyui.MSG["Please input a validity E-mail address"]);	
		}
		
	},
	
	time: function(str) {
		if(!(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/).test(str)) {
			return _($.reasyui.MSG["Please input a valid time."]);	
		}
	},
	
	hex: function (str) {
		if(!(/^[0-9a-fA-F]{1,}$/).test(str)) {
			return _($.reasyui.MSG["Must be hex."]);		
		}
	},
	
	ascii: function (str, min, max) {
		if(!(/^[ -~]+$/g).test(str)) {
			return _($.reasyui.MSG["Must be ASCII."]);		 
		}
		if(min || max) {
			return $.valid.len(str, min, max);
		}
	},
		
	pwd: function (str, minLen, maxLen) {
		var ret;
		
		if(!(/^[0-9a-zA-Z_]+$/).test(str))	{
			return _($.reasyui.MSG['Must be numbers, letters or an underscore']);
		}

		if (minLen && maxLen) {
			ret = $.valid.len(str, minLen, maxLen);
			if (ret) {
				return ret;
			}
		}
	},
	
	username: function(str) {
		if(!(/^\w{1,}$/).test(str))	{
			return _($.reasyui.MSG["Please input a validity username."]);
		}
	},
	
	ssidPasword: function (str, minLen, maxLen) {
		var ret;
		ret = $.valid.ascii(str);
		if (!ret && minLen && maxLen) {
			ret = $.valid.len(str, minLen, maxLen);
			if (ret) {
				return ret;
			}
		}
		
		return ret;
	},
	
	remarkTxt: function (str, banStr) {
		var len = banStr.length,
			curChar,
			i;
			
		for(i = 0; i < len; i++) {
			curChar = banStr.charAt(i);
			if(str.indexOf(curChar) !== -1) {
				return _($.reasyui.MSG["Can't input: '%s'"], [curChar]);
			}
		}
	}
};
// 中文翻译
$.extend($.reasyui.MSG, {
	"Must be number": "请输入数字",
	"Input range is: %s - %s": "输入范围：%s - %s",
	"%s is required": "%s不能为空",
	"this field is required": "本项不能为空",
	"String length range is: %s - %s bit": "长度范围：%s - %s 位",
	"String length range is: %s - %s byte": "长度范围：%s - %s 位字节",
	"Please input a validity IP address": "请输入正确的 IP 地址",
	"Please input a validity subnet mask": "请输入正确的子网掩码",
	"Please input a validity MAC address": "请输入正确的 MAC 地址",
	"Mac can not be 00:00:00:00:00:00": "Mac 地址不能全为0",
	"Must be ASCII.": "请输入非中文字符",
	"Can't input: '%s'": "不能输入: ‘%s’",
	"Must be numbers, letters or an underscore": "请输入数字，字母或下划线",
	"The second character must be even number.": "MAC 地址的第二个字符必须为偶数",
	"IP address can't be multicast, broadcast or loopback address.": "IP 地址不能为组播,广播或环回地址",
	"IP address first input don't be 127, becuse it is loopback address.": "以127开始的地址为保留的环回地址，请指定一个1到223之间的值。",
	"First input %s greater than 223.": "以%s开始的地址无效，请指定一个1到223之间的值。",
	"First input %s less than 223.": "以 %s 开始的地址无效，请指定一个223到255之间的值。",
	"Invalid Url": "无效的网址格式",
	"please enter a valid IP segment": "请输入正确的IP网段"
});

})(window, document);

/*!
 * REasy UI combine-lib @VERSION
 * http://reasyui.com
 *
 * Copyright 2015 reasy Foundation and other contributors
 *
 * Depends:
 *	reasy-ui-core.js
 */

(function (window, document) {"use strict";

function isSameNet(ip_lan, ip_wan, mask_lan, mask_wan) {
	var ip1Arr = ip_lan.split("."),
		ip2Arr = ip_wan.split("."),
		maskArr1 = mask_lan.split("."),
		maskArr2 = mask_wan.split("."),
		i;

	for (i = 0; i < 4; i++) {
		if ((ip1Arr[i] & maskArr1[i]) != (ip2Arr[i] & maskArr2[i])) {
			return false;
		}
	}
	return true;
}

$.combineValid = {
	//必须一样
	equal: function (str1, str2, msg) {
		if (str1 != str2) {
			return msg;
		}
	},

	//不能一样
	notequal: function (str1, str2, msg) {
		if (str1 == str2) {
			return msg;
		}
	},

	//ip mask gateway 组合验证
	static: function(ip, mask, gateway, msg) {
		if (ip == gateway) {
			return _($.reasyui.MSG["Static IP cannot be the same as default gateway."]);
		}

		if (!isSameNet(ip, gateway, mask, mask)) {
			return _($.reasyui.MSG["Static IP and default gateway be in the same net segment"]);
		}
	},

	ipSegment: function (ipElem, maskElem) {
		var ip,
			mask,
			ipArry,
			maskArry,
			len,
			maskArry2 = [],
			netIndex = 0,
			netIndex1 = 0,
			broadIndex = 0,
			i = 0;


		ip = ipElem;
		mask = maskElem;

		ipArry = ip.split(".");
		maskArry = mask.split(".");
		len = ipArry.length;

		for (i = 0; i < len; i++) {
			maskArry2[i] = 255 - Number(maskArry[i]);
		}

		for (var k = 0; k < 4; k++) { // ip & mask
			if ((ipArry[k] & maskArry[k]) == 0) {
				netIndex1 += 0;
			} else {
				netIndex1 += 1;
			}
		}
		for (var k = 0; k < 4; k++) { // ip & 255 - mask
			if ((ipArry[k] & maskArry2[k]) == 0) {
				netIndex += 0;
			} else {
				netIndex += 1;
			}
		}

		if (netIndex == 0 || netIndex1 == 0) {
			return;
		} else {
			return _($.reasyui.MSG["please enter a valid IP segment"]);
		}
	}	
};

$.extend($.reasyui.MSG, {
	"Static IP cannot be the same as default gateway.": "静态IP不能和默认网关一样",
	"Static IP and default gateway be in the same net segment": "静态IP和默认网关必须在同一网段",
	"please enter a valid IP segment": "请输入正确的IP网段"
});
})(window, document);


