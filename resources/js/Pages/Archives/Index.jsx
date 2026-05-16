import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Archive, Search, FileText, Mail, Building2, CalendarDays, X } from 'lucide-react';
import { useState } from 'react';
import { Pagination } from '@/Components/Ui';

export default function Index({ courriers, conventions, filtres }) {
    const [search, setSearch] = useState(filtres.search ?? '');

    const handleSearch = () => {
        router.get(route('archives.index'), { search }, { preserveState: true, replace: true });
    };

    return (
        <AppLayout title="Archives">
            <Head title="Archives du SREC" />

            <div className="page-header">
                <div>
                    <h2 className="page-title flex items-center gap-2">
                        <Archive size={20} className="text-srec-400" /> Archives Globales
                    </h2>
                    <p className="page-subtitle">Consultez les dossiers clôturés (Courriers archivés, Conventions expirées)</p>
                </div>
            </div>

            {/* Barre de recherche */}
            <div className="card-glass p-4 mb-6 flex gap-3">
                <div className="flex-1 relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                        type="text" 
                        className="input pl-9" 
                        placeholder="Rechercher par numéro, référence, objet, intitulé..." 
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <button onClick={handleSearch} className="btn-primary">Rechercher</button>
                {search && (
                    <button onClick={() => { setSearch(''); router.get(route('archives.index')); }} className="btn-ghost">
                        <X size={14} /> Reset
                    </button>
                )}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Colonne Courriers */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2 uppercase tracking-wider">
                        <Mail size={16} className="text-blue-400" /> Courriers Archivés
                    </h3>
                    
                    {courriers.data.length === 0 ? (
                        <div className="card-glass p-6 text-center text-slate-500 text-sm">
                            Aucun courrier archivé.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {courriers.data.map(c => (
                                <div key={c.id} className="card-glass p-4 hover:border-white/20 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-mono text-xs text-srec-300 font-semibold">{c.numero}</span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <CalendarDays size={12} /> {new Date(c.updated_at).toLocaleDateString('fr-FR')}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-white mb-1">{c.objet}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Link href={route('courriers.show', c.id)} className="btn-secondary text-xs py-1">Consulter</Link>
                                    </div>
                                </div>
                            ))}
                            <Pagination links={courriers.links} />
                        </div>
                    )}
                </div>

                {/* Colonne Conventions */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2 uppercase tracking-wider">
                        <Building2 size={16} className="text-purple-400" /> Conventions Expirées/Annulées
                    </h3>
                    
                    {conventions.data.length === 0 ? (
                        <div className="card-glass p-6 text-center text-slate-500 text-sm">
                            Aucune convention archivée.
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {conventions.data.map(c => (
                                <div key={c.id} className="card-glass p-4 hover:border-white/20 transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-mono text-xs text-srec-300 font-semibold">{c.reference}</span>
                                        <span className="badge badge-red">{c.statut}</span>
                                    </div>
                                    <p className="text-sm font-medium text-white mb-1 line-clamp-2">{c.intitule}</p>
                                    <div className="flex items-center gap-2 mt-3">
                                        <Link href={route('conventions.show', c.id)} className="btn-secondary text-xs py-1">Consulter</Link>
                                    </div>
                                </div>
                            ))}
                            <Pagination links={conventions.links} />
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
