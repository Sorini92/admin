<?php
session_start();
if ($_SESSION["authorization"] != true) {
    header("HTTP/1.0 403 Forbidden");
    die;
}

$file = "../../sdd22233sdsd.html";

if (file_exists($file)) {
    unlink($file);
} else {
    header("HTTP/1.0 400 Bad Request");
}