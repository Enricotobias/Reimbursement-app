<?php

// Buat file ini di root folder backend: debug.php
// Akses via: http://localhost/reimbursement-be/debug.php

require_once 'vendor/autoload.php';

// Load CodeIgniter
$paths = new Config\Paths();
require $paths->systemDirectory . '/Boot.php';
\CodeIgniter\Boot::boot(new Config\Paths(), false);

echo "<h2>Debug Reimbursement System</h2>";

try {
    // Test database connection
    $db = \Config\Database::connect();
    echo "<h3>✅ Database Connection: OK</h3>";
    
    // Test users table
    $users = $db->table('users')->get()->getResultArray();
    echo "<h3>Users Count: " . count($users) . "</h3>";
    
    // Test reimbursements table
    $reimbursements = $db->table('reimbursements')->get()->getResultArray();
    echo "<h3>Reimbursements Count: " . count($reimbursements) . "</h3>";
    
    if (count($reimbursements) > 0) {
        echo "<h4>Reimbursements Data:</h4>";
        echo "<pre>" . print_r($reimbursements, true) . "</pre>";
    }
    
    // Test reimbursement_details table
    $details = $db->table('reimbursement_details')->get()->getResultArray();
    echo "<h3>Reimbursement Details Count: " . count($details) . "</h3>";
    
    if (count($details) > 0) {
        echo "<h4>Details Data:</h4>";
        echo "<pre>" . print_r($details, true) . "</pre>";
    }
    
    // Test specific query for ID 2
    if (isset($_GET['id'])) {
        $id = (int)$_GET['id'];
        echo "<h3>Testing Specific ID: $id</h3>";
        
        $reimbursement = $db->table('reimbursements')
            ->select('reimbursements.*, users.name as user_name')
            ->join('users', 'users.id = reimbursements.user_id')
            ->where('reimbursements.id', $id)
            ->get()
            ->getRowArray();
            
        if ($reimbursement) {
            echo "<h4>✅ Reimbursement Found:</h4>";
            echo "<pre>" . print_r($reimbursement, true) . "</pre>";
            
            $details = $db->table('reimbursement_details')
                ->where('reimbursement_id', $id)
                ->get()
                ->getResultArray();
                
            echo "<h4>Details for ID $id:</h4>";
            echo "<pre>" . print_r($details, true) . "</pre>";
        } else {
            echo "<h4>❌ Reimbursement Not Found for ID: $id</h4>";
        }
    }
    
    echo "<hr>";
    echo "<p><a href='?id=1'>Test ID 1</a> | <a href='?id=2'>Test ID 2</a></p>";
    echo "<p><strong>Usage:</strong> Add ?id=X to URL to test specific reimbursement ID</p>";
    
} catch (Exception $e) {
    echo "<h3>❌ Error: " . $e->getMessage() . "</h3>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}