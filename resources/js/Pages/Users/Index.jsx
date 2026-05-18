import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { EmptyState, Pagination } from '@/Components/Ui';
import { useState } from 'react';
import {
    Users, Plus, Search, Filter, X, User,
    ShieldCheck, Crown, Edit, ToggleLeft, ToggleRight, Trash2
} from 'lucide-react';

const ROLE_META = {
    admin:       { color: 'text-red-400',     bg: 'bg-red-600/10',     label: 'Administrateur',  icon: ShieldCheck },
    directrice:  { color: 'text-amber-400',   bg: 'bg-amber-600/10',   label: 'Directrice SREC', icon: Crown },
    recteur:     { color: 'text-purple-400',  bg: 'bg-purple-600/10',  label: 'Recteur',          icon: Crown },
    secretariat: { color: 'text-srec-400',    bg: 'bg-srec-600/10',    label: 'Secrétariat',      icon: User },
};

export default function Index({ users, roles, filtres }) {
    const [search, setSearch] = useState(filtres.search ?? '');
    const [role,   setRole]   = useState(filtres.role ?? '');

    const applyFilters = (extra = {}) =>
        router.get(route('users.index'), {
            search: extra.search ?? search,
            role:   extra.role   ?? role,
        }, { preserveState: true, replace: true });

    const resetFilters = () => {
        setSearch(''); setRole('');
        router.get(route('users.index'));
    };

    const hasFilters = search || role;

    return (
        <AppLayout title="Utilisateurs">
            <Head title="Gestion des utilisateurs" />

            <div className="page-header">
                <div>
                    <h2 className="page-title">Utilisateurs</h2>
                    <p className="page-subtitle">{users.total} compte{users.total > 1 ? 's' : ''} enregistré{users.total > 1 ? 's' : ''}</p>
                </div>
                <Link href={route('users.create')} className="btn-primary">
                    <Plus size={15} /> Nouveau compte
                </Link>
            </div>

            {/* Filtres */}
            <div className="card-glass p-4 mb-6 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-48 relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Rechercher (nom, email...)"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        className="input pl-9"
                    />
                </div>
                <select value={role} onChange={e => { setRole(e.target.value); applyFilters({ role: e.target.value }); }} className="input w-auto min-w-40">
                    <option value="">Tous les rôles</option>
                    {roles.map(r => <option key={r} value={r}>{ROLE_META[r]?.label ?? r}</option>)}
                </select>
                <button onClick={() => applyFilters()} className="btn-primary"><Filter size={14} /> Filtrer</button>
                {hasFilters && <button onClick={resetFilters} className="btn-ghost"><X size={14} /> Reset</button>}
            </div>

            {/* Grid de cartes */}
            {users.data.length === 0 ? (
                <div className="card-glass p-4">
                    <EmptyState
                        icon={Users}
                        title="Aucun utilisateur trouvé"
                        description="Créez un premier compte pour accéder au système."
                        action={<Link href={route('users.create')} className="btn-primary"><Plus size={14} /> Créer un compte</Link>}
                    />
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {users.data.map(u => {
                        const primaryRole = u.roles?.[0]?.name;
                        const meta = ROLE_META[primaryRole] ?? { color: 'text-slate-400', bg: 'bg-slate-600/10', label: 'Utilisateur', icon: User };
                        const RoleIcon = meta.icon;
                        return (
                            <div key={u.id} className="card-glass p-5 flex flex-col gap-4">
                                {/* Top row */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-11 h-11 rounded-full overflow-hidden ${meta.bg} flex items-center justify-center flex-shrink-0 border border-white/10 p-[2px]`}>
                                            <img src={u.avatar_url} alt={u.name} className="w-full h-full rounded-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-white text-sm truncate">{u.name}</p>
                                            <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Link href={route('users.edit', u.id)} className="btn-ghost text-xs py-1 px-2 flex-shrink-0 text-slate-400 hover:text-white">
                                            <Edit size={14} />
                                        </Link>
                                        <button 
                                            onClick={() => {
                                                if (confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
                                                    router.delete(route('users.destroy', u.id));
                                                }
                                            }}
                                            className="btn-ghost text-xs py-1 px-2 flex-shrink-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                            title="Supprimer"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="divider" />

                                {/* Info */}
                                <div className="flex items-center justify-between text-xs">
                                    <span className={`chip ${meta.color}`}>{meta.label}</span>
                                    <span className={`flex items-center gap-1 ${u.actif ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {u.actif
                                            ? <><ToggleRight size={14} /> Actif</>
                                            : <><ToggleLeft size={14} /> Inactif</>
                                        }
                                    </span>
                                </div>

                                {(u.fonction || u.service) && (
                                    <div className="text-xs text-slate-500 space-y-0.5">
                                        {u.fonction && <p>{u.fonction}</p>}
                                        {u.service  && <p className="text-slate-600">{u.service}</p>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
            <div className="mt-4"><Pagination links={users.links} /></div>
        </AppLayout>
    );
}
