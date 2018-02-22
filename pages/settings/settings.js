// SIZE = [[1920, 1080], [1366, 768], [1280, 720], [1024, 768], [800, 480]]

const SIZE_H = ["1920 x 1080", "1366 x 768", "1280 x 720", "1024 x 768", "800 x 400"],//仅作显示
	SIZE_V = ["1080 x 1920", "768 x 1366", "720 x 1280", "768 x 1024", "400 x 800"], //仅作显示
	MKT = ["zh-CN", "en-WW", "zh_HK", "de-DE", "pt-BR", "fr-FR", 'en-AU', "fr-CA", "en-CA", "en-US", "ja-JP", "en-IN", "en-GB"],
	MKT_SHOW = ["中国", "全球", "香港(大陆需VPN)", "德国(大陆需VPN)", "巴西(大陆需VPN)", "法国(大陆需VPN)", "澳大利亚(大陆需VPN)", "加拿大[法语](大陆需VPN)", "加拿大[英语](大陆需VPN)", "美国(大陆需VPN)", "日本(大陆需VPN)", "印度(大陆需VPN)", "英国(大陆需VPN)"]

// de-DE,	pt-BR,	fr-FR,	en-AU	,fr-CA ,en-CA	,en-US	,en-WW,	ja-JP,	en-IN,	en-GB,	zh-CN	,zh_HK 


let layout,//横竖屏
	sizeIndex, //下载分辨率的index
	mktIndex, //区域index
	refreshMain  //主页刷新方法

let settings//留住this
Page({
	// 返回
	goback() {
		wx.navigateBack()
	},
	//复制
	copy(e) {
		wx.setClipboardData({
			data: e.target.dataset.copy,
			success: (data) => {
				wx.showToast({
					title: '链接复制成功！',
				})
			}
		})
	},
	//切换横竖屏
	changeLayout: () => {
		layout = 1 - layout;
		settings.setData({
			layout: layout,
			sizePicker: layout ? SIZE_H : SIZE_V
		})
		saveSettings()
	},
	//切换分辨率
	changeReso: (e) => {
		sizeIndex = +e.detail.value[0];
		settings.setData({
			sizeIndex: sizeIndex
		})
		saveSettings()
	},
	//切换区域
	changeMkt: (e) => {
		mktIndex = +e.detail.value[0];
		settings.setData({
			mktIndex: mktIndex
		})
		saveSettings()
	},
	onLoad(msg) {
		settings = this;
		settings.setData({
			bg: msg.bg,
			layout: layout,
			sizePicker: layout ? SIZE_H : SIZE_V,
			sizeIndex: sizeIndex,
			mktPicker: MKT_SHOW,
			mktIndex: mktIndex
		})
	},
	onUnload() {
		refreshMain(getDownSIze(), MKT[mktIndex], false)
	}

})

const getDownSIze = () => {
	let arr = layout ? SIZE_H : SIZE_V;
	return `_${arr[sizeIndex].replace(/\s/g, "")}.jpg`;
}

//保存设置
const saveSettings = () => {
	let ss = {
		layout: layout,
		sizeIndex: sizeIndex,
		mktIndex: mktIndex
	}
	wx.setStorageSync("bingPic", JSON.stringify(ss))
}
//读取设置
const readSettings = () => {
	let s = JSON.parse(wx.getStorageSync("bingPic") || "{}");
	layout = s.layout || 1;
	sizeIndex = s.sizeIndex || 0;
	mktIndex = s.mktIndex || 0;
}
readSettings();

//导出
module.exports = {
	getSettings: () => {
		return {
			downSize: getDownSIze(),
			mkt: MKT[mktIndex]
		}
	},
	regist: (fun) => {
		refreshMain = fun;
	}
}
