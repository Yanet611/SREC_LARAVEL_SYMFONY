import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { StatusBadge, EmptyState, Pagination } from '@/Components/Ui';
import { useState } from 'react';
import {
    Activity, Plus, Search, Filter, X,
    GraduationCap, FlaskConical, ArrowLeftRight,
    Mic2, BookOpen, LayoutGrid, CalendarDays, MapPin
} from 'lucide-react';

const TYPE_META = {
    formation:   { icon: GraduationCap, color: 'text-blue-400',    bg: 'bg-blue-600/10',    label: 'Formation' },
    recherche:   { icon: FlaskConical,  color: 'text-purple-400',  bg: 'bg-purple-600/10',  label: 'Recherche' },
    echange:     { icon: ArrowLeftRight,color: 'text-emerald-400', bg: 'bg-emerald-600/10', label: 'Échange' },
    conference:  { icon: Mic2,          color: 'text-amber-400',   bg: 'bg-amber-600/10',   label: 'Conférence' },
    stage:       { icon: BookOpen,      color: 'text-orange-400',  bg: 'bg-orange-600/10',  label: 'Stage' },
    autre:       { icon: LayoutGrid,    color: 'text-slate-400',   bg: 'bg-slate-600/10',   label: 'Autre' },
};

const STATUT_COLORS = {
    planifiee: 'blue', en_cours: 'orange', realisee: 'green', annulee: 'red',
};
const STATUT_LABELS = {
    planifiee: 'Planifiée', en_cours: 'En cours', realisee: 'Réalisée', annulee: 'Annulée',
};

const TYPES   = ['', 'formation', 'recherche', 'echange', 'conference', 'stage', 'autre'];
const STATUTS = ['', 'planifiee', 'en_cours', 'realisee', 'annulee'];

export default function Index({ activites, conventions, filtres }) {
    const [search,     setSearch]     = useState(filtres.search ?? '');
    const [statut,     setStatut]     = useState(filtres.statut ?? '');
    const [type,       setType]       = useState(filtres.type ?? '');
    const [convention, setConvention] = useState(filtres.convention ?? '');

    const applyFilters = (extra = {}) =>
        router.get(route('activites.index'), {
            search: extra.search     ?? search,
            statut: extra.statut     ?? statut,
            type:   extra.type       ?? type,
            convention: extra.convention ?? convention,
        }, { preserveState: true, replace: true });

    const resetFilters = () => {
        setSearch(''); setStatut(''); setType(''); setConvention('');
        router.get(route('activites.index'));
    };

    const hasFilters = search || statut || type || convention;

    return (
        <AppLayout title="Activités">
            <Head title="Activités" />

            {/* Header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">Activités</h2>
                    <p className="page-subtitle">{activites.total} activité{activites.total > 1 ? 's' : ''} enregistrée{activites.total > 1 ? 's' : ''}</p>
                </div>
                <Link href={route('activites.create')} className="btn-primary">
                    <Plus size={15} /> Nouvelle activité
                </Link>
            </div>

            {/* Filtres */}
            <div className="card-glass p-4 mb-6 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-48 relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Rechercher (titre, lieu...)"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyFilters()}
                        className="input pl-9"
                    />
                </div>
                <select value={type} onChange={e => { setType(e.target.value); applyFilters({ type: e.target.value }); }} className="input w-auto min-w-36">
                    {TYPES.map(t => <option key={t} value={t}>{t ? TYPE_META[t]?.label : 'Tous types'}</option>)}
                </select>
                <select value={statut} onChange={e => { setStatut(e.target.value); applyFilters({ statut: e.target.value }); }} className="input w-auto min-w-36">
                    {STATUTS.map(s => <option key={s} value={s}>{s ? STATUT_LABELS[s] : 'Tous statuts'}</option>)}
                </select>
                <select value={convention} onChange={e => { setConvention(e.target.value); applyFilters({ convention: e.target.value }); }} className="input w-auto min-w-44">
                    <option value="">Toutes conventions</option>
                    {conventions.map(c => <option key={c.id} value={c.id}>{c.reference} — {c.intitule}</option>)}
                </select>
                <button onClick={() => applyFilters()} className="btn-primary"><Filter size={14} /> Filtrer</button>
                {hasFilters && <button onClick={resetFilters} className="btn-ghost"><X size={14} /> Reset</button>}
            </div>

            {/* Grid de cards */}
            {activites.data.length === 0 ? (
                <div className="card-glass p-4">
                    <EmptyState
                        icon={Activity}
                        title="Aucune activité trouvée"
                        description="Créez une activité liée à une convention signée ou approuvée."
                        action={<Link href={route('activites.create')} className="btn-primary"><Plus size={14} /> Nouvelle activité</Link>}
                    />
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {activites.data.map(a => {
                        const meta = TYPE_META[a.type] ?? TYPE_META['autre'];
                        const TypeIcon = meta.icon;
                        return (
                            <Link key={a.id} href={route('activites.show', a.id)} className="card-glass p-5 hover:border-white/20 transition-all duration-200 group block hover:lift">
                                <div className="flex items-start gap-4">
                                    <div className={`w-11 h-11 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                                        <TypeIcon size={20} className={meta.color} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-white text-sm truncate group-hover:text-srec-300 transition-colors">{a.titre}</h3>
                                        <p className="text-xs text-slate-500 truncate mt-0.5">{a.convention?.reference} — {a.convention?.partenaire?.nom}</p>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <span className="chip">{meta.label}</span>
                                            <StatusBadge color={STATUT_COLORS[a.statut] ?? 'gray'} label={STATUT_LABELS[a.statut] ?? a.statut} />
                                        </div>
                                    </div>
                                </div>
                                <div className="divider mt-4 mb-3" />
                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span className="flex items-center gap-1.5">
                                        <CalendarDays size={11} />
                                        {new Date(a.date_debut).toLocaleDateString('fr-FR')}
                                        {a.date_fin && <> → {new Date(a.date_fin).toLocaleDateString('fr-FR')}</>}
                                    </span>
                                    {a.lieu && (
                                        <span className="flex items-center gap-1">
                                            <MapPin size={10} /> {a.lieu}
                                        </span>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
            <div className="mt-4"><Pagination links={activites.links} /></div>
        </AppLayout>
    );
}
