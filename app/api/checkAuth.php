<?php
session_start();

if ($_SESSION["authorization"] == true) {
    echo json_encode( array("authorization" => true) );
} else {
    echo json_encode( array("authorization" => false) );
}