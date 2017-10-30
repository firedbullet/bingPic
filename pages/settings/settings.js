const SIZE = [[1920, 1200], [1920, 1080], [1366, 768], [1280, 720], [1024, 768], [800, 480]],//用作计算下载分辨率
  LOC = ["zh-CN", "en-US"],
  SIZE_H = ["1920 x 1200(有水印)", "1920 x 1080", "1366 x 768", "1280 x 720", "1024 x 768", "800 x 400"],//仅作显示
  SIZE_V = ["1080 x 1920", "768 x 1366", "720 x 1280", "768 x 1024", "400 x 800"] //仅作显示

let SET = require("../index/index.js");


let layout,//横竖屏
  index //下载分辨率的index

let temp //保留的this

Page({
  //复制
  copy(e) {
    console.log(e)
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
    if (index == 0 && layout) {
      wx.showModal({
        showCancel: false,
        title: '不可切换',
        content: '当前分辨率(1920 x 1200)只有横屏，请切换其他分辨率体验竖屏',
        confirmText: '朕知道了',
        complete: () => {
          temp.setData({
            layout: layout
          })
        }
      })
    }
    else {
      layout = 1 - layout;
      temp.setData({
        layout: layout,
        size: layout ? SIZE_H : SIZE_V
      })
      SET.setLayout(layout);
      SET.setReso(index, getDOwnSIze());
    }
  },
  //切换分辨率
  changeReso: (e) => {
    index = +e.detail.value[0] + 1 - layout;
    temp.setData({
      index: index
    })
    SET.setReso(index, getDOwnSIze());
  },
  onLoad() {
    console.log(SET)
    layout = SET.setLayout();
    index = SET.setReso();
    temp = this;

    this.setData({
      layout: layout,
      size: layout ? SIZE_H : SIZE_V,
      index: index
    })
  }
})

const getDOwnSIze = () => {
  let arr = SIZE[index];
  return "_" + arr[1 - layout] + "x" + arr[layout] + ".jpg";
}
