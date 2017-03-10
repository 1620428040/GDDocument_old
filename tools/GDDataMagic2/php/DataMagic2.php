<?php
//响应头
header("Access-Control-Allow-Origin: *"); //允许的访问源：所有
header("Access-Control-Allow-Headers:X-Requested-With");//允许的访问类型：ajax

//导入设置信息
require("../settings-local.php");

//默认参数
$name=isset($_REQUEST["name"]) ? $_REQUEST["name"] : "news";

//$db=new MySQLClass(SQL_HOST,SQL_USERNAME,SQL_PASSWORD,SQL_DBNAME);
////定义常量
//define('SQL_HOST', '192.168.1.138');   // 数据库服务器地址
//define('SQL_DBNAME', 'bgmobile');    // 数据库名称
//define('SQL_USERNAME', 'root');    // 数据库用户账号
//define('SQL_PASSWORD', '123');    // 数据库用户密码
//define('SQL_CONNECTIONSTRING', 'mysql:dbname='.SQL_DBNAME.';host='.SQL_HOST);    // 数据库链接（依据上面自动生成，无需修改）

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
echo json_encode($data);

//基类
class DataMagic{
	var $db;//数据库链接
	var $meta;//数据对象的元数据
	var $permission;//允许访问的数据表
	var $sensitive;//禁止访问的敏感数据表，只有$permission为空时有效
	var $errorMess;//返回的错误提示
	const defaultDataSource="file";//"file",文件;"db",文件;
	
