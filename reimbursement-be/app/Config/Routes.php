<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// TANGANI SEMUA PREFLIGHT REQUESTS UNTUK API
$routes->options('api/(:any)', static function () {
    return response()->setStatusCode(200);
});

// Rute API untuk Login (tidak perlu JWT)
$routes->post('api/login', 'API\AuthController::login');

// Grup API yang dilindungi oleh JWT Filter
$routes->group('api', ['filter' => 'jwt'], static function ($routes) {
    // Rute reimbursements
    $routes->get('reimbursements', 'API\ReimbursementController::index');
    $routes->get('reimbursements/history', 'API\ReimbursementController::history'); // Endpoint baru untuk riwayat
    $routes->get('reimbursements/(:num)', 'API\ReimbursementController::show/$1');
    $routes->post('reimbursements', 'API\ReimbursementController::create');
    $routes->post('reimbursements/(:num)/approve', 'API\ReimbursementController::approve/$1');
});