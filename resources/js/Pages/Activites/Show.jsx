import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { StatusBadge } from '@/Components/Ui';
import {
    ArrowLeft, Edit, CalendarDays, MapPin, Users, User,
    GraduationCap, FlaskConical, ArrowLeftRight, Mic2, BookOpen, LayoutGrid, Building2
} from 'lucide-react';

const TYPE_META = {
    formation:   { icon: GraduationCap,  color: 'text-blue-400',    bg: 'bg-blue-600/10',    label: 'Formation' },
    recherche:   { icon: FlaskConical,   color: 'text-purple-400',  bg: 'bg-purple-600/10',  label: 'Recherche' },
    echange:     { icon: ArrowLeftRight, color: 'text-emerald-400', bg: 'bg-emerald-600/10', label: 'Échange' },
    conference:  { icon: Mic2,           color: 'text-amber-400',   bg: 'bg-amber-600/10',   label: 'Conférence' },
    stage:       { icon: BookOpen,       color: 'text-orange-400',  bg: 'bg-orange-600/10',  label: 'Stage' },
    autre:       { icon: LayoutGrid,     color: 'text-slate-400',   bg: 'bg-slate-600/10',   label: 'Autre' },
};

const STATUT_COLORS = { planifiee: 'blue', en_cours: 'orange', realisee: 'green', annulee: 'red' };
const STATUT_LABELS = { planifiee: 'Planifiée', en_cours: 'En cours', realisee: 'Réalisée', annulee: 'Annulée' };

export default function Show({ activite }) {
    const meta = TYPE_META[activite.type] ?? TYPE_META['autre'];
    const TypeIcon = meta.icon;

    const InfoRow = ({ label, value }) => value ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-1">
            <span className="text-xs text-slate-500 w-40 flex-shrink-0">{label}</span>
            <span className="text-sm text-slate-200">{value}</span>
        </div>
    ) : null;

    return (
        <AppLayout title={activite.titre}>
            <Head title={activite.titre} />

            {/* Header */}
            <div className="page-header">
                <div>
                    <Link href={route('activites.index')} className="btn-ghost mb-3 -ml-1">
                        <ArrowLeft size={15} /> Activités
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl ${meta.bg} flex items-center justify-center flex-shrink-0`}>
                            <TypeIcon size={20} className={meta.color} />
                        </div>
                        <div>
                            <h2 className="page-title leading-tight">{activite.titre}</h2>
                            <p className="page-subtitle">{meta.label} · {activite.convention?.reference}</p>
                        </div>
                    </div>
                </div>
                <Link href={route('activites.edit', activite.id)} className="btn-secondary">
                    <Edit size={14} /> Modifier
                </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Détails principaux */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="card-glass p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Détails</h3>
                        <div className="space-y-3">
                            <InfoRow label="Convention" value={`${activite.convention?.reference} — ${activite.convention?.intitule}`} />
                            <InfoRow label="Partenaire" value={activite.convention?.partenaire?.nom} />
                            <InfoRow label="Date de début" value={new Date(activite.date_debut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
                            {activite.date_fin && <InfoRow label="Date de fin" value={new Date(activite.date_fin).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />}
                            {activite.lieu && <InfoRow label="Lieu" value={activite.lieu} />}
                            {activite.participants_prevus && <InfoRow label="Participants prévus" value={activite.participants_prevus} />}
                            {activite.participants_reels != null && <InfoRow label="Participants réels" value={activite.participants_reels} />}
                        </div>
                    </div>

                    {activite.description && (
                        <div className="card-glass p-5">
                            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Description</h3>
                            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{activite.description}</p>
                        </div>
                    )}

                    {activite.observations && (
                        <div className="card-glass p-5">
                            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Observations</h3>
                            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{activite.observations}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="card-glass p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Statut</h3>
                        <StatusBadge color={STATUT_COLORS[activite.statut] ?? 'gray'} label={STATUT_LABELS[activite.statut] ?? activite.statut} />
                    </div>

                    <div className="card-glass p-5 space-y-3">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Informations</h3>
                        <div className="space-y-2 text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                                <User size={12} />
                                <span>Créé par <span className="text-slate-300">{activite.creee_par?.name}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarDays size={12} />
                                <span>{new Date(activite.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                            {activite.lieu && (
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} />
                                    <span>{activite.lieu}</span>
                                </div>
                            )}
                            {activite.participants_prevus && (
                                <div className="flex items-center gap-2">
                                    <Users size={12} />
                                    <span>{activite.participants_prevus} participants prévus</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <Link href={route('conventions.show', activite.convention?.id)} className="card-glass p-4 flex items-center gap-3 hover:border-white/20 transition-all group block">
                        <div className="w-9 h-9 rounded-lg bg-srec-600/20 flex items-center justify-center">
                            <Building2 size={16} className="text-srec-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500">Convention</p>
                            <p className="text-sm font-medium text-white truncate group-hover:text-srec-300 transition-colors">
                                {activite.convention?.reference}
                            </p>
                        </div>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
