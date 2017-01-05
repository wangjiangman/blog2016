/**
 * 单机网页版扫雷游戏
 * Author: Wangjiangman
 */
(function() {
    var G_visible_num = 0;
    //周围无雷节点保存在该数组
    var blankArray = [];
    //点击的无雷节点若周围还有无雷节点保存在该数组等待轮训
    var toCheckList = [];
    var size = parseInt(location.search.substr(1, location.search.length));
    var config = {
        size: size,
        mineNum: 6
    };

    fillMine();
    initEvent();

    function fillMine() {
        // 初始化数据 0:无雷 1:有雷
        function createRawData() {
            var rawData = [];
            if(config.size == 9) {
                rawData = [
                    [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0]
                ];
            } else {
                rawData = [
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
                ];
                $("#checkPoint1").addClass("none");
                $("#checkPoint2").removeClass("none");
            }

            return rawData;
        }

        function getRandomPositon(arr) {
            var i = config.mineNum;
            while (i > 0) {
                var x = Math.floor(Math.random() * config.size);
                var y = Math.floor(Math.random() * config.size);
                if (arr[x][y] == 0) {
                    arr[x][y] = config.size;
                    i--;
                } else {
                    continue;
                }
            }
            return arr;
        }
        var newData = getRandomPositon(createRawData());
        /*var newData = [
            [4, 4, 0, 0],
            [0, 0, 0, 4],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ];*/
        function initMap(arr) {
            for (var i = 0; i < arr.length; i++) {
                for (var j = 0; j < arr[i].length; j++) {
                    if (arr[i][j] >= config.size) {
                        if (i - 1 >= 0) {
                            if (j - 1 >= 0) {
                                // 上左
                                arr[i - 1][j - 1]++;
                            }
                            // 上
                            arr[i - 1][j]++;
                            // 上右
                            if (j + 1 < arr.length) {
                                arr[i - 1][j + 1]++;
                            }
                        }
                        if (i + 1 < arr.length) {
                            // 下左
                            if (j - 1 >= 0) {
                                arr[i + 1][j - 1]++;
                            }
                            // 下
                            arr[i + 1][j]++;
                            // 下右
                            if (j + 1 < arr.length) {
                                arr[i + 1][j + 1]++;
                            }
                        }
                        // 左
                        if (j - 1 >= 0) {
                            arr[i][j - 1]++;
                        }
                        // 右
                        if (j + 1 < arr.length) {
                            arr[i][j + 1]++;
                        }
                    }
                }
            }
            return arr;
        }
        var mapArray = initMap(newData);
        //将数组的值映射到DOM上
        function initView(arr) {
            for (var col = 0; col < config.size; col++) {
                for (var row = 0; row < config.size; row++) {
                    if (arr[col][row] >= config.size) {
                        // fill mine
                        $('table:visible').find('tr').eq(col).find('td').eq(row).addClass("mine").attr("data-bind", "*").attr("data-x", col).attr("data-y", row);
                    } else {
                        // fill number
                        $('table:visible').find('tr').eq(col).find('td').eq(row).addClass("num").attr("data-bind", arr[col][row]).attr("data-x", col).attr("data-y", row);
                    }
                }
            }
        }
        initView(mapArray);
    }

    function addToCheckList(ele) {
        if (ele.attr("data-bind") == "0") {
            toCheckList.push(ele);
            ele.attr("data-bind", "-1");
        }
    }
    // mark blank area
    function markBlank(ele) {
        var x = parseInt(ele.attr("data-x"));
        var y = parseInt(ele.attr("data-y"));
        var nextObj;
        blankArray.push(ele);
        ele.attr("data-bind", "-1");
        if (x - 1 >= 0) {
            if (y - 1 >= 0) {
                // 上左
                addToCheckList(ele.parent("tr").prev($("tr")).find("td").eq(y - 1));
            }
            // 上
            addToCheckList(ele.parent("tr").prev($("tr")).find("td").eq(y));
            if (y + 1 < config.size) {
                // 上右
                addToCheckList(ele.parent("tr").prev($("tr")).find("td").eq(y + 1));
            }
        }
        if (x + 1 < config.size) {
            if (y - 1 >= 0) {
                // 下左
                addToCheckList(ele.parent("tr").next($("tr")).find("td").eq(y - 1));
            }
            // 下
            addToCheckList(ele.parent("tr").next($("tr")).find("td").eq(y));
            if (y + 1 < config.size) {
                // 下右
                addToCheckList(ele.parent("tr").next($("tr")).find("td").eq(y + 1));
            }
        }
        if (y - 1 >= 0) {
            // 左
            addToCheckList(ele.parent("tr").find("td").eq(y - 1));
        }
        if (y + 1 < config.size) {
            // 右
            addToCheckList(ele.parent("tr").find("td").eq(y + 1));
        }
        if (toCheckList.length == 0) {
            return;
        }
        arguments.callee(toCheckList.pop());
    }

    function initEvent() {
        $(".num").on("click", function() {
            var bindData = parseInt($(this).attr("data-bind"), 10);
            if (bindData > 0) {
                $(this).html(bindData);
                G_visible_num++;
            } else if (bindData == 0) {
                markBlank($(this));
                G_visible_num += blankArray.length;
                for (var i = 0; i < blankArray.length; i++) {
                    blankArray[i].css("background-color", "rgb(228, 161, 39)");
                }
                // clear blank array
                blankArray = [];
            }

            if (G_visible_num == config.size * config.size - config.mineNum) {
                $("#wrap .mine").each(function() {
                    $(this).html($(this).attr("data-bind"));
                });
                if (confirm("Congratulations! You Win!")) {
                    window.location.href = "./index.html";
                }
            }
        });
        $(".mine").on("click", function() {
            $("#wrap .mine").each(function() {
                $(this).html($(this).attr("data-bind"));
            });
            if (confirm("Bomb! Game over!")) {
                window.location.href = "./index.html";
            }
        })
    }
})();