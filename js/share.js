(function ($,win) {
    $("#shareBtn").on('click', function () {
        $(".shareMask").show();
    });
    $(".shareMask").on('click', function () {
        $(".shareMask").hide();
    });
    var wxShareUrl=win.location.protocol+"//"+win.location.host+server.sharePathname+"/share.html?frontUserId="+server.getUrlParam("frontUserId")+"&headImgUrl="+server.getUrlParam("headImgUrl");
    server.getSignature(wxShareUrl);//微信权限校验
    server.ajax({
        url: "/weiXin/getQrcodeWithParam",
        data: {
            frontUserId: server.getUrlParam("frontUserId"),
        },
        success: function (result) {
            $("#qrCode").qrcode({
                render: "canvas", //设置渲染方式，有table和canvas，使用canvas方式渲染性能相对来说比较好
                text: result.data.url, //扫描了二维码后的内容显示,在这里也可以直接填一个网址，扫描二维码后
                width: "190", //二维码的宽度
                height: "190", //二维码的高度
                background: "#ffffff", //二维码的后景色
                foreground: "#000000", //二维码的前景色
                src: server.getUrlParam("headImgUrl") //二维码中间的图片
            });
            $("#qrCodeImg").html(convertCanvasToImage($("#qrCode canvas")[0]));

        }
    })

    function convertCanvasToImage(canvas) {
        var image = new Image();
        image.src = canvas.toDataURL("image/png");
        // console.log(image);
        return image;
    }
})(jQuery,window)