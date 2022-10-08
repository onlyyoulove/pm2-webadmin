const http = require('http');
const path = require('path');
const fs = require('fs');
const querystring = require('querystring');
const pm2 = require('pm2')
var url = require('url')
var lists;
var done = 'fail';
var mypass = 'you123456';/***** 这是登录密码，要自行设置 ******/
http.createServer((req,res)=>{
	// 路由（请求路径+请求方式）
	if(req.url.startsWith('/index') && req.method == 'GET'){
		var url_str = url.parse(req.url,true).query;
		let pdata = '';
		req.on('data',(chunk)=>{
			pdata += chunk;//一点一点的写入数据流
		});
		req.on('end',()=>{
			pm2.connect(function(err) {
				if (err) {
					console.error(err)
					process.exit(2)
				}
				pm2.list((err, list) => {
					var okc = list.length;
					lists = '';
					for (var i = 0;i<okc;i++){
						if(list[i]['name']!='pm22'){//这里可以设置pm2.js本身是否显示,写pm2则显示，其它不显示
							//console.log('pm2',list[i]);
							lists = lists +'id'+list[i]['pm_id']+'|'+list[i]['name']+'|状态:'+list[i]['pm2_env']['status']+'<br/><a href="/stop?code='+list[i]['name']+'&mypass='+url_str.mypass+'">停止</a>||<a href="/start?code='+list[i]['name']+'&jspath='+list[i]['pm2_env']['pm_exec_path']+'&mypass='+url_str.mypass+'">启动</a>||<a href="/reload?code='+list[i]['name']+'&mypass='+url_str.mypass+'">重载</a>||<a href="/delete?code='+list[i]['name']+'&mypass='+url_str.mypass+'">*删除*</a><br/><br/>';
						}
					}
					if (url_str.mypass != mypass){
						lists = 'No login<a href="/login">to login</a>';
					}
				})
			})
			fs.readFile(path.join(__dirname,'view','index.html'),'utf8',(err,con)=>{
				if(err){
					res.writeHead(500,{
						'Content-Type': 'text/plain; charset=utf8'
					});
					res.end('服务器错误，请与管理员联系');
				}
				// 返回内容之前要进行数据渲染
				con = con.replace('$$pm2list$$',lists);
				con = con.replace('$$mypass$$',url_str.mypass);
				res.end(con);
			});
		});
	}else if(req.url.startsWith('/stop') && req.method == 'GET'){
		console.log('stop...');
		let pdata = '';
		req.on('data',(chunk)=>{
			pdata += chunk;//一点一点的写入数据流
		});
		var url_str = url.parse(req.url,true).query;
		if (url_str.mypass != mypass){
			return;
		}
		console.log(url_str.code);
		req.on('end',()=>{
			let obj = querystring.parse(pdata);//解析数据，将数据转成对象
			pm2.connect(function(err) {
				if (err) {
					console.error(err)
					process.exit(2)
				}
				pm2.stop(url_str.code, function(err, apps) {
					if (err) {
						console.error(err)
						return pm2.disconnect()
						done = 'fail';
					}else{
						done = 'success';
					}
				})
			})
			fs.readFile(path.join(__dirname,'view','stop.html'),'utf8',(err,con)=>{
				if(err){
					res.writeHead(500,{
						'Content-Type': 'text/plain; charset=utf8'
					});
					res.end('服务器错误，请与管理员联系');
				}
				// 返回内容之前要进行数据渲染
				con = con.replace('$$how$$',done);
				con = con.replace('$$mypass$$',url_str.mypass);
				res.end(con);
			});
		});
	}else if(req.url.startsWith('/start') && req.method == 'GET'){
		console.log('start...');
		let pdata = '';
		req.on('data',(chunk)=>{
			pdata += chunk;//一点一点的写入数据流
		});
		var url_str = url.parse(req.url,true).query;
		if (url_str.mypass != mypass){
			return;
		}
		console.log(url_str.code);
		req.on('end',()=>{
			let obj = querystring.parse(pdata);//解析数据，将数据转成对象
			pm2.connect(function(err) {
				if (err) {
					console.error(err)
					process.exit(2)
				}
				pm2.start({
				script    : url_str.jspath,
				name      : url_str.code
				}, function(err, apps) {
					if (err) {
						console.error(err)
						return pm2.disconnect()
						done = 'fail';
					}else{
						done = 'success';
					}
				})
			})
			fs.readFile(path.join(__dirname,'view','start.html'),'utf8',(err,con)=>{
				if(err){
					res.writeHead(500,{
						'Content-Type': 'text/plain; charset=utf8'
					});
					res.end('服务器错误，请与管理员联系');
				}
				// 返回内容之前要进行数据渲染
				con = con.replace('$$how$$',done);
				con = con.replace('$$mypass$$',url_str.mypass);
				res.end(con);
			});
		});
	}else if(req.url.startsWith('/reload') && req.method == 'GET'){
		console.log('reload...');
		let pdata = '';
		req.on('data',(chunk)=>{
			pdata += chunk;//一点一点的写入数据流
		});
		var url_str = url.parse(req.url,true).query;
		if (url_str.mypass != mypass){
			return;
		}
		console.log(url_str.code);
		req.on('end',()=>{
			let obj = querystring.parse(pdata);//解析数据，将数据转成对象
			pm2.connect(function(err) {
				if (err) {
					console.error(err)
					process.exit(2)
				}
				pm2.reload(url_str.code, function(err, apps) {
					if (err) {
						console.error(err)
						return pm2.disconnect()
						done = 'fail';
					}else{
						done = 'success';
					}
				})
			})
			fs.readFile(path.join(__dirname,'view','reload.html'),'utf8',(err,con)=>{
				if(err){
					res.writeHead(500,{
						'Content-Type': 'text/plain; charset=utf8'
					});
					res.end('服务器错误，请与管理员联系');
				}
				// 返回内容之前要进行数据渲染
				con = con.replace('$$how$$',done);
				con = con.replace('$$mypass$$',url_str.mypass);
				res.end(con);
			});
		});
	}else if(req.url.startsWith('/delete') && req.method == 'GET'){
		console.log('delete...');
		let pdata = '';
		req.on('data',(chunk)=>{
			pdata += chunk;//一点一点的写入数据流
		});
		var url_str = url.parse(req.url,true).query;
		if (url_str.mypass != mypass){
			return;
		}
		console.log(url_str.code);
		req.on('end',()=>{
			let obj = querystring.parse(pdata);//解析数据，将数据转成对象
			pm2.connect(function(err) {
				if (err) {
					console.error(err)
					process.exit(2)
				}
				pm2.delete(url_str.code, function(err, apps) {
					if (err) {
						console.error(err)
						return pm2.disconnect()
						done = 'fail';
					}else{
						done = 'success';
					}
				})
			})
			fs.readFile(path.join(__dirname,'view','delete.html'),'utf8',(err,con)=>{
				if(err){
					res.writeHead(500,{
						'Content-Type': 'text/plain; charset=utf8'
					});
					res.end('服务器错误，请与管理员联系');
				}
				// 返回内容之前要进行数据渲染
				con = con.replace('$$how$$',done);
				con = con.replace('$$mypass$$',url_str.mypass);
				res.end(con);
			});
		});
	}else if(req.url.startsWith('/login') && req.method == 'GET'){
		console.log('login...');
		let pdata = '';
		req.on('data',(chunk)=>{
			pdata += chunk;//一点一点的写入数据流
		});
		var url_str = url.parse(req.url,true).query;
		console.log(url_str.mypass);
		req.on('end',()=>{
			let obj = querystring.parse(pdata);//解析数据，将数据转成对象
			fs.readFile(path.join(__dirname,'view','login.html'),'utf8',(err,con)=>{
				if(err){
					res.writeHead(500,{
						'Content-Type': 'text/plain; charset=utf8'
					});
					res.end('服务器错误，请与管理员联系');
				}
				// 返回内容之前要进行数据渲染
				console.log('url_str.mypass'+url_str.mypass);
				if(url_str.mypass!=null && url_str.mypass){
					if (url_str.mypass == mypass)
					{
						con = con.replace('$$login$$','登录成功!<a href="/index?mypass='+url_str.mypass+'">进入后台</a>');
					}else{
						con = con.replace('$$login$$','登录失败，密码不正确!');
					}
				}
				res.end(con);
			});
		});
	}	
}).listen(4343,()=>{
	console.log('running...');
});