<?php
/**
 * 不采用move_uploaded_file上传文件，
 */
if (isset($_FILES['upload'])) {
    $file = $_FILES['upload'];
    $ext =  substr($file['name'], strripos($file['name'], '.'));
    $tp = fopen($file['tmp_name'], 'r');
    $fp = fopen('./test/'.time() .$ext, 'a+');
    while(!feof($tp)){
        fwrite($fp, fread($tp,1024));
    }
    fclose($fp);
    fclose($tp);
}