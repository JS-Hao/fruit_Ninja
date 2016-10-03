window.onload = function() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	canvas.width = 640;
	canvas.height = 480;

	var width = canvas.width;
	var height = canvas.height;

	//创建图片
	function creatImg(src) {
		var img = new Image;
		img.onload = function() {
			this.isReady = true;
		}
		img.src = src;
		return img;

	}

	//图片全部下载完成的标志
	var isDownloadState = false;

	//判定图片是否全部下载完成
	function isDownload(arr) {
		var result = true;
		arr.forEach(function(e) {
			if (!e.isReady) {
				result = false;
			}
		});
		if (result && bgImg.isReady) {
			isDownloadState = true;
			return result
		}
		return false;
	}

	//背景
	var bgImg = creatImg('src/images/background.jpg');
	//各类水果图片
	var apple = creatImg('src/images/fruit/apple.png');
	var banana = creatImg('src/images/fruit/banana.png');
	var basaha = creatImg('src/images/fruit/basaha.png');
	var peach = creatImg('src/images/fruit/peach.png');
	var sandia = creatImg('src/images/fruit/sandia.png');
	var boomImg = creatImg('src/images/fruit/boom.png');

	//随机数
    function random(min, max) {
        return Math.floor(Math.random() * (max - min) + min)
    }

    //速度控制
    var speedX = [90, 180];
    var speedY = [350, 500];

	//仿重力加速度
	var g = -400;

	//运动单位时间：5ms
	var t = 5;

	//分数
	var score = 0;

    //定义水果的颜色
    var fruitStyle = [apple, banana, basaha, peach, sandia];

    //鼠标忍者刀
    function NinjaKnife() {
    	this.x = 0;
    	this.y = 0;
    	this.isDown = false;
    }

    // 忍者刀是否切中水果的判定及相应处理
    NinjaKnife.prototype.isCut = function(fruit) {
    	var that = this;
		var length = fruit.length;
		for (var i = 0; i < length; i++) {
			var target = fruit[i];
			var r = Math.min(target.fruitStyle.width, target.fruitStyle.height)
			//Math.abs(that.x - target.x) < target.fruitStyle.width && Math.abs(that.y - target.y) < target.fruitStyle.height
			//Math.sqrt(Math.pow((that.x - target.x), 2) + Math.pow((that.y - target.y), 2)) < target.r
			if (Math.sqrt(Math.pow((that.x - target.x), 2) + Math.pow((that.y - target.y), 2)) < r) {
				if (target.keepCutTime > 8) {
					//切到炸弹
					if (target.bomb) {
						clearInterval(Timer);
						ctx.clearRect(0, 0, canvas.width, canvas.height);
						//绘制背景
						ctx.drawImage(bgImg, 0, 0);
						//游戏结束
						ctx.fillStyle = '#fff';
						ctx.font = 'bold 30px Arial';
						ctx.textAlign = 'center';
						ctx.textBaseline = 'middle';
						ctx.fillText('Game Over', width / 2, height / 2);
					} else {
						//初始化设置
						target.delay = random(100, 200);
						target.x = random(0, width);
						target.y = height;
						target.speedY = random.apply(null, speedY);
						target.speedX = random.apply(null, speedX);
						target.fruitStyle = fruitStyle[Math.floor(Math.random() * fruitStyle.length)];
						target.keepX = false;
						target.initDelay = 400;
						target.isBegin = false;
						target.keepCutTime = 0;
						//获取分数
						score++;
					}	
				} else {
					target.keepCutTime++;
				}
				
			} 
		}
    }

    //鼠标操控忍者刀
    NinjaKnife.prototype.mouseMove = function() {
    	var that = this;

    	document.addEventListener('mousedown', function(e) {
    		that.isDown = true;
    	}, false);

    	document.addEventListener('mousemove', function(e) {
    		that.x = e.x - canvas.offsetLeft || e.pageX - canvas.offsetLeft;
    		that.y = e.y - canvas.offsetTop || e.pageY - canvas.offsetTop;
    		if (that.isDown && that.y < height) {
    			that.isCut(fruit);
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
	function Fruit(initDelay, bomb) {
		//位置
		this.x = random(0, width);
		this.y = height;
		//半径
		this.r = 25;
		//初速度，以秒为时间单位，以px为位移单位
		this.speedX = random.apply(null, speedX);
		this.speedY = random.apply(null, speedY);
		//水果种类
		this.fruitStyle = fruitStyle[Math.floor(Math.random() * fruitStyle.length)],
		//是否开始运动
		this.isBegin = false;
		//延迟
		this.delay = random(0, 200);
		//初始延迟
		this.initDelay = initDelay;
		//保持x方向
		this.keepX = false;
		//被切持续时间
		this.keepCutTime = 0;

		//判定是否为炸弹
		if (typeof bomb === 'boolean') {
			this.bomb = bomb;
			if (bomb === true) {
				this.fruitStyle = boomImg;
				this.delay = random(200, 400);
			}		
		}
	}

	Fruit.prototype.movement = function() {
		ctx.beginPath();
		if (this.isBegin) {
			if (this.y > height) {
				//经过一段时间的延迟，下一个水果才会出现
				if (this.delay) {
					this.delay--;
				} else {
					//初始化
					if (this.bomb) {
						this.fruitStyle = boomImg;
						this.delay = random(200, 400);
					} else {
						this.delay = random(100, 200);
						this.fruitStyle = fruitStyle[Math.floor(Math.random() * fruitStyle.length)];
					}	
					this.x = random(0, width);
					this.y = height;
					this.speedY = random.apply(null, speedY);
					this.speedX = random.apply(null, speedX);
					this.keepX = false;
					this.keepCutTime = 0;
				}

			} else {
				//y方向仿抛物线运动
				this.speedY = this.speedY + (g * t / 1000);
				this.y = this.y - (this.speedY * t / 1000);
				//x方向匀速运动
				if (!this.keepX) {
					this.speedX = (this.x - height / 2) < 0 ? this.speedX : -this.speedX;
					this.keepX = true;
				}
				this.x += this.speedX * t / 1000;
				//绘制图像
        		ctx.drawImage(this.fruitStyle, (this.x - this.fruitStyle.width / 2), (this.y - this.fruitStyle.height / 2));
			}
		} else {
			if (this.initDelay) {
				this.initDelay--;
			} else {
				//绘制图像
	        	ctx.drawImage(this.fruitStyle, (this.x - this.fruitStyle.width / 2), (this.y - this.fruitStyle.height / 2));
	        	this.isBegin = true;
			}	
		}
	}

	var fruit = [new Fruit(400, false), new Fruit(0, false), new Fruit(800, false), new Fruit(600, true)];
	//定时器
	var Timer = null;

	//动作渲染
	function render() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		//绘制背景
		ctx.drawImage(bgImg, 0, 0);
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
		fruit.forEach(function(e) {
			e.movement();
		})
	}

	function main() {
		Timer = setInterval(function(){
			if (isDownloadState) {
				render();
			} else if (isDownload(fruitStyle)) {
				render();
			}
		}, t);
	}
	
	main();
	
};