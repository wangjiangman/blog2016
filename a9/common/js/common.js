/**
 * extend class
 */
var initializing = false,
    fnTest = /xyz/.test(function () {
        xyz;
    }) ? /\b_super\b/ : /.*/;
var Class = function () {};
Class.extend = function (prop) {
    var _super = this.prototype;
    initializing = true;
    var prototype = new this();
    initializing = false;
    for (var name in prop) {
        prototype[name] = typeof prop[name] == "function" &&
            typeof _super[name] == "function" && fnTest.test(prop[name]) ?
            (function (name, fn) {
            return function () {
                var tmp = this._super;
                this._super = _super[name];
                var ret = fn.apply(this, arguments);
                this._super = tmp;
                return ret;
            };
        })(name, prop[name]) :
            prop[name];
    }

    function Class() {
        if (!initializing && this.init)
            this.init.apply(this, arguments);
    }
    Class.prototype = prototype;
    Class.prototype.constructor = Class;
    Class.extend = arguments.callee;
    return Class;
};


/**
 * 获取数据包装
 */

/**
 * [GetSetData description]
 * @type {Object}
 */

if (window.JSON) {
    $.parseJSON = JSON.parse;
}

$.GetSetData = {
    getData: function (url, handler) {
        if (url.indexOf("?") < 0) {
            url += "?" + Math.random();
        }
        $.ajax({
            url: url,
            cache: false,
            type: "post",
            dataType: "text",
            async: true,
            success: function (data, status) {
                if (data.indexOf("login.js") > 0) {
                    window.location.href = "login.html";
                    return;
                }

                if (typeof handler == "function") {
                    handler.apply(this, arguments);
                }
            },
            error: function (msg, status) {
                Debug.log("get Data failed,msg is ", msg);
                if (typeof handler == "function") {
                    handler.apply(this, arguments);
                }
            },
            complete: function (xhr) {
                xhr = null;
            }
        });

    },
    getDataSync: function (url, handler) {
        if (url.indexOf("?") < 0) {
            url += "?" + Math.random();
        }
        $.ajax({
            url: url,
            cache: false,
            type: "post",
            dataType: "text",
            async: false,
            success: function (data, status) {
                if (data.indexOf("login.js") > 0) {
                    window.location.href = "login.html";
                    return;
                }

                if (typeof handler == "function") {
                    handler.apply(this, arguments);
                }
            },
            error: function (msg, status) {
                Debug.log("get Data failed,msg is ", msg);
                if (typeof handler == "function") {
                    handler.apply(this, arguments);
                }
            },
            complete: function (xhr) {
                xhr = null;
            }
        });
    },
    getJson: function (url, handler) {
        this.getData(url, function (data) {
            handler($.parseJSON(data));
        });
    },
    getHtml: function (elems, url, handler) {
        this.getData(url, function (data, status) {
            if (status == "success") {
                elems.html(data);
            }
            handler(status);
            data = null;
            elems = null;
        });
    },
    setData: function (url, data, handler) {
        $.ajax({
            url: url,
            cache: false,
            type: "post",
            dataType: "text",
            async: true,
            data: data,
            success: function (data) {
                if (data.indexOf("login.js") > 0) {
                    window.location.href = "login.html";
                    return;
                }
                if ((typeof handler).toString() == "function") {
                    handler(data);
                }
            }
        });
    }
};



/**
 * jquery 数据操作拓展
 */

$.isEqual = function (a, b) {
    for (var prop in a) {
        if ((!b.hasOwnProperty(prop) && a[prop] !== "") || a[prop] !== b[prop]) {
            return false;
        }
    }
    return true;
};

