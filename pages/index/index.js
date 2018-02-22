//index.js
const HOSTS = "https://www.bing.com",
	BASESIZE = '_720x1280.jpg' //要显示的分辨率

let settingsMod;

//获取应用实例
let app = getApp()

//设置中可更改的内容
let downSize, //要下载的分辨率
	mkt //区域

let imagesInfo,	//保存的图片信息
	currDay, //当前天 0为今天、1为昨天，最大为7
	storyIndex,	//显示的故事 -1,0,1,2,3
	week  //周

Page({
	data: {
		images: imagesInfo,
		BASESIZE: BASESIZE,
		currDay: currDay
	},
	// 跳到当天
	goToday() {
		storyIndex = -1;
		currDay = 1;
		this.setData({
			currDay: currDay,
			storyIndex: storyIndex,
			iconAnim: false
		})
		let mainMod = this;
		// 开启动画
		setTimeout(function () {
			mainMod.setData({
				iconAnim: true
			})
		}, 400)
	},
	//bing life
	showLife() {
		storyIndex = -1;
		this.setData({
			storyIndex: storyIndex
		})
		wx.navigateTo({
			url: `../life/life?date=${imagesInfo[currDay].date}&title=${imagesInfo[currDay].attribute}&bg=${imagesInfo[currDay].urlBase + BASESIZE}`
		})
	},
	//查看故事
	showStory(event) {
		let index = event.currentTarget.dataset.index;
		storyIndex = storyIndex == index ? -1 : index;
		this.setData({
			storyIndex: storyIndex
		})
	},
	//设置
	gotoSettings() {
		wx.navigateTo({
			url: `../settings/settings?bg=${imagesInfo[currDay].urlBase + BASESIZE}`
		})
	},
	//切换完成
	swipeEnd(e) {
		if (e.detail.current == currDay)
			return;
		currDay = e.detail.current;
		storyIndex = -1;

		let mainMod = this;
		// 继续加载
		if (week < 1 && currDay == week * 8 + 7) {
			week++;
			getImgInfo(this, () => {
				mainMod.setData({
					images: imagesInfo,
					currDay: currDay
				})
			})
		}

		// 刷新故事内容，闪烁动画
		this.setData({
			images: imagesInfo,
			currDay: currDay,
			storyIndex: storyIndex,
			iconAnim: false
		})
		// 开启动画
		setTimeout(function () {
			mainMod.setData({
				iconAnim: true
			})
		}, 400)

	},
	//下载
	download() {
		console.log("down")
		wx.downloadFile({
			url: imagesInfo[currDay].urlBase + downSize,
			success(res) {
				wx.saveImageToPhotosAlbum({
					filePath: res.tempFilePath,
					success(res) {
						wx.showToast({
							title: '保存成功！',
						})
					}
				})
			},
			fail(res) {
				wx.showModal({
					title: '失败',
					content: JSON.stringify(res)
				})
			}
		})
	},
	//预览图片
	preView(event) {
		wx.previewImage({
			urls: [imagesInfo[event.currentTarget.dataset.link].urlBase + downSize],
			fail(msg) {
				wx.showModal({
					title: '结果',
					content: JSON.stringify(msg),
				})
			}
		})
	},
	refreshMain(_downSize, _mkt, isFirst) {
		let mainMod = this;
		downSize = _downSize;
		if (isFirst) {
			currDay = 1;
		}
		if (_mkt !== mkt) {
			mkt = _mkt;
			//初始化数据
			imagesInfo = [];
			storyIndex = -1;
			week = 0;
			getImgInfo(this, () => {
				mainMod.setData({
					images: imagesInfo,
					currDay: currDay,
					iconAnim: false
				})
			});

		}
	},
	onLoad() {
		wx.showNavigationBarLoading();
		settingsMod = require("../settings/settings.js");
		settingsMod.regist(this.refreshMain);
		let st = settingsMod.getSettings();

		this.refreshMain(st.downSize, st.mkt, true);
	},
	onShareAppMessage(res) {
		return {
			title: '每天下载一张Bing美图',
			desc: '聆听图片的故事，了解图片相关的生活',
			imageUrl: '',
			success(res) {
				wx.showToast({
					title: '分享成功！',
				})
			},
			fail(res) {
				wx.showModal({
					showCancel: false,
					title: '分享失败',
					content: res.errMsg.indexOf('cancel') > 0 ? '你取消了分享' : JSON.stringify(res),
				})
			}
		}
	}
})


/**
 * 获取最近8天的图片信息
 */
const getImgInfo = (mainMod, cb) => {
	wx.request({
		url: 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=' + (week * 8 - 1) + '&n=8&mkt=' + mkt,
		header: {
			'Cookie': 'ENSEARCH=BENVER=0'
		},
		success(res) {
			let images = res.data.images;
			// console.log(images)
			// 获取图片的标题，基础路径，版权，四点位置
			for (let i = 0; i < images.length; i++) {
				imagesInfo.push({
					desc: images[i].copyright.match(/[^*]+(?=\(|，)/)[0],
					urlBase: HOSTS + images[i].urlbase,
					copyText: images[i].copyright.match(/[^\(]+(?=\))/)[0],
					copyLink: images[i].copyrightlink,
					date: images[i].enddate,
					pos: getPos()
				});

				//获取图片资源，故事
				((index) => {
					// 故事
					if (mkt === "zh-CN")
						getStoryInfo(imagesInfo[index].date, (data) => {
							imagesInfo[index].attribute = data.attribute
							imagesInfo[index].story = data.para1.match(/\S+?[。？！；]/g);
							imagesInfo[index].story.push(data.title);
							imagesInfo[index].xy = [data.Longitude, data.Longitude];
							//去掉超出4个的
							if (imagesInfo[index].story.length > 4)
								imagesInfo[index].story.length = 4;

							if (index === currDay) {
								// 刷新故事内容，闪烁动画
								mainMod.setData({
									images: imagesInfo,
									currDay: currDay,
									iconAnim: false
								})
								// 开启动画
								setTimeout(function () {
									mainMod.setData({
										iconAnim: true
									})
								}, 400)
							}
						})
				})(i + week * 8)

			}
			if (cb) cb(res.data);
		}
	})
}
/**
 * 获取每日故事
 * @param data 日期
 * @params cb 回调函数
 */
const getStoryInfo = (date, cb) => {
	wx.request({
		url: 'https://www.bing.com/cnhp/coverstory/',
		data: {
			d: date,
			mkt: mkt
		},
		success(res) {
			if (cb) cb(res.data);
		}
	})
}


//随机四个坐标
const getPos = () => {
	let arr = []
	for (let i = 0; i < 4; i++) {
		let x = Math.floor(Math.random() * 30) + 10 + (arr.length < 2 ? 50 : 0);
		let y = Math.floor(Math.random() * 25) + 10 + arr.length % 2 * 40;
		if (Math.random() > 0.5) {
			arr.push([x, y]);
		}
		else {
			arr.unshift([x, y])
		}
	}
	return arr;
}