	function __construct($name="",$meta=null,$db){
		if($meta===null){
			$meta=self::getMeta($name);
		}
		$this->db=$db;
		$this->meta=$meta;
	}
	//工厂方法，要求$meta["handler"]中的类是DataMagic的子类
	static function createDataMagic($name,$db){
		$meta=self::getMeta($name);
		$inst=null;
		if(isset($meta["handler"])&&class_exists($meta["handler"])){
			$inst=new $meta["handler"]($name,$meta,$db);
		}
		else{
			$inst=new DataMagic($name,$meta,$db);
		}
		return $inst;
	}
	static function getMeta($name){
		//如果相应的meta文件存在，则直接读取文件
		$path="meta/".$name.".json";
		$meta=null;
//		echo $path."\n";
//		if(self::defaultDataSource==="file"&&file_exists($path)){
			$content=file_get_contents($path);
//			echo $content."\n";
			$meta=json_decode($content,TRUE);
//			print_r($meta);
//		}
//		else{
//			$meta=self::getMetaFromDatabase($name)||self::getMetaFromDefault($name);
//			file_put_contents($path, json_encode($meta));
//		}
		return $meta;
	}
	/*
	//从数据库的tables表中读取元数据
	static function getMetaFromDatabase($name){
		$result=$this->db->query("SELECT * from tables where name='$name' or id='$name'")->fetchAll(PDO::FETCH_ASSOC);
		if($result){
			$table=$result[0];
			if($table["bindTable"]&&$this->authorityExamine($table["bindTable"])===FALSE){
				echo json_encode($this->errorMess);
				exit;
			}
			$columns=$this->db->search("fields", "id in (".$table["fieldList"].")","*",null);
			$meta=array();
			$fieldList=array();
			
			//处理表格相关的meta
			foreach($table as $key=>$value){
				if($value!=null){
					$meta[$key]=$table[$key];
				}
			}
			
			//排序
			$sortIndex=explode(",",$table["fieldList"]);
			$newColumns=array();
			for($i=0;$i<count($columns);$i++){
				if($columns[$i]["id"]==$table["primaryField"]){
					$meta["primaryField"]=$columns[$i]["field"];
				}
				for($j=0;$j<count($sortIndex);$j++){
					if($columns[$i]["id"]==$sortIndex[$j]){
						$newColumns[$j]=$columns[$i];
						break;
					}
				}
			}
			$columns=$newColumns;
			
			//处理字段相关的meta
			for($i=0;$i<count($columns);$i++){
				$fieldList[$columns[$i]["field"]]=array();
				foreach($columns[$i] as $key=>$value){
					if($value!=null&&$key!="field"){
						$fieldList[$columns[$i]["field"]][$key]=$value;
					}
				}
			}
			$meta["fieldList"]=$fieldList;
			$meta["feature"]=explode(",",$table["feature"]);
			return $meta;
		}
	}
	//直接获取相应的数据表，生成默认的元数据
	static function getMetaFromDefault($name){
		return $result=$this->db->query("SELECT * from tables where name='$name' or id='$name'")->fetchAll(PDO::FETCH_ASSOC);
	}*/
	//快捷操作，直接通过一组参数执行相应的操作
	function shortcutOperate($params){
		$result=null;
		$action=isset($params["action"])?$params["action"]:null;
		
		if($action==="getMeta"||$action==null){//默认是返回元数据
			$result=$this->exportMeta();//print_r($params);
			$result["data"]=$this->search($params);
		}
		elseif(method_exists($this, $action)){
			$result=$this->$action($params);
		}
		else{
			$this->errorMess=array("status"=>"error","reason"=>"指定的action未定义");
			return $this->errorMess;
		}
		return $result;
	}
	//输出meta数据
	function exportMeta(){
		$meta=$this->meta;
		unset($meta["bindTable"]);
		unset($meta["handler"]);
		foreach($meta["fieldList"] as $kn=>$kv){
			if($kv["hidden"]===TRUE){
				unset($meta["fieldList"][$kn]);
			}
		}
		return $meta;
	}
	function insert($params){
		$data=$this->inputDataDispose($params["data"]);
		$data=$this->writeDataAdapter($data);
		
		$keys=array();
		$values=array();
		foreach($this->meta["fieldList"] as $key=>$value){
			if($key==="id"){
				continue;
			}
			if(isset($data[$key])){
				$keys[]=$key;
				$values[]=$data[$key];
			}
		}
		$sql="INSERT INTO `".$this->meta["bindTable"]."` (`".join("`, `", $keys)."`) VALUES ('".join("', '", $values)."')";
		$this->db->exec($sql);
		return $this->db->lastInsertId();
	}
	//删除操作只能使用指定的ID(数组)
	function delete($params){
		return $this->db->exec("DELETE FROM `".$this->meta["bindTable"]."` WHERE id in(".join(",", $params["where"]["id"]).")");
	}
	//修改操作只能通过ID来查找
	function update($params){
		$data=$this->inputDataDispose($params["data"]);
		$data=$this->writeDataAdapter($data);
		
		$sections=array();
		foreach($this->meta["fieldList"] as $key=>$value){
			if($key==="id"){
				continue;
			}
			if(isset($data[$key])){
				$sections[]=" `".$key."` = '".$data[$key]."'";
			}
		}
		$sql="UPDATE `".$this->meta["bindTable"]."` SET".join(",", $sections)." WHERE `id` = ".$params["where"]["id"];
		return $this->db->exec($sql);
	}
	function search($params){
//		print_r($params);
		$sql="SELECT * FROM `".$this->meta["bindTable"]."`";
		if($params){
			if(isset($params["where"])){
				$where=$this->parserWhere($params["where"]);
	//			echo "where:".$where."\n";
				if($where){
					$sql.=" WHERE ".$where;
				}
			}
			
			$pagesize = isset($params["pagesize"]) ? intval($params["pagesize"]) : 20 ;
			$page = isset($params["page"]) ? intval($params["page"]) : 0 ;
			$sql.=" LIMIT ".($page*$pagesize).",".$pagesize;
		}
//		echo $sql."\n";exit;
		$result=$this->db->query($sql);
		$data=$result->fetchAll(PDO::FETCH_ASSOC);
		$data=$this->readDataAdapter($data);
		$data=$this->outputDataDispose($data);
		return $data;
	}
	//将查询条件转换成sql语句的形式
	function parserWhere($where){
		$whereStr=array();
		foreach($this->meta["fieldList"] as $key=>$value){
			$whereItem=$where[$key];
			if($whereItem){
				if($key==="id"){
					$whereStr[]=$key."=".$whereItem;
				}
				elseif($value["type"]==="Number"||$value["type"]==="Date"||$value["type"]==="DateTime"){
					if($whereItem["start"]){
						$whereStr[]=$key.">".$whereItem["start"];
					}
					if($whereItem["end"]){
						$whereStr[]=$key."<".$whereItem["end"];
					}
				}
				else{
					$whereStr[]=$key." like '%".$whereItem."%'";
				}
			}
		}
		return join(" and ", $whereStr);
	}
	//检查是否有权限访问数据
	function authorityExamine($tableName){
		$permit=TRUE;
		if($this->permission){
			foreach($this->permission as $permission){
				if($tableName===$permission){
					$permit=TRUE;
					break;
				}
			}
			$this->errorMess=array("status"=>"error","reason"=>"数据表:".$tableName." 不在允许访问的范围内");
			$permit=FALSE;
		}
		elseif($this->sensitive){
			foreach($this->sensitive as $permission){
				if($tableName===$permission){
					$this->errorMess=array("status"=>"error","reason"=>"数据表:".$tableName." 属于敏感数据，无权访问");
					$permit=FALSE;
					break;
				}
			}
			$permit=TRUE;
		}
		if($permit===FALSE) {
			writeToFile($this->errorMess);
		}
		return $permit;
	}
	//输入数据之前进行处理，如果出现错误就结束脚本
	function inputDataDispose($data){
		if(!$data){
			echo json_encode(array("status"=>"error","reason"=>"输入的数据为空"));
			exit;
		}
		foreach($this->meta["fieldList"] as $key=>$value){
			if($key==="id"){
				continue;
			}
			$dataItem=$data[$key];
			if(isset($value["notNull"])&&$value["notNull"]==="1"&&($dataItem==null||$dataItem==="")){
				echo json_encode(array("status"=>"error","reason"=>"字段：".$key." 的值不能为空"));
				exit;
			}
			if($dataItem&&isset($value["regexp"])&&!preg_match($value["regexp"], $dataItem)){
				echo json_encode(array("status"=>"error","reason"=>"字段：".$key." 的值格式错误"));
				exit;
			}
		}
		return $data;
	}
	//输出数据之前进行处理
	function outputDataDispose($data){
		return $data;
	}
	//读取数据库时进行适配
	function readDataAdapter($data){
		return $data;
	}
	//写入数据库时进行适配
	function writeDataAdapter($data){
		return $data;
	}
}
//针对已经有的旧的数据表的适配版本
class DataMagicInterim extends DataMagic{
//	function search($params){
//		$params=$params||array();
//		if($_REQUEST["name"]==="bpm"){
//			if(isset($_REQUEST["creatorname"])){
//				$params["where"]["creatorname"]=$_REQUEST["creatorname"];
//			}
//			if(isset($_REQUEST["type"])&&$_REQUEST["type"]==="done"){
//				$params["where"]["result"]="y";
//			}
//		}
////		print_r($params);
//		return parent::search($params);
//	}
	function outputDataDispose($data){
		return $data;
	}
}
?>

