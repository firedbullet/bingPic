//index.js
const HOSTS = "https://www.bing.com",
  BASESIZE = '_1080x1920.jpg'//要显示的分辨率

//导入计算主色调模块
let getImgRgb = require("./decoder.js");

//获取应用实例
let app = getApp()

//设置中可更改的内容
let resoIndex,//选中的分辨率
  layout,//布局，垂直0|水平1
  downSize,//要下载的分辨率
  mkt //区域

const setLayout = (value) => {
  if (value === undefined) return layout
  layout = value;
  setSettings();
}
const setReso = (index, size) => {
  if (index === undefined) return resoIndex
  resoIndex = index;
  downSize = size;
  setSettings();
}
//保存设置
const setSettings = () => {
  let s = {
    resoIndex: resoIndex,
    layout: layout,
    downSize: downSize,
    mkt: mkt
  }
  wx.setStorageSync("bingPic", JSON.stringify(s))
}
//读取设置
const getSettings = () => {
  let s = JSON.parse(wx.getStorageSync("bingPic") || "{}");
  resoIndex = s.resoIndex || 0;
  layout = s.layout || 1;
  downSize = s.downSize || "_1920x1200.jpg";
  mkt = s.mkt || "zh-CN";
}

let imagesInfo = [],//保存的图片信息
  currDay = 0,//当前天 0为今天、1为昨天，最大为7
  storyIndex = -1,//显示的故事
  week = 0

let sysInfo;//设备信息

Page({
  data: {
    images: imagesInfo,
    BASESIZE: BASESIZE,
    currDay: currDay

  },
  //bing life
  showLife() {
    storyIndex = -1;
    this.setData({
      storyIndex: storyIndex
    })
    wx.navigateTo({
      url: "../life/life?date=" + imagesInfo[currDay].date + "&title=" + imagesInfo[currDay].attribute
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
      url: "../settings/settings"
    })
  },
  //切换完成
  swipeEnd(e) {
    if (e.detail.current == currDay) return;
    currDay = e.detail.current;
    storyIndex = -1;

    let that = this;
    //继续加载
    if (week < 1 && currDay == week * 8 + 7) {
      week++;
      getImgInfo((data) => {
        that.setData({
          images: imagesInfo
        })
      })
    }
    // getImgRgb
    if (imagesInfo[currDay].story) {
      //换标题
      wx.setNavigationBarTitle({
        title: imagesInfo[currDay].desc,
      })
      that.setData({
        currDay: currDay,
        storyIndex: storyIndex,
        iconAnim: false
      })
      setTimeout(function () {
        that.setData({
          iconAnim: true
        })
      }, 200)
    }
    else {
      loadCurrInfo(that);
    }

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
  onLoad() {
    currDay = 1;
    getSettings()
    wx.getSystemInfo({
      success(res) {
        sysInfo = res;
      }
    })
    let that = this;
    getImgInfo((data) => {
      loadCurrInfo(that);
    });

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
 * 加载当前天的详情数据
 */
const loadCurrInfo = (that) => {
  wx.showNavigationBarLoading();
  getStoryInfo(imagesInfo[currDay].date, (data) => {
    imagesInfo[currDay].attribute = data.attribute
    imagesInfo[currDay].story = data.para1.match(/\S+?。/g);
    imagesInfo[currDay].story.push(data.title)
    imagesInfo[currDay].xy = [data.Longitude, data.Longitude];
    if (imagesInfo[currDay].story.length > 4) imagesInfo[currDay].story.length = 4;
    // console.log(imagesInfo[currDay].story)

    //换标题
    wx.setNavigationBarTitle({
      title: imagesInfo[currDay].desc,
    })

    that.setData({
      images: imagesInfo,
      currDay: currDay,
      storyIndex: storyIndex,
      iconAnim: false
    })
    setTimeout(function () {
      that.setData({
        iconAnim: true
      })
    }, 200)

    wx.hideNavigationBarLoading();
  })
}

/**
 * 获取最近8天的图片信息
 * @params cb 回调函数
 */
const getImgInfo = (cb) => {
  wx.request({
    url: 'https://www.bing.com/HPImageArchive.aspx?format=js&idx=' + (week * 8 - 1) + '&n=8&mkt=' + mkt,
    header: {
      'Cookie': 'ENSEARCH=BENVER=0'
    },
    success(res) {
      let images = res.data.images;
      // console.log(images)
      for (let i = 0; i < images.length; i++) {
        imagesInfo.push({
          desc: images[i].copyright.match(/[^*]+(?=\(|，)/)[0],
          copyText: images[i].copyright.match(/[^\(]+(?=\))/)[0],
          copyLink: images[i].copyrightlink,
          urlBase: HOSTS + images[i].urlbase,
          date: images[i].enddate,
          pos: getPos()
        })
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
/**
 * 获取每日生活
 * @param data 日期
 * @params cb 回调函数
 */
const getStoryLife = (date, cb) => {
  wx.request({
    url: 'https://www.bing.com/cnhp/life?currentDate=' + date,
    success(res) {
      if (cb) cb(res.data);
    }
  })
}
/**
 * 获取下载链接
 * @params day 0为今天1为昨天最大为7
 */
const getDownUrl = (day) => {
  return HOSTS + imagesInfo[day].urlbase + downSize;
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


//导出
module.exports = {
  setLayout: setLayout,
  setReso: setReso,
  getStoryLife: getStoryLife
}