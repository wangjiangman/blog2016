---
layout: post
title:  "jekyll本地调试环境搭建"
date:  2016-05-07
categories: Tools
---

- 目录
{:toc}

背景
------------

* 使用jekyll在github上建立个人博客有段时间了，为了减少向github服务器上传代码的次数，决定在本地搭建调试服务器。

安装ruby
------------

1、下载地址：[http://rubyinstaller.org/downloads](http://rubyinstaller.org/downloads) (安装了最新版本)
<br />
2、安装过程中可以勾选加入本地path环境变量中，也可以安装后自行设置环境变量
<br />
3、安装到D: \Ruby23

安装ruby dev-kit
------------

1、下载地址同[ruby下载地址](http://rubyinstaller.org/downloads) **注意版本要与ruby版本对应**
<br />
2、安装到D:\rubydevkit
<pre><code>cd D:\rubydevkit
ruby dk.rb init
ruby dk.rb install
</code></pre>
3、**ruby dk.rb init**会创建一个config.yml文件，请在文件内部配置好ruby安装目录。
<pre><code># Example:
#
# ---
# - C:/ruby19trunk
# - C:/ruby192dev
#
---
- D:/Ruby23
</code></pre>
4、更改gem镜像到 taobao网，可以改善国内Ruby安装的速度
<pre><code>gem sources --remove https://rubygems.org/
gem sources -a https://ruby.taobao.org/
gem sources -l         #查看是否只有taobao镜像
gem update --system    #更新RubyGems软件
</code></pre>
可能会不稳定，所以我仍然用默认的gem镜像
<pre><code>D:\rubydevkit>gem sources
*** CURRENT SOURCES ***

http://rubygems.org/

</code></pre>

安装jekyll
------------

<pre><code>gem install jekyll
</code></pre>

博客本地跑起来
------------

<pre><code>jekyll server
</code></pre>

