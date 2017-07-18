var app = new Vue({
	el: "#index",
	data: {
		baseImageUrl: "",
		headImgUrl: "",
		nickname: "",
		integral: 0,
		integralRecordList: [],
		goodsList: [],
		isload:false
	},
	created: function () {
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
		} else { //timeLimit或frontUserId 不存在则去 授权登录
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
					frontUserId: 1, //localStorage.getItem("frontUserId"),
					code: code
				},
				success: function (result) {
					var result = result.data;
					self.baseImageUrl = result.baseImageUrl;
					localStorage.setItem("frontUserId", result.frontUserId);
					localStorage.setItem("timeLimit", Math.floor(new Date().getTime() / 1000) + 604800);
					self.headImgUrl = result.img.replace("/0", '/96');
					self.nickname = result.nickname;
					self.integral = result.integral;
					result.integralRecordList.forEach(function (element) {
						element.weixinHeadimg = element.weixinHeadimg.replace("/0", '/96');
					}, this);
					self.integralRecordList = result.integralRecordList,
					self.goodsList = result.goodsList;
					setTimeout(function(){
						self.isload=true;
					},500);
					
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
		}
	}
})