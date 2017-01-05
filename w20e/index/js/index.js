var lastActive = null,
    defaultPage = '#network/wlanSet.html',
    currentPage = '',
    helpWindow,
    number,
    hideInfo,
    isLB = window.navigator.userAgent && window.navigator.userAgent.indexOf('LBBROWSER') > -1 ? true : false;//如果为猎豹浏览器

function loginOut() {
    helpWindow && helpWindow.close();
    window.location.href = "login.asp";
}

$('#sideNav').on('click', '.list-group-item', function() {
    if (!$(this).hasClass('collapsed')) {//如果已经展开，什么都不做
        if ($(this).next().filter('.in').is(':hidden')) {//如果子菜单不显示，刷新页面
            $(this).next('ul').find('a:first').click();
        }
        return;
    }
    if (lastActive != this) {
        if (lastActive) lastActive.addClass('collapsed').next().collapse('hide');
        lastActive = $(this);
    }
    $(this).next('ul').find('a:first').click();
});

$('#sideNav').on('click', '.menu-group a', function(e) {
    e.preventDefault();
    var href = $(this).attr('href');
    $("body").removeClass("modal-open");
    toggleNav();


    $(this).parent().siblings().find('.active').removeClass('active');
    $(this).addClass('active');
    $('iframe').attr('src', href.slice(1)).parent().css('visibility', 'hidden');

    if (!isLB) {
        window.location.hash = href;
    }
    
    
    currentPage = href;

    $("#helpBtn").hide();
    helpWindow && helpWindow.close();
});

$("#helpBtn").on("click", function() {
    
    if(currentPage == "#weixin/weWifi.html"){
        //window.location.href = "../w20e/weixin/微信连WIFI操作指南.pdf";
        window.open("../w20e/weixin/微信连WIFI操作指南.pdf","_blank");
        return;
    }

    var helpUrl = "/w20e/helpData.html?" + currentPage.substring(1),
        windowWidth = $(window).width(),
        windowHeight = $(window).height(),
        popWidth = windowWidth*0.8 < 400? 400: windowWidth*0.8,
        popHeight = windowHeight*0.8 < 600? 600: windowHeight*0.8,
        popLeft = (windowWidth-popWidth)/2,
        popTop = (windowHeight-popHeight)/3;



    helpWindow = window.open(helpUrl, "使用说明", 'width='+popWidth+',height='+popHeight+',toolbar=no,status=no,scrollbars=yes,resizable=yes,location=no,menubar=no');
    helpWindow.moveTo(popLeft, popTop);
});

function initFrame(hash) {
    hash = hash || window.location.hash;
    if (!hash || hash.indexOf('/') < 0) hash = defaultPage;
    var loc = hash.slice(1),
        catagory = loc.split('/')[0];
    $('#sideNav').find('span[data=' + catagory + ']').click().next('ul').find('a[href="#' + loc + '"]').click();
}

var onlineUpgradeFlag = false;
var noUpdateInfo = 0;
var getOnlineUpgradeHandler1;
var getOnlineUpgradeHandler2;
function getOnlineUpgradeFlag() {
    $.GetSetData.getData('/w20e/goform/getOnlineUpgrade', function(data) {
        var transData = $.parseJSON(data);
        var status = transData.status;
        switch(status){
            case 0:
                noUpdateInfo = 0;
                getOnlineUpgradeHandler1 = setTimeout(getOnlineUpgradeFlag, 5000);
                break;
            case 1:
                noUpdateInfo = 0;
                break;
            case 2:
            {
                noUpdateInfo = 0;
                onlineUpgradeFlag = true;
                break;
            }
            default:
            {
                if(noUpdateInfo === 5) {
                    break;
                }
                noUpdateInfo += 1;
                getOnlineUpgradeHandler2 = setTimeout(getOnlineUpgradeFlag, 60000);
            }
        }
        if(onlineUpgradeFlag === true) {
            $('[data="sysManage"]').append('<img src="../w20e/common/img/validate-error-icon.png">');
            $('[href="#sysManage/update.html"]').append('<img src="../w20e/common/img/validate-error-icon.png">');
            }  
    });
}

$(function() {
    var checkoutFlag = false;
    $.GetSetData.getData("/w20e/goform/webInit", function(data) {
        var obj = $.parseJSON(data); 
        checkoutFlag = obj.needCheckLogout;
    });
    //云认证开启后，需要隐藏行为管理、Qos、和VLAN模块。
    //后台直接给出需要隐藏的模块
    $.GetSetData.getJson("/w20e/goform/getModuleHideInfo", function(data) {
        hideInfo = data;
        number = data.wanNum;
        window.WAN_NUMBER = data.wanNum || 0;
        if (data.bmHide === true) {
            $(".list-group-item, .menu-group").filter("[data=behavior], #behavior").remove();
        }

        if (data.qosHide === true) {
            $(".list-group-item, .menu-group").filter("[data=qos], #qos").remove();
        }

        //if (data.vlanHide === true) {
        $(".menu-group li:eq(5)").remove();
        //}

        $(".index-main").removeClass("none");
        initFrame();
    });

    $.GetSetData.getJson("/w20e/goform/getAcountType", function(data) {
        if (data.acountType.indexOf("ordinary") != -1) {
            $(".list-group-item, .menu-group").not("[data=sysStatus], #sysStatus").remove();
            defaultPage = '#sysStatus/sysInfo.html';
        }
        $(".index-main").removeClass("none");
        initFrame();
    });

    getOnlineUpgradeFlag();

    $(window).bind('beforeunload',function(){
        if(checkoutFlag === true) {
            $.GetSetData.getData("/w20e/goform/logout");
        }
    });
   
});


