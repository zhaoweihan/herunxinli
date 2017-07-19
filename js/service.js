// http://doc.weiwei528.com/hrxl/swagger-ui.html
//13810225771@163.com
//xinlirexian309
(function ($, win) {
    function Server() {
        this.baseUrl = "/hrxl";
        this.debug = false;
        this.wxShareUrl = "http://zwh.natapp4.cc/herunxinli/index.html";
        this.wxShareTitle = "和润心理扫码赚积分";
        this.wxShareDes = "扫码并关注，积分送不停。凭借积分可免费兑换课程，免费心理咨询";
        this.wxShareImg = "http://ocif3scej.bkt.clouddn.com/tz2.jpg";
        this._init();
    }
    Server.prototype = {
        _init: function () {},
        isLogin: function (self) {
            if (!localStorage.getItem("id") || !localStorage.getItem("token") || !localStorage.getItem("username")) {
                self.$messagebox.alert("登录状态失效，请重新登录").then(action => {
                    localStorage.clear();
                    window.location.href = 'login.html';
                });

            }
        },
        ajax: function (options) {
            var self = this;
            var isBackId = false;
            var defaults = {
                async: true,
                type: "post",
                url: "",
                contentType: "application/x-www-form-urlencoded",
                processData: true,
                cache: true,
                beforeSend: function () {},
                success: function () {},
                error: function () {},
                timeout: function () {}
            }
            if (typeof (options) != "object") {
                throw "参数必须为对象";
            }
            $.extend(true, defaults, options || {});
            for (var dataKey in defaults.data) {
                if (dataKey == "backUserId") {
                    isBackId = true
                    break;
                }
            }
            $.ajax({
                type: defaults.type,
                url: self.baseUrl + defaults.url,
                async: defaults.async,
                headers: this.headerToken(isBackId),
                data: defaults.data,
                beforeSend: defaults.beforeSend(),
                processData: defaults.processData,
                contentType: defaults.contentType,
                cache: defaults.cache,
                success: function (data) {
                    var code = Number(data.responseHead.code);
                    if (code == 200) {
                        defaults.success(data.responseBody);
                    } else if (code < 60000 && code >= 50000) { //业务级别错误
                        // 请求加固失效 需要重新登录
                        if (code == 50000) {
                            app.$messagebox.alert(data.responseHead.msg).then(action => {
                                localStorage.clear();
                                window.location.href = 'login.html';
                            });
                        } else {
                            app.$toast(data.responseHead.msg)
                        }
                        defaults.error(data.responseHead.code, data.responseHead.msg);
                    } else if (code < 50000) { //系统级别错误
                        self.debug ? console.log(data.responseHead.msg) : null;
                    }
                },
                timeout: 6000,
                error: function (xhr, error) {
                    defaults.timeout();
                    if (self.debug) {
                        console.log(xhr);
                        console.log("error：" + error);
                    }

                }
            });
        },
        headerToken: function (bl) {
            var key = localStorage.getItem("token");
            var nonceStr = this.randomStr();
            var timestamp = Math.floor(new Date().getTime() / 1000);
            var signature = hex_md5(timestamp + key + nonceStr);
            if (bl) {
                return {
                    nonceStr: nonceStr,
                    timestamp: timestamp,
                    signature: signature
                }
            } else {
                return {};
            }

        },
        randomStr: function () {
            var str = '';
            var letterArr = []
            for (var i = 97; i <= 122; i++) {
                letterArr.push(String.fromCharCode(i));
            }
            for (var index = 0; index < 4; index++) {
                str += letterArr[Math.floor(Math.random() * 26)];
                str += Math.floor(Math.random() * 10);
            }
            return str;
        },
        /*
         * 获取地址栏参数，支持直接传中文参数
         */
        getUrlParam: function (name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象
            var r = window.location.search.substr(1).match(reg); // 匹配目标参数
            if (r != null)
                return decodeURIComponent(r[2]);
            return null; // 返回参数值
        },
        //微信sdk 权限验证
        getSignature: function () {
            var self = this;
            self.ajax({
                url: "/weiXin/getSignature",
                data: {
                    url: window.location.href
                },
                success: function (result) {
                    wx.config({
                        debug: self.debug, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
                        appId: result.data.appId, // 必填，公众号的唯一标识
                        timestamp: result.data.timestamp, // 必填，生成签名的时间戳
                        nonceStr: result.data.noncestr, // 必填，生成签名的随机串
                        signature: result.data.signature, // 必填，签名，见附录1
                        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'hideMenuItems'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
                    });
                    // 分享到朋友
                    wx.onMenuShareAppMessage({
                        title: self.wxShareTitle, // 分享标题
                        desc: self.wxShareDes, // 分享描述
                        link: self.wxShareUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                        imgUrl: self.wxShareImg, // 分享图标
                        success: function () {
                            $.toast("分享成功");
                            // 用户确认分享后执行的回调函数
                        }
                    });
                    // 分享到朋友圈
                    wx.onMenuShareTimeline({
                        title: self.wxShareTitle, // 分享标题
                        link: self.wxShareUrl, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
                        imgUrl: self.wxShareImg, // 分享图标
                        success: function () {
                            $.toast("分享成功");
                            // 用户确认分享后执行的回调函数
                        }
                    });
                    wx.ready(function () {
                        wx.hideMenuItems({
                            menuList: ["menuItem:share:qq", "menuItem:share:weiboApp", "menuItem:share:QZone", "menuItem:openWithSafari", "menuItem:openWithQQBrowser", "menuItem:copyUrl"] // 要显示的菜单项，所有menu项见附录3
                        });
                    });
                }
            })
        }

    }
    win.Server = Server; //把对象挂载到window下
})(jQuery, window);
var server = new Server(); //实例化对象