<?php
//设置允许跨域访问的响应头
header("Access-Control-Allow-Origin: *"); //允许的访问源：所有
header("Access-Control-Allow-Headers:X-Requested-With");//允许的访问类型：ajax

//导入设置信息
require("../../../settings-local.php");
//或者定义常量
//define('SQL_HOST', '192.168.1.138');   // 数据库服务器地址
//define('SQL_DBNAME', 'bgmobile');    // 数据库名称
//define('SQL_USERNAME', 'root');    // 数据库用户账号
//define('SQL_PASSWORD', '123');    // 数据库用户密码
//define('SQL_CONNECTIONSTRING', 'mysql:dbname='.SQL_DBNAME.';host='.SQL_HOST);    // 数据库链接（依据上面自动生成，无需修改）

//导入类库文件
require("DataMagic.php");

//默认参数
$name=isset($_REQUEST["name"]) ? $_REQUEST["name"] : "news";


$demo=array(
	"default"=>array(),
	"insert"=>array(
		"action"=>"insert",
		"data"=>array(
			"title"=>"432werer",
			"content"=>"gtrtr",
			"type"=>"1",
			"add_time"=>"1483200000",
			"tag"=>"0",
			"userid"=>"tgrt",
			"username"=>"trgtrgt"
		)
	),
	"delete"=>array(
		"action"=>"delete",
		"where"=>"id in (2)"
	),
	"search"=>array(
		"action"=>"search",
		"where"=>array(
			"title"=>"trg"
		)
	)
);

$db=new PDO(SQL_CONNECTIONSTRING, SQL_USERNAME, SQL_PASSWORD);
$magic=DataMagic::createDataMagic($name,$db);
$magic->permission=array("person","oa_news");
$data=$magic->shortcutOperate($_REQUEST);

//兼容jsonp协议
$callback = $_REQUEST['callback'];
if ($callback) {
    header('Content-Type: text/javascript');
    echo $callback . '(' . json_encode($data) . ');';
} else {
    header('Content-Type: application/x-json');
    echo json_encode($data);
}
?>