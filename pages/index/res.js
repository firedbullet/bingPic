

const resouce = new Map();

/**
 * 获取资源
 */
const getResPath = (url, callback) => {
	let res = resouce.get(url)
	if (res) {
		callback(res)
	}
	else {
		wx.downloadFile({
			url: url,
			success(res) {
				console.log(res)
				resouce.set(url, res.tempFilePath);
				callback && callback(res.tempFilePath);
			},
			fail(res) {
				wx.showModal({
					title: '失败',
					content: JSON.stringify(res)
				})
			}
		})
	}
}
/**
 * 获取资源的ArrayBuffer
 */
const getResData = (url, callback) => {
	let res = resouce.get(url)
	if (res) {
		callback(res)
	}
	else {
		wx.request({
			url: url,
			dataType: "ArrayBuffer",
			responseType: "arraybuffer",
			success(res) {
				resouce.set(url, res.data);
				callback && callback(res.data)
			}
		})
	}
}

//导出
module.exports = {
	getResData: getResData,
	getResPath: getResPath
}