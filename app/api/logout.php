<?php
session_start();

if ($_SESSION["authorization"] == true) {
    $_SESSION["authorization"] = false;
    unset($_SESSION["authorization"]);
    session_destroy();
}