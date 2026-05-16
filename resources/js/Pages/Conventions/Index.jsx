import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { StatusBadge, EmptyState, Pagination } from '@/Components/Ui';
import { useState } from 'react';
import { FileText, Plus, Search, Filter, X } from 'lucide-react';

const STATUT_COLORS = {
    brouillon:'gray', soumise_directrice:'yellow', soumise_recteur:'yellow',
    approuvee:'green', rejetee:'red', revision:'orange', signee:'green', expiree:'slate', archive:'slate'
};

const STATUTS = [
    { value:'', label:'Tous les statuts' },
    { value:'brouillon', label:'Brouillon' },
    { value:'soumise_directrice', label:'Soumise (Directrice)' },
    { value:'soumise_recteur', label:'Soumise (Recteur)' },
    { value:'approuvee', label:'Approuvée' },
    { value:'rejetee', label:'Rejetée' },
    { value:'signee', label:'Signée' },
];

export default function Index({ conventions, partenaires, filtres }) {
    const [search, setSearch] = useState(filtres.search ?? '');
    const [statut, setStatut] = useState(filtres.statut ?? '');
    const [partenaire, setPartenaire] = useState(filtres.partenaire ?? '');

    const applyFilters = (params = {}) => {
        router.get(route('conventions.index'), {
            search: params.search ?? search,
            statut: params.statut ?? statut,
            partenaire: params.partenaire ?? partenaire,
        }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title="Conventions">
            <Head title="Conventions" />
            <div className="page-header">
                <div>
                    <h2 className="page-title">Conventions</h2>
                    <p className="page-subtitle">{conventions.total} convention{conventions.total > 1 ? 's' : ''}</p>
                </div>
                <Link href={route('conventions.create')} className="btn-primary"><Plus size={15} /> Nouvelle convention</Link>
            </div>

            {/* Filtres */}
            <div className="card-glass p-4 mb-6 flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-48 relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type="text" placeholder="Rechercher (référence, intitulé...)" value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && applyFilters()} className="input pl-9" />
                </div>
                <select value={statut} onChange={e => { setStatut(e.target.value); applyFilters({ statut: e.target.value }); }} className="input w-auto min-w-44">
                    {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <select value={partenaire} onChange={e => { setPartenaire(e.target.value); applyFilters({ partenaire: e.target.value }); }} className="input w-auto min-w-44">
                    <option value="">Tous partenaires</option>
                    {partenaires.map(p => <option key={p.id} value={p.id}>{p.nom}</option>)}
                </select>
                <button onClick={() => applyFilters()} className="btn-primary"><Filter size={14} /> Filtrer</button>
                {(search || statut || partenaire) && (
                    <button onClick={() => { setSearch(''); setStatut(''); setPartenaire(''); router.get(route('conventions.index')); }} className="btn-ghost"><X size={14} /> Reset</button>
                )}
            </div>

            {/* Table */}
            <div className="card-glass overflow-hidden">
                {conventions.data.length === 0 ? (
                    <div className="p-4">
                        <EmptyState icon={FileText} title="Aucune convention" description="Commencez par créer une convention." action={<Link href={route('conventions.create')} className="btn-primary"><Plus size={14} /> Nouvelle convention</Link>} />
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table-srec">
                            <thead>
                                <tr>
                                    <th>Référence</th>
                                    <th>Intitulé</th>
                                    <th>Partenaire</th>
                                    <th>Type</th>
                                    <th>Date fin</th>
                                    <th>Statut</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {conventions.data.map(c => (
                                    <tr key={c.id}>
                                        <td><span className="font-mono text-xs text-srec-300 font-semibold">{c.reference}</span></td>
                                        <td className="max-w-xs"><p className="truncate font-medium text-slate-200">{c.intitule}</p></td>
                                        <td className="text-slate-400 text-xs">{c.partenaire?.nom}</td>
                                        <td><span className="chip">{c.type?.replace(/_/g, ' ')}</span></td>
                                        <td className="text-xs text-slate-400 whitespace-nowrap">
                                            {c.date_fin ? new Date(c.date_fin).toLocaleDateString('fr-FR') : '—'}
                                        </td>
                                        <td><StatusBadge color={STATUT_COLORS[c.statut] ?? 'gray'} label={c.statut_label ?? c.statut} /></td>
                                        <td><Link href={route('conventions.show', c.id)} className="btn-ghost text-xs py-1 px-2">Voir</Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="px-4 pb-4"><Pagination links={conventions.links} /></div>
            </div>
        </AppLayout>
    );
}
