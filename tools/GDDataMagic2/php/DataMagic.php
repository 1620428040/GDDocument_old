<?
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
		$path="../meta/".$name.".json";
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
			$result["count"]=$this->count($params);
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
		
		$alias=array();//将键名和健值对换过的别名
		
		foreach($meta["alias"] as $aliasName=>$name){
			$alias[$name]=$aliasName;
		}
		$fieldList=array();
		foreach($meta["fieldList"] as $kn=>$kv){
			if(!$kv["hidden"]){
				$kn=isset($alias[$kn]) ? $alias[$kn] : $kn;
				$fieldList[$kn]=$kv;
			}
		}
		$meta["fieldList"]=$fieldList;
		unset($meta["primaryFields"]);
		unset($meta["bindTable"]);
		unset($meta["handler"]);
		unset($meta["alias"]);
		return $meta;
	}
	function insert($params){
		$data=$this->inputDataDispose($params["data"]);
		$data=$this->writeDataAdapter($data);
		
		$keys=array();
		$values=array();
		foreach($this->meta["fieldList"] as $key=>$value){
			if($key===$this->meta["primaryFields"]){
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
		return $this->db->exec("DELETE FROM `".$this->meta["bindTable"]."` WHERE ".$this->meta["primaryFields"]." in(".join(",", $params["where"]["id"]).")");
	}
	//修改操作只能通过ID来查找
	function update($params){
		$data=$this->inputDataDispose($params["data"]);
		$data=$this->writeDataAdapter($data);
		
		$sections=array();
		foreach($this->meta["fieldList"] as $key=>$value){
			if($key===$this->meta["primaryFields"]){
				continue;
			}
			if(isset($data[$key])){
				$sections[]=" `".$key."` = '".$data[$key]."'";
			}
		}
		$sql="UPDATE `".$this->meta["bindTable"]."` SET".join(",", $sections)." WHERE `".$this->meta["primaryFields"]."` = ".$params["where"]["id"];
		return $this->db->exec($sql);
	}
	function search($params){
		$fields=array();
		foreach ($this->meta["fieldList"] as $key => $value){
//			if(!$value["hidden"]){
				$fields[]="`".$key."`";
//			}
		}
		$fields=join(",", $fields);
//		print_r($params);
		$sql="SELECT $fields FROM `".$this->meta["bindTable"]."`";
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
	function count($params){
		$sql="SELECT count(*) FROM `".$this->meta["bindTable"]."`";
		if($params){
			if(isset($params["where"])){
				$where=$this->parserWhere($params["where"]);
				if($where){
					$sql.=" WHERE ".$where;
				}
			}
		}
		$result=$this->db->query($sql);
		$data=$result->fetchAll(PDO::FETCH_ASSOC);
		return intval($data[0]["count(*)"]);
	}
	//不仅返回数据，而且附带符合条件的数据的总数量
	function search_count($params){
		$return=array(
			"data"=>$this->search($params),
			"count"=>$this->count($params)
		);
		return $return;
	}
	//将查询条件转换成sql语句的形式
	function parserWhere($where){
		$whereStr=array();
		
		foreach($this->meta["alias"] as $alias=>$name){
			if($where[$alias]){
				$where[$name]=$where[$alias];
				unset($where[$alias]);
			}
		}
		
		foreach($this->meta["fieldList"] as $key=>$value){
			$whereItem=$where[$key];
			if($whereItem!=null){
				if($key===$this->meta["primaryFields"]){
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
	//对各项属性进行不同类型的统计功能
	function statistics($params){
		$todo=$params["statistics"];//所有要统计的项目，格式为[["统计方式","字段"],["统计方式","字段"]];
		$result=array();
		require("statistics.php");
		$object=new statistics();
		$dataList=$this->search(array("where"=>$params["where"]));
//		print_r($dataList);
		$object->dataList=$dataList;//只用where条件进行搜索获取数据
		foreach($todo as $statist){
			$method="by".$statist[0];//获取处理函数
			if(method_exists($object, $method)){
				$result[]=$object->$method($statist[1]);
			}
		}
		return $result;
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
		
		foreach($this->meta["alias"] as $alias=>$name){
			$data[$index][$name]=$item[$alias];
			unset($data[$index][$alias]);
		}
		
		foreach($this->meta["fieldList"] as $key=>$value){
			if($key===$this->meta["primaryFields"]){
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
	//输出数据之前进行处理(此处要求data是数组)
	function outputDataDispose($data){
		foreach($data as $index=>$item){
			foreach($this->meta["alias"] as $alias=>$name){
				$data[$index][$alias]=$item[$name];
				unset($data[$index][$name]);
			}
		}
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
?>