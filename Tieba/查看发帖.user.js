// ==UserScript==
// @name        查看发帖
// @namespace   firefox
// @include     http://tieba.baidu.com/home/*
// @version     1
// @run-at 		document-start
// @require 	http://code.jquery.com/jquery-latest.min.js
// @grant 		none
// ==/UserScript==
//自动去除访问记录加一个查看发贴记录链接
(function(){
	var dflag = false,aflag = false, b = null, un = null;
	var i = setInterval(function(){
		b = $(".del_card_btn");
		if(b && b.length > 0){
			b.click();
			$(".dialogJ").hide();
			$(".dialogJbtn").click();
			flag = $(".del_card_btn").length < 1 ? true : false;
		}
		un = $('.userinfo_username ');
		if(un.length > 0 && !aflag){
			if(un)$('.userinfo_middle .userinfo_title').append('<a style="margin-left: 10px;text-decoration: none!important;cursor: pointer;color:#FF6600;" href="http://www.tieba.com/f/search/ures?ie=utf-8&kw=&qw=&rn=100&un='+ encodeURIComponent(un.text()) + '&sm=1"" target="_blank">发言记录</a>')
			aflag = true;
		}
		if(b.length < 0 && flag && aflag){
			clearInterval(i);
		}
	},100);
})();