<?php

namespace App\Http\Controllers;

use App\Models\NotificationSrec;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifs = $request->user()->notifications()
            ->latest('created_at')
            ->take(20)
            ->get()
            ->map(fn($n) => [
                'id'       => $n->id,
                'titre'    => $n->titre,
                'message'  => $n->message,
                'type'     => $n->type,
                'priorite' => $n->priorite,
                'lue'      => $n->lue,
                'date'     => $n->created_at->format('d/m/Y H:i'),
                'date_raw' => $n->created_at->toIso8601String(),
                'lien'     => $n->entite_id && $n->entite_type
                    ? route('courriers.show', $n->entite_id)
                    : null,
            ]);

        return response()->json([
            'notifications' => $notifs,
            'non_lues'      => $request->user()->notificationsNonLues()->count(),
        ]);
    }

    public function marquerLue(NotificationSrec $notification): JsonResponse
    {
        $notification->marquerLue();
        return response()->json(['success' => true]);
    }

    public function marquerToutesLues(Request $request): JsonResponse
    {
        $request->user()->notificationsNonLues()->update(['lue' => true, 'lue_le' => now()]);
        return response()->json(['success' => true]);
    }
}
