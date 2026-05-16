import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { StatusBadge, EmptyState, Pagination } from '@/Components/Ui';
import { useState } from 'react';
import { Handshake, Plus, Search, Globe, Building2, Filter, X, GraduationCap, HeartHandshake, Landmark, Briefcase, ClipboardList } from 'lucide-react';

const NATURE_BADGE = { national: 'badge-green', international: 'badge-blue' };
const TYPE_ICONS = { 
    universite: <GraduationCap size={20} className="text-blue-400" />, 
    ong: <HeartHandshake size={20} className="text-rose-400" />, 
    ambassade: <Landmark size={20} className="text-amber-400" />, 
    organisation_internationale: <Globe size={20} className="text-emerald-400" />, 
    entreprise: <Briefcase size={20} className="text-purple-400" />, 
    autre: <ClipboardList size={20} className="text-slate-400" /> 
};

export default function Index({ partenaires, filtres }) {
    const [search, setSearch] = useState(filtres.search ?? '');
    const [nature, setNature] = useState(filtres.nature ?? '');

    const applyFilters = (params = {}) => {
        router.get(route('partenaires.index'), { search: params.search ?? search, nature: params.nature ?? nature }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title="Partenaires">
            <Head title="Partenaires" />
            <div className="page-header">
                <div>
                    <h2 className="page-title">Partenaires institutionnels</h2>
                    <p className="page-subtitle">{partenaires.total} partenaire{partenaires.total > 1 ? 's' : ''} enregistré{partenaires.total > 1 ? 's' : ''}</p>
                </div>
                <Link href={route('partenaires.create')} className="btn-primary">
                    <Plus size={15} /> Nouveau partenaire
                </Link>
            </div>

            {/* Filtres */}
            <div className="card-glass p-4 mb-6 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-48 relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" placeholder="Rechercher (nom, sigle, pays...)" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()} className="input pl-9" />
                </div>
                <select value={nature} onChange={e => { setNature(e.target.value); applyFilters({ nature: e.target.value }); }} className="input w-auto">
                    <option value="">Toutes natures</option>
                    <option value="national">National</option>
                    <option value="international">International</option>
                </select>
                <button onClick={() => applyFilters()} className="btn-primary"><Filter size={14} /> Filtrer</button>
                {(search || nature) && <button onClick={() => { setSearch(''); setNature(''); router.get(route('partenaires.index')); }} className="btn-ghost"><X size={14} /> Reset</button>}
            </div>

            {/* Cards */}
            {partenaires.data.length === 0 ? (
                <div className="card-glass p-4">
                    <EmptyState icon={Handshake} title="Aucun partenaire" description="Aucun partenaire ne correspond à vos critères." action={<Link href={route('partenaires.create')} className="btn-primary"><Plus size={14} /> Ajouter</Link>} />
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {partenaires.data.map(p => (
                        <Link key={p.id} href={route('partenaires.show', p.id)} className="card-glass p-5 hover:border-white/20 transition-all duration-200 group block hover:lift">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                                    {TYPE_ICONS[p.type] ?? TYPE_ICONS['autre']}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-white text-sm truncate group-hover:text-srec-300 transition-colors">{p.nom}</h3>
                                    {p.sigle && <span className="text-xs text-slate-500">{p.sigle}</span>}
                                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                                        <span className={`badge ${NATURE_BADGE[p.nature]}`}>{p.nature}</span>
                                        <span className="chip"><Globe size={10} /> {p.pays}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="divider mt-4 mb-3" />
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Building2 size={11} /> {p.conventions_count ?? 0} convention{(p.conventions_count ?? 0) > 1 ? 's' : ''}</span>
                                <StatusBadge color={p.statut === 'actif' ? 'green' : p.statut === 'suspendu' ? 'yellow' : 'gray'} label={p.statut} />
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <div className="mt-4"><Pagination links={partenaires.links} /></div>
        </AppLayout>
    );
}
