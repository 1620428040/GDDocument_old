<?php
//关于文件上传的文档
$_FILES//超全局变量，二维数组，记录post到当前脚本的文件的信息  4.1+
//老版本中用HTTP_POST_FILES 替代
$file=$_FILES['filename'];
$_FILES['filename']['name']; //显示客户端文件的原名称。
$_FILES['filename']['type']; //文件的 MIME 类型，例如"image/gif"。
$_FILES['filename']['size']; //已上传文件的大小，单位为字节。
$_FILES['filename']['tmp_name']; //储存的临时文件名，一般是系统默认。
$_FILES['filename']['error'];//如果出错的话，在这保存，否则为空
//相关函数
//bool is_uploaded_file ( string $filename )
//检测是否是上传的文件

//bool move_uploaded_file ( string $filename , string $destination )
//移动上传的文件到指定的位置，函数会检查是否是上传的文件

//bool file_put_contents($path, $content, FILE_APPEND)
//将内容写入一个文件，FILE_APPEND表示添加到已有的内容之后
?>

<!-- 文件上传表单，要确保文件上传表单的属性是 enctype="multipart/form-data"，否则文件上传不了。 -->
<form enctype="multipart/form-data" action="__URL__" method="POST">
    <!-- MAX_FILE_SIZE 可以建议浏览器检查要上传的文件大小，从而避免超过php服务器的上传限制 -->
    <input type="hidden" name="MAX_FILE_SIZE" value="30000" />
    <!-- Name of input element determines name in $_FILES array -->
    Send this file: <input name="userfile" type="file" />
    <input type="submit" value="Send File" />
</form>