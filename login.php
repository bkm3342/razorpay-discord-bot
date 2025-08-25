<?php
session_start();
include 'config.php';
include 'api.php';

// Default error variable
$error = "";

// If form submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user = trim($_POST['username']);
    $pass = trim($_POST['password']);

    // KeyAuth login API
    $url = "https://keyauth.win/api/1.0/?type=login&username=" . urlencode($user) . "&password=" . urlencode($pass) . "&name=" . $name . "&ownerid=" . $ownerid;
    $response = file_get_contents($url);
    $json = json_decode($response, true);

    if ($json["success"]) {
        $_SESSION['username'] = $user;

        // Generate QR code link using Google API
        $qrText = "Welcome " . $user . "! You are logged in successfully.";
        $qrCodeUrl = "https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=" . urlencode($qrText);

        echo "<h2>Login Successful ✅</h2>";
        echo "<p>Welcome, " . htmlspecialchars($user) . "</p>";
        echo "<img src='" . $qrCodeUrl . "' alt='QR Code'>";
        exit;
    } else {
        $error = $json["message"];
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Login with QR</title>
</head>
<body>
    <h2>Login Page</h2>
    <?php if (!empty($error)) echo "<p style='color:red;'>$error</p>"; ?>
    <form method="POST">
        <label>Username:</label><br>
        <input type="text" name="username" required><br><br>
        <label>Password:</label><br>
        <input type="password" name="password" required><br><br>
        <button type="submit">Login</button>
    </form>
</body>
</html>
