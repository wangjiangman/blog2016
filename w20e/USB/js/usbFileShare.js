(function(window, $) {
    var G_data;
    var addedFlag = false;

    function handlerMappingData(res) {
        G_data = res;

        //show progress
        var usbNum = G_data.usbPartition.length;
        Debug.log("usbNum = " + usbNum);
        if (usbNum === 0) {
            $("#notice").show();
            $("#usbInfo .form-group").each(function() {
                $(this).hide();
            });
        } else {
            $("#notice").hide();
             $("#usbInfo .form-group").each(function() {
                $(this).show();
            });
            if(usbNum > 4) {
                usbNum = 4; //最多允许显示4个USB分区信息
            }
            for (var i = 0; i < usbNum; i += 1) {
                var totalSpace = G_data.usbPartition[i].usbPartitionTotalSpace;
                var freeSpace = G_data.usbPartition[i].usbPartitionFreeSpace;
                var useSpace = totalSpace - freeSpace;
                var usePercentInt = Math.round((useSpace * 100) / totalSpace);
                $('#bar' + (i + 1)).css('width', usePercentInt + "%");
                $('#bar' + (i + 1)).html(usePercentInt + "%");
                $("#usb"+(i+1)).find("label").text(G_data.usbPartition[i].usbPartitionName+"：");
            }

            if (usbNum === 1) {
                $("#usb2").hide();
                $("#usb3").hide();
                $("#usb4").hide();
            } else if(usbNum === 2) {
                $("#usb3").hide();
                $("#usb4").hide();
            }else if(usbNum === 3) {
                $("#usb4").hide();
            }

            if(!addedFlag){//lan IP
                var lanIP = "ftp:\/\/"+G_data.lanIP + ":21" ;
                $('#localAccess').append('<a href="'+lanIP+'" target="_blank" style="color:#333333;text-decoration:underline" class="controls-text">' + lanIP + '</a>&nbsp&nbsp&nbsp或&nbsp&nbsp&nbsp' + '<span style="color:#333333;" class="controls-text">' + '\\\\' + G_data.lanIP + '</span>');
    
                //wan IP
                var netAccessNum = G_data.wanIP.length;
                for (var j = 0; j < netAccessNum; j += 1) {
                    var addr = 'ftp:\/\/' + G_data.wanIP[j].wanIP + ':21';
                    $('#netAccess').append('<a style="color:#333333;text-decoration:underline" href="'+addr+'"  target="_blank" class="controls-text">' + addr + '</a>');
                    if (j !== netAccessNum - 1) {
                        $('#netAccess').append('<br>');
                    }
                }
                addedFlag = true;
            }
        }

        var data = {
            "internetAccessUSBEn": G_data.internetAccessUSBEn,
            "usbPrivilegedUserName": G_data.usbPrivilegedUserName,
            "usbPrivilegedUserPwd": G_data.usbPrivilegedUserPwd,
            "admin": "读写",
            "usbOrdinaryUserName": G_data.usbOrdinaryUserName,
            "usbOrdinaryUserPwd": G_data.usbOrdinaryUserPwd,
            "guest": "只读"
        };

        if(data.internetAccessUSBEn == false) {
            $('#internetAccess').hide();
        }
        return data;
    }

    var usbShareView = new R.View("#usbContainer", {
        fetchUrl: '/w20e/goform/getUSB',
        submitUrl: '/w20e/goform/setUSB',
        updateCallback: handlerMappingData,
        events: {
            '#usbFileSet-save, click': function() {
                showSaveMsg(_("请稍候..."));
                $.GetSetData.setData("/w20e/goform/setUSB",
                    new AutoCollect("#usbContainer").getJson(),
                    function() {
                        showSaveMsg(_("保存成功！"), 1000);
                    });
            },

            '.usb-btn, click': function() {
                showSaveMsg(_("请稍候..."));
                var usbIndex = parseInt($(this).attr("id").charAt($(this).attr("id").length-1));
                $.GetSetData.setData("/w20e/goform/umountUSBPartition", {
                    "usbPartitionName": G_data.usbPartition[usbIndex].usbPartitionName
                }, function() {
                    showSaveMsg(_("弹出成功！"), 1000);
                    setTimeout(function() {
                        usbShareView.update();
                    }, 1000);
                });
            },

            '#usbInfo, click, input': function() {
                if (this.value === 'true') {
                    $('#internetAccess').slideDown(200);
                } else if (this.value === 'false') {
                    $('#internetAccess').slideUp(200);
                }
                top.ResetHeight.resetHeight(200);
            },
            '#usbFileSet-cancel, click': function() {
                if(G_data[0].internetAccessUSBEn === true) {
                    $('#internetAccess').slideDown(200);
                } else if(G_data[0].internetAccessUSBEn === false) {
                    $('#internetAccess').slideUp(200);
                }
                ddnsConfigView.update();
            },
            
            '#usbFileSet-cancel, click': function() {
                usbShareView.initElements();
            }
        }
    });

    setInterval(function() {
        usbShareView.update(false);
    },5000);

}(window, $));
