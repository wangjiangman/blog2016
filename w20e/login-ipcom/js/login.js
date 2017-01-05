var R = {};

R.G = {
    FAILED: '#pwdError',
    LOGINPAGENAME: 'login.asp',
    DOM: {
        form: $('form[name=login]'),
        form1: $('form[name=firstLogin]'),
        username: $('#username'),
        password: $('#password'),
        message: $('#message>label'),
        firstmessage: $('#first_login_message>label'),
        submit: $('#formsubmit'),
        initusername: $('#first_acount'),
        initpassword: $('#first_pass_word'),
        initenpassword: $('#first_en_pass_word')
    },
    MSG: {
        userNameEmpty: _('用户名不能为空'),
        pwdEmpty: _('密码不能为空'),
        enEmpty: _('确认密码不能为空'),

        authError: _('用户名/密码错误'),
        pwdLenError: _('密码长度只能为1-32个字符'),
        pwdTooShort: _('密码长度太短'),

        pwdFormatError: _('密码由字母、数字和下划线组成'),
        enFormatError: _('确认密码由字母、数字和下划线组成'),
        nameFormatError: _('用户名由字母、数字和下划线组成'),

        getDataFailure: _('数据获取失败！'),
        login: _('登录'),
        brand: _('IP-COM | '),
        firstIn: _('首次设置'),
        capIsLock: _('大写锁定已打开'),
        oldBrowser: _("您的浏览器版本过低，请升级您的浏览器至IE8以上或使用chrome等现代浏览器！"),
        pwdChkHalf: _("密码不支持全角字符"),
        enChkHalf: _("确认密码不支持全角字符"),
        nameChkHalf: _("用户名不支持全角字符"),
        notSame: '密码和确认密码不一致'
    }
};