var ResetHeight = {
    border: 105,
    innerBorder: 30,
    frameId: 'embedFrame',
    initHeight: function() {
        //Debug.log('resize start');
        top.document.getElementById(ResetHeight.frameId).style.visibility = 'hidden';
        setTimeout(function() {
            var height = ResetHeight.computeHeight();
            top.document.getElementById(ResetHeight.frameId).style.height = height + 'px';
            top.document.getElementById(ResetHeight.frameId).style.visibility = 'visible';
            //Debug.log('resize end');
        }, 500);
        $("#helpBtn").show();
    },
    resetHeight: (function() {
        var reset = function() {
            var scrollTop = $(window).scrollTop(),
            height = ResetHeight.computeHeight();
            document.getElementById(ResetHeight.frameId).style.height = height + 'px';
            document.getElementById(ResetHeight.frameId).style.visibility = 'visible';
            $(window).scrollTop(scrollTop);
        };
        return function(delayTime) {
            setTimeout(reset, delayTime*1.2);
        }
    })(),
    clearHeight: function() {
        top.document.getElementById(ResetHeight.frameId).style.height = 'auto';
    },
    computeHeight: function(frameBody) {
        frameBody = frameBody || window.frames[0].document.body;
        ResetHeight.clearHeight();
        return Math.max(document.body.clientHeight - ResetHeight.border, document.body.scrollHeight - ResetHeight.border, frameBody.clientHeight + ResetHeight.innerBorder, frameBody.scrollHeight + ResetHeight.innerBorder);

    }
}

var Progress = function (url, timeout, progressdialog, text, callback, dispatchtime) {
    this.url = url || "";
    this.timeOut = timeout || 500;
    this.progressDialog = progressdialog || document.getElementById("progress-dialog");
    this.progressDialogBar = $(this.progressDialog).find(".progress-bar")[0];
    this.progressDialogP = this.progressDialog.getElementsByTagName("p")[0];
    this.Text = text || this.progressDialogP.innerHTML;
    this.callback = callback;
    this.dispatchTime = dispatchtime || 100;
    this.timeHandler = 0;

    this.process = function (i) {
        start = i || 0;
        var url = this.url;
        if (start > this.dispatchTime) {
            if (typeof this.callback == "function") {
                this.callback.apply(this, arguments);
            }
        }
        if (start > 100) {
            if (url !== "") {
                window.setTimeout(function () { //防止过早跳转
                    window.location.href = url;
                }, 1000);
            }
            return;
        }
        this.progressDialogBar.style.width = i + "%";
        var _this = this;
        ++i;
        this.timeHandler = setTimeout(function () {
            _this.process(i);
        }, this.timeOut);
    };
};


Progress.prototype = {
    bind: function (ele) {
        this.progressDialog = ele;
        this.progressDialogBar = $(ele.getElementById).find("#progress-bar")[0];
        this.progressDialogP = ele.getElementsByTagName("p")[0];
        return this;
    },
    center: function () {
        var ele = $(this.progressDialog).find(".modal-dialog")[0];
        var height = ($(window).height() - ele.clientHeight * 3) / 2;
        ele.style.top = height + "px";
        return this;
    },
    hide: function (ele) {
        ele = ele || this.progressDialog;
        ele.style.display = "none";
        this.progressDialogBar.style.width = 0 + "%";
        return this;
    },
    show: function (pos) {
        var ele = ele || this.progressDialog;
        ele.style.display = "block";
        if (typeof pos != "undefined" && pos == "center") {
            this.center();
        }
        return this;
    },
    setUrl: function (url) {
        this.url = url;
        return this;
    },
    setText: function (text) {
        this.Text = text;
        this.progressDialogP.innerHTML = this.Text;
        return this;
    },
    setTimeout: function (timeout) {
        this.timeOut = timeout || 500;
        return this;
    },
    start: function () {
        /*进度条开始时清除所有公共定时器*/
        clearTimeout(getOnlineUpgradeHandler1);
        clearTimeout(getOnlineUpgradeHandler2);
        this.setText(this.Text);
        this.process(0);
        return this;
    },
    setCallback: function (fun) {
        this.callback = fun;
    },
    setPercent: function(percent) {
        this.process(percent);
        clearTimeout(this.timeHandler);
        return this;
    }
};


//nav event
setTimeout(function() {
    $(".aside-left").addClass("aside-left-transition");
}, 1000);

$(".navbar-toggle").on("click", toggleNav);
$(document).on("click", function(e) {
    if (!$(e.target).hasClass("aside-left") && 
        $(e.target).parents(".aside-left").length == 0 &&
        !$(e.target).hasClass("navbar-toggle") && 
        $(e.target).parents(".navbar-toggle").length == 0) {
        $("body").removeClass("nav-show");
    }
});


function toggleNav() {
    if ($("body").hasClass("nav-show")) {
        $("body").removeClass("nav-show");
    } else {
        $("body").addClass("nav-show"); //new IScroll(".aside-left",{});
    }
}

function one(method, context) {//一段时间内只执行一次
    if (method.run)return;
    clearTimeout(method.tId);
    method.tId = setTimeout(function() {
        method.call(context);
        method.run = true;
        setTimeout(function() {
            method.run = false;
        }, 300);
    }, 200);
}

$(window).on('resize', function(e) {
    Debug.log(e);
    one(ResetHeight.resetHeight);
});
