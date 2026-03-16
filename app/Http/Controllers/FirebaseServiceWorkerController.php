<?php

namespace App\Http\Controllers;

use Illuminate\Http\Response;

class FirebaseServiceWorkerController extends Controller
{
    public function __invoke(): Response
    {
        $config = json_encode([
            'apiKey' => config('services.firebase.api_key'),
            'authDomain' => config('services.firebase.auth_domain'),
            'projectId' => config('services.firebase.project_id'),
            'storageBucket' => config('services.firebase.storage_bucket'),
            'messagingSenderId' => config('services.firebase.messaging_sender_id'),
            'appId' => config('services.firebase.app_id'),
            'measurementId' => config('services.firebase.measurement_id'),
        ]);

        $content = <<<JS
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/11.0.0/firebase-messaging-compat.js');

firebase.initializeApp({$config});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title ?? 'New notification';
    const notificationOptions = {
        body: payload.notification?.body ?? '',
        icon: payload.notification?.icon ?? '/favicon.ico',
        data: payload.data ?? {},
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
JS;

        return response($content, 200, [
            'Content-Type' => 'application/javascript',
            'Service-Worker-Allowed' => '/',
        ]);
    }
}
