<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');
$routes->options('(:any)', static fn() => '');

$routes->post('api/login', 'App\Controllers\Api\AuthController::login');

// Grup untuk semua API yang memerlukan autentikasi
$routes->group('api', ['filter' => 'jwt'], static function ($routes) {
    // Rute untuk Reimbursement
    $routes->get('reimbursements', 'App\Controllers\Api\ReimbursementController::index'); // Melihat daftar
    $routes->get('reimbursements/(:num)', 'App\Controllers\Api\ReimbursementController::show/$1'); // Melihat detail
    $routes->post('reimbursements', 'App\Controllers\Api\ReimbursementController::create'); // Membuat pengajuan baru

    // Rute untuk Proses Approval
    $routes->post('reimbursements/(:num)/approve', 'App\Controllers\Api\ReimbursementController::approve/$1'); // Menyetujui/menolak
});


// Rute API tidak dilindungi
$routes->post('api/login', 'App\Controllers\Api\AuthController::login');

// Grup API dilindungi oleh JWT Filter
$routes->group('api', ['filter' => 'jwt'], static function ($routes) {
    // Rute untuk Reimbursement
    $routes->get('reimbursements', 'App\Controllers\Api\ReimbursementController::index');
    $routes->post('reimbursements', 'App\Controllers\Api\ReimbursementController::create');

    // Rute untuk Approval
    $routes->post('reimbursements/(:num)/approve', 'App\Controllers\Api\ReimbursementController::approve/$1');
});
