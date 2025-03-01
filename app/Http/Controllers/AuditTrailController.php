<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\AuditTrail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuditTrailController extends Controller
{
    public function index(): Response
    {
        $audit_trail = AuditTrail::join('users', 'users.id', '=', 'audit_trail.user_id')
            ->select('audit_trail.*', 'users.name', 'users.user_type')
            ->orderBy('created_at')
            ->get();

        

        return Inertia::render('Admin/AuditTrail', [
            'audit_trail' => $audit_trail
        ]);


    }
}

