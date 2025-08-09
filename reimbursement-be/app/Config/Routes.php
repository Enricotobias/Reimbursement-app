<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// Rute API yang tidak dilindungi (hanya untuk login)
$routes->post('api/login', 'App\Controllers\API\AuthController::login');

// Grup untuk semua API yang memerlukan autentikasi JWT
$routes->group('api', ['filter' => 'jwt'], static function ($routes) {
    // Rute untuk Reimbursement
    $routes->get('reimbursements', 'App\Controllers\API\ReimbursementController::index'); // Melihat daftar
    $routes->get('reimbursements/(:num)', 'App\Controllers\API\ReimbursementController::show/$1'); // Melihat detail
    $routes->post('reimbursements', 'App\Controllers\API\ReimbursementController::create'); // Membuat pengajuan baru

    // Rute untuk Proses Approval
    $routes->post('reimbursements/(:num)/approve', 'App\Controllers\API\ReimbursementController::approve/$1'); // Menyetujui/menolak
});