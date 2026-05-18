import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import {
    CheckCircle2, FileText, Mail, Clock, TrendingUp,
    Handshake, AlertTriangle, Users, BarChart2, Award,
    Calendar, ArrowRight, ShieldCheck
} from 'lucide-react';

// ─── Anneau de pourcentage ───────────────────────────────────────────────────
function RingProgress({ pct, color = '#a78bfa', size = 80 }) {
    const r = 30, circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <svg width={size} height={size} viewBox="0 0 80 80">
            <circle cx="40" cy="40" r={r} fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="8" />
            <circle
                cx="40" cy="40" r={r} fill="none" stroke={color} strokeWidth="8"
                strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ / 4}
                strokeLinecap="round" style={{ transition: 'stroke-dasharray .8s ease' }}
            />
            <text x="40" y="45" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">{pct}%</text>
        </svg>
    );
}

// ─── Barre horizontale ───────────────────────────────────────────────────────
function BarItem({ label, value, max, color = 'bg-violet-500' }) {
    const pct = max > 0 ? Math.round((value / max) * 100) : 0;
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 truncate max-w-[160px]">{label}</span>
                <span className="text-slate-400 font-mono ml-2">{value}</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

// ─── Graphique barres (évolution sur 5 ans) ──────────────────────────────────
function EvolutionChart({ data }) {
    const max = Math.max(...data.map(d => d.count), 1);
    return (
        <div className="flex items-end gap-3 h-28 pt-2">
            {data.map((d, i) => {
                const pct = Math.max((d.count / max) * 100, 4);
                return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <span className="text-[10px] text-slate-500">{d.count}</span>
                        <div
                            className="w-full rounded-t-sm bg-gradient-to-t from-violet-700 to-violet-400 transition-all duration-700"
                            style={{ height: `${pct}%` }}
                        />
                        <span className="text-[10px] text-slate-500">{d.annee}</span>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Donut chart répartition ──────────────────────────────────────────────────
function DonutChart({ data }) {
    const total = data.reduce((s, d) => s + d.count, 0);
    const COLORS = ['#7c3aed', '#0ea5e9', '#f59e0b', '#10b981'];
    let offset = 0;
    const r = 40, circ = 2 * Math.PI * r;

    return (
        <div className="flex items-center gap-6">
            <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,.05)" strokeWidth="16" />
                {data.map((d, i) => {
                    const pct = total > 0 ? d.count / total : 0;
                    const dash = pct * circ;
                    const seg = (
                        <circle
                            key={i} cx="50" cy="50" r={r} fill="none"
                            stroke={COLORS[i % COLORS.length]} strokeWidth="16"
                            strokeDasharray={`${dash} ${circ - dash}`}
                            strokeDashoffset={circ * 0.25 - offset}
                            strokeLinecap="butt"
                        />
                    );
                    offset += dash;
                    return seg;
                })}
                <text x="50" y="54" textAnchor="middle" fill="white" fontSize="11" fontWeight="bold">{total}</text>
            </svg>
            <div className="space-y-1.5 flex-1">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                        <span className="text-slate-300 flex-1 truncate">{d.type}</span>
                        <span className="text-slate-400 font-mono">{d.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── KPI Card ──────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color = 'text-violet-400', bg = 'bg-violet-600/15' }) {
    return (
        <div className="card-glass p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
                <Icon size={22} className={color} />
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5">{label}</p>
                {sub && <p className="text-[10px] text-slate-600 mt-0.5">{sub}</p>}
            </div>
        </div>
    );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────
export default function Recteur({
    fileDecision, stats,
    topPartenaires = [], evolutionConventions = [],
    repartitionTypes = [], conventionsExpirant = []
}) {
    return (
        <AppLayout title="Dashboard Recteur">
            <Head title="Dashboard — Recteur" />

            {/* ── Header ── */}
            <div className="page-header mb-8">
                <div>
                    <h2 className="page-title">Tableau de bord <span className="gradient-text-gold">Recteur</span></h2>
                    <p className="page-subtitle">Vue stratégique et file de décision</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck size={14} className="text-emerald-400" />
                    <span>Données en temps réel</span>
                </div>
            </div>

            {/* ── KPIs ── */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                <KpiCard icon={Clock} label="En attente de décision" value={stats.en_attente} color="text-amber-400" bg="bg-amber-600/15" />
                <KpiCard icon={CheckCircle2} label="Traités ce mois" value={stats.traites_mois} color="text-emerald-400" bg="bg-emerald-600/15" />
                <div className="card-glass p-5 flex items-center gap-4 col-span-1">
                    <RingProgress pct={stats.taux_validation} color="#a78bfa" size={72} />
                    <div>
                        <p className="text-xs text-slate-400">Taux de validation</p>
                        <p className="text-[10px] text-slate-600 mt-1">Dossiers approuvés</p>
                    </div>
                </div>
                <KpiCard icon={FileText} label="Conventions signées" value={stats.conventions_signees} color="text-violet-400" bg="bg-violet-600/15" />
                <KpiCard icon={Users} label="Partenaires actifs" value={stats.partenaires_actifs} color="text-sky-400" bg="bg-sky-600/15" />
            </div>

            {/* ── Alertes Expiration ── */}
            {conventionsExpirant.length > 0 && (
                <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle size={16} className="text-amber-400" />
                        <h3 className="text-sm font-semibold text-amber-300">
                            {conventionsExpirant.length} convention{conventionsExpirant.length > 1 ? 's' : ''} expirant dans moins de 30 jours
                        </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {conventionsExpirant.map(c => (
                            <Link key={c.id} href={route('conventions.show', c.id)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300 hover:bg-amber-500/20 transition-colors">
                                <span className="font-mono">{c.reference}</span>
                                <span className="text-amber-500">·</span>
                                <span>{c.partenaire}</span>
                                <span className="badge" style={{ background: 'rgba(239,68,68,.2)', color: '#fca5a5', border: '1px solid rgba(239,68,68,.3)' }}>
                                    J-{c.jours}
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Graphiques ── */}
            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                {/* Évolution conventions */}
                <div className="lg:col-span-2 card-glass p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart2 size={16} className="text-violet-400" />
                        <h3 className="text-sm font-semibold text-white">Évolution des conventions signées</h3>
                        <span className="text-[10px] text-slate-500 ml-auto">5 dernières années</span>
                    </div>
                    <EvolutionChart data={evolutionConventions} />
                </div>

                {/* Répartition types */}
                <div className="card-glass p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-sky-400" />
                        <h3 className="text-sm font-semibold text-white">Répartition courriers</h3>
                    </div>
                    <DonutChart data={repartitionTypes} />
                </div>
            </div>

            {/* ── Top Partenaires + File de décision ── */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Top partenaires */}
                <div className="card-glass p-6">
                    <div className="flex items-center gap-2 mb-5">
                        <Award size={16} className="text-amber-400" />
                        <h3 className="text-sm font-semibold text-white">Top partenaires</h3>
                    </div>
                    {topPartenaires.length === 0 ? (
                        <p className="text-xs text-slate-500 text-center py-4">Aucune donnée</p>
                    ) : (
                        <div className="space-y-4">
                            {topPartenaires.map((p, i) => (
                                <BarItem
                                    key={i}
                                    label={`${p.sigle || p.nom} — ${p.pays}`}
                                    value={p.count}
                                    max={topPartenaires[0]?.count || 1}
                                    color={['bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'][i]}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* File de décision */}
                <div className="lg:col-span-2 card-glass overflow-hidden">
                    <div className="p-5 border-b border-white/5 flex items-center gap-2">
                        <Clock size={16} className="text-amber-400" />
                        <h3 className="text-sm font-semibold text-white">File de décision</h3>
                        {fileDecision.length > 0 && (
                            <span className="badge badge-yellow ml-auto">{fileDecision.length} en attente</span>
                        )}
                    </div>

                    {fileDecision.length === 0 ? (
                        <div className="flex flex-col items-center py-12 text-center">
                            <CheckCircle2 size={36} className="text-emerald-500 mb-3" />
                            <p className="text-slate-300 font-medium">File de décision vide</p>
                            <p className="text-sm text-slate-500 mt-1">Aucun document en attente de votre validation.</p>
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
                                    <ArrowRight size={16} className="text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
