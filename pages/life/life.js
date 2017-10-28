
let SET = require("../index/index.js");

// let cn = /[\u4E00-\u9FFF（）“”，。、！~？/0-9]+(?=\<)/g;
// let link = /http:\/\/s[0-4]\.cn\.bing\.net\S+(?=")/g;

// let reg = /(\<\w[^\>]*?\>(?=[^\<]))(\S+?)(\<\/\w+\>)/g;

let reg = /((\>(?=[^\<]))(\S+?)(\<\/\w+\>)|(src=")(http:\/\/s[0-6]?\.cn\.bing\.net\S+?)("))/g

// let regTitle = /(\<\w+?.*?hplactt.*?)(\>(?=[^\<]))(\S+?)(\<\/\w+\>)/g;
// let regText = /(\<\w+?.*?hplactc.*?)(\>(?=[^\<]))(\S+?)(\<\/\w+\>)/g;
// let regInfo = /(\<\w+?.*?hplatxt.*?)(\>(?=[^\<]))(\S+?)(\<\/\w+\>)/g;

wx.showNavigationBarLoading();
Page({
  onLoad(msg) {
    let that = this;

    wx.setNavigationBarTitle({
      title: msg.title
    })
    SET.getStoryLife(msg.date, function (data) {
      let arr = [];
      let p = [];

      data.replace(reg, function (s0, s1, s2, s3, s4, s5, s6, s7, s8) {
        if (s3) arr.push(s3);
        if (s6) p[arr.length - 1] = s6;
      })

      that.setData({
        life: arr.slice(1, arr.length - 1),
        picture: p
      })
      wx.hideNavigationBarLoading();
    })

  }
})
