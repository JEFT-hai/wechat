'use strict'

var Koa = require('koa')
var path = require('path')
var wechat = require('./wechat/g')
var util = require('./libs/util')
var config = require('./config')
var weixin = require('./wx/reply')
var Wechat = require('./wechat/wechat')

var app = new Koa()

var ejs = require('ejs')
var crypto = require('crypto')
var heredoc = require('heredoc')

var tpl = heredoc(function(){/*
<!DOCTYPE html>
<html>
  <head>
    <title>搜电影</title>
    <meta name="viewport" content="initial-scale=1,maximum-scale=1,minimum-scale=1"
  </head>
  <body>
	<h1>点击标题，开始录音翻译</h1>
	<p id="title"></p>
	<p id="year"></p>
	<p id="doctor"></p>
	<div id="poster"></div>
	<script src="http://zeptojs.com/zepto-docs.min.js"></script>
	<script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>

	<script>
	  wx.config({
		debug:true,
		appId:'wx5bf5b0664493ee03',
		timestamp:'<%= timestamp%>',
		nonceStr:'<%= noncestr%>',
		signature:'<%= signature%>',
		jsApiList:[
			'startRecord',
			'stopRecord',
			'onVoiceRecordEnd',
			'translateVoice'
		]
	  })

	  wx.ready(function(){
		wx.checkJsApi({
			jsApiList:['onVoiceRecordEnd'],
			success:function(res){
				console.log(res)
			}
		})

		var isRecording = false

		$('h1').on('tap',function(){
			if(!isRecording){
				isRecording= true
				wx.startRecord({
					cancel:function(){
						window.alert('那就不能搜了哦')
					}
				})

				return
			}

			isRecording = false

			wx.stopRecord({
			    success: function (res) {
			        var localId = res.localId;

			        wx.translateVoice({
					    localId: localId, 
					    isShowProgressTips: 1,
					    success: function (res) {
					        window.alert(res.translateResult); 
					    }
					});
			    }
			});
		})
	  })
	  </script>
  </body>
</html>  
*/})

var createNonce = function(){
	return Math.random().toString(36).substr(2,15)
}

var createTimestamp = function(){
	return parseInt(new Date().getTime() / 1000,10) + ''
}

var _sign = function(noncestr,ticket,timestamp,url){
	var params = [
		'noncestr=' +noncestr,
		'jsapi_ticket=' + ticket,
		'timestamp=' + timestamp,
		'url=' + url
	]

	var str = params.sort().join('&')
	var shasum = crypto.createHash('sha1')

	shasum.update(str)

	return shasum.digest('hex')
}

function sign(ticket,url){
	var noncestr = createNonce()
	var timestamp = createTimestamp()
	var signature = _sign(noncestr,ticket,timestamp,url)

	return  {
		noncestr:noncestr,
		timestamp:timestamp,
		signature:signature
	}
}

app.use(function*(next){
	if(this.url.indexOf('/movie') > -1){
		var wechatApi = new Wechat(config.wechat)
		var data = yield wechatApi.fetchAccessToken()
		var access_token = data.access_token
		var ticketData = yield wechatApi.fetchTicket(access_token)

		var ticket = ticketData.ticket
		var url = this.href.replace(':10967','')
		var params = sign(ticket,url)

		this.body = ejs.render(tpl,params)

		return next
	}

	yield next
})

app.use(wechat(config.wechat,weixin.reply))

app.listen(80)
console.log('Listening:80')