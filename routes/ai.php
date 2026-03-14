<?php

use App\Mcp\Servers\FamilyOrganizerServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp', FamilyOrganizerServer::class)
    ->middleware(['auth:sanctum', 'verified']);
