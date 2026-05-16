import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, XCircle, FileText, Mail, Clock } from 'lucide-react';

export default function Recteur({ fileDecision, stats }) {
    const handleDecision = (e, item, isApprove) => {
        e.preventDefault();
        const endpoint = item.type === 'courrier' 
            ? route('courriers.statut', item.id) 
            : route('conventions.statut', item.id);
            
        const statut = item.type === 'courrier' 
            ? (isApprove ? 'valide' : 'rejete') 
            : (isApprove ? 'approuvee' : 'rejetee');
            
        router.post(endpoint, { statut, commentaire: isApprove ? 'Approuvé par le Recteur' : 'Rejeté par le Recteur' }, {
            preserveScroll: true
        });
    };

    return (
        <AppLayout title="Dashboard Recteur">
            <Head title="Dashboard — Recteur" />

            <div className="page-header">
                <div>
                    <h2 className="page-title">Tableau de bord <span className="gradient-text-gold">Recteur</span></h2>
                    <p className="page-subtitle">Documents en attente de votre décision</p>
                </div>
                <div className="flex gap-4">
                    <div className="card-glass px-5 py-3 text-center">
                        <p className="text-2xl font-bold text-amber-400">{stats.en_attente}</p>
                        <p className="text-xs text-slate-500">En attente</p>
                    </div>
                    <div className="card-glass px-5 py-3 text-center">
                        <p className="text-2xl font-bold text-emerald-400">{stats.traites_mois}</p>
                        <p className="text-xs text-slate-500">Traités ce mois</p>
                    </div>
                </div>
            </div>

            <div className="card-glass overflow-hidden">
                <div className="p-5 border-b border-white/5 flex items-center gap-2">
                    <Clock size={16} className="text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">File de décision</h3>
                    {fileDecision.length > 0 && <span className="badge badge-yellow ml-auto">{fileDecision.length} en attente</span>}
                </div>

                {fileDecision.length === 0 ? (
                    <div className="flex flex-col items-center py-16 text-center">
                        <CheckCircle2 size={40} className="text-emerald-500 mb-3" />
                        <p className="text-slate-300 font-medium">Aucun document en attente</p>
                        <p className="text-sm text-slate-500 mt-1">Votre file de décision est vide.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-white/5">
                        {fileDecision.map((item, i) => (
                            <Link
                                key={i}
                                href={`/${item.type === 'courrier' ? 'courriers' : 'conventions'}/${item.id}`}
                                className="flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors group"
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.type === 'courrier' ? 'bg-blue-600/20' : 'bg-purple-600/20'}`}>
                                    {item.type === 'courrier'
                                        ? <Mail size={18} className="text-blue-400" />
                                        : <FileText size={18} className="text-purple-400" />
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono text-xs text-srec-400 font-semibold">{item.numero}</span>
                                        {item.partenaire && <span className="chip">{item.partenaire}</span>}
                                    </div>
                                    <p className="text-sm font-medium text-white truncate mt-0.5">{item.objet}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">Soumis par {item.soumis_par} · {item.date}</p>
                                </div>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <button className="btn-success text-xs py-1.5 px-3" onClick={e => handleDecision(e, item, true)}>
                                        <CheckCircle2 size={13} /> Approuver
                                    </button>
                                    <button className="btn-danger text-xs py-1.5 px-3" onClick={e => handleDecision(e, item, false)}>
                                        <XCircle size={13} /> Rejeter
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
