<?php

namespace App;

use Core\Auth;
use Core\Request;
use Core\Response;
use mysqli;

class Router
{
    /** @var list<array{0:string,1:string,2:array{0:class-string,1:string}}> */
    private array $routes = [];

    public function __construct(
        private mysqli $conn,
        private Request $request,
        private Auth $auth
    ) {
    }

    public function register(string $method, string $path, string $controllerClass, string $action): void
    {
        $this->routes[] = [$method, $path, [$controllerClass, $action]];
    }

    public function dispatch(): void
    {
        $method = $this->request->method();
        $path = $this->request->path();

        foreach ($this->routes as [$m, $p, $handler]) {
            if ($m === $method && $p === $path) {
                [$class, $action] = $handler;
                $controller = new $class($this->conn, $this->request, $this->auth);
                $controller->{$action}();
                return;
            }
        }

        Response::json(['error' => 'Route not found', 'path' => $path], 404);
    }
}
?>