$.extend($.fn, {
    getVal: function () {
        if ($(this).length == 1) {
            if (this.tagName == "input" || $(this).attr("data-val")) {
                return $(this).val();
            } else {
                return $(this).text();
            }
        } else {
            return $(this).filter(function () {
                return this.checked && this.value;
            }).map(function () {
                return this.value;
            }).get();
        }
    },
    setVal: function (value) {
        if ($(this).length < 0 || value === undefined) {
            return;
        }
        var tagName = $(this)[0].tagName.toLowerCase(),
            type = $(this).attr("type");
        if (tagName == "input") {
            switch (type) {
            case "checkbox":
                if ($(this).attr('group-index')) {
                    if ($(this).attr('group-index') !== '0') break;

                    var groups = $('[name=' + this[0].name + ']'),
                        valueArr;
                    if (!value || !value.toString().length) {
                        valueArr = [];
                        valueArr.length = groups.length;
                    } else {
                        valueArr = value.toString().split('');
                        if (valueArr.length < groups.length) break;
                    }

                    for (var i = 0, l = groups.length; i < l; i++) {
                        if (valueArr[i] === '1') {
                            groups[i].checked = true;
                        } else {
                            groups[i].checked = false;
                        }
                    }
                } else if (value == $(this).val() || value == "enabled" || value == "启用" || value == "1" || value == "true") {
                    $(this).attr("checked", true);
                } else {
                    $(this).attr("checked", false);
                }
                break;
            case "radio":
                $(this).val([value]);
                break;
            default:
                $(this).val(value);
            }
        } else if (tagName == "select") {
            if ($(this).find("option[value='" + value + "']").length < 1) {
                //支持手动填写的元素赋值,需要包含writeable属性
                var writeAbleOption;
                if ((writeAbleOption = $(this).find("option[writeable]")).length > 0) {
                    writeAbleOption.val(value);
                    $(this).val(value);
                } else {
                    $(this).val([value]);
                }

            } else {
                $(this).val([value]);
            }
        } else if ($(this).attr("data-val")) {
            $(this).val(value);
        } else {
            $(this).text(value);
        }
    },
    collect: function () {
        return this.filter(function () {
                var type = this.type;
                // Use .is(":disabled") so that fieldset[disabled] works
                return this.name && !$(this).is(":disabled") &&
                    ($(this).attr("type") != "radio" || $(this).attr("type") == "radio" && this.checked);
            })
            .map(function (i, elem) {
                var val = $(this).val() || $(this).text();
                if ($(this).attr("type") == "checkbox") {
                    if (!$(this).attr('group-index')) {
                        val = this.checked.toString();
                    } else {
                        if ($(this).attr('group-index') === '0') {
                            val = $('input[name=' + this.name + ']').map(function () {
                                return this.checked ? 1 : 0;
                            }).get().join('');
                        } else {
                            val = null;
                        }
                    }
                }
                return val === null ?
                    null :
                    $.isArray(val) ?
                    $.map(val, function (val) {
                        return {
                            name: elem.name || $(elem).attr('data-bind'),
                            value: val
                        };
                    }) : {
                        name: elem.name || $(elem).attr('data-bind') || $(elem).attr('name'),
                        value: val
                    };
            }).get();
    },
    serializeJson: function () {
        var serializeObj = {},
            array = this.collect();

        $(array).each(function () {
            if (serializeObj[this.name]) {
                if ($.isArray(serializeObj[this.name])) {
                    serializeObj[this.name].push(this.value);
                } else {
                    serializeObj[this.name] = [serializeObj[this.name], this.value];
                }
            } else {
                serializeObj[this.name] = this.value;
            }
        });
        return serializeObj;
    },
    getFormData: function () {
        return $.param(this.collect());
    }
});



/*
 * animate Event Extend
 */
(function () {
    'use strict';

    function getTransitionEndName() {
        var el = document.createElement('div');

        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        };

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return transEndEventNames[name];
            }
        }

        return false;
    }

    $.transitionEndEvent = getTransitionEndName() || "unSupportTransitionEnd";

    $.fn.triggerTransitionEnd = function (duration) {
        if ($.transitionEndEvent.indexOf("unSupportTransitionEnd") != "-1") {
            $(this).trigger($.transitionEndEvent);
            return;
        }

        var called = false,
            $el = this;

        $(this).one($.transitionEndEvent, function () {
            called = true;
        });

        setTimeout(function () {
            if (!called) $($el).trigger($.transitionEndEvent);
        }, duration);

        return this;
    };
})();


//针对要加浏览器前缀的css属性
$.fn.css3 = function () {
    var cssObj = {};
    if (arguments.length >= 2 && typeof arguments[0] == "string") {
        cssObj[arguments[0]] = arguments[1];
    } else if (typeof arguments[0] == "object") {
        cssObj = arguments[0];
    }

    var newCssObj = {};
    for (var cssName in cssObj) {
        newCssObj[cssName] = cssObj[cssName];
        if (/transform|transition/.test(cssName)) {
            newCssObj["-webkit-" + cssName] = cssObj[cssName];
            newCssObj["-moz-" + cssName] = cssObj[cssName];
            newCssObj["-o-" + cssName] = cssObj[cssName];
        }
    }
    return this.css(newCssObj);
};


/*** 页面切换对象，负责页面之间的切换 切换效果在effects里面定义、扩展***/
var PageChanger = function ($firstPage) {
    this.$firstPage = $($firstPage);
    this.$currentPage = $($firstPage);
    this.$nextPage = null;
    this.duration = 0.5;
};

