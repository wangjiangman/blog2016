(function(window,$) {


    $('[name="type"]').parent().hide();
    if(top.WAN_NUMBER) {
        $('[name="type"]:lt('+(top.WAN_NUMBER +1)+')').parent().show();
    }

    /****************************List ************************/
    var qosCount = new TablePage($("#qosCountContainer table"));
    update();
    
    function update() {
        $.GetSetData.getData('/w20e/goform/getFlow', function(res) {
            qosCount.data = $.parseJSON(res);
            qosCount.init();
            return res;
        });
    }

    setInterval(update, 3000);
    /****************************List end************************/

    /****************************Line Chart ************************/

    var wan1UpData = [];
    var wan1downData = [];
    var wan2UpData = [];
    var wan2downData = [];
    var wan3UpData = [];
    var wan3downData = [];
    var wan4UpData = [];
    var wan4downData = [];
    var upData = [];
    var downData = [];

    function insertFirstData(data) {
        wan1UpData.unshift(parseFloat(data.wan1FlowUpstream)|| 0);
        wan1downData.unshift(parseFloat(data.wan1FlowDownstream) || 0);
        wan2UpData.unshift(parseFloat(data.wan2FlowUpstream) || 0);
        wan2downData.unshift(parseFloat(data.wan2FlowDownstream) || 0);
        wan3UpData.unshift(parseFloat(data.wan3FlowUpstream) || 0);
        wan3downData.unshift(parseFloat(data.wan3FlowDownstream) || 0);
        wan4UpData.unshift(parseFloat(data.wan4FlowUpstream) || 0);
        wan4downData.unshift(parseFloat(data.wan4FlowDownstream) || 0);
        upData.unshift(parseFloat(data.wan1FlowUpstream || 0) + parseFloat(data.wan2FlowUpstream || 0) + parseFloat(data.wan3FlowUpstream || 0) + parseFloat(data.wan4FlowUpstream || 0));
        downData.unshift(parseFloat(data.wan1FlowDownstream || 0) + parseFloat(data.wan2FlowDownstream || 0) + parseFloat(data.wan3FlowDownstream || 0) + parseFloat(data.wan4FlowDownstream || 0));
    }

    function deletLastData() {
        wan1UpData.pop();
        wan1downData.pop();
        wan2UpData.pop();
        wan2downData.pop();
        wan3UpData.pop();
        wan3downData.pop();
        wan4UpData.pop();
        wan4downData.pop();
        upData.pop();
        downData.pop();
    }

    function updateLineChartData() {
        $.GetSetData.getData('/w20e/goform/getWanFlow', function(res) {
            var data = $.parseJSON(res);
            var type = $("[name='type']:checked").val();
            var data1, 
                data2;

            if(wan1UpData.length === 30) {
                deletLastData();
            }
            insertFirstData(data);

            if(type === "all") {
                data1 = upData;
                data2 = downData;
            } else if (type === "wan1") {
                data1 = wan1UpData;
                data2 = wan1downData;
            } else if(type === "wan2") {
                data1 = wan2UpData;
                data2 = wan2downData;
            }else if(type === "wan3") {
                data1 = wan3UpData;
                data2 = wan3downData;
            }else if(type === "wan4") {
                data1 = wan4UpData;
                data2 = wan4downData;
            }

            var linectx = document.getElementById("qosLineChart").getContext("2d");
            var linedata = {
                labels : ["","","","","","","","","","","","","","","","","","","","","","","","","","","","","",""],
                datasets : [
                    {
                        fillColor : "rgba(243,134,48,0.2)",
                        strokeColor : "rgba(243,134,48,1)",
                        pointColor : "rgba(243,134,48,1)",
                        pointStrokeColor : "#fff",
                        data : data1
                    },
                    {
                        fillColor : "rgba(153,204,204,0.2)",
                        strokeColor : "rgba(153,204,204,1)",
                        pointColor : "rgba(153,204,204,1)",
                        pointStrokeColor : "#fff",
                        data : data2
                    }
                ]
            };
            var myLineChart = new Chart(linectx).Line(linedata, {animation: false, pointDot : false, showTooltips: false, responsive: true});

            return res;
        });
    }

    updateLineChartData();
    setInterval(updateLineChartData, 3000);

    /****************************Line Chart End ********************/

}(window,$))