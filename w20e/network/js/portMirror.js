(function(window,$) {
    var G_data;
    var Msg = {
        "true":"1",
        "false":"0"
    };
    function handler(res) {
        var i,len;
        var portStr = res.portMirrorMirroredPorts;
        var portArray = [];
        G_data = res;
        if(res.portMirrorEn === true) {
            $('#detail').removeClass('none');
        } else if(res.portMirrorEn === false) {
            $('#detail').addClass('none');
        }
        portArray = portStr.split(',');
        for(i = 0, len = portStr.length ; i < len; i++) {
            if(portArray[i] == "1") {
                $('#portMirrorMirroredPorts'+i).prop("checked",true);
            } else if(portArray[i] == "0") {
                $('#portMirrorMirroredPorts'+i).prop("checked",false);
            }
        }
        return res;
    }

    function beforeSubmitHandler(res) {
        if($("[name=portMirrorEn]:checked").val() === "true") {
            for(var i = 0; i < 4; i++) {
                if(res["portMirrorMirroredPorts" + i] === "true") {
                    break;
                }
            }
            if(i === 4) {
                showMsg(_("未选中任何被镜像端口。"));
                return false;
            }
        }
        
        var portArray = [];
        portArray[0] = Msg[res.portMirrorMirroredPorts0];
        portArray[1] = Msg[res.portMirrorMirroredPorts1];
        portArray[2] = Msg[res.portMirrorMirroredPorts2];
        portArray[3] = Msg[res.portMirrorMirroredPorts3];
        delete res.portMirrorMirroredPorts0;
        delete res.portMirrorMirroredPorts1;
        delete res.portMirrorMirroredPorts2;
        delete res.portMirrorMirroredPorts3;
        res.portMirrorMirroredPorts = portArray.join(',');

        showSaveMsg(_("请稍候..."));
        return res;
    }

    var portMirrorView = new R.View('#portMirrorContainer', {
        fetchUrl: '/w20e/goform/getPortMirror',
        submitUrl:'/w20e/goform/setPortMirror',
        updateCallback: handler,
        beforeSubmit:beforeSubmitHandler,
        afterSubmit: function() {
            showSaveMsg(_("保存成功！"), 1000);
        },
        events: {
            '#commitBtn, click': function() {
                portMirrorView.submit();
            },
            '#switch, click, input': function() {
                if (this.value === 'true') {
                    $('#detail').slideDown(200);
                } else if (this.value === 'false') {
                    $('#detail').slideUp(200);
                }
                top.ResetHeight.resetHeight(200);
            },
            '#cancelBtn, click': function() {
                if(G_data.portMirrorEn === true) {
                    $('#detail').slideDown(200);
                } else if(G_data.portMirrorEn === false) {
                    $('#detail').slideUp(200);
                }
                portMirrorView.update();
            }
        }
    });
}(window,$))