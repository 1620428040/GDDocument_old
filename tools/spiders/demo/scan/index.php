<?php
//扫描文本格式的内容，将其中格式类似的数据提取出来作为数据
//$dataString
//$grainLength粒度
//返回值：关联数组{原文本,替换过的完整文本,索引数组:[关联数组:{格式,对应的数据}]}
//文本中重复的格式一律用标签替换:比如
//{repeat-格式编号}一种格式，需要手动定义 字段编号和字段名 之间的对照表 ，否则只能用索引数组表示
//{repeat-格式编号-实例编号}对应某种格式在一个地方的实例，数据对应一张数据表
//{repeat-格式编号-实例编号-字段编号}对应要替换的字段
function scanRepeatData($dataString,$grainLength){
	
}
?>