PageChanger.prototype.goTo = function ($page, effect, duration) {
    $page = $($page);

    //说明上次切换还未完成
    if (this.$nextPage || $page[0] == this.$currentPage[0]) return;

    effect = effect || "right";
    duration = duration || this.duration;
    this.$nextPage = $page;

    PageChanger.effects[effect](this.$currentPage, this.$nextPage);
    this.$currentPage.addClass("animating").css3({
        "transition": "all " + duration + "s"
    });
    this.$nextPage.addClass("animating").css3({
        "transition": "all " + duration + "s"
    }).removeClass("none");

    var that = this;
    setTimeout(function () {
        that.$currentPage.removeClass("animating").addClass("none");
        that.$currentPage = $page;
        that.$nextPage = null;
    }, duration * 1000);

};

PageChanger.prototype.goToInitialPage = function () {
    this.goTo(this.$firstPage, "left");
};

PageChanger.effects = {
    "left": function ($page1, $page2) {
        $page2.css3({
            "transform": "translate(-100%)"
        });
        setTimeout(function () {
            $page1.css3({
                "transform": "translate(100%)"
            });
            $page2.css3({
                "transform": "none"
            });
        }, 100);
    },
    "right": function ($page1, $page2) {
        $page2.css3({
            "transform": "translate(100%)"
        });
        setTimeout(function () {
            $page1.css3({
                "transform": "translate(-100%)"
            });
            $page2.css3({
                "transform": "none"
            });
        }, 100);
    }
};

var goToPage = (function () {
    var pageChanger = null;

    return function ($page, effect, duration) {
        if (!pageChanger) {
            pageChanger = new PageChanger($(".page").not(".none"));
        }
        pageChanger.goTo.apply(pageChanger, arguments);
    };
})();


/*
 * 数据 model层 负责获取视图需要的数据和存数据
 */
var Model = Class.extend({
    _modelDefault: {
        fetchUrl: "",
        submitUrl: "",
        container: "body", //数据服务于的范围
        rawData: {}, //从服务器上get过来的原始数据
        viewData: {}, //视图关联的数据，由raw数据经getTransfer()转换得来
        defaultViewData: {}, //默认的视图数据
        getTransfer: function (data) {
            return data;
        }, //远程获取数据之后的转换为view数据
        setTransfer: function (submitData) {
            return submitData;
        } //提交view数据到远程之前的转换
    },

    init: function () {
        this._models = {};
    },

    //设置viewdata
    setData: function (modelName, data) {
        $.extend(this._models[modelName].viewData, data);
    },

    //获取数据（异步）
    fetchData: function (modelName, queryData, callback) {
        var viewData = {},
            that = this;

        callback = (typeof queryData === "function" ? queryData : (callback || null));
        queryData = (typeof queryData === "object" ? queryData : null);

        if (!this._models[modelName]) {
            throw new Error("没有此数据model---" + modelName);
        }

        if (!this._models[modelName].fetchUrl) {
            throw new Error("model---" + modelName + "没有定义fetchUrl");
        }

        $.GetSetData.setData(this._models[modelName].fetchUrl, queryData, function (data) {
            //远程获取到之后的接口数据->viewData的转换
            data = $.parseJSON(data);
            that._models[modelName].viewData = that._models[modelName].getTransfer(data);
            callback && callback(that._models[modelName].viewData);
        });
    },

    //获取最近一次的数据
    getViewData: function (modelName) {
        return (this._models[modelName].viewData || this._models[modelName].defaultViewData);
    },

    //获取默认的数据
    getViewDefaultData: function (modelName) {
        return (this._models[modelName] && this._models[modelName].defaultViewData);
    },

    //远程保存数据
    saveData: function (modelName, submitData, callback) {
        var isSuccess = false;

        callback = (typeof submitData === "function" ? submitData : (callback || null));
        submitData = (typeof submitData === "object" ? submitData : null);

        if (!this._models[modelName]) {
            throw new Error("没有此数据model---" + modelName);
        }

        if (!this._models[modelName].submitUrl) {
            throw new Error("model---" + modelName + "没有定义submitUrl");
        }

        this.setData(modelName, $.extend(true, {}, submitData));

        //数据保存到远程之前的viewData->接口数据的转换
        submitData = this._models[modelName].setTransfer(submitData);

        $.ajaxMessage('<img src="/a9/common/img/loading-ico.gif" alt="" />');
        $.GetSetData.setData(this._models[modelName].submitUrl, submitData, function (res) {
            isSuccess = true;
            $.ajaxMessage().hide();
            callback && callback(res);
        });
        setTimeout(function () {
            if (!isSuccess)
                $.ajaxMessage('<span class="text-error">' + _('与设备连接已断开') + '</span>');
        }, 15000);
    },

    //扩展model
    extendModels: function (modelObjs) {

        var modelObj;
        for (var modelName in modelObjs) {
            modelObj = modelObjs[modelName];
            this._models[modelName] = $.extend({}, this._modelDefault, modelObj);
        }
    }
});


