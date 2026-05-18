import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Activity, Search, Filter, X, Shield, Clock, User as UserIcon, FileText } from 'lucide-react';
import { Pagination, EmptyState } from '@/Components/Ui';

const ACTION_COLORS = {
    'created': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'updated': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'deleted': 'bg-red-500/10 text-red-400 border-red-500/20',
    'statut_change': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'archived': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    'default': 'bg-white/5 text-slate-300 border-white/10'
};

const ACTION_LABELS = {
    'created': 'Création',
    'updated': 'Modification',
    'deleted': 'Suppression',
    'statut_change': 'Changement Statut',
    'archived': 'Archivage',
};

export default function Logs({ logs, filtres, users }) {
    const [search, setSearch] = useState(filtres.search ?? '');
    const [userId, setUserId] = useState(filtres.user_id ?? '');
    const [action, setAction] = useState(filtres.action ?? '');

    const applyFilters = (params = {}) => {
        router.get(route('logs.index'), {
            search: params.search ?? search,
            user_id: params.user_id ?? userId,
            action: params.action ?? action
        }, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch(''); setUserId(''); setAction('');
        router.get(route('logs.index'));
    };

    return (
        <AppLayout title="Audit & Logs Système">
            <Head title="Audit & Logs Système" />
            
            <div className="page-header">
                <div>
                    <h2 className="page-title flex items-center gap-2">
                        <Shield className="text-srec-400" size={24} /> Audit & Logs Système
                    </h2>
                    <p className="page-subtitle">Traçabilité complète des actions effectuées sur la plateforme</p>
                </div>
            </div>

            {/* Filtres */}
            <div className="card-glass p-4 mb-6 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-48 relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        placeholder="Rechercher par utilisateur ou commentaire..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        onKeyDown={e => e.key === 'Enter' && applyFilters()} 
                        className="input pl-9" 
                    />
                </div>
                <select value={userId} onChange={e => { setUserId(e.target.value); applyFilters({ user_id: e.target.value }); }} className="input w-auto min-w-40">
                    <option value="">Tous les utilisateurs</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
                <select value={action} onChange={e => { setAction(e.target.value); applyFilters({ action: e.target.value }); }} className="input w-auto min-w-40">
                    <option value="">Toutes les actions</option>
                    {Object.entries(ACTION_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                    ))}
                </select>
                <button onClick={() => applyFilters()} className="btn-primary"><Filter size={14} /> Filtrer</button>
                {(search || userId || action) && (
                    <button onClick={resetFilters} className="btn-ghost"><X size={14} /> Reset</button>
                )}
            </div>

            {/* Liste des logs */}
            <div className="card-glass overflow-hidden">
                {logs.data.length === 0 ? (
                    <div className="p-8">
                        <EmptyState icon={Activity} title="Aucun log trouvé" description="Aucune action ne correspond à vos critères de recherche." />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Date & Heure</th>
                                    <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Utilisateur</th>
                                    <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Action</th>
                                    <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Entité Concernée</th>
                                    <th className="p-4 text-xs font-semibold text-slate-300 uppercase tracking-wider">Détails</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                                {logs.data.map(log => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <Clock size={14} className="text-slate-500" />
                                                <span>{log.date}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 ml-6">{log.diffForHumans}</div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-srec-700/50 flex items-center justify-center border border-srec-500/20">
                                                    <UserIcon size={12} className="text-srec-300" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{log.user}</p>
                                                    <p className="text-[10px] text-slate-500 uppercase">{log.user_role ?? 'Système'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${ACTION_COLORS[log.action] ?? ACTION_COLORS.default}`}>
                                                {ACTION_LABELS[log.action] ?? log.action}
                                            </span>
                                        </td>
                                        <td className="p-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <FileText size={14} className="text-slate-500" />
                                                {log.entite_nom}
                                            </div>
                                        </td>
                                        <td className="p-4 text-slate-400 min-w-64">
                                            {log.ancien_statut && log.nouveau_statut && (
                                                <div className="flex items-center gap-2 text-xs mb-1">
                                                    <span className="text-slate-500 line-through">{log.ancien_statut}</span>
                                                    <span className="text-slate-600">→</span>
                                                    <span className="text-white">{log.nouveau_statut}</span>
                                                </div>
                                            )}
                                            {log.commentaire && (
                                                <p className="italic">« {log.commentaire} »</p>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-4"><Pagination links={logs.links} /></div>
        </AppLayout>
    );
}
