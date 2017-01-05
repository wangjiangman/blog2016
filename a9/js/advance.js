var encode = (function() {

    var base64EncodeChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    function utf16to8(str) {
        var out,
            i,
            len,
            c;

        out = '';
        len = str.length;
        for (i = 0; i < len; i++) {
            c = str.charCodeAt(i);
            if ((c >= 0x0001) && (c <= 0x007F)) {
                out += str.charAt(i);
            } else if (c > 0x07FF) {
                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            } else {
                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
            }
        }
        return out;
    }

    function base64encode(str) {
        var out,
            i,
            len;
        var c1,
            c2,
            c3;

        len = str.length;
        i = 0;
        out = '';
        while (i < len) {
            c1 = str.charCodeAt(i++) & 0xff;
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt((c1 & 0x3) << 4);
                out += '==';
                break;
            }
            c2 = str.charCodeAt(i++);
            if (i == len) {
                out += base64EncodeChars.charAt(c1 >> 2);
                out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
                out += base64EncodeChars.charAt((c2 & 0xF) << 2);
                out += '=';
                break;
            }
            c3 = str.charCodeAt(i++);
            out += base64EncodeChars.charAt(c1 >> 2);
            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
            out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
            out += base64EncodeChars.charAt(c3 & 0x3F);
        }
        return out;
    }
    return function(s) {
        return base64encode(utf16to8(s));
    };
})();

$.valid.loginPassword = function(str, min, max) {
	if(!(/^[\dA-Za-z]*$/g).test(str)) {
		return "密码只能由字母或者数字组成";		 
	}
	if(min || max) {
		return $.valid.len(str, min, max);
	}
}


define(function(require, exports, module) {
	var model = new Model(); 

	model.extendModels({
		//密码修改
		"sysPwd": {
			fetchUrl: "/a9/goform/getSysTools",
			submitUrl: "/a9/goform/setSystem",	
			container: $("#pageSysPwd"),
            getTransfer: function(data) {
                if(data.sysPwd.hasPwd === "true") {
                    return {hasPwd: true};
                } else {
                    return {hasPwd: false};
                }
            },
			setTransfer: function(data) {
				var submitData = {};
                submitData.module1 = "setPwd";

				for (var key in data) {
                    if(key !== "confirmPwd") {
                        submitData[key] = encode(data[key]);
                    }
				}

				return submitData;
			}
		},

        //重启
        "reboot": {
            submitUrl: "/a9/goform/setSystem",
            setTransfer: function() {
                var submitData = {
                    module1:"sysOperate",
                    action:"reboot"
                }

                return submitData;
            }
        },

		//恢复出厂
		"restore": {
			submitUrl: "/a9/goform/setSystem",
            setTransfer: function() {
                var submitData = {
                    module1:"sysOperate",
                    action:"restore"
                }

                return submitData;
            }
		}
	});

	var SpecifyViewModule =  ViewModule.extend({
		initialize: function() {

		},

		initEvent: function() {
			var that = this;
				model = this.model;

            $("#advanceBackBtn").on(click, function() {
                window.location.href = "/a9/scan.html";
            });

			$("#goSysPwd").on(click, (function() {
				var hasPwd;

				function showPwdPage() {
					that.model.setData("sysPwd", {"hasPwd": hasPwd});
					that.renderForModel("sysPwd");
					goToPage("#pageSysPwd");
				}
				return function() {
					if (typeof hasPwd === "undefined") {
						model.fetchData("sysPwd", {module1:"sysPwd"}, function(data) {
							hasPwd = data.hasPwd;
							showPwdPage();
						});
					} else {
						showPwdPage();
					}
				};
			})());

			//密码修改页
			$("#pageSysPwdTitle").on(click, function() {
				goToPage("#pageAdvMenu", "left");
				that.reset("#pageSysPwd");
			});

			$("#sysPwdSave").on(click, function() {
				that.saveForModel("sysPwd", function(res) {
                    var num = JSON.parse(res).errCode || "-1"
					if (num == "2") { // 旧密码错误
						$.alert("密码修改失败，旧密码错误")
					} else if (num == "101") { // 新密码不为空
                        window.location.href = "/a9/login.html";
                    } else if (num == "102") { // 新密码为空
                        $.alert("密码修改成功");
                        goToPage("#pageAdvMenu", "left");
                    }
				});
			});

            /* 重启 */
            $("#rebootExtender").on(click, function() {
                //确认

                $.showConfirm("确认重启设备吗？", function() {
                    model.saveData("reboot", function() {

                        //走进度
                        $.progressBar().run(50000, "正在重启设备", function() {
                            var checkRebootT= setInterval(function() {
                                $.ajax({
                                     type: "get",
                                     url: "/a9/goform/getRebootStatus",
                                     dataType: "jsonp",
                                     jsonp: "callback",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(一般默认为:callback)
                                     jsonpCallback:"flightHandler",//自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名，也可以写"?"，jQuery会自动为你处理数据
                                     success: function(json){
                                        clearInterval(checkRebootT);
                                        window.location.href = "scan.html";
                                     }
                                 });
                            }, 5000);
                        });
                    });                 
                });
            });
			
			//恢复出厂设置
			$("#goRestore").on(click, function() {
				//确认

				$.showConfirm("恢复出厂设置将清空当前所有配置并还原系统到出厂状态！", function() {
					model.saveData("restore", function() {

						//走进度
						$.progressBar().run(50000, "正在恢复出厂设置", function() {
							var checkRebootT= setInterval(function() {
								$.ajax({
								     type: "get",
								     url: "/a9/goform/getRebootStatus",
								     dataType: "jsonp",
								     jsonp: "callback",//传递给请求处理程序或页面的，用以获得jsonp回调函数名的参数名(一般默认为:callback)
								     jsonpCallback:"flightHandler",//自定义的jsonp回调函数名称，默认为jQuery自动生成的随机函数名，也可以写"?"，jQuery会自动为你处理数据
								     success: function(json){
								     	clearInterval(checkRebootT);
								        window.location.href = "scan.html";
								     }
								 });
							}, 5000);
						});
					});					
				});
			});
		}
	});

	var viewModule = new SpecifyViewModule("body", model)

	module.exports = viewModule;
});