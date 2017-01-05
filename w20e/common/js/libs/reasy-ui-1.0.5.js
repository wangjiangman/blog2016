/*!
 * reasy-ui.js v1.0.5 2015-06-19
 * Copyright 2015 ET.W
 * Licensed under Apache License v2.0
 *
 * The REasy UI for router, and themes built on top of the HTML5 and CSS3..
 */

if ("undefined" === typeof jQuery && "undefined" === typeof REasy) {
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

$.extend({
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
	
	//获取视口宽度，不包含滚动条
	viewportWidth: function() {
		var de = doc.documentElement;
		
		return (de && de.clientWidth) || doc.body.clientWidth ||
				win.innerWidth;
	},
	
	//获取视口高度，不包含滚动条
	viewportHeight: function() {
		var de = doc.documentElement;
		
		return (de && de.clientHeight) || doc.body.clientHeight ||
				win.innerHeight;
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
 * REasy UI Inputs @VERSION
 * http://reasyui.com
 *
 * Copyright 2015 reasy Foundation and other contributors
 *
 * Depends:
 *	reasy-ui-core.js
 */

(function(win, doc) {"use strict";
	var supChangeType = "no",
		supportPlaceholder = ('placeholder' in doc.createElement("input"));


	function Input(element) {
		var that = this;

		this.$element = $(element);
		this.$placeholderText = null;//可能等于true（支持placeholder），或者jq元素
		this.$textInput = null;
		this.capTipCallback = null;

		element.val = function(value) {
			return that.setValue(value);
		}
	}

	Input.prototype.initPassword = function(placeholderText) {
		this.addPlaceholder(placeholderText);

		if ((this.$textInput && this.$textInput.length == 1) || this.$element[0].type !== "password") {
			return;
		}

		if (supChangeType === "no") {
			supChangeType = isSupportTypeChange(this.$element[0]);
		}

		// HANDLE: 可直接修改 ‘type’属性
		if (supChangeType) {
			this.$element.on("focus", function () {
				this.type = 'text';
			})
			.on("blur", function () {
				if (!$(this).hasClass("validatebox-invalid")) 
				this.type = 'password';
			});
			
		// HANDLE: 不支持‘type’属性修改，创建一个隐藏的文本框来实现
		} else {
			var inputObj = this;

			this.$textInput = $(createTextInput(this.$element[0]));
		
			//绑定事件，控制两个输入框的显示隐藏，数据同步
			this.$element.on("focus.re.input.password", function () {
				var thisVal = this.value;
				
				inputObj.setValue(thisVal);
				$(this).hide();
				inputObj.$textInput.show();
				setTimeout(function() {
					inputObj.$textInput.focus();
					$.setCursorPos(inputObj.$textInput[0], thisVal.length);	
				}, 50);
			});
			
			this.$textInput.on("blur.re.input.password", function () {
				var $this = $(this);
				
				inputObj.setValue($this.val());
				if (!$this.hasClass("validatebox-invalid")) {
					$this.hide();
					inputObj.$element.show();
				}
			}).on("keyup.re.input.password", function () {
				inputObj.setValue($(this).val());
			});
		}
	}

	Input.prototype.addPlaceholder = function(placeholderText) {
		var inputObj = this,
			text = this.$element.attr("placeholder");


		if (typeof placeholderText !== "undefined" && text !== placeholderText) {
			this.$element.attr("placeholder", placeholderText);
		} else {
			placeholderText = text;
		}
		placeholderText = $.trim(placeholderText);

		if (typeof placeholderText === "undefined") {
			return;
		} else if (placeholderText === "" && this.$placeholderText && this.$placeholderText.length === 1) {

			//之前创建了placeholder文本元素，现在设置成了空，既删除placeholder
			this.$placeholderText.remove();
			this.$placeholderText = null;
			this.$element.off("re.input.placeholder");//解绑事件
			return;
		} else if (!supportPlaceholder) {

			//不支持placeholder 为此元素创建一个隐藏的文本元素
			if (this.$placeholderText && this.$placeholderText.length === 1) {
				this.$placeholderText.remove();
			}
			this.$placeholderText = createPlaceholderElem(this.$element[0], placeholderText);
		} else {

			//支持placeholder
			this.$placeholderText = true;
		}
		
		this.$element.on("click.re.input.placeholder keyup.re.input.placeholder focus.re.input.placeholder blur.re.input.placeholder", function () {
			inputObj.setValue(this.value);
		});

		inputObj.setValue(this.$element.val());
	}

	Input.prototype.addCapTip = function(callback) {
		var inputObj = this;

		function hasCapital(value, pos) {
			var pattern = /[A-Z]/g,
				myPos = pos || value.length;
				
			return pattern.test(value.charAt(myPos - 1));
		}		

		if (!callback) {
			return;
		}

		if (!this.capTipCallback) {
			var $capTipElem = this.$element;
			if (this.$textInput && this.$textInput.length == 1) {
				$capTipElem = this.$textInput;
			}

			//add capital tip 
			$capTipElem.on("keyup", function (e) {
				var myKeyCode  =  e.keyCode || e.which,
					repeat,
					pos;
				
				// HANDLE: Not input letter
				if (myKeyCode < 65 || myKeyCode > 90) {
					return true;
				}
				
				pos = $.getCursorPos(this);
				
				if (hasCapital(this.value, pos)) {
					inputObj.capTipCallback(true);//输入的是大写字母
				} else {
					inputObj.capTipCallback(false);//输入的是小写字母
				}
			});	
		}
		this.capTipCallback = callback;
	}

	Input.prototype.setValue = function(value) {
		if (typeof value === "undefined") {
			return this.$element[0].value;
		}

		if (value !== this.$element[0].value)
		this.$element[0].value = value;
		
		//placeholder 赋值
		if (this.$placeholderText) {
			if (value === "") {
				$(this.$element).addClass("placeholder-text");
				if (this.$placeholderText.length == 1) {
					this.$placeholderText.removeClass("none");
				}
			} else {
				$(this.$element).removeClass("placeholder-text");
				if (this.$placeholderText.length == 1) {
					this.$placeholderText.addClass("none");
				}
			}
		}

		//password to text 赋值处理
		if (this.$textInput && this.$textInput.length == 1) {
			if (this.$textInput[0].value !== value)
			this.$textInput.val(value);
		}
	}

	//create placeholder text elem for those browsers doesn't support placeholder feature
	function createPlaceholderElem(elem, placeholderText) {
		var ret = doc.createElement('span');
		
		ret.className = "placeholder-content";
		ret.innerHTML = '<span class="placeholder-text" style="width:' + 
				(elem.offsetWidth || 255) + 'px;line-height:' + 
				(elem.offsetHeight || 28)+ 'px">' +
				(placeholderText || "") + '</span>';
		
		elem.parentNode.insertBefore(ret, elem);
		
		$(ret).on('click', function () {
			elem.focus();
		});
		
		return $(ret);
	}

	//create password text elem for those browsers doesn't support changing the type attribute
	function createTextInput(elem) {
		var $elem = $(elem),
			newField = doc.createElement('input'),
			$newField;
		
		newField.setAttribute("type", "text");
		newField.setAttribute("maxLength", elem.getAttribute("maxLength"));
		newField.setAttribute("id", elem.id + "_");
		newField.className = elem.className.replace("placeholder-text", "");
		newField.setAttribute("placeholder", elem.getAttribute("placeholder") || "");
		if (elem.getAttribute('data-options')) {
			newField.setAttribute("data-options", elem.getAttribute('data-options'));
		}
		
		if (elem.getAttribute('required')) {
			newField.setAttribute("required", elem.getAttribute('required'));
		}
		$(elem).after(newField, elem);
		$newField = $(newField).hide();
		
		return newField;
	}


	function isSupportTypeChange(passwordElem) {
		try {
			passwordElem.setAttribute("type", "text");
			if (passwordElem.type === 'text') {
				passwordElem.setAttribute("type", "password");
				return true;
			}
		} catch (d) {
			return false;
		}
	}

	function addPlugin(option) {
		$(this).each(function() {
			var $this = $(this),
				data = $this.data("re.input");

			if (!data) {
				data = $this.data("re.input", new Input(this));
			}
		});
	}

	/*
	* @插件 聚焦时可视的密码输入框
	* @param placeholderText placeholder文本，用以添加placeholder
	*/
	$.fn.initPassword = function(placeholderText) {
		addPlugin.call(this);
		return this.each(function() {
			$(this).data("re.input").initPassword(placeholderText);
		});
	}

	/*
	* @插件 placeholder兼容插件，保证所有浏览器正常显示placeholder
	* @param placeholderText placeholder文本，省略的话直接读取元素placeholder属性
	*/
	$.fn.addPlaceholder = function(placeholderText) {
		addPlugin.call(this);
		return this.each(function() {
			$(this).data("re.input").addPlaceholder(placeholderText);
		});
	}

	/*
	* @插件 initInput
	* 功能与initPassword一致，为了保留接口
	*/	
	$.fn.initInput = function(placeholderText) {
		addPlugin.call(this);
		return this.each(function() {
			$(this).data("re.input").initPassword(placeholderText);
		});		
	}

	/*
	* @插件 大写检查
	* @param {function} 回调，每次键盘点击时会调用，
	* 该回调接受一个参数，true代表大写，false：小写
	*/
	$.fn.addCapTip = function(callback) {
		addPlugin.call(this);
		return this.each(function() {
			$(this).data("re.input").addCapTip(callback);
		});
	}

	//页面加载后自动优化有placeholder的元素
	$(function() { 
		$("input[placeholder]").addPlaceholder(); 
		$("input:password[data-role=visiblepassword]").initPassword();
	});

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
            this.$txtWrap.css({"display": "none", "opacity": "0"});
        },
        
        show: function () {
            this.$mask.stop().fadeIn(200);
            this.$txtWrap.stop(true).show().animate({"top":"23%", "opacity": "1"},300);
        },
        
        hide: function () {
            var that = this;

            this.$mask.stop().fadeOut(200);
            this.$txtWrap.stop().animate({"top":"20%", "opacity": "0"},300, function() {
                that.$txtWrap.hide();
            });
        },
        
        remove: function () {
            this.$txtWrap.remove();
            this.$mask.remove();
        },
        
        text: function (msg) {
            this.$txtElem.html(msg);
        }
    }
    
    $.ajaxMessage = function (msg) {
        if (!ajaxMessageSington) {
            ajaxMessageSington = new AjaxMsg(msg);      
        }
        ajaxMessageSington.text(msg);
        ajaxMessageSington.show();
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
		dataOptions = this.$element[0].getAttribute("data-options");

		try {
			options = options || $.parseJSON(dataOptions);
		} catch (e) {
			//console.log(e);
			//console.log(dataOptions);
			options = null;
		}

	if (options) {
		this.checkOptions = [];
		//支持多条验证规则
		options = $.isArray(options)? options : (options? [options]: []);


		for (var i = 0; i < options.length ; i++) {
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
	

	//取得自动纠正类型
	this.correctType = getCorrectType(this.checkOptions);

	//监听元素事件触发验证程序
	this.$element.off(".re.checker").on("focus.re.checker blur.re.checker keyup.re.checker check.re.re.checker", function (e) {
		var eventType = e.checktype || (e ? e.type : null);
		that.check(eventType);
	});

	if (!this.hasBeenInit) {
		$('<span class="validate-elem-wrap"></span>').insertBefore(that.$element).append(that.$element);
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
		return true;
	}

	this.errorMsg = this._selfCheck(eventType);
	
	if (!this.errorMsg && eventType !== "focus" && eventType !== "keyup" && 
		triggerType !== "focus" && triggerType !== "keyup") {

		this.errorMsg = this._combineCheck();
	}


	setTimeout(function() {
		if (that.errorMsg) {
			that.addValidateTip(that.errorMsg, true);
		} else {
			that.removeValidateTip();
		}
	}, 30);
	return (this.errorMsg ? false : true);

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
	
	// 先纠正输入
	$.inputCorrect(this.$element, this.correctType);

	thisVal = this.$element.val();

	//如果元素拥有required属性且值为空，且验证不是聚焦和keyup触发的
	isEmpty = thisVal === "" || thisVal === null || thisVal === this.$element.attr('placeholder');
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
		errorMsg,
		notAllEmpty = false,
		focus = false;

	//遍历每一条联合验证规则
	for (var i = combineOptions.length - 1; i >= 0; i--) {
		focus = false;
		combineCheckFun = null;
		if (typeof combineOptions[i].type == "string") {
			combineCheckFun = $.combineValid[combineOptions[i].type];
		} else if (typeof combineOptions[i].type == "function"){
			combineCheckFun = combineOptions[i].type;
		}
		if (combineCheckFun) {
			var args = [];
			combineOptions[i].$elems.each(function() {
				if ($(this).is(":focus")) {
					focus = true;
					return false;
				}
				notAllEmpty = (notAllEmpty || $(this).val());
				args.push($(this).val());
			});
			args.push(combineOptions[i].msg);
			errorMsg = (notAllEmpty && !focus) ? combineCheckFun.apply($.combineValid, args) : "";
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

//添加tip，如果invalid真，则给验证元素添加警示类validatebox-invalid
Checker.prototype.addValidateTip = (function() {

	function closeContent($tipElem, invalid) {
		$tipElem.find(".validatebox-tip").addClass("none");
		if (invalid)
		$tipElem.find(".validatebox-error-icon").removeClass("none");
	}

	function showContent($tipElem) {
		$tipElem.find(".validatebox-tip").removeClass("none");
		$tipElem.find(".validatebox-error-icon").addClass("none");
	}


	return function(errorMsg, invalid) {
		var that = this;
		if (!that.$tipElem) {
			var tipElem = document.createElement('span'),
				span;
			
			tipElem.innerHTML = '<span class="validatebox-tip" title="点击隐藏提示">' +
		                '<span class="validatebox-tip-content">'+ errorMsg + '</span>'+
		                '<span class="validatebox-tip-pointer"></span>'+
		            '</span>'+
		         	'<span class="validatebox-error-icon none"></span>';
		    that.$tipElem = $(tipElem).addClass("validatebox-tip-wrap").hide();
			that.$tipElem.on("click", ".validatebox-error-icon", function() {showContent(that.$tipElem)});
			that.$tipElem.on("click", ".validatebox-tip-content", function() {closeContent(that.$tipElem, that.$element.hasClass("validatebox-invalid"))});

			that.$element.before(tipElem);
		}

		that.$tipElem.show().find(".validatebox-tip-content").html(errorMsg + '<span class="validatebox-tip-close">&times;</span>');
		//showContent(that.$tipElem);
		if (invalid)
		that.$element.addClass("validatebox-invalid");
	}

})();


Checker.prototype.removeValidateTip = function() {
	$(this.$tipElem).hide();
	this.$element.removeClass("validatebox-invalid");
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

	$combineElems.not(this.$element).on("blur keyup focus", function(e) {
		var eventType = (e ? e.type : null);

		setTimeout(function() {
			if (that.$element.val() != "")
			that.check("combineTrigger", eventType);
		}, 0);
	});
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

$.fn.addValidateTip = function(str) {
	return this.each(function() {
		if ($(this).data("re.checker")) {
			$(this).data("re.checker").addValidateTip(str);
		}		
	});
}

$.fn.removeValidateTip = function() {
	return this.each(function() {
		if ($(this).data("re.checker")) {
			$(this).data("re.checker").removeValidateTip();
		}		
	});
}

$.fn.check = function() {
	addPlugin.call(this);

	var checkPass = true;
	this.each(function() {
		if ($(this).data("re.checker")) {

			//只要有一个不通过就为false
			checkPass = checkPass && $(this).data("re.checker").check();
		}		
	});
	return checkPass;
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
	var checkPass = true;

	this.$elems.each(function() {
		if (!$(this).check()) {
			checkPass = false;
		}
	});

	if (checkPass) {
		var customResult;

		if (typeof this.options.custom === 'function') {
			customResult = this.options.custom();
		}
		
		if (!customResult) {
			if (typeof this.options.success === 'function') {
				this.options.success();
			}			
			return true;
		}
	}
	
	if (typeof this.options.error === 'function') {
		this.options.error(customResult);
	}
}

Validate.prototype.check = function($elem) {
	var checkPass = true,
		$checkElems = $($elem);

	if ($checkElems.length === 0) {
		$checkElems = this.$elems;
	}

	$checkElems.each(function() {
		//console.log($(this).check());
		if (!$(this).check()) {
			checkPass = false;
		}
	});

	if (checkPass) {
		var customResult;

		if (typeof this.options.custom === 'function') {
			customResult = this.options.custom();
			checkPass = customResult?true: false;
		}
	}

	return checkPass;
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
 * REasy UI Correct @VERSION
 * http://reasyui.com
 *
 * Copyright 2015 reasy Foundation and other contributors
 *
 * Depends:
 *	reasy-ui-core.js
 */

(function (window, document) {"use strict";
	var corrector = {
		ip: function(str) {
			var curVal = str,
				ipArr;
			curVal = curVal.replace(/([^\d\.]|\s)/g, "");

			ipArr = curVal.split(".");
			$.each(ipArr, function(i, ipPart) {
				ipArr[i] = (ipArr[i] == ""?"":parseInt(ipPart, 10));
			});
			return ipArr.join(".");
		},
		mac: function(str) {
			var curVal = str;
			curVal = curVal.replace(/([^\d\:a-fA-F]|\s)/g, "");
			return curVal;
		},
		num: function(str) {
			var curVal = str;
			curVal = curVal.replace(/([^\d]|\s)/g, "");
			return isNaN(parseInt(curVal, 10))?"":parseInt(curVal, 10) + "";
		},
		float: function(str) {
			var curVal = str;
			curVal = curVal.replace(/([^\d\.]|\s)/g, "");
			if (/\./.test(curVal)) {
				var split = curVal.split(".");
				curVal = split[0] + ".";
				split.shift();
				curVal += split.join("");
			}
			return curVal;
		}
	}
	corrector.ipSegment = corrector.ip;

	function correctTheElement(type) {
		if (!$(this).val() || !type || !corrector[type]) return;
    	var curVal = $(this).val() + "";
    	var newVal = corrector[type](curVal);
    	if (newVal != curVal) {
    		$(this).val(newVal);
    	}		
	}

	$.fn.inputCorrect=function(type){
        this.each(function(){
			if (!type || !corrector[type]) {
				return;
			}
            $(this).off(".re.correct").on("keyup.re.correct blur.re.correct correct.re", function() {
            	correctTheElement.call(this, type);
            });
        });
        return this;
    }

    $.inputCorrect = function($elem, type) {
    	correctTheElement.call($elem, type);
    }

    $.corrector = corrector;

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
			return _($.reasyui.MSG['String length range is: %s - %s character'], [min, max]);	
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

	domain: {
		all: function(str) {
			if (!/^[\d\.]+$/.test(str)) {
				if(/^([\w-]+\.)*(\w)+$/.test(str))
				return;
			} else {
				if (!$.valid.ip.all(str)) 
				return;
			}
			return  _($.reasyui.MSG["Please input a valid IP address or domain name"]);
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
				return _($.reasyui.MSG['MAC can not be 00:00:00:00:00:00']);
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
			if(!(/^([1-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){2}(0|128|192|224|240|252|254)$/).test(str)) {
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
		var dateAndTime = str.split(" ");
		var date = dateAndTime[0];
		var time = dateAndTime[1];
		var datePattern = /^((((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(10|12|0?[13578])([-\/\._])(3[01]|[12][0-9]|0?[1-9]))|(((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(11|0?[469])([-\/\._])(30|[12][0-9]|0?[1-9]))|(((1[8-9]\d{2})|([2-9]\d{3}))([-\/\._])(0?2)([-\/\._])(2[0-8]|1[0-9]|0?[1-9]))|(([2468][048]00)([-\/\._])(0?2)([-\/\._])(29))|(([3579][26]00)([-\/\._])(0?2)([-\/\._])(29))(([1][89][0][48])([-\/\._])(0?2)([-\/\._])(29))|(([2-9][0-9][0][48])([-\/\._])(0?2)([-\/\._])(29))|(([1][89][2468][048])([-\/\._])(0?2)([-\/\._])(29))|(([2-9][0-9][2468][048])([-\/\._])(0?2)([-\/\._])(29))|(([1][89][13579][26])([-\/\._])(0?2)([-\/\._])(29))|(([2-9][0-9][13579][26])([-\/\._])(0?2)([-\/\._])(29)))$/;
		var timePattern = /^(((0|1)\d)|(2[0-3]))(:([0-5]\d)){2}$/
		if (!(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/).test(str)) {
			return _($.reasyui.MSG["Time format error"]);
		} else if(!(datePattern.test(date)) || !(timePattern.test(time))) {
            return _($.reasyui.MSG["Please input a valid time"]);
        }

	},
	
	hex: function (str) {
		if(!(/^[0-9a-fA-F]{1,}$/).test(str)) {
			return _($.reasyui.MSG["Must be hex."]);		
		}
	},

	/**
     * 检测是否包含全角字符
     * @param  {[type]} str [待检测字符串]
     * @return {[type]}     [true：包含全角字符 false:不包含]
     */
    chkHalf: function(str) {
        for (var i = 0; i < str.length; i++) {
            var strCode = str.charCodeAt(i);
            if ((strCode > 65248) || (strCode == 12288)) {
                return _($.reasyui.MSG["Can't enter SBC case."]);;
                break;
            }
        }
    },
	
	ascii: function (str, min, max) {
		/*chkHalf*/
		for (var i = 0; i < str.length; i++) {
            var strCode = str.charCodeAt(i);
            if ((strCode > 65248) || (strCode == 12288)) {
                return _($.reasyui.MSG["Can't enter SBC case."]);
                break;
            }
        }

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
	
	username: function(str, min, max) {
		var totalLength = $.getUtf8Length(str);

		if (typeof min !== "undefined" && typeof max !== "undefined" && (totalLength < min || totalLength > max)) {	
			return _($.reasyui.MSG['String length range is: %s - %s byte'], [min, max]);	
		}
		
		if(!(/^[0-9a-zA-Z\u4e00-\u9fa5_]+$/).test(str))	{
			return _($.reasyui.MSG['Must be numbers, letters, underscore or Chinese character']);
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
	
	specialChar: function (str, banStr) {
		var len = banStr.length,
			curChar,
			i;
			
		for(i = 0; i < len; i++) {
			curChar = banStr.charAt(i);
			if(str.indexOf(curChar) !== -1) {
				return _($.reasyui.MSG["Can't input: %s"], [banStr.split("").join(" ")]);
			}
		}
	},

	remarkTxt: function(str, min, max) {
		var totalLength = str.length,
			ret;

		if (min && max) {
			ret = $.valid.len(str, min, max);
			if (ret) {
				return ret;
			}
		}
		
		if(!(/^[0-9a-zA-Z\u4e00-\u9fa5_\s]+$/).test(str))	{
			return _($.reasyui.MSG['Must be numbers, letters, underscore, space or Chinese character']);
		}
	},

	noBlank: function (str) {
		if(str.indexOf(" ") !== -1) {
			return _($.reasyui.MSG["Can't input blank."]);
		}
	},

	charTxt: function(str) {
		if(!(/^[0-9a-zA-Z]+$/).test(str))	{
			return _($.reasyui.MSG['Must be numbers or letters']);
		}
	}
};
// 中文翻译
$.extend($.reasyui.MSG, {
	"Must be number": "请输入数字",
	"Input range is: %s - %s": "输入范围：%s - %s",
	"this field is required": "本项不能为空",
	"String length range is: %s - %s byte": "长度范围：%s - %s 位字节",
	"String length range is: %s - %s character": "长度范围：%s - %s 个字符",
	"Please input a validity IP address": "请输入正确的 IP 地址",
	"Please input a validity subnet mask": "请输入正确的子网掩码",
	"Time format error": "时间格式为YYYY-MM-DD HH:MM:SS",
	"Please input a valid time": "请输入合法的时间",
	"Please input a validity E-mail address": "请输入合法的E-mail地址",
	"Please input a validity MAC address": "请输入正确的 MAC 地址，格式：XX:XX:XX:XX:XX:XX",
	"MAC can not be 00:00:00:00:00:00": "MAC 地址不能全为0",
	"Must be ASCII.": "请输入非中文字符",
	"Can't input: %s": "不能输入: %s",
	"Can't input blank.": "不能输入空格",
	"Must be numbers, letters or an underscore": "请输入数字，字母或下划线",
	"The second character must be even number.": "MAC 地址的第二个字符必须为偶数",
	"IP address can't be multicast, broadcast or loopback address.": "IP 地址不能为组播,广播或环回地址",
	"IP address first input don't be 127, becuse it is loopback address.": "以127开始的地址为保留的环回地址，请指定一个1到223之间的值。",
	"First input %s greater than 223.": "以%s开始的地址无效，请指定一个1到223之间的值。",
	"First input %s less than 223.": "以 %s 开始的地址无效，请指定一个223到255之间的值。",
	"Invalid Url": "无效的网址格式",
	"please enter a valid IP segment": "请输入正确的IP网段",
	"Can't enter SBC case.": "不能输入全角字符",
	"Please input a valid IP address or domain name": "请输入有效的域名或IP地址",
	"Must be numbers, letters, underscore, space or Chinese character": "请输入数字、字母、下划线、空格或中文",
	"Must be numbers, letters, underscore or Chinese character": "请输入数字、字母、下划线或中文",
	"Must be numbers or letters": "输入数字或字母"
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

		for (var k = 0; k < 4; k++) { // ip & 255 - mask
			if ((ipArry[k] & maskArry2[k]) == 0) {
				netIndex += 0;
			} else {
				netIndex += 1;
			}
		}

		if (netIndex == 0) {
			return;
		} else {
			return _($.reasyui.MSG["please enter a valid IP segment"]);
		}
	}	
};

$.extend($.reasyui.MSG, {
	"Static IP cannot be the same as default gateway.": "静态IP不能和默认网关一样",
	"Static IP and default gateway be in the same net segment": "静态IP和默认网关必须在同一网段",
	"please enter a valid IP segment": "请输入有效的IP网段"
});
})(window, document);