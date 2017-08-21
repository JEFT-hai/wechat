'use strict'

var config = require('../config')
var Wechat = require('../wechat/wechat')
var menu = require('./menu')
var wechatApi = new Wechat(config.wechat)
var path = require('path')

wechatApi.deleteMenu().then(function(){
	return wechatApi.createMenu(menu)
})
.then(function(msg){
	console.log(msg)
})

exports.reply = function*(next){
	var message = this.weixin

	if(message.MsgType === 'event'){
		if(message.Event === 'subscribe'){
			if(message.EventKey){
				console.log('扫描二维码进来'+ message.EventKey +''+message.ticket)
			}

			this.body = '你好' 
		}
		else if(message.Event === 'unsubscribe'){
			console.log('无情取关')
			this.body = ''
		}	
		else if(message.Event === 'LOCATION'){
			this.body = '您上报的位置是：'+ message.Latitude + '' + message.Longitude + '-' + message.Precision
		}
		else if(message.Event === 'CLICK'){
			this.body = '您点击了菜单：'+ message.EventKey
		}
		else if(message.Event === 'SCAN'){
			console.log('关注后扫描二维码' + message.Event+ ' ' + message.Ticket)
			this.body = '看到你扫了一下哦'
		}
		else if(message.Event === 'VIEW'){
			this.body = '您点击了菜单中的链接 ：' + message.EventKey
		}
		else if(message.Event === 'scancode_push'){
			console.log(message.ScanCodeInfo.ScanType)
			console.log(message.ScanCodeInfo.ScanResult)
			this.body = '您点击了菜单中：' + message.EventKey
		}
		else if(message.Event === 'scancode_waitmsg'){
			console.log(message.ScanCodeInfo.ScanType)
			console.log(message.ScanCodeInfo.ScanResult)
			this.body = '您点击了菜单中：' + message.EventKey
		}
		else if(message.Event === 'pic_sysphoto'){
			console.log(message.SendPicsInfo.PicList)
			console.log(message.SendPicsInfo.Count)
			this.body = '您点击了菜单中：' + message.EventKey
		}
		else if(message.Event === 'pic_photo_or_album'){
			console.log(message.SendPicsInfo.PicList)
			console.log(message.SendPicsInfo.Count)
			this.body = '您点击了菜单中：' + message.EventKey
		}
		else if(message.Event === 'pic_weixin'){
			console.log(message.SendPicsInfo.PicList)
			console.log(message.SendPicsInfo.Count)
			this.body = '您点击了菜单中：' + message.EventKey
		}
		else if(message.Event === 'location_select'){
			console.log(message.SendLocationInfo.Location_X)
			console.log(message.SendLocationInfo.Location_Y)
			console.log(message.SendPicsInfo.Scale)
			console.log(message.SendPicsInfo.Lable)
			console.log(message.SendPicsInfo.Poiname)
			this.body = '您点击了菜单中：' + message.EventKey
		}
	}
	else if(message.MsgType === 'text'){
		var content = message.Content
		var reply = '额，你说的 '+message.Content + ' 太复杂了'

		if(content === '1'){
			reply = '天下第一吃仙丹'
		}
		else if(content === '2'){
			reply = '天下第一吃豆腐'
		}
		else if(content === '3'){
			reply = '天下第一吃大米'
		}
		else if(content === '4'){
			reply = [{
				title:'技术改变世界',
				description:'只是个描述而已',
				picUrl:'http://p4.so.qhmsg.com/t0191873d007b121d24.jpg',
				url:'https://www.so.com/s?ie=utf-8&src=hao_isearch2_ad_7&q=%E4%BC%98%E9%85%B7'
			}]
		}
		else if(content === '5'){
			var data = yield(wechatApi.uploadMaterial('image',path.join(__dirname,
							'../2.jpg')))

			reply = {
				type: 'image',
				mediaId:data.media_id
			}
		}
		else if(content === '6'){
			var data = yield(wechatApi.uploadMaterial('video',path.join(__dirname ,
							'../6.mp4')))

			reply = {
				type: 'video',
				title:'回复视频内容',
				description:'描述',
				mediaId:data.media_id
			}
		}
		else if(content === '7'){
			var data = yield(wechatApi.uploadMaterial('image',path.join(__dirname , 
							'../2.jpg')))

			reply = {
				type: 'music',
				title:'回复视频内容',
				description:'放松一下',
				musicUrl: 'http://mpge.5nd.com/2015/2015-9-12/66325/1.mp3',
				thumbMediaId:data.media_id
			}
		}
		else if(content === '8'){
			var data = yield(wechatApi.uploadMaterial('image',path.join(__dirname ,
							'../2.jpg'),{type:'image'}))
			console.log(data)
			reply = {
				type: 'image',
				mediaId:data.media_id
			}
		}
		else if(content === '9'){
			var data = yield(wechatApi.uploadMaterial('video',path.join(__dirname , 
							'../6.mp4'),{type:'video',description:'{"title":"Really a nice place","introduction":"Never think it"}'}))

			console.log(data)
			reply = {
				type: 'video',
				title:'回复视频内容',
				description:'描述',
				mediaId:data.media_id
			}
		}
		else if(content === '10'){
			var picData = yield(wechatApi.uploadMaterial('image',path.join(__dirname , 
							'../2.jpg'),{}))

			console.log(picData)

			var media = {
				articles:[{
					title:'tututu',
					thumb_media_id:picData.media_id,
					author:'hai',
					digest:'摘要',
					show_cover_pic:1,
					contnet:'没有内容',
					content_source_url:'https://github.com'					
				}]
			}
			
			data = yield wechatApi.uploadMaterial('news',media,{})
			data = yield wechatApi.fetchMaterial(data.media_id,'news',{})

			//console.log(data)

			var items = data.news_item
			var news = []

			items.forEach(function(item){
				news.push({
					title:item.title,
					description:item.digest,
					picUrl:picData.url,
					url:item.url
				})
			})

			reply = news
		}
		else if(content === '11'){
			var counts = yield wechatApi.countMaterial()

			console.log(JSON.stringify(counts))

			var results = yield [
			wechatApi.batchMaterial({
				type:'image',
				offset:0,
				count:10
			}),
			wechatApi.batchMaterial({
				type:'video',
				offset:0,
				count:10
			}),
			wechatApi.batchMaterial({
				type:'voice',
				offset:0,
				count:10
			}),
			wechatApi.batchMaterial({
				type:'image',
				offset:0,
				count:10
			})
			]

			console.log(JSON.stringify(results))

			reply = '1'
		}
		// else if(content === '11'){
		// 	var group = yield wechatApi.createGroup('wechat')

		// 	console.log('新分组 wechat')
		// 	console.log(group)

		// 	var groups = yield wechatApi.fetchGroups()

		// 	console.log('加了 wechat 后的分组列表')
		// 	console.log(groups)

			// var group2 = yield wechatApi.checkGroup(message.FromUserName)

			// console.log('查看自己的分组')
			// console.log(group2)

		// 	var result = yield wechatApi.moveGroup(message.FromUserName,100)

		// 	console.log('移动到100')
		// 	console.log(result)

		// 	var groups2 = yield wechatApi.fetchGroups()

		// 	console.log('移动后的分组列表')
		// 	console.log(groups2)

		// 	var result2 = yield wechatApi.moveGroup([message.FromUserName],102)

		// 	console.log('批量移动到101')
		// 	console.log(result)

		// 	var groups3 = yield wechatApi.fetchGroups()

		// 	console.log('批量移动后的分组列表')
		// 	console.log(groups3)

		// 	var result3 = yield wechatApi.updateGroup(102,'wechat10')

		// 	console.log('更新后的分组')
		// 	console.log(result3)	

		// 	var groups4 = yield wechatApi.fetchGroups()

		// 	console.log('批量移动后的分组列表')
		// 	console.log(groups3)

		// 	var result4 = yield wechatApi.deleteGroup(101)

		// 	console.log('删除后的分组列表')
		// 	console.log(result4)

		// 	var groups5 = yield wechatApi.fetchGroups()

		// 	console.log('删除101后的分组列表')
		// 	console.log(groups5)		

		// 	reply ='Group done!'
		// }
		else if (content === '12'){
			var user = yield wechatApi.fetchUsers(message.FromUserName)

			console.log(user)

			var openIds = [
			{
				openid:message.FromUserName
			}]

			var users = yield wechatApi.fetchUsers(openIds)

			console.log(users)

			reply = JSON.stringify(user)
		}
		else if (content === '13'){
			var userlist = yield wechatApi.listUsers()

			console.log(userlist)

			reply = userlist.total
		}
		else if (content === '14'){

			// var group2 = yield wechatApi.checkGroup(message.FromUserName)

			// console.log('查看自己的分组')
			// console.log(group2)

			var image = {
				media_id:'G4TVenIH3GP2hjwik__atS0jHgqczr2DXeZk63QbiA'
			}

			var text = {
				"content":"Hellow Wechat"
			}

			var msgData = yield wechatApi.sendByGroup('text',text,102)

			console.log(msgData)
			reply = 'Yeah'
		}
		else if (content === '15'){

			// var group2 = yield wechatApi.checkGroup(message.FromUserName)

			// console.log('查看自己的分组')
			// console.log(group2)

			var image = {
				media_id:'G4TVenIH3GP2hjwik__atS0jHgqczr2DXeZk63QbiA'
			}

			var text = {
				"content":"Hellow Wechat"
			}

			var msgData = yield wechatApi.previewMass('text',text,'o6ynAwbAUR86v52ENnVoQlVxgWng')

			console.log(msgData)
			reply = 'Yeah'
		}
		else if (content === '16'){

			var msgData = yield wechatApi.checkMass('1000000007')

			console.log(msgData)
			reply = 'Yeah hah '
		}
		else if (content === '17'){
			var tempQr = {
				expire_seconds:400000,
				action_name:'QR_SCENE',
				action_info:{
					scene:{
						scene_id:123
					}
				}
			}

			var permQr = {
				action_name:'QR_LIMIT_SCENE',
				action_info:{
					scene:{
						scene_id:123
					}
				}
			}

			var permStrQr = {
				action_name:'QR_LIMIT_STR_SCENE',
				action_info:{
					scene:{
						scene_str:'abc'
					}
				}
			}

			var msgData = yield wechatApi.checkMass('1000000007')

			console.log(msgData)
			reply = 'Yeah hah '
		}
		else if (content === '19'){
			var longUrl = 'http://www.imooc.com/'

			var shortData = yield wechatApi.createShorturl(null,longUrl)

			reply = shortData.short_url
			
		}
		else if (content === '20'){
			var semanticData = {
				query:'寻龙诀',
				city:'深圳',
				category:'movie',
				uid:message.FromUserName
			}

			var _semanticData = yield wechatApi.semantic(semanticData)

			reply = JSON.stringify(_semanticData)
			
		}


		this.body = reply
	}	

	yield next
}