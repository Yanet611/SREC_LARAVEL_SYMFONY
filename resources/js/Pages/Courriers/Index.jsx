import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { StatusBadge, EmptyState, Pagination } from '@/Components/Ui';
import { useState } from 'react';
import { Mail, Plus, Search, Filter, X, Download, Calendar } from 'lucide-react';

const STATUTS = [
    { value: '', label: 'Tous les statuts' },
    { value: 'soumis_directrice', label: 'En attente (Directrice)' },
    { value: 'examine_directrice', label: 'Pris en charge' },
    { value: 'rdv_planifie', label: 'RDV planifié' },
    { value: 'entretien_realise', label: 'Entretien réalisé' },
    { value: 'soumis_recteur', label: 'En attente (Recteur)' },
    { value: 'valide', label: 'Validé' },
    { value: 'rejete', label: 'Rejeté' },
    { value: 'archive', label: 'Archivé' },
];

const TYPES_LABELS = {
    demande_partenariat: 'Partenariat',
    demande_convention:  'Convention',
    invitation:          'Invitation',
    rendez_vous:         'Rendez-vous',
    information:         'Information',
    autre:               'Autre',
};

const COLORS = {
    soumis: 'blue', recu: 'blue', pris_en_charge: 'orange',
    rdv_planifie: 'orange', entretien_realise: 'purple',
    soumis_directrice: 'yellow', examine_directrice: 'purple',
    soumis_recteur: 'yellow', valide: 'green', rejete: 'red', archive: 'gray',
};

export default function Index({ courriers, filtres }) {
    const { auth } = usePage().props;
    const userRole = auth?.user?.roles?.[0]?.name ?? '';
    const canCreate = userRole === 'secretariat';

    const [search, setSearch] = useState(filtres.search ?? '');
    const [statut, setStatut] = useState(filtres.statut ?? '');
    const [sens, setSens] = useState(filtres.sens ?? '');
    const [type, setType] = useState(filtres.type ?? '');

    const applyFilters = (params = {}) => {
        router.get(route('courriers.index'), {
            search: params.search ?? search,
            statut: params.statut ?? statut,
            sens:   params.sens ?? sens,
            type:   params.type  ?? type,
        }, { preserveState: true, replace: true });
    };

    const resetFilters = () => {
        setSearch(''); setStatut(''); setSens(''); setType('');
        router.get(route('courriers.index'));
    };

    const hasFilters = search || statut || sens || type;

    return (
        <AppLayout title="Courriers">
            <Head title="Courriers" />

            {/* Header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Courriers</h2>
                    <p className="page-subtitle">{courriers.total} courrier{courriers.total > 1 ? 's' : ''} trouvé{courriers.total > 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="btn-secondary">
                        <Download size={15} /> Export CSV
                    </button>
                    {canCreate && (
                        <Link href={route('courriers.create')} className="btn-primary">
                            <Plus size={15} /> Nouveau courrier
                        </Link>
                    )}
                </div>
            </div>

            {/* Filtres */}
            <div className="card-glass p-4 mb-6 flex flex-wrap gap-3 items-end">
                {/* Search */}
                <div className="flex-1 min-w-48 relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Rechercher (numéro, objet, expéditeur...)"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        className="input pl-9"
                    />
                </div>

                {/* Statut */}
                <select
                    value={statut}
                    onChange={e => { setStatut(e.target.value); applyFilters({ statut: e.target.value }); }}
                    className="input w-auto min-w-44"
                >
                    {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>

                {/* Sens — Recteur et Directrice ne voient que les entrants */}
                {!['recteur', 'directrice'].includes(userRole) && (
                    <select
                        value={sens}
                        onChange={e => { setSens(e.target.value); applyFilters({ sens: e.target.value }); }}
                        className="input w-auto min-w-32"
                    >
                        <option value="">Tous (sens)</option>
                        <option value="entrant">Entrant</option>
                        <option value="sortant">Sortant</option>
                    </select>
                )}

                {/* Type */}
                <select
                    value={type}
                    onChange={e => { setType(e.target.value); applyFilters({ type: e.target.value }); }}
                    className="input w-auto min-w-40"
                >
                    <option value="">Tous (type)</option>
                    {Object.entries(TYPES_LABELS).map(([val, lbl]) => (
                        <option key={val} value={val}>{lbl}</option>
                    ))}
                </select>

                <button onClick={() => applyFilters()} className="btn-primary">
                    <Filter size={14} /> Filtrer
                </button>

                {hasFilters && (
                    <button onClick={resetFilters} className="btn-ghost">
                        <X size={14} /> Réinitialiser
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="card-glass overflow-hidden">
                {courriers.data.length === 0 ? (
                    <div className="p-4">
                        <EmptyState
                            icon={Mail}
                            title="Aucun courrier trouvé"
                            description="Aucun courrier ne correspond à vos filtres."
                            action={canCreate ? <Link href={route('courriers.create')} className="btn-primary"><Plus size={14} /> Créer un courrier</Link> : null}
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-srec">
                            <thead>
                                <tr>
                                    <th>Numéro</th>
                                    <th>Objet</th>
                                    <th>Sens</th>
                                    <th>Date</th>
                                    <th>Expéditeur</th>
                                    <th>Statut</th>
                                    <th>Soumis par</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {courriers.data.map(c => (
                                    <tr key={c.id}>
                                        <td>
                                            <span className="font-mono text-xs text-srec-300 font-semibold">{c.numero}</span>
                                        </td>
                                        <td className="max-w-xs">
                                            <p className="truncate font-medium text-slate-200">{c.objet}</p>
                                            <span className={`text-[10px] font-medium mt-0.5 inline-flex items-center gap-1 ${
                                                c.type === 'rendez_vous' ? 'text-orange-400' :
                                                c.type === 'demande_partenariat' ? 'text-srec-400' :
                                                c.type === 'demande_convention' ? 'text-blue-400' : 'text-slate-500'
                                            }`}>
                                                {c.type === 'rendez_vous' && <Calendar size={10} />}
                                                {TYPES_LABELS[c.type] ?? c.type}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${c.sens === 'entrant' ? 'badge-blue' : 'badge-purple'}`}>
                                                {c.sens === 'entrant' ? '↓ Entrant' : '↑ Sortant'}
                                            </span>
                                        </td>
                                        <td className="text-xs text-slate-400 whitespace-nowrap">
                                            {new Date(c.date_courrier).toLocaleDateString('fr-FR')}
                                        </td>
                                        <td className="text-slate-400 text-xs max-w-[160px] truncate">{c.expediteur}</td>
                                        <td>
                                            <StatusBadge color={COLORS[c.statut] ?? 'gray'} label={c.statut_label ?? c.statut} />
                                        </td>
                                        <td className="text-xs text-slate-500">{c.soumis_par_user?.name ?? '—'}</td>
                                        <td>
                                            <Link href={route('courriers.show', c.id)} className="btn-ghost text-xs py-1 px-2">
                                                Voir
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="px-4 pb-4">
                    <Pagination links={courriers.links} />
                </div>
            </div>
        </AppLayout>
    );
}
