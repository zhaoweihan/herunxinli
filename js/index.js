var app = new Vue({
	el: "#index",
	data: {
		baseImageUrl: "",
		headImgUrl: "",
		nickname: "",
		integral: 0,
		exchangedRecordCount:0,
		integralRecordList: [],
		goodsList: [],
		isload: false
	},
	created: function () {
		$.showLoading();
		var self = this;
		//是否有过期时间，如果有 则去比对是否过期.如果过期 则去授权登录.如果没有过期时间则直接授权登录
		if (localStorage.getItem("timeLimit") && localStorage.getItem("frontUserId")) {
			var nowDatetime = Math.floor(new Date().getTime() / 1000);
			if (nowDatetime > localStorage.getItem("timeLimit")) { //过期
				localStorage.clear();
				self.authorization();
			} else { //未过期
				self.getUserInfo();
			}
		} else if (server.getUrlParam("code")) { //timeLimit或frontUserId 不存在则判断地址栏里是否有code 如果没有则去授权登录，有则用code请求用户信息
			self.getUserInfo();
		} else {
			localStorage.clear();
			self.authorization();
		}

	},
	methods: {
		//授权登录
		authorization: function () {
			window.location.href = server.baseUrl + "/weiXin/redirect.htm?redirectUri=" + window.location.href;
		},
		//用code 或 frontUserId获取用户个人信息
		getUserInfo: function () {
			var self = this;
			var code = "abc";
			if (server.getUrlParam("code")) {
				code = server.getUrlParam("code");
			}
			server.ajax({
				url: "/weiXin/getUserInfo",
				data: {
					needExtraData: 1,
					frontUserId: localStorage.getItem("frontUserId"), //localStorage.getItem("frontUserId")
					code: code
				},
				success: function (result) {
					var result = result.data;
					self.baseImageUrl = result.baseImageUrl;
					localStorage.setItem("frontUserId", result.frontUserId);
					localStorage.setItem("timeLimit", Math.floor(new Date().getTime() / 1000) + 604800);
					self.headImgUrl = result.img.replace("/0", '/96');//头像
					localStorage.setItem("headImgUrl",self.headImgUrl);
					self.nickname = result.nickname;//昵称
					self.integral = result.integral;//积分
					self.exchangedRecordCount=result.exchangedRecordCount;//积分兑换记录数
					result.integralRecordList.forEach(function (element) {
						element.weixinHeadimg = element.weixinHeadimg.replace("/0", '/96');
					}, this);
					self.integralRecordList = result.integralRecordList,
						self.goodsList = result.goodsList;
					// 微信SDK 权限校验 和分享配置
					var shareUrl = window.location.protocol+"//"+window.location.host+server.sharePathname+"/share.html?frontUserId="+result.frontUserId+"&headImgUrl="+self.headImgUrl;
					server.getSignature(shareUrl);
					setTimeout(function () {
						$.hideLoading();
						self.isload = true;
					}, 500);

				}
			})
		},
		// 兑换课程
		exchange: function (id, integral) {
			var self = this;
			server.ajax({
				url: "/frontUser/exchangeGoods",
				data: {
					goodsId: id,
					frontUserId: localStorage.getItem("frontUserId")
				},
				success: function (result) {
					self.integral -= integral;
					$.alert("兑换成功，请到兑换记录页查看", "兑换课程", function () {
						window.location.href = 'record.html';
					});
				}
			})
		},
		shareTips:function(type){
			window.location.href='share.html?frontUserId='+localStorage.getItem("frontUserId")+"&headImgUrl="+this.headImgUrl;
		}
	}
})