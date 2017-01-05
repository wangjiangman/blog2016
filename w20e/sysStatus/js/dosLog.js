(function(window,$) {

    var G_data;
    var pieColor = ["#99CCFF", "#FFCC00", "#99CC33", "#FF9900","#669999", "#CC9999"];
    var dosLog = new TablePage($("#dosInfo table"));

    function transPercent(data) {
        var percent = (data*100/G_data.attackTotalCount).toFixed(1);
        return percent;
    }

    $.GetSetData.getData('/w20e/goform/getProtecAttacktLog', function(res) {
        G_data = $.parseJSON(res);
        dosLog.data = G_data.attackList;
        var len = dosLog.data.length;

        for(var i = 0; i < len; i++) {
            dosLog.data[i] = $.extend(true, {dosIndex: (i + 1)}, dosLog.data[i]);
        }
        dosLog.init();

        if(len === 0) {
            $(".container").hide();
            return false;
        }

        /****************************Pie Chart *****************************/
        var piectx = document.getElementById("dosPieChart").getContext("2d");
        var topTotalCount = 0;
        var totalPercent = 0;
        var piedata = [];
        var templateStr = '<ul class="legend">';

        for(var j = 0; j < G_data.attackTopUserInfo.length; j++) {
            topTotalCount += parseInt(G_data.attackTopUserInfo[j].attackCount);
            totalPercent += parseFloat(transPercent(G_data.attackTopUserInfo[j].attackCount));
            templateStr += '<li><span style="color:' + pieColor[j] + '"><big>' + G_data.attackTopUserInfo[j].attackIP + ': (' + transPercent(G_data.attackTopUserInfo[j].attackCount) + '%)</big></span></li>'
            piedata.push({
                value: G_data.attackTopUserInfo[j].attackCount, 
                color: pieColor[j],
                label: G_data.attackTopUserInfo[j].attackIP
            });
        }

        if((G_data.attackTotalCount - topTotalCount) > 0) {
            piedata.push({value: (G_data.attackTotalCount - topTotalCount), 
                color: pieColor[j],
                label: "Others"
            });
        }

        if(((G_data.attackTotalCount - topTotalCount) == 0) && (G_data.attackTopUserInfo.length === 1)) {
            piedata.push({value: (G_data.attackTotalCount - topTotalCount), 
                color: pieColor[j-1],
                label: "Others"
            });
        }
        
        var otherPercent = ((100 - totalPercent) >= 0) ? ((100 - totalPercent).toFixed(1)) : "0.0";
        templateStr += '<li><span style="color:' + pieColor[j] + '"><big>Others: (' + otherPercent + '%)</big></span></li></ul>';
        
        var myPieChart = new Chart(piectx).Pie(piedata, {
            legendTemplate: templateStr,
            animation: false,
            segmentShowStroke : false
        });
        $("#showList").html(myPieChart.generateLegend());
        myPieChart.update();
        /****************************Pie Chart End******************************/

        return res;
    });

}(window,$))