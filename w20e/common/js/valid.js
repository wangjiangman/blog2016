(function(window) {
    //注：该方法不要与jquery挂载
    var Valid = {
        /**
         * IP转化为整数
         * @param  {[type]} ip [IP]
         * @return {[type]}    [整数]
         */
        IPToInt: function(ip) {
            var arr = ip.split('.'),
                num = +arr[3] + +arr[2] * (1 << 8) + +arr[1] * (1 << 16) + +arr[0] * (1 << 24);
            return num;
        },

        /**
         * 检测是否包含全角字符
         * @param  {[type]} str [待检测字符串]
         * @return {[type]}     [true：包含全角字符 false:不包含]
         */
        chkHalf: function(str) {
            for (var i = 0; i < str.length; i++) {
                strCode = str.charCodeAt(i);
                if ((strCode > 65248) || (strCode == 12288)) {
                    return true;
                    break;
                }
            }
            return false;
        },
        /**
         * 方法拓展
         * @param  {[type]} name [方法名]
         * @param  {[type]} func [方法功能]
         * @return {[type]}      [R.Valid]
         */
        extend: function(name, func) {
            if (Valid[name]) {
                throw new Error('R.Valid.' + name + ' has already exists!');
                return;
            } else if (typeof func !== 'function') {
                throw new Error('the second args is not a function');
                return;
            } else {
                Valid[name] = func;
            }
            return Valid;
        },
        /**
         * 检测是否在统一网段
         * @param  {[type]} name [方法名]
         * @param  {[type]} func [方法功能]
         * @return {[type]}      [R.Valid]
         */
        /**
         * 检测是否在统一网段
         * @param  {String}  ip_lan   [description]
         * @param  {String}  ip_wan   [description]
         * @param  {String}  mask_lan [description]
         * @param  {String}  mask_wan [description]
         * @return {Boolean}          [true在同一网段]
         */
        isSameNet: function(ip_lan, ip_wan, mask_lan, mask_wan) {
            if((ip_lan=="") || (ip_wan=="") || (mask_lan=="") || (mask_wan=="")) {
                return false;
            }
            var ip1Arr = ip_lan.split("."),
                ip2Arr = ip_wan.split("."),
                maskArr1 = mask_lan.split("."),
                mask_wan = mask_wan || mask_lan,
                maskArr2 = mask_wan.split("."),
                i;

            for (i = 0; i < 4; i++) {
                if (((ip1Arr[i] & maskArr1[i]) !== (ip2Arr[i] & maskArr1[i])) && ((ip1Arr[i] & maskArr2[i]) !== (ip2Arr[i] & maskArr2[i]))){
                    return false;
                }
            }
            return true;
        },
        /**
         * 检测IP段与已有IP段组是否有重复
         * @param  {array} ip_arr     [IP段组]
         * @param  {string} ip_segment [IP段]
         * @param  {string} splitter   [IP段分隔符]
         * @return {string}            [错误信息]
         */
        ipIntersection: function(ip_arr, ip_segment, splitter) {
            var len = ip_arr.length,
                splitter = splitter || '-',
                start_ip = this.IPToInt(ip_segment.split(splitter)[0]),
                end_ip = this.IPToInt(ip_segment.split(splitter)[1]),
                start_temp = 0,
                end_temp = 0;
            for (var i = 0; i < len; i++) {
                start_temp = this.IPToInt(ip_arr[i].split(splitter)[0]);
                end_temp = this.IPToInt(ip_arr[i].split(splitter)[1]);

                if(start_ip > end_temp || end_ip < start_temp) {

                } else {
                    return '此IP段与已经存在的IP段：' + ip_arr[i] + '有重复部分';
                }
            }

            return;
        }
    }
    window.R = window.R || {};
    window.R.Valid = R.Valid || Valid;
}(window));
