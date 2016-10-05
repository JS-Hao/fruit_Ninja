var mousemove = function(n) {

	//创建n个div
	var divs = function(n) {
		var divs = [];
		for (var i = 0; i < n; i++) {
			var div = document.createElement('div');
			//设定div样式
			div.style.width = 4 * ((n - i) / n) + 'px';
			div.style.height = 4 * ((n - i) / n) + 'px';
			div.style.backgroundColor = '#fff';
			div.style.position = 'absolute';
			div.style.zIndex = n - i;
			divs.push(div);
		}
		return divs; 
	}(n);

	var fragment = document.createDocumentFragment();
	//插入元素
	for (var i = 0, length = divs.length; i < length; i++) {
		fragment.appendChild(divs[i]);
	}
	document.body.insertBefore(fragment, document.querySelector('#canvas'));
	//获取方位
	function pos(oev){
		var scrollLeft=document.documentElement.scrollLeft || document.body.scrollLeft;
		var scrollTop=document.documentElement.scrollTop || document.body.scrollTop;
		left = scrollLeft + oev.clientX;
		Top= scrollTop + oev.clientY;
		return {x: left, y: Top};
	}

	var mousemoveStunt = function(e) {
		for (var i = divs.length - 1; i > 0; i--) {
			divs[i].style.left = divs[i - 1].offsetLeft + 'px';
			divs[i].style.top = divs[i - 1].offsetTop + 'px';
		}

		var opos = pos(e);
		divs[0].style.left = opos.x + 'px';
		divs[0].style.top = opos.y + 'px';
	};

	return {
		mousemoveStunt: mousemoveStunt
	};
}(1);