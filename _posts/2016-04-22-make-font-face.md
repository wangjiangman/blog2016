---
layout: post
title:  "如何制作icon-font"
date:  2016-04-22
categories: HTMLCSS
---

- 目录
{:toc}

制作背景
-------------

公司某项目需要最大限度减少前端图片占用内存量（PC端+手机端图片占用总大小<80kb），常用的压缩图片方式不能完全达到要求，尤其是手机端如果采用常用的png格式图片，为了兼容分辨越来越高的现代移动设备（iphone 6s plus 1920×1080），设计师设计的图片必须保证图片像素点比较高才能显示清楚，高像素点也意味着图片很大。

Icon-font的优点
------------

> - 纯色图片改成icon-font图标字体可以像操作文字那样操作图片
> - 基于SVG图片，放大后图片不失真
> - 占用空间小，制作成font-face字体后一个图标平均占用内存仅有2kb左右（若无需兼容ios4.1-则一张图片占用的空间<1kb）

Icon-font的缺点
------------
> - 制作成本大。设计师设计SVG图标，转换成字体库过程相对麻烦
> - 仅试用于纯色图片，色彩丰富的图片不可使用
> - 使用图片字体时，定位图片比较麻烦，会较多用到绝对定位等，对工程师是个考验

制作Icon-font的输入和输出
------------
> - 我们的输入：设计师制作好的SVG图标，
> - 我们的输出：兼容所有浏览器的字库文件（.ttf  .eot  .svg  .woff）后面会介绍使用字库文件的方法。


制作方法
-----------
本人尝试过的icon-font大致有三类制作方法。

#### 1、在线icon-font生成器
如icomoon.io比如icomoon.io（https://icomoon.io/app/#/select）或fontello（http://fontello.com）

> **Note:**

> - 两种在线生成器都有常用的图标可供勾选，可选择自己需要的图标使用。免费的在线图标编辑器只适合小批量快速的图标编辑。

#### 2、使用工具生成 .ttf格式字体文件后再用Font Squirrel网站提供的Webfont生成器生成字体包

> - 工具有**Glyphs**（仅适用于Mac且为付费的）
> - **Fontographer** 正版也需要付费，绿色版目前尚未试验成功。

使用工具导出icon字体文件后，可以使用Font Squirrel网站提供的Webfont生成器（http://www.fontsquirrel.com/tools/webfont-generator）上传由工具导出的.ttf格式字体，然后选择默认的Optimal选项，最后“Download Your Kit”，生成器就会默认生成包括.eot、svg、ttf、woff、 stylesheet、css及Demo页面的文件。不过icon-font字体有时无法正常在它生成的Demo页面正常预览到。这个Font Squirrel的字体生成器会更加适合英文字体的生成和排版效果预览。

#### 3、使用NodeJS插件
具体查看Github仓库，里面有完整的使用介绍。
https://github.com/wangjiangman/font-carrier
该插件主要有两大功能：
1、根据已有的SVG图片创建新的图标字体库；
2、从其它已有的ttf字体库中导入图标字体到目标图标字体库。

##### 图标字体的使用：

    //CSS样式：
    @font-face {
        font-family: 'iconfont';
        src: url('a9icon.eot'); /* IE9*/
        src: url('a9icon.eot?#iefix') format('embedded-opentype'), /* IE6-IE8 */
        url('a9icon.woff') format('woff'), /* chrome、firefox */
        url('a9icon.ttf') format('truetype'), /* chrome、firefox、opera、Safari, Android, iOS 4.2+*/
        url('a9icon.svg#iconfont') format('svg'); /* iOS 4.1- */
    }

    .reboot:before {
        font-family: "iconfont";
        content: "\e001";
        font-size: 30px;
        font-style: normal;
        color: #008B12;
    }

    //html
    <p class="reboot">重新启动</p>


