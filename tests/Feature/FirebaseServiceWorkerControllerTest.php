<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FirebaseServiceWorkerControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_service_worker_returns_javascript_response(): void
    {
        $response = $this->get(route('firebase.sw'));

        $response->assertOk()
            ->assertHeader('Content-Type', 'application/javascript');
    }

    public function test_service_worker_includes_service_worker_allowed_header(): void
    {
        $response = $this->get(route('firebase.sw'));

        $response->assertHeader('Service-Worker-Allowed', '/');
    }

    public function test_service_worker_is_accessible_without_authentication(): void
    {
        $this->get(route('firebase.sw'))->assertOk();
    }

    public function test_service_worker_content_imports_firebase_scripts(): void
    {
        $response = $this->get(route('firebase.sw'));

        $content = $response->getContent();
        $this->assertStringContainsString('importScripts', $content);
        $this->assertStringContainsString('firebase-app-compat.js', $content);
        $this->assertStringContainsString('firebase-messaging-compat.js', $content);
    }

    public function test_service_worker_content_initialises_firebase_app(): void
    {
        $response = $this->get(route('firebase.sw'));

        $content = $response->getContent();
        $this->assertStringContainsString('firebase.initializeApp', $content);
    }

    public function test_service_worker_registers_background_message_handler(): void
    {
        $response = $this->get(route('firebase.sw'));

        $content = $response->getContent();
        $this->assertStringContainsString('onBackgroundMessage', $content);
        $this->assertStringContainsString('showNotification', $content);
    }
}
