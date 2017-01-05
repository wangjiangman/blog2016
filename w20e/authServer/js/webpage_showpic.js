$(function() {

    var searchData = window.location.search.match(/data=(.+)&rd=.*/),
        gotoUrl = searchData && searchData.length == 2 ? searchData[1] : "";



    $.GetSetData.getData('/w20e/goform/getWebAuthAnnouncement', function(res) {
        var anData = $.parseJSON(res);

        $("#anTitle").text(anData.webAuthTitle);
        $("#anTxt").text(anData.webAuthContent);
    });  


    if (!gotoUrl) {
        $('#loginForm [type="submit"]').off('click').on('click', function(e) {
            e.preventDefault();
        });
        return;
    }

    /****************  弹出， 编辑View *******************/
    var loginForm = new R.FormView("#loginForm", {
        beforeSubmit: function() {
            if ($("#webAuthUserName").val() == "") {
                showMsg(_("请输入用户名！"));
                return false;
            } else if($("#webAuthUserPassword").val() == "") {
                showMsg(_("请输入密码！"));
                return false;
            } else if($("#webAuthUserName").val().indexOf(" ") !== -1) {
                showMsg(_("用户名不能输入空字符！"));
                return false;
            } else if($("#webAuthUserPassword").val().indexOf(" ") !== -1) {
                showMsg(_("密码不能输入空字符！"));
                return false;
            }
        },

        afterSubmit: function(res) {
            // "success"               /*认证成功*/
            // "infoError",            /*认证帐号或密码错误*/
            // "accountDisabled",      /*认证帐号未启用*/
            // "timeOut"           /*认证超时*/
            // "overLogin",        /*超过最大限制用户数*/
            // "macUsed",          /*本机已认证过，不需要重新认证*/
            // "accountUsed"           /*帐号已使用-对应max_login=1*/

            switch (res) {
                case "success":
                    showSaveMsg(_("认证成功"));
                    window.location.href = "http://" + gotoUrl;
                    break;
                case "infoError":

                    $("#errorTip").html(_("认证帐号或密码错误"));
                    break;
                case "accountDisabled":
                    $("#errorTip").html(_("认证帐号未启用"));
                    break;
                case "timeOut":
                    $("#errorTip").html(_("认证超时"));
                    break;
                case "overLogin":
                    $("#errorTip").html(_("超过最大限制用户数"));
                    break;
                case "macUsed":
                    $("#errorTip").html(_("本机已认证过，不需要重新认证"));
                    break;
                case "accountUsed":
                    $("#errorTip").html(_("帐号已使用"));
                    break;

            }
        }
    });

    /****************  弹出， 编辑View over*******************/

});