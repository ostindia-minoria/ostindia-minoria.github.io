<?php
session_start();
if(!isset($_GET['code'])||$_GET['code']!=='284717')die('Доступ запрещён');
if($_SERVER['REQUEST_METHOD']==='POST'){
  if($_POST['login']==='Maydesk'&&$_POST['password']==='29341!IEID_KALI@#!')$_SESSION['admin']=true;
  else $err='Неверный логин/пароль';
}
if(!isset($_SESSION['admin'])){
  echo '<form method="post"><input name="login" placeholder="Логин"><input type="password" name="password" placeholder="Пароль"><button>Войти</button></form>';
  if(isset($err))echo"<p>$err</p>";
  exit;
}
$ip=$_SERVER['REMOTE_ADDR'];
file_put_contents('visits.log',$ip."\n",FILE_APPEND);
echo '<h1>Админка</h1><p>IP:'.$ip.'</p>';
?>