/**
 * 视图相关，仅使用视图相关的数据更新视图状态。
 * 普通的控件直接赋值，如input select textarea。
 * 特殊的控件（根据不同的数据显示不同的视图）自定义
 * 自定义控件接受一个带有set，get方法的对象，用于控件数据显示获取
 */
var View = Class.extend({
    $container: null,

    widgetDefault: {
        get: function () {},
        set: function (data) {},
        default: function () {}
    },

    //一些默认的widget
    defalutWidget: {
        "disabled": {
            set: function (data) {
                var isDisabled = (data === "false" || data === false) ? false : true;

                $(this)[0].disabled = isDisabled;
                if (isDisabled) {
                    $(this).addClass("disabled");
                } else {
                    $(this).removeClass("disabled");
                }

            },
            get: function () {}
        },

        //textwidget用于设置视图，提交数据会使用innerHTML提交
        "text": {
            set: function (data) {
                $(this).html(data);
            },
            get: function () {
                // return this.innerHTML;
                return $(this).text();
            }
        },

        "visible": {
            set: function (data) {
                if (data) {
                    $(this).show();
                } else {
                    $(this).hide();
                }
            }
        }
    },

    customWidget: {},

    init: function ($container) {
        this.$container = $($container);
        $.extend(this.customWidget, this.defalutWidget);
        this.extendCustomWidget(this.customWidget);
    },

    //渲染视图
    "render": function (data, $container) {
        //autofill
        var that = this,
            $elems,
            widgetName = "",
            dataBind = "";
        $container = $container ? $($container) : this.$container;

        if ($container.is("[name], [data-bind]")) {
            $elems = $container;
        } else {
            $elems = $container.find("[name], [data-bind]");
        }

        $elems.each(function () {
            var dataKey = this.name || $(this).data("bind") || "";
            elemData = (typeof data[dataKey] !== "undefined" ? data[dataKey] : null),
            widgetName = this.getAttribute("data-widget");

            if (elemData === null) return;

            if (widgetName) {
                if (widgetName && that.customWidget[widgetName]) {
                    that.customWidget[widgetName].set &&
                        that.customWidget[widgetName].set.call(this, elemData);
                }
            } else {
                $(this).setVal(elemData);
            }
        });
    },

    //获取某个container下的json数据
    "collect": function ($container) {
        var $elems,
            that = this;
        $container = $container ? $($container) : this.$container;

        if ($container.is("[name], [data-widget]")) {
            $elems = $container;
        } else {
            $elems = $container.find("[name], [data-widget]");
        }

        $elems = $elems.filter(function () {
            if ($(this).is("[type=hidden]") && !$(this).is(":disabled")) {
                return true;
            }
            if ($(this).is(":visible") && !$(this).is(":disabled")) {
                return true;
            }
        });

        //自定义的widget的值的获取
        var widgetData = {};

        $elems.filter("[data-widget]:visible").each(function () {
            var dataKey = this.name || $(this).data("bind"),
                widgetName = this.dataset.widget;
            widgetValue = that.customWidget[widgetName].get.call(this);

            if (typeof widgetValue !== "undefined") {
                widgetData[dataKey] = widgetValue;
            }
        });

        return $.extend($elems.serializeJson(), widgetData);
    },

    //表单元素的重置
    "reset": function ($container) {
        $container = $container ? $($container) : this.$container;
        $container.find("input").each(function () {
            if (this.type == "radio") {
                $container.find("[name=" + this.name + "]").eq(0).prop("checked", true);
            } else if (this.type == "checkbox") {
                this.checked = false;
            } else {
                this.value = "";
            }
        });
    },

    //widgetName(data-widget) 写在html元素上用于说明是什么widget
    "extendCustomWidget": function (widgetObjs) {
        var widgetObj;
        for (var widgetName in widgetObjs) {
            widgetObj = widgetObjs[widgetName];

            if (typeof widgetObj == "function") {
                this.customWidget[widgetName] = $.extend({}, this.widgetDefault, {
                    set: widgetObj
                });
            } else {
                this.customWidget[widgetName] = $.extend({}, this.widgetDefault, widgetObj);
            }
        }
    }
});


