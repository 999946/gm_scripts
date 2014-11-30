// ==UserScript==
// @name 		千树贴吧工具
// @namespace 	firefox
// @include 	http://tieba.baidu.com/*
// @version 	1
// @run-at 		document-start
// @require 	http://code.jquery.com/jquery-latest.min.js
// @grant 		GM_xmlhttpRequest
// ==/UserScript==
/**
功能：坟贴提示、黑名单、查看用户隐藏动态、查看网盘、相册、去除访客记录
**/
//坟贴设置
var ovSet = {
	days : 30,//超过多少天提示
	hide : 2//-1表示不自动隐藏提示,0 点击隐藏, >0 数值表示时间(秒)
};
//黑名单设置
var hateUserArray = ['讨厌鬼','贱人','渣渣'];

//========================以下部分不需要改动=============================//
//用户个人中心自动去除访问记录加一个查看发帖记录链接
window.location.href.indexOf('http://tieba.baidu.com/home') != -1 && (function () {
	var dflag = false, aflag = false, b = null, un = null;
	var i = setInterval(function () {
			b = $(".del_card_btn");
			if(b && b.length > 0) {
				//jquery 有问题
				document.querySelector('.j_del_card_btn').click();
				$(".dialogJ").hide();
				$(".dialogJbtn").click();
				flag = $(".del_card_btn").length < 1 ? true : false;
			}
			un = $('.userinfo_username ');
			if(un.length > 0 && !aflag) {
				$('.userinfo_middle .userinfo_title').append('<a style="margin-left: 10px;text-decoration: none!important;cursor: pointer;color:#FF6600;" href="http://www.tieba.com/f/search/ures?ie=utf-8&kw=&qw=&rn=100&un=' + encodeURIComponent(un.text()) + '&sm=1"" target="_blank">发言记录</a>')
				aflag = true;
			}
			if(b.length < 0 && flag && aflag) {
				clearInterval(i);
			}
		}, 100);
})();
//用户卡片添加查看发帖记录、查看网盘、相册
$(document).ready(function(){
	var load = false, firstPost = null;
	document.addEventListener('DOMNodeInserted',function(e){
		if(!load){
			(function(){
				if(window.location.href.indexOf('http://tieba.baidu.com/p') != -1){
					firstPost = $('#j_p_postlist .l_post:first-child');
					if(firstPost && firstPost.length > 0){
						load = true;
						overdue($.parseJSON(firstPost.attr('data-field')).content.date);
					}
				}else{
					load = true;
				}
			})();
		}
		if(e.target.className == 'card_headinfo_wrap'){
			//查看发帖记录
			var sp = $('.card_userinfo_num .userinfo_split + span').css({ color: 'red',cursor:'default'});
			sp.click(function(){
				var name = encodeURIComponent($.parseJSON($('#user_visit_card').attr('data-field')).un);
				window.open('http://www.tieba.com/f/search/ures?ie=utf-8&kw=&qw=&rn=100&un=' + name + '&sm=1', '_blank');
			});
			//查看网盘 相册
			$('.card_userinfo_title').append('<div id="panOrAlbum"><span>(盘)</span><span>(册)</span></div>');
			$('#panOrAlbum span').click(function(){
				var name = encodeURIComponent(JSON.parse($('#user_visit_card').attr('data-field')).un);
				var url = ($(this).text() == '(盘)'?'http://yun.baidu.com/share/home?uk=':'http://xiangce.baidu.com/u/');
				GM_xmlhttpRequest({
					method:'GET',
					url:'http://pan.baidu.com/inbox/friend/queryuser?query_uname={"' + name + '":0}',
					onload:function(data){
						var json = $.parseJSON(data.responseText);
						var uk = json.user_list[0].uk;
						window.open(url + uk , '_blank');
					}
				});
			}).css({ color: 'red',cursor:'default','font-size':12})
		};
	},false);
	myctrl();
});
//坟贴提示
function overdue(dateStr){
	var dateArr = dateStr.split(' ');
	var date = null;
	if(dateArr.length == 2) {
		var yymmdd = dateArr[0].split('-');
		if (yymmdd.length === 3) {
			date = new Date(yymmdd[0], yymmdd[1] - 1, yymmdd[2], 00, 00, 00);
		}
	}
	var days = Math.abs(Math.floor((new Date().getTime()-date.getTime())/1000/3600/24));
	if(days > ovSet.days){
		$('body').append('<span id="overdue_message">该贴发表了' + days + '天了，回贴请慎重！</span>');
		var msg = $('#overdue_message');
		msg.css({'line-height':'100px',width:'100%',height:'100px',position:'fixed',left:0, top:'40%',background:'rgba(255, 119, 119, .3)','text-align':'center',color:'red','font-size':'28px'});
		ovSet.hide > 0 ? setTimeout(function(){msg.hide()},ovSet.hide*1000):ovSet.hide == 0 && msg.click(function(){$(this).hide()});
	}
}
// Hate
(function () {
	if(readHate().list.length > 0){
		hateUsers(readHate().list, 10);
	}
	function hateUser(user, callback, retryNo) {
		var data = {type : 1,hide_un : user,ie : 'utf-8'};
		$.ajax({
			url : "/tphide/add",
			headers : {
				'Accept':'application/json, text/javascript, */*; q=0.01',
				'Content-Length':data.length
			},
			data : data,
			type : "post",
			dataType : "json",
			success : callback
		});
		//$.post("/tphide/add", data, callback, 'json');
	}
	function persHate(users){
		localStorage.hateUser = JSON.stringify({
			'date':today(),
			'list':$.grep(users, function(n,i){
			  return n != undefined;
			})
		});
	}
	function readHate(){
		var hateUser = localStorage.hateUser==undefined ||
			localStorage.hateUser=="undefined" ||
			localStorage.hateUser=="null" ? localHateUser = {
			'date':today(),
			'list':hateUserArray
		} : JSON.parse(localStorage.hateUser);
		if(hateUser.date != today()){
			hateUser.list = hateUserArray;
		}
		return hateUser;
	}
	function hateUsers(users, retryNo) {
		$.each(users, function (i, n) {
			n != undefined && hateUser(n, function (re) {
				try {
					if (0 == re.no) {
						console.log('移除讨厌鬼' + n + '成功')
						delete users[users.indexOf(n)];
					}
					persHate(users);
					if (users.indexOf(n) == (users.length - 1)) {
						users = $.grep(users, function (n, i) {
								return n != undefined;
							});
						if(retryNo > 0) hateUsers(users,retryNo - 1)
					}
				} catch (ex) {}
			},retryNo);
		})
	}
})();
function today() {
	var d = new Date();
	d.setHours(0);
	d.setMinutes(0);
	d.setSeconds(0);
	d.setMilliseconds(0);
	return d.getTime();
};