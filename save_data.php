<?php
header('Content-Type: application/json');

// Get the raw POST data
$data = json_decode(file_get_contents('php://input'), true);

if ($data) {
    // Save users data
    if (isset($data['users'])) {
        file_put_contents('data/users.json', json_encode($data['users']));
    }
    
    // Save mods data
    if (isset($data['mods'])) {
        file_put_contents('data/mods.json', json_encode($data['mods']));
    }
    
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'error' => 'Invalid data']);
}
?>
