

// let cn = /[\u4E00-\u9FFF（）“”，。、！~？/0-9]+(?=\<)/g;
// let link = /http:\/\/s[0-4]\.cn\.bing\.net\S+(?=")/g;
// let reg = /(\<\w[^\>]*?\>(?=[^\<]))(\S+?)(\<\/\w+\>)/g;
// let reg = /((\>(?=[^\<]))(\S+?)(\<\/\w+\>)|(src=")(http:\/\/s[0-6]?\.cn\.bing\.net\S+?)("))/g;

let styleReg = /\<style.*?style\>/;
let aReg = /\<a[\s|\S]+?\>/g;

let dayImgReg = /(src=")(http:\/\/s[0-6]?\.cn\.bing\.net\S+?)(")/;
// 最上面的图片
let dayTitleReg = /("hplaTtl"\>)(.*?)(\<\/)/;
let daySubReg = /("hplaAttr"\>)(.*?)(\<\/)/;
// 地点描述
let locTitleReg = /("hplatBlue".*?"hplatt"\>)(.*?)(\<\/)/g;
let locSubReg = /("hplatBlue".*?"hplats"\>)(.*?)(\<\/)/g;
let locInfoReg = /("hplatxt"\>)([^\<]*?)(\<\/)/;
let locInfoReg2 = /("hplatxt hplatxtl"\>)(.*?)(\<\/)/;

//中间四个
let cardTitleReg = /("hplactt hplatBlue".*?\>)(.*?)(\<\/)/g;
let cardContentReg = /("hplactc".*?\>)(.*?)(\<\/)/g;

//下面两个
let bottomTitleReg = /(hplatDefault.*?"hplatt".*?\>)(.*?)(\<\/)/g;
let bottomSubReg = /(hplatDefault.*?"hplats"\>)(.*?)(\<\/)/g;
let bottomInfoReg = /(hplaCard".*?"hplatxt hplatxtl"\>)(.*?)(\<\/)/g;
let bottomImgReg = /(hplaCard".*?src=")(http:\/\/s[0-6]?\.cn\.bing\.net\S+?)(")/g;


let dayImg,
	dayTitle,
	daySub,

	locTitle,
	locSub,
	locInfo,

	cardTitle,
	cardContent,

	bottomTitle,
	bottomSub,
	bottomInfo,
	bottomImg;


Page({
	onLoad(msg) {
		let that = this;
		wx.showNavigationBarLoading();
		wx.setNavigationBarTitle({
			title: msg.title
		})
		wx.request({
			url: 'https://cn.bing.com/cnhp/life?currentDate=' + msg.date + "&mkt=zh-CN",
			dataType: "notJSON",
			success(res) {
				let htmlStr = res.data.replace(styleReg, "").replace(aReg, "");
				console.log(msg.date, htmlStr)
				getContent(htmlStr);
				that.setData({
					bg: msg.bg,
					dayImg: dayImg,
					dayTitle: dayTitle,
					daySub: daySub,

					locTitle: locTitle,
					locSub: locSub,
					locInfo: locInfo,

					cardTitle: cardTitle,
					cardContent: cardContent,

					bottomTitle: bottomTitle,
					bottomSub: bottomSub,
					bottomInfo: bottomInfo,
					bottomImg: bottomImg
				})

				wx.hideNavigationBarLoading();
			}
		})
	}
})

const getContent = (htmlStr) => {
	locTitle = [];
	locSub = [];
	locInfo = [];

	cardTitle = [];
	cardContent = [];

	bottomTitle = [];
	bottomSub = [];
	bottomInfo = [];
	bottomImg = [];


	// 顶部图片上的文字
	htmlStr = htmlStr.replace(dayTitleReg, function (s0, s1, s2, s3) {
		dayTitle = s2;
		return "";
	})
	htmlStr = htmlStr.replace(daySubReg, function (s0, s1, s2, s3) {
		daySub = s2;
		return "";
	})


	// 中间四个
	htmlStr = htmlStr.replace(cardTitleReg, function (s0, s1, s2, s3) {
		cardTitle.push(s2);
		return "";
	})

	htmlStr = htmlStr.replace(cardContentReg, function (s0, s1, s2, s3) {
		cardContent.push(s2);
		return "";
	})

	// 底部图片，文字
	htmlStr = htmlStr.replace(bottomTitleReg, function (s0, s1, s2, s3) {
		bottomTitle.push(s2)
		return "";
	})
	htmlStr = htmlStr.replace(bottomSubReg, function (s0, s1, s2, s3, s4) {
		bottomSub.push(s2)
		return "";
	})
	htmlStr.replace(bottomInfoReg, function (s0, s1, s2, s3) {
		bottomInfo.push(s2)
	})
	htmlStr = htmlStr.replace(bottomImgReg, function (s0, s1, s2, s3) {
		bottomImg.push(s2)
		return "";
	})

	// 顶部图片
	htmlStr = htmlStr.replace(dayImgReg, function (s0, s1, s2, s3) {
		dayImg = s2;
		return ""
	})


	// 地点描述
	htmlStr.replace(locTitleReg, function (s0, s1, s2, s3) {
		locTitle.push(s2);
	})
	htmlStr.replace(locSubReg, function (s0, s1, s2, s3) {
		locSub.push(s2);
	})
	htmlStr.replace(locInfoReg, function (s0, s1, s2, s3) {
		locInfo.push(s2);
	})
	htmlStr.replace(locInfoReg2, function (s0, s1, s2, s3) {
		locInfo.push(s2);
	})

}