<!DOCTYPE html>
<html lang="zh-cn">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=no">
    <meta http-equiv="Pragma" content="no-cache,no-store">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="renderer" content="webkit">
    <title>用户认证</title>

    <link rel="stylesheet" href="/w20e/common/css/bootstrap.css?t=2016512174418">

    <link rel="stylesheet" href="/w20e/common/css/reasy-ui.css?t=2016512174418">

    <link rel="stylesheet" href="/w20e/authServer/css/webpage_showpic.css?t=2016512174418">  

    <!-- 打开以下链接为Tenda页面风格；注释掉为IP-COM页面风格 -->
    <link rel="stylesheet" href="/w20e/common/css/tenda.css">

    <!--[if lte IE 8]>
      <script src="/w20e/common/js/libs/respond/respond.min.js?t=2016512174418"></script>
      <script src="/w20e/common/js/libs/excanvas.js?t=2016512174418"></script>
      <script src="/w20e/common/js/libs/html.js"></script>
    <![endif]-->
</head>
<body>

    <div class="container">
        <div class="row">
                <div class="col-sm-6 col-md-7">

                  <div id="msg" class="panel announce-panel">
                    <div class="panel-heading">
                      <h4 id="anTitle" class="panel-title text-center"></h4>
                    </div>
                    <pre id="anTxt" class="panel-body" style="background-color: white;font-family:inherit;border: 0px; font-size: 14px; word-wrap: break-all; word-break: break-all;"></pre> 
                  </div>

                </div>
                <div class="col-sm-5 col-md-4 col-sm-offset-1 login-form" >
                    <div class="panel login-panel">
                        <div class="panel-heading">
                            <h3 class="panel-title" data-lang="login">帐号认证</h3>
                        </div>
                        <div class="panel-body">
                            <form class="col-xs-12" name="login" role="form" method="post" action="/w20e/goform/PortalAuth" id="loginForm">
                               <div class="form-group ico-groups" id="usernameElem">
                                   <label class="ico ico-user" for="webAuthUserName"></label>
                                   <input type="text" class="form-control input-lg ico-text" name="webAuthUserName" id="webAuthUserName" placeholder="用户名" maxlength="32" autocomplete="off">

                               </div>
                               <div class="form-group ico-groups" id="pwdElem">
                                   <label class="ico ico-password" for="webAuthUserPassword"></label>
                                   <input type="password" class="form-control input-lg ico-text" name="webAuthUserPassword" id="webAuthUserPassword" placeholder="密码" maxlength="32" autocomplete="off">

                               </div>
                               <div class="form-group">
                                 <input id="loginButton" type="submit" data-lang="login" class="btn btn-primary btn-block btn-lg" value="认证上网"/>
                               </div>

                               <p class="text-center text-warning" id="errorTip"></p>
                            </form>

                        </div>
                    </div>
                </div>
        </div>

        <footer class="navbar-fixed-bottom footer">
          <div class="copyright">服务热线：400-6622-666 丨<span id="tendaAuthWebsite">官网：<a href="http://www.tenda.com.cn" target="_blank">tenda.com.cn</a></span>丨©2016 深圳市吉祥腾达科技有限公司</div>
        </footer>
    </div>

    <script src="/w20e/common/js/libs/jquery.js?t=2016512174418"></script>
    <script src="/w20e/common/js/libs/bootstrap.js?t=2016512174418"></script>
    <script src="/w20e/common/js/libs/reasy-ui-1.0.5.js?t=2016512174418"></script>
    <script src="/w20e/common/lang/b28n_async.js?t=2016512174418"></script>
    <script src="/w20e/common/js/valid.js?t=2016512174418"></script>
    <script src="/w20e/common/js/macro_config.js?t=2016512174418"></script>
    <script src="/w20e/common/js/util.js?t=2016512174418"></script>
    <script src="/w20e/common/js/msg.js?t=2016512174418"></script>

    <script src="/w20e/authServer/js/webpage_showpic.js?t=2016512174418"></script>

</body>
</html>