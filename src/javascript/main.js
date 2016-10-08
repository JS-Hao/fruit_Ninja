window.onload = function() {
	var canvas = document.getElementById('canvas');
	var ctx = canvas.getContext('2d');
	if (window.innerHeight > 640) {
		canvas.width = 320;
		canvas.height = 240;
	} else {
		canvas.width = window.innerHeight * 320 / 240;
		canvas.height = window.innerHeight;
	}
	

	var width = canvas.width;
	var height = canvas.height;

	//音频控制
	var music = {
		splatter: document.querySelector('.splatter'),
		throw: document.querySelector('.throw'),
		boom: document.querySelector('.boom')
	}

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
		if (result && bgImg.isReady && scoreIcog.isReady
			&& heart1.isReady && heart2.isReady && heart3.isReady 
			&& heart1f.isReady && heart2f.isReady && heart3f.isReady 
			&& flash.isReady) {
			//设置图像尺寸
			/*var newArr = [];
			newArr.push.apply(newArr, arr);
			newArr.push(bgImg, scoreIcog, heart1, heart2, heart3, heart1f, heart2f, heart3f, flash);
			newArr.forEach(function(e) {
				e.style.width = height * e.width / 480 + 'px';
				e.style.height = height * e.height / 480 + 'px';
			});*/
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
	//分数图标
	var scoreIcog = creatImg('src/images/score.png');
	//生命值
	var heart1 = creatImg('src/images/x.png');
	var heart2 = creatImg('src/images/xx.png');
	var heart3 = creatImg('src/images/xxx.png');
	var heart1f = creatImg('src/images/xf.png');
	var heart2f = creatImg('src/images/xxf.png');
	var heart3f = creatImg('src/images/xxxf.png');
	//击中特效
	var flash = creatImg('src/images/flash.png');

	//击中特效时常控制
	var hitState = {
		time: 8,
		start: false,
		savePosition: false,
		rotate: 0,
		x: 0,
		y: 0
	}

	//当前生命值
	var heart = 3;

	//随机数
    function random(min, max) {
        return Math.floor(Math.random() * (max - min) + min)
    }

    //速度控制
    var speedX = [width * 90 / 640, width * 180 / 640];
    var speedY = [width * 350 / 640, width * 500 / 640];

	//仿重力加速度
	var g = -(height * 400 / 480);

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

    function hitRender(x, y) {
    	ctx.drawImage(flash, x - flash.width, y - flash.height);
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
						//播放音频
						music.boom.play();
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
						ctx.fillText('总分: ' + score, width / 2, height / 2 -30);
					} else {
						//播放音频
						music.splatter.currentTime = 0;
						music.splatter.play();
						//击中后的设置
						hitState.state = true;
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
						target.isLoseHeart = false;
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
    		return false;
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
		this.r = height * 25 / 480;
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
		//是否失去一条生命
		this.isLoseHeart = false;
		//是否播放了音乐
		this.isPlayMusic = false;
		//判定是否为炸弹
		if (typeof bomb === 'boolean') {
			this.bomb = bomb;
			if (bomb === true) {
				this.fruitStyle = boomImg;
				this.delay = random(200, 400);
				this.isLoseHeart = true;
			}		
		}
	}

	Fruit.prototype.movement = function() {
		ctx.beginPath();
		if (this.isBegin) {
			if (this.y > height) {
				if (!this.isLoseHeart) {
					// 失去一条生命值
					heart--;
					this.isLoseHeart = true;
				}
				//经过一段时间的延迟，下一个水果才会出现
				if (this.delay) {
					this.delay--;
				} else {
					//初始化
					if (this.bomb) {
						this.fruitStyle = boomImg;
						this.delay = random(200, 400);
						this.isLoseHeart = true;
					} else {
						this.delay = random(100, 200);
						this.fruitStyle = fruitStyle[Math.floor(Math.random() * fruitStyle.length)];
						this.isLoseHeart = false;
					}	
					this.x = random(0, width);
					this.y = height;
					this.speedY = random.apply(null, speedY);
					this.speedX = random.apply(null, speedX);
					this.keepX = false;
					this.keepCutTime = 0;
					this.isPlayMusic = false;
				}

			} else {
				if (!this.isPlayMusic) {
					//播放音频
					music.throw.currentTime = 0;
					music.throw.play();
					this.isPlayMusic = true;
				}
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
        		ctx.drawImage(this.fruitStyle, 
        			(this.x - (height * this.fruitStyle.width / 480) / 2), 
        			(this.y - (height * this.fruitStyle.height / 480) / 2), 
        			height * this.fruitStyle.width / 480, 
        			height * this.fruitStyle.height / 480);
			}
		} else {
			if (this.initDelay) {
				this.initDelay--;
			} else {
				//绘制图像
	        	ctx.drawImage(this.fruitStyle, 
	        		(this.x - (height * this.fruitStyle.width / 480) / 2), 
	        		(this.y - (height * this.fruitStyle.height / 480) / 2),
	        		height * this.fruitStyle.width / 480, 
	        		height * this.fruitStyle.height / 480);
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
		ctx.drawImage(bgImg, 0, 0, height * bgImg.width / 480, height * bgImg.height / 480);
		//判断生命是否为0，0则游戏结束，否则游戏继续
		if (heart === 0) {
			//游戏结束
			ctx.fillStyle = '#fff';
			ctx.font = 'bold 30px Arial';
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('Game Over', width / 2, height / 2);
			ctx.fillText('总分: ' + score, width / 2, height / 2 -30);
		} else {
			//绘制忍者刀
			if (ninjaKnife.isDown) {
				document.title = ninjaKnife.x + ' ' + ninjaKnife.y;
				ctx.fillStyle = '#fff';
				ctx.arc(ninjaKnife.x, ninjaKnife.y, 4, 0, Math.PI * 2, false);
				ctx.fill();
			}
			//绘制分数图标
			ctx.drawImage(scoreIcog, height * 10 / 480, height * 10 / 480, 
				height * scoreIcog.width / 480, height * scoreIcog.height / 480);

			//绘制分数
			ctx.fillStyle = '#f9fe73';
			ctx.font = '26px Arial';
			ctx.textAlign = 'start';
			ctx.textBaseline = 'top';
			ctx.fillText(score, height * 50 / 480, height * 12 / 480);

			//绘制生命值
			if (heart === 3) {
				ctx.drawImage(heart1, width-(width * 125 / 640), width * 10 / 640, 
					height * heart1.width / 480, height * heart1.height / 480);
				ctx.drawImage(heart2, width-(width * 90 / 640), width * 10 / 640,
					height * heart2.width / 480, height * heart2.height / 480);
				ctx.drawImage(heart3, width-(width * 50 / 640), width * 10 / 640,
					height * heart3.width / 480, height * heart3.height / 480);
			} else if (heart === 2) {
				ctx.drawImage(heart1f, width-(width * 125 / 640), width * 10 / 640,
					height * heart1f.width / 480, height * heart1f.height / 480);
				ctx.drawImage(heart2, width-(width * 90 / 640), width * 10 / 640,
					height * heart2.width / 480, height * heart2.height / 480);
				ctx.drawImage(heart3, width-(width * 50 / 640), width * 10 / 640,
					height * heart3.width / 480, height * heart3.height / 480);
			} else if (heart === 1) {
				ctx.drawImage(heart1f, width-(width * 125 / 640), width * 10 / 640,
					height * heart1f.width / 480, height * heart1f.height / 480);
				ctx.drawImage(heart2f, width-(width * 90 / 640), width * 10 / 640,
					height * heart2f.width / 480, height * heart2f.height / 480);
				ctx.drawImage(heart3, width-(width * 50 / 640), width * 10 / 640,
					height * heart3.width / 480, height * heart3.height / 480);
			}
			
			//绘制击中特效
			if (hitState.state && hitState.time !== 0) {
				//如果击中特效已触发，则一直在该鼠标停留位置触发，直到下一次的击中发生才改变方位
				if (!hitState.savePosition) {
					hitState.x = ninjaKnife.x;
					hitState.y = ninjaKnife.y;
					hitState.rotate = random(0, 180) * Math.PI / 180; //旋转角度
					hitState.savePosition = true;
				}
				ctx.save();//保存状态
				ctx.translate(hitState.x, hitState.y);//设置画布上的(0,0)位置，也就是旋转的中心点
				ctx.rotate(hitState.rotate);
				ctx.drawImage(flash, 
					0 - (height * flash.width / 480) / 2, 
					0 - (height * flash.height / 480) / 2, 
					height * flash.width / 480, 
					height * flash.height / 480);//把图片绘制在旋转的中心点，
				ctx.restore();//恢复状态
				
				hitState.time--;
			} else {
				hitState.state = false;
				hitState.time = 8;
				hitState.savePosition = false;
			}

			//绘制当前生命
			document.title = hitState.time;
			//绘制水果运动
			fruit.forEach(function(e) {
				e.movement();
			})
		}
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
}