R.Encode = (function() {

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

$(function() {
    var option;
    var Login = (function() {
        var LOGINPAGENAME = R.G.LOGINPAGENAME,
            FAILED = R.G.FAILED,
            $DOM = R.G.DOM,
            MSG = R.G.MSG;

        function resetForm() {
            $(':input').not(':button, :submit, :reset, :hidden').val('');
        }

        function directLoc(href) {
            if (location.href != top.location.href) {
                top.loginOut && top.loginOut();
                //top.location.href = href;
            }
        }

        function showAuthResult() {
            if (location.hash == FAILED) {
                $DOM.message.html(MSG.authError);
            }
        }

        function validatePwd(val) {
            var msg = "";

            for (var i = 0; i < val.length; i++) {
                var strCode = val.charCodeAt(i);
                if ((strCode > 65248) || (strCode == 12288)) {
                    msg = MSG.pwdChkHalf;
                    break;
                }
            }

            if (val === '') {
                msg = MSG.pwdEmpty;
            } else if (msg != "") {

            }　
            else if (!(/^[0-9a-zA-Z_]+$/).test(val)) {
                msg = MSG.pwdFormatError;
            }

            if (msg) {
                $DOM.message.html(msg);
                $("#password").focus();
                return false;
            }

            $DOM.message.html('&nbsp;');
            return true;
        }

        function validateName(val) {
            var msg = "";

            for (var i = 0; i < val.length; i++) {
                var strCode = val.charCodeAt(i);
                if ((strCode > 65248) || (strCode == 12288)) {
                    msg = MSG.nameChkHalf;
                    break;
                }
            }

            if (val === '') {
            	msg = MSG.userNameEmpty;
            } else if (msg != "") {

            } else if (!(/^[0-9a-zA-Z_]+$/).test(val)) {
                msg = MSG.nameFormatError;
            }
            if (msg) {
                $DOM.message.html(msg);
                $("#username").focus();
                return false;
            }

            $DOM.message.html('&nbsp;');
            return true;
        }

        function submit() {
            var name = $DOM.username.val();
            var pwd = R.Encode($DOM.password.val());

            if (validateName(name) && validatePwd($DOM.password.val())) {
                $('input[name=username]').val(name);
                $('input[name=password]').val(pwd);

                $DOM.form[0].submit();
            }
        }

        function initControl() {
            var that = this;
            $DOM.submit.on('click', function() {
                submit.call(that);
            });
        }

        return {
            init: function() {
                resetForm();
                directLoc(LOGINPAGENAME);
                showAuthResult();
                initControl();
                window.document.title = R.G.MSG.brand + R.G.MSG.login;
                setTimeout(function() {
                    $("#username").focus();
                }, 300);
            },
            preSubmit: function() {
                submit();
            }
        };
    })();

    var FirstIn = (function() {
        var $DOM = R.G.DOM;
        var MSG = R.G.MSG;

        function validatePwd(val, type) {
            var msg = "";

            for (var i = 0; i < val.length; i++) {
                var strCode = val.charCodeAt(i);
                if ((strCode > 65248) || (strCode == 12288)) {
                    if (type === "pwd") {
                        msg = MSG.pwdChkHalf;
                    } else {
                        msg = MSG.enChkHalf;
                    }
                    break;
                }
            }

            if (val === '') {
                if (type === "pwd") {
                    msg = MSG.pwdEmpty;
                } else {
                    msg = MSG.enEmpty;
                }
            } else if (msg !== "") {

            }　
            else if (!(/^[0-9a-zA-Z_]+$/).test(val)) {
                if (type === "pwd") {
                    msg = MSG.pwdFormatError;
                } else {
                    msg = MSG.enFormatError;
                }
            }

            if (msg) {
                $DOM.firstmessage.html(msg);
                return false;
            }

            $DOM.firstmessage.html('&nbsp;');
            return true;
        }

        function validateName(val) {
            var msg = "";

            for (var i = 0; i < val.length; i++) {
                var strCode = val.charCodeAt(i);
                if ((strCode > 65248) || (strCode == 12288)) {
                    msg = MSG.nameChkHalf;
                    break;
                }
            }

            if (val === '') {
                msg = MSG.userNameEmpty;
            } else if (msg !== "") {

            } else if (!(/^[0-9a-zA-Z_]+$/).test(val)) {
                msg = MSG.nameFormatError;
            }
            if (msg) {
                $DOM.firstmessage.html(msg);
                return false;
            }

            $DOM.firstmessage.html('&nbsp;');
            return true;
        }

        function initEvents() {
            $('#login').addClass('none');
            $('#firstIn').removeClass('none');
            $('#firstInSubmit').on('click', function() {
                submit();
            });
            $("#first_pass_word, #first_en_pass_word, #first_acount").on("focus", function () {
                $('#first_login_message label').html("&nbsp;");
            });
        }

        function submit() {
            var name = $DOM.initusername.val();
            var pwd = R.Encode($DOM.initpassword.val());
            var enpwd = R.Encode($DOM.initenpassword.val());

            if (validateName(name) && validatePwd($DOM.initpassword.val(), "pwd") && validatePwd($DOM.initenpassword.val(), "en")) {
                if ($DOM.initpassword.val() !== $DOM.initenpassword.val()) {
                    $DOM.firstmessage.html(MSG.notSame);
                    return false;
                }
                $('input[name=sysUserAccount]').val(name);
                $('input[name=sysUserPwd]').val(pwd);

                $DOM.form1[0].submit();
            }
        }

        return {
            init: function() {
                initEvents();
                window.document.title = R.G.MSG.brand + R.G.MSG.firstIn;
                setTimeout(function() {
                    $("#first_acount").focus();
                }, 300);
            },
            preSubmit: function() {
                submit();
            }
        };
    }());

    function enterDown(events) {
        //解决火狐浏览器不支持event事件的问题。
        var e = events || window.event,
            char_code = e.charCode || e.keyCode;

        if (char_code == 13) {
            if (e.preventDefault) {
                e.preventDefault();
            } else {
                e.returnValue = false;
            }

            if (option == 'login') {
                Login.preSubmit();
            } else if (option == 'firstLogin') {
                FirstIn.preSubmit();
            }

            return false;
        }
    }

    function isCapPress($eles, callback) {
        var IsCapPress = function() {
            this.capIsPress = false;
            this.lastValue = $eles.val();

            function _check(value, isShiftPress) {
                if (value) {
                    if (IsCapPress.lastValue != value)
                        IsCapPress.lastValue = value;
                    else return IsCapPress.capIsPress;
                    var lastKey = value.charAt(value.length - 1);
                    if (lastKey >= 'a' && lastKey <= 'z' || lastKey >= 'A' && lastKey <= 'Z')
                        return isShiftPress ? lastKey >= 'a' && lastKey <= 'z' : lastKey >= 'A' && lastKey <= 'Z';
                    else
                        return IsCapPress.capIsPress;
                }
                return IsCapPress.capIsPress;
            }

            this.bindCtrl = function($eles, callback) {
                $eles.on('keyup', function(e) {
                    if (e.keyCode == 16 || e.keyCode == 8) return IsCapPress.capIsPress;
                    IsCapPress.capIsPress = _check($(this).val(), e.shiftKey);
                    if (callback && typeof callback == 'function')
                        callback.call(this, IsCapPress.capIsPress);
                    else return IsCapPress.capIsPress;
                });
            };
            if ($eles && callback) this.bindCtrl($eles, callback);
        }
        return new IsCapPress();
    }

    //Bind events to DOM elements
    function initEvents() {
        document.getElementById('password').onkeydown = function(e) {
            enterDown(e);
        };
        document.getElementById('first_en_pass_word').onkeydown = function(e) {
            enterDown(e);
        };
        $('#login-tip').on('click', function() {
            $('.login-tip-text').slideDown();
            setTimeout(function() {
                $('.login-tip-text').slideUp();
            }, 6000);
        });
        isCapPress($('#password'), function(e) {
            if (e) {
                $('#message .control-label').text(R.G.MSG.capIsLock);
            } else {
                $('#message .control-label').html('&nbsp;');
            }
        });
    }

    function detectIEMajorVersion() {
        var groups = /MSIE ([0-9.]+)/.exec(window.navigator.userAgent);
        if (groups === null) {
            return null;
        }
        var ieVersionNum = parseInt(groups[1], 10);
        var ieMajorVersion = Math.floor(ieVersionNum);
        return ieMajorVersion;
    }

    function getLoginData(url, handler) {
        if (url.indexOf("?") < 0) {
            url += "?" + Math.random();
        }
        $.ajax({
            url: url,
            cache: false,
            type: "get",
            dataType: "text",
            async: true,
            success: function(data, status) {
                if (data.indexOf("login.js") > 0) {
                    window.location.href = "login.asp";
                    return;
                }

                if (typeof handler == "function") {
                    handler.apply(this, arguments);
                }
            },
            error: function(msg, status) {
                Debug.log("get Data failed,msg is ", msg);
                if (typeof handler == "function") {
                    handler.apply(this, arguments);
                }
            },
            complete: function(xhr) {
                xhr = null;
            }
        });

    }

    getLoginData("/w20e/goform/getLoginType", function(res) {
        var noticeAcount;
        var noticePwd;
        var data = $.parseJSON(res);
        option = data.loginType;
        noticeAcount = data.userName;
        noticePwd = data.decodePwd;
        //For test
        // option = 'firstLogin';
        if (option === 'firstLogin') {
            FirstIn.init();
        } else {
            Login.init();
            option = 'login';
        }
    });

    var ieVersion = detectIEMajorVersion();
    if (ieVersion !== null && ieVersion < 8) {
        document.body.innerHTML = '';
        alert(R.G.MSG.oldBrowser);
        return;
    }

    initEvents();
});
