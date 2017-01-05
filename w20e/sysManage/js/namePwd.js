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

(function(window, $) {

    var G_index,
        G_data;

    var Msg = {
        '管理员帐号':'privileged',
        '普通帐号':'ordinary'
    };

    function handlerMappingData(res) {
        G_data = res;
        res.sysUser = new TableData([
            {type: '管理员帐号', name:res.sysUserPrivilegedAccount}, 
            {type: '普通帐号', name:res.sysUserOrdinaryUserAccount}
            ],['<div class="operate"><span class="edit"></span></div>']).get();

        return res;
    }

    var namePwdView = new R.View("#namePwdContainer", {
        fetchUrl: '/w20e/goform/getSysUser',
        updateCallback: handlerMappingData,
        events:{
            '#namePwdContainer, click, .edit': function() {
                $('#namepwd-modal').modal();

                G_index = $(this).parents('tr')[0].rowIndex - 1;
                var data = namePwdView.defaults.originData.sysUser[G_index];

                var transData={};
                transData.sysUserAccountType = data.type;
                transData.sysUserOldAccount = data.name; 
                dialogView.reset();
                dialogView.update(transData);
                $('#modalTitle').html(transData.sysUserAccountType);
            }
        }
    });

    var dialogView = new R.FormView('#namepwd-modal form');
    dialogView.beforeSubmit = function(data) {
        if(($("#sysUserOldPwd").val() == "") || ($("#sysUserAccount").val() == "") ||
            ($("#sysUserNewPwd").val() == "") || ($("#sysUserPwd").val() == "")) {
                showMsg("输入不能为空！");
                return false;
            }

        if(data.sysUserPwd !== data.sysUserNewPwd) {
            showMsg(_("新密码和确认密码不相同"));
            return false;
        }

        if((G_index === 0) && (data.sysUserAccount === G_data.sysUserOrdinaryUserAccount)) {
            showMsg(_("管理员帐户名不能与普通帐户名相同！"));
            return false;
        }
        if((G_index === 1) && (data.sysUserAccount === G_data.sysUserPrivilegedAccount)) {
            showMsg(_("普通帐户名不能与管理员帐户名相同！"));
            return false;
        }

        if(!(/^[0-9a-zA-Z_]+$/).test(data.sysUserOldPwd)) {
            showMsg(_("旧密码由字母、数字和下划线组成!"));
            return false;
        }
        if(!(/^[0-9a-zA-Z_]+$/).test(data.sysUserAccount)) {
            showMsg(_("新账户名由字母、数字和下划线组成!"));
            return false;
        }
        if(!(/^[0-9a-zA-Z_]+$/).test(data.sysUserPwd)) {
            showMsg(_("新密码由字母、数字和下划线组成!"));
            return false;
        }

        var transData = {};
        transData.sysUserOldPwd = R.Encode(data.sysUserOldPwd);
        transData.sysUserAccountType = Msg[data.sysUserAccountType];
        transData.sysUserAccount = data.sysUserAccount;
        transData.sysUserPwd = R.Encode(data.sysUserPwd);

        return transData;
    };

    dialogView.afterSubmit = function(res) {
        if(res !== "1") {
            showMsg(_("旧密码输入错误，修改失败！"));
            return false;
        }

        if(($('input[name="sysUserAccountType"]').val() === "管理员帐号") && (res === "1")) {
            showMsg(_("修改成功，正在进入登录页面..."),true,5000);
            window.setTimeout(function () { 
                //防止过早跳转
                window.location.href = "/login.asp";
            }, 1000);
        }else if($('input[name="sysUserAccountType"]').val() === "普通帐号") {
            showSaveMsg(_("修改成功！"), 1000);
        }

        $('#namepwd-modal').modal("hide");
        namePwdView.update(true);
    };
    
} (window, $));