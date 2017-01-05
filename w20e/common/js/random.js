/**
 * 生成随机数函数
 * @param  {[type]} length [随机数长度]
 * @param  {[type]} float  [是否为float形]
 * @param  {[type]} randomLength  [随机数位数,默认3位]
 * @return {[type]}        [随机数]
 */
function makeRandom(length, float, randomLength) {
    randomLength = randomLength || 3;
    var res = (Date.parse(new Date()) + Math.random() * Math.pow(10, randomLength));  
    if (!!float) {//如果生成浮点
        res = res.toString();    
    } else {
        res = parseInt(res, 10).toString();
    }
    length = length && length < res.length && length > 0? parseInt(length, 10): res.length;
    return res.substr(res.length - length, length)
}