window.onload = function() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = 700;
	canvas.height = 500;

	var width = canvas.width;
	var height = canvas.height;

	//随机数
    function random(min, max) {
        return Math.floor(Math.random() * (max - min) + min)
    }

	//重力加速度
	var g = -300;

	//运动单位时间：30ms
	var t = 5;

	//分数
	var score = 0;

    //定义水果的颜色
    var colors = ["#33B5E5", "#0099CC", "#AA66CC", "#9933CC", "#99CC00", "#669900", "#FFBB33", "#FF8800", "#FF4444", "#CC0000"];

    //鼠标忍者刀
    function NinjaKnife() {
    	this.x = 0;
    	this.y = 0;
    	this.isDown = false;
    	this.isCut = function() {
    		var that = this;
    		var length = arguments.length;
    		for (var i = 0; i < length; i++) {
    			var target = arguments[i];
    			if (Math.sqrt(Math.pow((that.x - target.x), 2) + Math.pow((that.y - target.y), 2)) < target.r) {
    				//初始化设置
    				target.delay = random(100, 200);
					target.x = random(25, 675);
					target.y = 500;
					target.speedY = random(350, 500);
					target.speedX = random(50, 90);
					target.color = colors[Math.floor(Math.random() * colors.length)];
					target.keepX = false;
					target.initDelay = 400;
					target.isBegin = false;
					//获取分数
					score++;
    			} 
    		}
    	}
    }

    NinjaKnife.prototype.mouseMove = function() {
    	var that = this;

    	document.addEventListener('mousedown', function(e) {
    		that.isDown = true;
    	}, false);

    	document.addEventListener('mousemove', function(e) {
    		that.x = e.x - canvas.offsetLeft || e.pageX - canvas.offsetLeft;
    		that.y = e.y - canvas.offsetTop || e.pageY - canvas.offsetTop;
    		if (that.isDown) {
    			that.isCut(banana, apple, watermena);
    		}
    	});

    	document.addEventListener('mouseup', function(e) {
    		that.isDown = false;
    	}, false);
    }

    //创建一把忍者刀
    var ninjaKnife = new NinjaKnife();
    ninjaKnife.mouseMove();

	//水果
	function Fruit(initDelay) {
		//位置
		this.x = random(25, 675);
		this.y = 500;
		//半径
		this.r = 25;
		//初速度，以秒为时间单位，以px为位移单位
		this.speedX = random(50, 90);
		this.speedY = random(350, 500);
		//颜色
		this.color = colors[Math.floor(Math.random() * colors.length)],
		//是否开始运动
		this.isBegin = false;
		//延迟
		this.delay = random(0, 200);
		//初始延迟
		this.initDelay = initDelay;
		//保持x方向
		this.keepX = false;
	}

	Fruit.prototype.movement = function() {
		ctx.beginPath();
		if (this.isBegin) {
			if (this.y > 500) {
				//经过一段时间的延迟，下一个水果才会出现
				if (this.delay) {
					this.delay--;
				} else {
					//初始化
					this.delay = random(100, 200);
					this.x = random(25, 675);
					this.y = 500;
					this.speedY = random(350, 500);
					this.speedX = random(50, 90);
					this.color = colors[Math.floor(Math.random() * colors.length)];
					this.keepX = false;
				}

			} else {
				//y方向仿抛物线运动
				this.speedY = this.speedY + (g * t/1000);
				this.y = this.y - (this.speedY * t/1000);
				//x方向匀速运动
				if (!this.keepX) {
					this.speedX = (this.x - 350) < 0 ? this.speedX : -this.speedX;
					this.keepX = true;
				}
				this.x += this.speedX * t / 1000;
				//绘制图像
				ctx.fillStyle = this.color;
        		ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        		ctx.fill();
			}
		} else {
			if (this.initDelay) {
				this.initDelay--;
			} else {
				ctx.fillStyle = this.color;
	        	ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
	        	ctx.fill();
	        	this.isBegin = true;
			}	
		}
	}

	var banana = new Fruit(400);
	var apple = new Fruit(0);
	var watermena = new Fruit(800);
	var Timer = setInterval(function(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		//绘制忍者刀
		if (ninjaKnife.isDown) {
			document.title = ninjaKnife.x + ' ' + ninjaKnife.y;
			ctx.fillStyle = '#fff';
			ctx.arc(ninjaKnife.x, ninjaKnife.y, 4, 0, Math.PI * 2, false);
			ctx.fill();
		}
		//绘制分数
		ctx.fillStyle = '#fff';
		ctx.font = 'bold 14px Arial';
		ctx.textAlign = 'start';
		ctx.textBaseline = 'top';
		ctx.fillText('当前分数: ' + score, 0, 0);
		//绘制水果运动
		banana.movement();
		apple.movement();
		watermena.movement();
	}, t);
};