import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { StatusBadge } from '@/Components/Ui';
import { Mail, Plus, Clock, AlertCircle } from 'lucide-react';

const COLORS = {
    soumis: 'blue', recu: 'blue', pris_en_charge: 'orange', rdv_planifie: 'orange',
    soumis_directrice: 'yellow', soumis_recteur: 'yellow', valide: 'green', rejete: 'red',
};

export default function Secretariat({ courriersDuJour, enAttente, stats }) {
    return (
        <AppLayout title="Dashboard Secrétariat">
            <Head title="Dashboard — Secrétariat" />

            <div className="page-header">
                <div>
                    <h2 className="page-title">Tableau de bord <span className="gradient-text">Secrétariat</span></h2>
                    <p className="page-subtitle">Gestion quotidienne du courrier</p>
                </div>
                <Link href={route('courriers.create')} className="btn-primary">
                    <Plus size={15} /> Nouveau courrier
                </Link>
            </div>

            {/* Stats du jour */}
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <div className="card-glass p-5 text-center">
                    <p className="text-3xl font-bold text-srec-400">{stats.total_aujourd_hui}</p>
                    <p className="text-xs text-slate-500 mt-1">Courriers aujourd'hui</p>
                </div>
                <div className="card-glass p-5 text-center">
                    <p className="text-3xl font-bold text-amber-400">{stats.non_traites}</p>
                    <p className="text-xs text-slate-500 mt-1">Non traités</p>
                </div>
                <div className="card-glass p-5 text-center">
                    <p className="text-3xl font-bold text-purple-400">{stats.total_semaine}</p>
                    <p className="text-xs text-slate-500 mt-1">Cette semaine</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Courriers du jour */}
                <div className="card-glass overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center gap-2">
                        <Mail size={15} className="text-srec-400" />
                        <h3 className="text-sm font-semibold text-white">Courriers d'aujourd'hui</h3>
                        <span className="badge badge-blue ml-auto">{courriersDuJour.length}</span>
                    </div>
                    {courriersDuJour.length === 0 ? (
                        <div className="py-10 text-center text-slate-500 text-sm">
                            <Mail size={28} className="mx-auto mb-2 opacity-30" />
                            Aucun courrier enregistré aujourd'hui
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {courriersDuJour.map(c => (
                                <Link key={c.id} href={route('courriers.show', c.id)} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <span className="font-mono text-xs text-srec-400 font-semibold">{c.numero}</span>
                                        <p className="text-sm text-white truncate">{c.objet}</p>
                                    </div>
                                    <StatusBadge color={COLORS[c.statut] ?? 'gray'} label={c.statut} />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* En attente de traitement */}
                <div className="card-glass overflow-hidden">
                    <div className="p-4 border-b border-white/5 flex items-center gap-2">
                        <AlertCircle size={15} className="text-amber-400" />
                        <h3 className="text-sm font-semibold text-white">En attente de traitement</h3>
                        {enAttente.length > 0 && <span className="badge badge-yellow ml-auto">{enAttente.length}</span>}
                    </div>
                    {enAttente.length === 0 ? (
                        <div className="py-10 text-center text-slate-500 text-sm">
                            <Clock size={28} className="mx-auto mb-2 opacity-30" />
                            Aucun courrier en attente
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {enAttente.map(c => (
                                <Link key={c.id} href={route('courriers.show', c.id)} className="flex items-center gap-3 px-4 py-3 hover:bg-white/3 transition-colors">
                                    <div className="flex-1 min-w-0">
                                        <span className="font-mono text-xs text-srec-400 font-semibold">{c.numero}</span>
                                        <p className="text-sm text-white truncate">{c.objet}</p>
                                        <p className="text-xs text-slate-600">{c.date}</p>
                                    </div>
                                    <StatusBadge color={COLORS[c.statut] ?? 'gray'} label={c.statut} />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
