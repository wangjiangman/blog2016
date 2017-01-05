<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no">
    <meta http-equiv="Pragma" content="no-cache,no-store">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="renderer" content="webkit">
    <title>Tenda|登录</title>
    <link rel="stylesheet" href="/w20e/common/css/bootstrap.css?t=2016512174418">
    <link rel="stylesheet" href="/w20e/common/css/reasy-ui.css?t=2016512174418">
    <link rel="stylesheet" href="/login/css/login.css">
    <link rel="stylesheet" href="/w20e/common/css/tenda.css">
    <!--[if lt IE 9]>
      <script src="/w20e/common/js/libs/respond/respond.min.js?t=2016512174418"></script>
    <![endif]-->
</head>
<body style="overflow: scroll">
    <div id="login">
        <div class="container-fluid">
            <form name="login" method="post" action="login/Auth">
                <div class="row">
                <div class="col-sm-offset-2 col-md-offset-3 col-sm-8 col-md-6 col-lg-offset-4 col-lg-4 pull-none">
                        <div class="login box-shadow">
                            <div> 
                                <img src="/w20e/common/img/logo-tenda.png" class="img-responsive"> 
                            </div>
                            <p id="message" class="has-error">
                                <label class="control-label">&nbsp;</label>
                            </p>
                            <div class="form-group ico-groups">
                                <label class="ico ico-user"></label>
                                <input type="text" class="form-control ico-text" placeholder="登录帐号" required maxlength="15" id="username" autocomplete="off">
                                <input type="hidden" name="username" value="">
                            </div>
                            <div class="form-group ico-groups">
                                <label class="ico ico-password"></label>
                                <input type="password" class="form-control ico-text" placeholder="登录密码" required  maxlength="32" id="password" autocomplete="off">
                                <input type="hidden" name="password" value="">
                            </div>
                            <div class="form-group ico-groups">
                                <input class="btn btn-primary btn-block btn-lg" id="formsubmit" value="登录" type="button">
                            </div>
                            <div class="forget">
                                <p class="forget-link" id="forgotCaret">忘记密码？<b id="login-caret" class="caret active"></b></p>
                                <div class="forget-info none">
                                    <span id="passwordNotice"></span>
                                    <p><span>&gt;</span>如忘记密码，只能将设备复位。方法：设备正常启动后，长按路由器上的RESET按键8秒后松开（注意：此操作将还原设备所有设置，您需要重新设置设备）</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <div id="firstIn" class="none">
        <div class="container-fluid">
            <form name="firstLogin" id="firstLogin" method="post" action="/w20e/goform/initAdminUser">
                <div class="row">
                    <div class="col-sm-offset-2 col-md-offset-3 col-sm-8 col-md-6 col-lg-offset-4 col-lg-4 pull-none">
                        <div class="login box-shadow">
                            <div> 
                                <img src="/w20e/common/img/logo-tenda.png" class="img-responsive"> 
                            </div>
                            <p id="first_login_message" class="has-error">
                                <label class="control-label"></label>
                            </p>
                            <div class="form-group ico-groups">
                                <label class="ico-label">登录帐号：</label>
                                <input type="text" class="form-control first-ico-text" maxlength="15" id="first_acount" placeholder="1-15位下划线、数字或字母" autocomplete="off">
                                <input type="hidden" name="sysUserAccount" value="">
                            </div>
                            <div class="form-group ico-groups">
                                <label class="ico-label">登录密码：</label>
                                <input type="password" class="form-control first-ico-text" required maxlength="32" id="first_pass_word" placeholder="1-32位下划线、数字或字母" autocomplete="off">
                                <input type="hidden" name="sysUserPwd" value="">
                            </div>
                            <div class="form-group ico-groups">
                                <label class="ico-label">确认密码：</label>
                                <input type="password" class="form-control first-ico-text" maxlength="32" id="first_en_pass_word" placeholder="1-32位下划线、数字或字母" autocomplete="off">
                                <input type="hidden" value="">
                            </div>
                            <div class="form-group ico-groups">
                                <input class="btn btn-primary btn-block btn-lg" id="firstInSubmit" value="确定" type="button">
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <script src="/w20e/common/js/libs/jquery.js?t=2016512174418"></script>
    <script src="/w20e/common/js/libs/bootstrap.js?t=2016512174418"></script>
    <script src="/w20e/common/js/libs/reasy-ui-1.0.5.js?t=2016512174418"></script>
    <script src="/w20e/common/js/valid.js?t=2016512174418"></script>
    <script src="/w20e/common/js/macro_config.js?t=2016512174418"></script>
    <script src="/w20e/common/js/util.js?t=2016512174418"></script>
    <script src="/login/js/login.js?t=2016512174418"></script>
</body>
</html>

