<?php
$token = $_GET['token'] ?? '';
$error = '';
$success = '';

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $token = $_POST['token'];
    $password = $_POST['password'];
    $confirm_password = $_POST['confirm_password'];
    
    if ($password !== $confirm_password) {
        $error = 'Passwords do not match';
    } elseif (strlen($password) < 6) {
        $error = 'Password must be at least 6 characters';
    } else {
        // Verify token
        if (file_exists('reset_tokens.json')) {
            $reset_data = json_decode(file_get_contents('reset_tokens.json'), true);
            
            if ($reset_data['token'] === $token && strtotime($reset_data['expires']) > time()) {
                // Update password in users data
                $users_file = 'users.json';
                if (file_exists($users_file)) {
                    $users = json_decode(file_get_contents($users_file), true);
                } else {
                    $users = [
                        ['id' => 1, 'fullName' => 'John Doe', 'email' => 'john@example.com', 'password' => 'password123'],
                        ['id' => 2, 'fullName' => 'Sarah Miller', 'email' => 'sarah@example.com', 'password' => 'password123'],
                        ['id' => 3, 'fullName' => 'Mike Chen', 'email' => 'mike@example.com', 'password' => 'password123']
                    ];
                }
                
                // Find and update user
                foreach ($users as &$user) {
                    if ($user['email'] === $reset_data['email']) {
                        $user['password'] = $password;
                        break;
                    }
                }
                
                file_put_contents($users_file, json_encode($users));
                unlink('reset_tokens.json'); // Remove used token
                
                $success = 'Password updated successfully!';
            } else {
                $error = 'Invalid or expired reset token';
            }
        } else {
            $error = 'Invalid reset token';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password - SportsIn</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
    <nav class="bg-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <a href="index.html" class="text-2xl font-bold" style="color: #1e3a8a;">SportsIn</a>
            </div>
        </div>
    </nav>

    <main class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-md w-full space-y-8">
            <div class="card">
                <div class="text-center mb-6">
                    <h2 class="text-3xl font-bold" style="color: #1e3a8a;">Set New Password</h2>
                </div>
                
                <?php if ($error): ?>
                    <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <?php echo htmlspecialchars($error); ?>
                    </div>
                <?php endif; ?>
                
                <?php if ($success): ?>
                    <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        <?php echo htmlspecialchars($success); ?>
                        <script>setTimeout(() => window.location.href = 'login.html', 2000);</script>
                    </div>
                <?php else: ?>
                    <form method="POST" class="space-y-4">
                        <input type="hidden" name="token" value="<?php echo htmlspecialchars($token); ?>">
                        <div>
                            <input type="password" name="password" placeholder="New Password" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <div>
                            <input type="password" name="confirm_password" placeholder="Confirm Password" required 
                                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                        </div>
                        <button type="submit" class="w-full btn-primary py-3 rounded-lg font-bold">Update Password</button>
                    </form>
                <?php endif; ?>
            </div>
        </div>
    </main>
</body>
</html>