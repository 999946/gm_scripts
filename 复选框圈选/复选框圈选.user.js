// ==UserScript==
// @name 		复选框圈选
// @namespace 	linxiaolu
// @include 	http://*
// @include 	file://*
// @include     file:///*
// @version 	1.1
// @description:zh-cn  CTRL(Mac 是Command键) + 鼠标左键批量选择 
// @run-at 		document-end
// @grant 		none
// ==/UserScript==
// http://bbs.blueidea.com/thread-2854610-1-1.html
(function () {
	var wrap = document.querySelector("#MultiSelectorWrap"),
	mousewindow = document.querySelector("#mousewindow");
	// nofocus = document.querySelector("#nofocus");
	if (!wrap) {
		wrap = document.createElement("div");
		wrap.id = "wrap";
		wrap.style.cssText = "display:none;background:#000;filter:alpha(opacity=10);opacity:.1;left:0px;top:0px;position:fixed;height:100%;width:100%;overflow:hidden;z-index:999999999;";
		document.body.appendChild(wrap);
		mousewindow = document.createElement("div");
		mousewindow.id = "mousewindow";
		mousewindow.style.cssText = "position:absolute;font-size:0;border:1px dashed #ff6600;display:none;background:#ffffcc;opacity: 0.50;filter:alpha(opacity=50)";
		//nofocus = document.createElement("input");
		// nofocus.id = "nofocus";
		// nofocus.style.cssText = "border:0;width:0;height:0;font-size:0;background:none;overflow:hidden;";
		//mousewindow.appendChild(nofocus);
		document.body.appendChild(mousewindow);
	}
	var isMac = function() {
        return /macintosh|mac os x/i.test(navigator.userAgent);
	}();
	var onKey = function(evt){
		evt = evt || window.event;
		//console.log(evt);
		if ((isMac && evt.keyCode == 224) || (!isMac && evt.ctrlKey)) {
			ctrlKey = !ctrlKey;
		}
	};
	var x,
	y,
	ox,
	oy,
	osl,
	ost,
	sl,
	st,
	cw,
	ch,
	xy = false,
	chk,
	ctrlKey = false;
	document.onkeydown = onKey;
	document.onkeyup = onKey;
	document.onmousedown = function (evt) {
		evt = evt || window.event;
		// console.log(evt);
		// 0 	规定鼠标左键。
		// 1 	规定鼠标中键。
		// 2 	规定鼠标右键。
		// altKey | shiftKey | ctrlKey
		if (evt.button == 0 && ctrlKey == true) {
			ox = evt.pageX;
			oy = evt.pageY;
			osl = document.body.scrollLeft;
			ost = document.body.scrollTop;

			cw = docClientWidth(document);
			ch = docClientHeight(document);
			wrap.setAttribute('z-index', 999999999);

			if (ox <= cw && oy <= ch) {
				xy = true;
				mousewindow.style.left = (parseInt(ox)) + "px";
				mousewindow.style.top = parseInt(oy) + "px";
				chk = document.querySelectorAll('input');
				for (i = 0; i < chk.length; i++) {
					if (chk[i].type == "checkbox") {
						chk[i].chkctrl = 0;
					}
				}
			}
		}
	};
	document.onmousemove = function (evt) {
		evt = evt || window.event;
		if (xy == true) {
			//nofocus.focus();

			x = evt.pageX;
			y = evt.pageY;
			sl = document.body.scrollLeft;
			st = document.body.scrollTop;
			// nofocus.focus();
			mousewindow.style.display = "block";
			wrap.style.display = "block";
			mousewindow.style.width = Math.abs(x - ox) + "px";
			mousewindow.style.height = Math.abs(y - oy) + "px";

			if (x > ox) {
				mousewindow.style.left = ox + "px";
			}
			if (x < ox) {
				mousewindow.style.left = x + "px";
			}
			if (y > oy) {
				mousewindow.style.top = oy + "px";
			}
			if (y < oy) {
				mousewindow.style.top = y + "px";
			}
			minx = parseInt(mousewindow.style.left + "px");
			maxx = minx + parseInt(mousewindow.style.width);
			miny = parseInt(mousewindow.style.top);
			maxy = miny + parseInt(mousewindow.style.height);
			ctrl(minx, maxx, miny, maxy);
		}
	};
	document.onmouseup = function () {
		xy = false;
		mousewindow.style.display = "none";
		wrap.style.display = "none";
		wrap.setAttribute('z-index', -999999999);
		mousewindow.style.width = 0;
		mousewindow.style.height = 0;
	};

	function ctrl(minx, maxx, miny, maxy) {
		chk = document.querySelectorAll('input');
		for (i = 0; i < chk.length; i++) {
			var obj = chk[i];
			var mmx = obj.offsetLeft;
			var mmy = obj.offsetTop;
			while (obj = obj.offsetParent) {
				mmx += obj.offsetLeft;
				mmy += obj.offsetTop;
			}
			if (mmx >= minx && mmx <= maxx && mmy >= miny && mmy <= maxy) {
				if (chk[i].chkctrl == "0" && chk[i].checked == false) {
					chk[i].checked = true;
					chk[i].chkctrl = 1;
				}
				if (chk[i].chkctrl == "0" && chk[i].checked == true) {
					chk[i].checked = false;
					chk[i].chkctrl = -1;
				}
			} else {
				if (chk[i].checked == true && chk[i].chkctrl != 0) {
					chk[i].checked = false;
					chk[i].chkctrl = 0;
				}
				if (chk[i].checked == false && chk[i].chkctrl != 0) {
					chk[i].checked = true;
					chk[i].chkctrl = 0;
				}
			}
		}
	}
	function docClientHeight(doc) {
		if (doc.documentElement.scrollHeight > doc.body.scrollHeight)
			return doc.documentElement.scrollHeight;
		return doc.body.scrollHeight;
	}
	function docClientWidth(doc) {
		if (doc.documentElement.scrollWidth > doc.body.scrollWidth)
			return doc.documentElement.scrollWidth;
		return doc.documentElement.scrollWidth;
	}
})();
