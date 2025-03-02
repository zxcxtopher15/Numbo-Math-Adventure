<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;
use Illuminate\Http\Request;
use App\Models\AuditTrail;
use Illuminate\Support\Facades\Auth;

class UserManagementController extends Controller
{
    public function index(): Response
    {
        $users = User::where('status', 0)->where('user_type', '!=', 'Administrator')->orderBy('created_at')->get();
        $allRequests = User::where('status', 2)->orderBy('created_at')->get();
        $allRejects = User::where('status', 3)->orderBy('created_at')->get();
        $allDisabled = User::where('status', 1)->orderBy('created_at')->get();

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
            'allRequests' => $allRequests,
            'allRejects' => $allRejects,
            'allDisabled' => $allDisabled
        ]);
    }

    public function approveUsers(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array|exists:users,id',
        ]);

        $users = User::whereIn('id', $request->user_ids)->get();

        if (!$users) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        foreach ($users as $user) {
            $user->status = 0;
            $user->save();

            AuditTrail::create([
                'user_id' => Auth::user()->id,
                'action' => 'Approve User: ' . $user->name,
                'created_at' => now()
            ]);
        }

        return response()->json([
            'message' => 'Users approved successfully.',
            'users' => $users
        ], 200);
    }

    public function restoreUsers(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array|exists:users,id',
        ]);

        $users = User::whereIn('id', $request->user_ids)->where('status', 3)->get();

        if ($users->isEmpty()) {
            return response()->json(['message' => 'No rejected users found.'], 404);
        }

        foreach ($users as $user) {
            $user->status = 0;
            $user->save();

            AuditTrail::create([
                'user_id' => Auth::user()->id,
                'action' => 'Approve Previously Rejected User: ' . $user->name,
                'created_at' => now()
            ]);
        }

        return response()->json([
            'message' => 'Previously rejected users approved successfully.',
            'users' => $users
        ], 200);
    }

    public function rejectUsers(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array|exists:users,id',
        ]);

        $users = User::whereIn('id', $request->user_ids)->get();

        if (!$users) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        foreach ($users as $user) {
            $user->status = 3; // 
            $user->save();

            AuditTrail::create([
                'user_id' => Auth::user()->id,
                'action' => 'Reject User: ' . $user->name,
                'created_at' => now()
            ]);
        }

        return response()->json([
            'message' => 'Users rejected successfully.',
            'users' => $users
        ], 200);
    }

    
    public function disableUser($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $user->status = 1; 
        $user->save();

        AuditTrail::create([
            'user_id' => Auth::user()->id,
            'action' => 'Disable User: ' . $user->name,
            'created_at' => now()
        ]);

        return response()->json([
            'message' => 'User disabled successfully.',
        ], 200);
    }
    public function enableUsers(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array|exists:users,id',
        ]);

        $users = User::whereIn('id', $request->user_ids)->get();

        if (!$users) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        foreach ($users as $user) {
            $user->status = 0; 
            $user->save();

            AuditTrail::create([
                'user_id' => Auth::user()->id,
                'action' => 'Enable User: ' . $user->name,
                'created_at' => now()
            ]);
        }

        return response()->json([
            'message' => 'Users enabled successfully.',
        ], 200);
    }

    public function destroy(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array|exists:users,id',
        ]);

        $users = User::whereIn('id', $request->user_ids)->get();

        if (!$users) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        foreach ($users as $user) {
            $user->delete();

            AuditTrail::create([
                'user_id' => Auth::user()->id,
                'action' => 'Delete User: ' . $user->name,
                'created_at' => now()
            ]);
        }

        return response()->json([
            'message' => 'Users deleted successfully.',
            'users' => $users
        ], 200);
    }

    public function userCounts(Request $request){
        $parents = User::where('user_type', 'Parent')->where('status', 0)->count();
        $students = User::where('user_type', 'Student')->where('status', 0)->count();
        $teachers = User::where('user_type', 'Teacher')->where('status', 0)->count();
        return response()->json([
            'parents' => $parents,
            'students' => $students,
            'teachers' => $teachers
        ], 200);
    }

}

