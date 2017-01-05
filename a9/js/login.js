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

define(function(require, exports, module) {

    var LoginViewModel = ViewModule.extend({

        initialize: function() {
            var search = window.location.search;

            $("#Password").focus();
            if (search.match("1")) {
                $.alert("密码错误");
                $(".login-lock-pic").addClass("lock-shake");
            } else if(search.match("2")) {
                $.alert("登录用户已达到4个！");
                $(".login-lock-pic").addClass("lock-shake");
            } else if(search.match("3")) {
                $(".control-group-icon").addClass("none");
                $.alert("登录用户已达到4个！");
                $(".login-lock-pic").addClass("lock-shake");
            }
        },

        initEvent: function() {
            that = this;

            $("#Password").on("keyup", function(e) {
                if (e.keyCode == 13) {
                    that.submit();
                }
            });

            $("#loginSubmitBtn").on(click, function() {
                that.submit();
            });
        },

        submit: function() {
            var validateObj = $.validate();
            var checkRes = validateObj.check($("#Password"));
            if (checkRes) {
                $.alert(checkRes);
            } else {
                $("[name=password]").val(encode($("#Password").val()));
                $("form")[0].submit();
            }            
        }
    });

    module.exports = new LoginViewModel("form", null);
});