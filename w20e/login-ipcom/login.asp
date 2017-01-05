<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no">
    <meta http-equiv="Pragma" content="no-cache,no-store">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="renderer" content="webkit">
    <title>IP-COM | LOGIN</title>

    <link rel="stylesheet" href="/w20e/common/css/bootstrap.css?t=2016512174418">

    <link rel="stylesheet" href="/w20e/common/css/reasy-ui.css?t=2016512174418">

    <link rel="stylesheet" href="/login-ipcom/css/login.css?t=2016512174418">  

    <!-- 打开以下链接为Tenda页面风格；注释掉为IP-COM页面风格 -->
    <link rel="stylesheet" href="/w20e/common/css/tenda.css">

    <!--[if lte IE 8]>
      <script src="/w20e/common/js/libs/respond/respond.min.js?t=2016512174418"></script>
      <script src="/w20e/common/js/libs/excanvas.js?t=2016512174418"></script>
      <script src="/w20e/common/js/libs/html.js"></script>
    <![endif]-->
</head>
<body>

<header class="mashead navbar navbar-fixed-top">
  <div class="container">
    <div class="row">
      <div class="navbar-brand"> <img src="/w20e/common/img/logo.png" width="180" alt="IP-COM LOGO"> </div>
      <p class="navbar-text">WiFi 方案解决专家</p>
    </div>
  </div>
</header>

<div class="container-fluid">
  <div class="row">

  	<noscript><div style="width:500px;margin:auto;text-align:center">查看该网页需浏览器支持javascript,请换用其他浏览器，如IE（或请开启浏览器的的javascrip功能）后，重新加载该网页。</div></noscript>
  	<div id="login">
    <div class="col-xs-12 col-sm-push-6 col-sm-6 col-md-push-7 col-md-4">
        <div class="panel login-panel">
            <div class="panel-heading">
                <h3 class="panel-title">登 录</h3>
            </div>
            <div class="panel-body">
                <form class="col-xs-12" name="login" role="form" method="POST" action="login/Auth">
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
                        <input type="password" class="form-control ico-text" placeholder="登录密码" required maxlength="32" id="password" autocomplete="off">
                        <input type="hidden" name="password" value="">
                    </div>
                    <div class="form-group">
                        <input class="btn btn-primary btn-block btn-lg" id="formsubmit" value="登录" type="button">
                    </div>
                </form>
                <div>
                    <div class="login-tip pull-right" id="login-tip"> 忘记密码？ </div>
                    <p class="panel login-panel login-tip-text">&gt;如忘记密码，只能将设备复位。方法：设备正常启动后，长按路由器上的RESET按键8秒后松开（注意：此操作将还原设备所有设置，您需要重新设置设备）</p>

                </div>
            </div>
        </div>
    </div>
    <div class="hidden-xs col-sm-pull-6 col-sm-6 col-md-pull-4 col-md-7">
        <img src="/w20e/common/img/loginBg.jpg" class="center-block img-responsive" width="350">
    </div>
</div>
<div id="firstIn" class="none">
    <div class="col-xs-12 col-sm-push-6 col-sm-6 col-md-push-7 col-md-4">
        <div class="panel login-panel">
            <div class="panel-heading">
                <h3 class="panel-title">首 次 登 录</h3>
            </div>
            <div class="panel-body">
                <form class="col-xs-12" name="firstLogin" role="form" method="POST" action="login/Auth">
                    <p id="first_login_message" class="has-error">
                        <label class="control-label">&nbsp;</label>
                    </p>
                    <div class="form-group ico-groups">
                        <label class="ico ico-user"></label>
                        <input type="text" class="form-control ico-text" placeholder="登录帐号:1-15位下划线、数字或字母" required maxlength="15" id="first_acount" autocomplete="off">
                        <input type="hidden" name="sysUserAccount" value="">
                    </div>
                    <div class="form-group ico-groups">
                        <label class="ico ico-password"></label>
                        <input type="password" class="form-control ico-text" placeholder="登录密码:1-32位下划线、数字或字母" required maxlength="32" id="first_pass_word" autocomplete="off">
                        <input type="hidden" name="sysUserPwd" value="">
                    </div>
                    <div class="form-group ico-groups">
                        <label class="ico ico-password"></label>
                        <input type="password" class="form-control ico-text" placeholder="确认密码:1-32位下划线、数字或字母" required maxlength="32" id="first_en_pass_word" autocomplete="off">
                        <input type="hidden" value="">
                    </div>
                    <div class="form-group">
                        <input class="btn btn-primary btn-block btn-lg" id="firstInSubmit" value="登录" type="button">
                    </div>
                </form>
                <div>
                    <div class="login-tip pull-right" id="login-tip"> 忘记密码？ </div>
                    <p class="panel login-panel login-tip-text">&gt;如忘记密码，只能将设备复位。方法：设备正常启动后，长按路由器上的RESET按键8秒后松开（注意：此操作将还原设备所有设置，您需要重新设置设备）</p>

                </div>
            </div>
        </div>
    </div>
    <div class="hidden-xs col-sm-pull-6 col-sm-6 col-md-pull-4 col-md-7">
        <img src="/w20e/common/img/loginBg.jpg" class="center-block img-responsive" width="350">
    </div>
</div>

  </div>  
</div>

<footer class="navbar-fixed-bottom footer">
  <ul class="list-inline">
    <li>官网：<a href="http://www.ip-com.com.cn" target="_blank">ip-com.com.cn</a></li>
    <li>服务热线：400-665-0066</li>
    <li class="hidden-xs">©2007-2015</li>
    <li class="hidden-xs">深圳市和为顺网络技术有限公司</li>
  </ul>
</footer>


    <script src="/w20e/common/js/libs/jquery.js?t=2016512174418"></script>
    <script src="/w20e/common/js/libs/bootstrap.js?t=2016512174418"></script>
    <script src="/w20e/common/js/libs/reasy-ui-1.0.5.js?t=2016512174418"></script>
    <script src="/w20e/common/lang/b28n_async.js?t=2016512174418"></script>
    <script src="/w20e/common/js/valid.js?t=2016512174418"></script>
    <script src="/w20e/common/js/macro_config.js?t=2016512174418"></script>
    <script src="/w20e/common/js/util.js?t=2016512174418"></script>
    <script src="/w20e/common/js/msg.js?t=2016512174418"></script>

    <script src="/login-ipcom/js/login.js?t=2016512174418"></script>

</body>
</html>