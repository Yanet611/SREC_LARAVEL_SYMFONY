<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = User::with('roles')
            ->when($request->filled('role'),   fn($q) => $q->role($request->role))
            ->when($request->filled('search'), fn($q) => $q->where(function ($sq) use ($request) {
                $sq->where('name', 'like', '%' . $request->search . '%')
                   ->orWhere('email', 'like', '%' . $request->search . '%');
            }))
            ->latest()
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users'  => $users,
            'roles'  => Role::orderBy('name')->pluck('name'),
            'filtres' => $request->only(['role', 'search']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('Users/Create', [
            'roles' => Role::orderBy('name')->pluck('name'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email',
            'password'  => 'required|string|min:8|confirmed',
            'telephone' => 'nullable|string|max:50',
            'fonction'  => 'nullable|string|max:255',
            'service'   => 'nullable|string|max:255',
            'role'      => 'required|exists:roles,name',
            'avatar'    => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $userData = [
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'password'  => Hash::make($validated['password']),
            'telephone' => $validated['telephone'] ?? null,
            'fonction'  => $validated['fonction'] ?? null,
            'service'   => $validated['service'] ?? null,
            'actif'     => true,
        ];

        if ($request->hasFile('avatar')) {
            $userData['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user = User::create($userData);

        $user->syncRoles([$validated['role']]);

        return redirect()->route('users.index')
            ->with('success', "Utilisateur « {$user->name} » créé.");
    }

    public function edit(User $user): Response
    {
        $user->load('roles');
        return Inertia::render('Users/Edit', [
            'user'  => $user,
            'roles' => Role::orderBy('name')->pluck('name'),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255',
            'email'     => 'required|email|unique:users,email,' . $user->id,
            'password'  => 'nullable|string|min:8|confirmed',
            'telephone' => 'nullable|string|max:50',
            'fonction'  => 'nullable|string|max:255',
            'service'   => 'nullable|string|max:255',
            'role'      => 'required|exists:roles,name',
            'actif'     => 'boolean',
            'avatar'    => 'nullable|image|mimes:jpeg,png,jpg,gif,svg,webp|max:2048',
        ]);

        $updateData = [
            'name'      => $validated['name'],
            'email'     => $validated['email'],
            'telephone' => $validated['telephone'] ?? null,
            'fonction'  => $validated['fonction'] ?? null,
            'service'   => $validated['service'] ?? null,
            'actif'     => $validated['actif'] ?? true,
        ];

        if (!empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        if ($request->hasFile('avatar')) {
            if ($user->avatar) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($user->avatar);
            }
            $updateData['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($updateData);
        $user->syncRoles([$validated['role']]);

        return redirect()->route('users.index')
            ->with('success', 'Utilisateur mis à jour.');
    }

    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Vous ne pouvez pas supprimer votre propre compte.');
        }

        $user->delete();
        return redirect()->route('users.index')
            ->with('success', 'Utilisateur supprimé.');
    }
}