<?php
////直接读取相应的数据表的结构信息，生成默认的meta文件
////$name="";
////$tableName="foo";
//
////定义常量
//define('SQL_HOST', '192.168.1.138');   // 数据库服务器地址
//define('SQL_DBNAME', 'bgmobile');    // 数据库名称
//define('SQL_USERNAME', 'root');    // 数据库用户账号
//define('SQL_PASSWORD', '123');    // 数据库用户密码
//define('SQL_CONNECTIONSTRING', 'mysql:dbname='.SQL_DBNAME.';host='.SQL_HOST);    // 数据库链接（依据上面自动生成，无需修改）
//
////create("duty", "oa_duty");
////create("stamp", "oa_stamp_log");
////create("leave", "oa_noteforleave");
//create("travel", "oa_travel");
//
//function create($name,$tableName){
//	$path="../meta/".$name.".json";
//
//	$pdo=new PDO(SQL_CONNECTIONSTRING, SQL_USERNAME, SQL_PASSWORD);
//	$tableInfo=$pdo->query("SHOW TABLES LIKE '".$tableName."'")->fetchAll(PDO::FETCH_ASSOC);
//	if($tableInfo==null){//如果表不存在，则报错
//		throw new Exception("要修改的表不存在！");
//	}
//	else{
//		//表信息
//		$meta=file_exists($path)?json_decode(file_get_contents($path),TRUE):array();//如果文件已经存在，则根据已有文件进行修改
//		isset($meta["describe"])||$meta["describe"]=$tableInfo[0]["Comment"];
//		$meta["bindTable"]=$tableName;
//		$meta["primaryFields"]=null;
//		isset($meta["feature"])||$meta["feature"]=array("browse","insert","delete","update","search","refresh");
//		isset($meta["fieldList"])||$meta["fieldList"]=array();
//		
//		//字段信息
//		$result=$pdo->query("SHOW FULL COLUMNS FROM `".$tableName."`")->fetchAll(PDO::FETCH_ASSOC);
//		foreach($result as $row){
//			$field=isset($meta["fieldList"][$row["Field"]])?$meta["fieldList"][$row["Field"]]:array();
//			if($row["Key"]==="PRI"){
//				$meta["primaryFields"]=$row["Field"];
//			}
//			$type=explode("(",$row["Type"]);
//			isset($field["title"])||$field["title"]=urlencode($row["Comment"]);
//			if(!isset($field["type"])){
//				if($type[0]==="int"){
//					$field["type"]="number";
//				}
//			}
//			$field["notNull"]=$row["Null"]!=="NO";
//			$field["dataType"]=$type[0];
//			$field["maxlength"]=intval(str_replace(")", "", $type[1]));
//			$meta["fieldList"][$row["Field"]]=$field;
//		}
//	}
//	$meta=urldecode(json_encode($meta));
//	file_put_contents($path, decodeUnicode($meta));
//}
//function decodeUnicode($str)
//{
//  return preg_replace_callback(
//  	'/\\\\u([0-9a-f]{4})/i',
//      create_function(
//          '$matches',
//          'return mb_convert_encoding(pack("H*", $matches[1]), "UTF-8", "UCS-2BE");'
//      ),
//      $str
//	);
//}
?>