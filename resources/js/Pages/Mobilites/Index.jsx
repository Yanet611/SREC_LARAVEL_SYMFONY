import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { StatusBadge, EmptyState, Pagination } from '@/Components/Ui';
import { useState } from 'react';
import { Plane, Plus, Search, Filter, X, ArrowDownLeft, ArrowUpRight, CalendarDays, Globe, User } from 'lucide-react';

const STATUT_COLORS = {
    en_attente: 'yellow', approuvee: 'green', en_cours: 'orange', realisee: 'blue', annulee: 'red',
};
const STATUT_LABELS = {
    en_attente: 'En attente', approuvee: 'Approuvée', en_cours: 'En cours', realisee: 'Réalisée', annulee: 'Annulée',
};
const BENEFICIAIRE_LABELS = {
    etudiant: 'Étudiant', enseignant: 'Enseignant', chercheur: 'Chercheur', personnel_admin: 'Personnel admin',
};

const STATUTS     = ['', 'en_attente', 'approuvee', 'en_cours', 'realisee', 'annulee'];
const TYPES_MOB   = ['', 'entrant', 'sortant'];
const TYPES_BENEF = ['', 'etudiant', 'enseignant', 'chercheur', 'personnel_admin'];

export default function Index({ mobilites, conventions, filtres }) {
    const [search,           setSearch]           = useState(filtres.search ?? '');
    const [statut,           setStatut]           = useState(filtres.statut ?? '');
    const [typeMobilite,     setTypeMobilite]     = useState(filtres.type_mobilite ?? '');
    const [typeBeneficiaire, setTypeBeneficiaire] = useState(filtres.type_beneficiaire ?? '');
    const [convention,       setConvention]       = useState(filtres.convention ?? '');

    const applyFilters = (extra = {}) =>
        router.get(route('mobilites.index'), {
            search:           extra.search           ?? search,
            statut:           extra.statut           ?? statut,
            type_mobilite:    extra.type_mobilite    ?? typeMobilite,
            type_beneficiaire:extra.type_beneficiaire ?? typeBeneficiaire,
            convention:       extra.convention       ?? convention,
        }, { preserveState: true, replace: true });

    const resetFilters = () => {
        setSearch(''); setStatut(''); setTypeMobilite(''); setTypeBeneficiaire(''); setConvention('');
        router.get(route('mobilites.index'));
    };

    const hasFilters = search || statut || typeMobilite || typeBeneficiaire || convention;

    return (
        <AppLayout title="Mobilités académiques">
            <Head title="Mobilités académiques" />

            <div className="page-header">
                <div>
                    <h2 className="page-title">Mobilités académiques</h2>
                    <p className="page-subtitle">{mobilites.total} mobilité{mobilites.total > 1 ? 's' : ''} enregistrée{mobilites.total > 1 ? 's' : ''}</p>
                </div>
                <Link href={route('mobilites.create')} className="btn-primary">
                    <Plus size={15} /> Nouvelle mobilité
                </Link>
            </div>

            {/* Filtres */}
            <div className="card-glass p-4 mb-6 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-48 relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" placeholder="Rechercher (bénéficiaire, référence, institution...)" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()} className="input pl-9" />
                </div>
                <select value={typeMobilite} onChange={e => { setTypeMobilite(e.target.value); applyFilters({ type_mobilite: e.target.value }); }} className="input w-auto min-w-32">
                    {TYPES_MOB.map(t => <option key={t} value={t}>{t === 'entrant' ? '↓ Entrant' : t === 'sortant' ? '↑ Sortant' : 'Tous sens'}</option>)}
                </select>
                <select value={typeBeneficiaire} onChange={e => { setTypeBeneficiaire(e.target.value); applyFilters({ type_beneficiaire: e.target.value }); }} className="input w-auto min-w-36">
                    {TYPES_BENEF.map(t => <option key={t} value={t}>{t ? BENEFICIAIRE_LABELS[t] : 'Tous profils'}</option>)}
                </select>
                <select value={statut} onChange={e => { setStatut(e.target.value); applyFilters({ statut: e.target.value }); }} className="input w-auto min-w-36">
                    {STATUTS.map(s => <option key={s} value={s}>{s ? STATUT_LABELS[s] : 'Tous statuts'}</option>)}
                </select>
                <button onClick={() => applyFilters()} className="btn-primary"><Filter size={14} /> Filtrer</button>
                {hasFilters && <button onClick={resetFilters} className="btn-ghost"><X size={14} /> Reset</button>}
            </div>

            {/* Table */}
            <div className="card-glass overflow-hidden">
                {mobilites.data.length === 0 ? (
                    <div className="p-4">
                        <EmptyState
                            icon={Plane}
                            title="Aucune mobilité trouvée"
                            description="Enregistrez un flux de mobilité lié à une convention active."
                            action={<Link href={route('mobilites.create')} className="btn-primary"><Plus size={14} /> Nouvelle mobilité</Link>}
                        />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-srec">
                            <thead>
                                <tr>
                                    <th>Référence</th>
                                    <th>Bénéficiaire</th>
                                    <th>Sens</th>
                                    <th>Profil</th>
                                    <th>Destination</th>
                                    <th>Départ</th>
                                    <th>Statut</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {mobilites.data.map(m => (
                                    <tr key={m.id}>
                                        <td><span className="font-mono text-xs text-srec-300 font-semibold">{m.reference}</span></td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                                    <User size={12} className="text-slate-400" />
                                                </div>
                                                <p className="font-medium text-slate-200 text-sm">{m.nom_beneficiaire}</p>
                                            </div>
                                        </td>
                                        <td>
                                            {m.type_mobilite === 'entrant' ? (
                                                <span className="badge badge-blue"><ArrowDownLeft size={11} /> Entrant</span>
                                            ) : (
                                                <span className="badge badge-purple"><ArrowUpRight size={11} /> Sortant</span>
                                            )}
                                        </td>
                                        <td><span className="chip">{BENEFICIAIRE_LABELS[m.type_beneficiaire]}</span></td>
                                        <td className="text-slate-400 text-xs">
                                            <div className="flex items-center gap-1">
                                                <Globe size={11} />
                                                {m.pays_destination}
                                            </div>
                                        </td>
                                        <td className="text-xs text-slate-400 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <CalendarDays size={11} />
                                                {new Date(m.date_depart).toLocaleDateString('fr-FR')}
                                            </div>
                                        </td>
                                        <td><StatusBadge color={STATUT_COLORS[m.statut] ?? 'gray'} label={STATUT_LABELS[m.statut] ?? m.statut} /></td>
                                        <td><Link href={route('mobilites.show', m.id)} className="btn-ghost text-xs py-1 px-2">Voir</Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="px-4 pb-4"><Pagination links={mobilites.links} /></div>
            </div>
        </AppLayout>
    );
}
