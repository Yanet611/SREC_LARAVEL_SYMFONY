import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { KpiCard, StatusBadge } from '@/Components/Ui';
import {
    Mail, Handshake, FileText, Plane, Clock,
    TrendingUp, ArrowRight, AlertCircle, CheckCircle2, AlertTriangle
} from 'lucide-react';
import {
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="card-glass px-3 py-2 text-xs">
            <p className="text-white font-semibold mb-1">{label}</p>
            {payload.map(p => (
                <p key={p.name} style={{ color: p.color }}>
                    {p.name}: <span className="font-bold">{p.value}</span>
                </p>
            ))}
        </div>
    );
};

export default function Dashboard({ kpis, fileAction, courriersParMois, activiteRecente, notifications, userRole, courriersBlockes = [] }) {
    return (
        <AppLayout title="Tableau de bord">
            <Head title="Tableau de bord" />

            {/* Page header */}
            <div className="page-header">
                <div>
                    <h2 className="page-title">
                        Bienvenue, <span className="gradient-text">Tableau de bord</span>
                    </h2>
                    <p className="page-subtitle">Vue d'ensemble du Système de Relations Extérieures et de Coopération</p>
                </div>
                {fileAction.length > 0 && (
                    <div className="flex items-center gap-2 badge badge-yellow pulse-urgent">
                        <AlertCircle size={13} />
                        {fileAction.length} action{fileAction.length > 1 ? 's' : ''} requise{fileAction.length > 1 ? 's' : ''}
                    </div>
                )}
            </div>

            {/* ── Bannière d'alertes d'inactivité ── */}
            {courriersBlockes.length > 0 && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={15} className="text-red-400" />
                        <h3 className="text-sm font-semibold text-red-300">
                            {courriersBlockes.length} dossier{courriersBlockes.length > 1 ? 's' : ''} bloqué{courriersBlockes.length > 1 ? 's' : ''} depuis plus de 48h
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {courriersBlockes.map(c => (
                            <Link key={c.id} href={route('courriers.show', c.id)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/15 rounded-lg text-xs text-red-300 hover:bg-red-500/20 transition-colors">
                                <span className="font-mono">{c.numero}</span>
                                <span className="text-red-500">·</span>
                                <span className="truncate max-w-[160px]">{c.objet}</span>
                                <span className="ml-1 text-red-500 font-mono">{c.heures}h</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                <KpiCard title="Courriers actifs"       value={kpis.courriers_total}      icon={Mail}       color="blue"   />
                <KpiCard title="En attente"             value={kpis.courriers_en_attente}  icon={Clock}      color="amber"  subtitle="Nécessitent une action" />
                <KpiCard title="Partenaires actifs"     value={kpis.partenaires_actifs}    icon={Handshake}  color="green"  />
                <KpiCard title="Conventions signées"    value={kpis.conventions_actives}   icon={FileText}   color="purple" />
                <KpiCard title="Conventions en cours"   value={kpis.conventions_en_cours}  icon={TrendingUp} color="blue"   />
                <KpiCard title="Mobilités cette année"  value={kpis.mobilites_annee}       icon={Plane}      color="green"  />
            </div>

            {/* Main grid */}
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
                {/* Graphique courriers */}
                <div className="lg:col-span-2 card-glass p-6">
                    <h3 className="text-sm font-semibold text-white mb-4">Courriers — 6 derniers mois</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={courriersParMois} barSize={12}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                            <Bar dataKey="entrant" name="Entrant" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="sortant" name="Sortant" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* File d'action */}
                <div className="card-glass p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-white">Actions requises</h3>
                        {fileAction.length > 0 && (
                            <span className="badge badge-red">{fileAction.length}</span>
                        )}
                    </div>
                    <div className="space-y-3">
                        {fileAction.length === 0 ? (
                            <div className="flex flex-col items-center py-6 text-center">
                                <CheckCircle2 size={28} className="text-emerald-500 mb-2" />
                                <p className="text-xs text-slate-500">Aucune action en attente</p>
                            </div>
                        ) : fileAction.map((item, i) => (
                            <Link
                                key={i}
                                href={`/${item.type === 'courrier' ? 'courriers' : 'conventions'}/${item.id}`}
                                className="flex items-start gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/7 transition-colors group"
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-white truncate">{item.label}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">{item.date}</p>
                                </div>
                                <ArrowRight size={14} className="text-slate-600 group-hover:text-srec-400 flex-shrink-0 mt-0.5 transition-colors" />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Activité récente */}
            <div className="card-glass p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-white">Activité récente — Courriers</h3>
                    <Link href={route('courriers.index')} className="text-xs text-srec-400 hover:text-srec-300 flex items-center gap-1">
                        Voir tout <ArrowRight size={12} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="table-srec">
                        <thead>
                            <tr>
                                <th>Numéro</th>
                                <th>Objet</th>
                                <th>Statut</th>
                                <th>Par</th>
                                <th>Il y a</th>
                            </tr>
                        </thead>
                        <tbody>
                            {activiteRecente.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <Link href={route('courriers.show', c.id)} className="text-srec-400 hover:text-srec-300 font-mono text-xs font-medium">
                                            {c.numero}
                                        </Link>
                                    </td>
                                    <td className="max-w-xs truncate">{c.objet}</td>
                                    <td><StatusBadge color={c.color} label={c.statut} /></td>
                                    <td className="text-slate-500 text-xs">{c.auteur}</td>
                                    <td className="text-slate-600 text-xs">{c.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
