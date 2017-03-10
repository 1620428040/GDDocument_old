<?php
$zip=new ZipArchive; 
if($zip->open('test.zip',ZipArchive::OVERWRITE)===TRUE){ 
	$zip->addFile('file/5.pdf',"5.pdf");
	$zip->close(); 
} 
?>