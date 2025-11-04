<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
    
    if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
        // Generate reset token
        $token = bin2hex(random_bytes(32));
        $expires = date('Y-m-d H:i:s', strtotime('+1 hour'));
        
        // Store reset token (in production, use database)
        $reset_data = [
            'email' => $email,
            'token' => $token,
            'expires' => $expires
        ];
        file_put_contents('reset_tokens.json', json_encode($reset_data));
        
        // Send email (mock)
        $reset_link = "http://localhost/sportsin/reset-form.php?token=" . $token;
        
        // In production, use mail() or PHPMailer
        error_log("Password reset link for $email: $reset_link");
        
        echo json_encode(['success' => true, 'message' => 'Reset link sent to your email']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid email address']);
    }
} else {
    header('Location: forgot-password.html');
}
?>