/*
 * ViewModule
 * 继承视图对象，包含逻辑处理
 */
var ViewModule = View.extend({
    model: null,
    validateObj: null,

    init: function ($container, model) {
        this.validateObj = $.validate({
            "wrapElem": $container
        }),
        this.model = model;
        this._super($container);
        this._initEvent(); //简便方式
        this.initEvent(); //传统方式
        this.initialize();
        this.update();
    },

    _initEvent: function (events) {
        this.events = events || this.events;
        for (var key in this.events) {

            var event = this.events[key];
            if (event) {
                var args = key.split(',').concat(event),
                    ele = args.shift(0);
                $(ele).on.apply($(ele), args);
            }
        }
        return this;
    },

    initEvent: function () {},

    events: {},

    initialize: function () {},

    update: function () {},

    handup: function () {},

    /*
     *使用model渲染视图
     * @param dataType 代表需要的数据类型，fetch远程数据，default默认数据，last上次数据
     */
    renderForModel: function (modelName, dataType, callback) {
        var that = this,
            container = that.model._models[modelName].container;

        if (typeof dataType !== "string") {
            callback = (typeof dataType === "function") ? dataType : undefined;
            dataType = "last";
        }

        if (dataType == "last") {

            //用上次数据更新
            that.render(this.model.getViewData(modelName), container);
            callback && callback();
        } else if (dataType == "default") {

            //用默认数据更新
            this.render(this.model.getViewDefaultData(modelName), container);
            callback && callback();
        } else if (dataType == "fetch") {

            //异步取新数据更新
            this.model.fetchData(modelName, {
                module1: modelName
            }, function (data) {
                that.render(data, container);
                callback && callback();
            });
        }
    },


    //为model提交数据
    saveForModel: function (modelName, callback) {
        var that = this,
            submitData = {},
            container = that.model._models[modelName].container;

        if (container) {
            var errMsg = this.validateObj.check($(container).find(".validatebox"));

            //数据验证 
            if (errMsg) {
                $.alert(errMsg);
                return false;
            }
            submitData = this.collect(container);
        }
        this.model.saveData(modelName, submitData, callback);
    }
});


//Using click event dev on pc while using tap on mobile
var click = typeof window.ontouchstart === "undefined" ? "click" : "tap";


$.fn.initPassword = (function () {
    $(document).on(click, ".icon-seepwd", function () {
        var $pwdIpt = $(this).prev();
        if ($pwdIpt[0].type === "password") {
            $pwdIpt[0].type = "text";
            $(this).addClass("icon-noseepwd");
        } else {
            $pwdIpt[0].type = "password";
            $(this).removeClass("icon-noseepwd");
        }
    });

    return function () {
        return this.each(function () {
            this.type = "password";
            $(this).next().removeClass("icon-noseepwd");
        });
    };
})();



$.showConfirm = (function () {
    var $confirmBox = null,
        $overlay = null,
        status = "hide",
        applyFun = null,
        cancelFun = null,
        context = window;

    function create() {

        $confirmBox = $('<div class="overlay popup-wrap"></div>');
        $confirmBox[0].innerHTML = '<div class="popup"><div class="popop-tip" id="confirmMsg">&nbsp;</div><div class="popup-btn-wrap clearfix"><a class="btn popup-cancel" id="confirmCancelBtn">'+_('取消')+'</a><a class="btn btn-primary" id="confirmApplyBtn">'+_('确定')+'</a></div></div>';

        $confirmBox.appendTo("body");

        $confirmBox.on(click, "#confirmApplyBtn", function () {
            $confirmBox.hide();
            (typeof applyFun === "function") && applyFun.call(context);
        });
        $confirmBox.on(click, "#confirmCancelBtn", function () {
            $confirmBox.hide();
            (typeof cancelFun === "function") && cancelFun.call(context);
            applyFun = null;
            cancelFun = null;
        });
    }


    return function (msg, applyCallback, cancelCallback) {
        context = this;

        if (!$confirmBox) {
            create();
        }
        applyFun = applyCallback;
        cancelFun = cancelCallback;
        $confirmBox.show().find("#confirmMsg").html(msg);
    };
})();

/**
* Escape text for attribute or text content.
*/
function escapeText( s ) {
    if ( !s ) {
        return "";
    }
    s = s + "";

    // Both single quotes and double quotes (for attributes)
    return s.replace( /['"<>&]/g, function( s ) {
        switch ( s ) {
        case "'":
            return "&#039;";
        case "\"":
            return "&quot;";
        case "<":
            return "&lt;";
        case ">":
            return "&gt;";
        case "&":
            return "&amp;";
        }
    } );
}