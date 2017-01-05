var Define = {
    product: 'TENDA'
};


var mainPageRegx;
if (Define.product == 'TENDA') {
    mainPageRegx = new RegExp('^\\\/(index|login)\\\/?(.*(html|tpl|asp))', 'i');
} else {
    mainPageRegx = new RegExp('^\\\/(index|login-ipcom)\\\/?(.*(html|tpl|asp))', 'i');
}

/**
 * 使用时间戳,如果使用的md5则时间戳会失效
 * 可以有效规避因缓存带来的问题
 */
var now = new Date();
fis.config.set('timestamp', [now.getFullYear(), now.getMonth() + 1, now.getDate(), now.getHours(), now.getMinutes(), now.getSeconds()].join(''));


// default settings. fis3 release
fis
    .match('**', {
        useHash: false
    })
    // 启用 fis-spriter-csssprites 插件
    .match('::package', {
         spriter: fis.plugin('csssprites')
    })
    // 对 CSS 进行图片合并
    .match('**.css', {
        // 给匹配到的文件分配属性 `useSprite`
        useSprite: true,
        margin: 20
    })
    .match('**.{html,asp,tpl,htm}', {
        parser: fis.plugin('art-template', {
            native: false,
            define: {
                product: Define.product
            }
        })
    })
    .match('**.{js,css,scss}', {
        query: '?t=${timestamp}'
    })
    .match('**.tpl', {
        rExt: 'html'
    })
    .match(mainPageRegx, {
        release: '/$2'
    })
    .match('webpage_showpic.asp', {
        release: '/$0'
    })
    .match('preTimeout.asp', {
        release: '/$0'
    })
    .match('timeout.asp', {
        release: '/$0'
    })
    .match('goform/(*).html', {
        release: 'goform/$1/index.html'
    })
    .match('**.scss', {
        parser: fis.plugin('sass', {
            sourceMap: true,
            //outputStyle: 'expanded',
        }),
        rExt: 'css'
    })
    .match('**/_*.scss', {
        release: false
    })
    .match('**/tpl/**', {
        release: false
    })

    .match('bootstrap/bootstrap.{scss,css}', {
        release: '/w20e/common/css/bootstrap.css'
    })

    .match('conmmon/css/*.{scss,css}', {
        release: 'common/css/reasy-ui.css'
    })
    .match('fis*', {
        release: false
    })
    .match('lang/**.json', {
        release: '$&'
    }, true)
    .match('**.json', {
        release: false
    })



// fis3 release production
fis
    .media('TENDA')

    /*.match('*.js', {
        optimizer: fis.plugin('uglify-js')
    })*/

    /*.match('*.{css,scss}', {
        optimizer: fis.plugin('clean-css')
    })*/

    .match('*.png', {
            optimizer: fis.plugin('png-compressor')
    })
    .match('{index/theme.tpl,test/**,test/**}', {
        release: false
    })
