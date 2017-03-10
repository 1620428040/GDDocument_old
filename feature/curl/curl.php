<?php

///GET方式
//初始化
$curl=curl_init();
//设置请求的参数
curl_setopt($curl, CURLOPT_URL, "http://www.jb51.net");
curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($curl, CURLOPT_HEADER, 0);
//执行
$output = curl_exec($curl);
//释放
curl_close($curl);
//输出
print_r($output);

///POST方式
$server="http://localhost/web_services.php";
$post_data = array ("username" => "bob","key" => "12345");
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $server);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
// post数据
curl_setopt($ch, CURLOPT_POST, 1);
// post的变量
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
$output = curl_exec($ch);
curl_close($ch);
//打印获得的数据
print_r($output);

//常用参数含义：
CURLOPT_URL//设定URL
CURLOPT_RETURNTRANSFER//如果等于1，则数据会作为返回值；等于0，数据会直接发送给浏览器
CURLOPT_HEADER//启用时会将头文件的信息作为数据流输出
CURLOPT_POST//等于1，则使用POST方式
CURLOPT_POSTFIELDS//POST形式发送的字段，数组格式
?>