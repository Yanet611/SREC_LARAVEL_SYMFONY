import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { StatusBadge } from '@/Components/Ui';
import {
    ArrowLeft, Edit, CalendarDays, Globe, User, Plane,
    ArrowDownLeft, ArrowUpRight, Building2, Phone, Mail, Banknote
} from 'lucide-react';

const STATUT_COLORS = {
    en_attente: 'yellow', approuvee: 'green', en_cours: 'orange', realisee: 'blue', annulee: 'red',
};
const STATUT_LABELS = {
    en_attente: 'En attente', approuvee: 'Approuvée', en_cours: 'En cours', realisee: 'Réalisée', annulee: 'Annulée',
};
const BENEF_LABELS = {
    etudiant: 'Étudiant', enseignant: 'Enseignant', chercheur: 'Chercheur', personnel_admin: 'Personnel admin',
};

export default function Show({ mobilite }) {
    const { auth } = usePage().props;
    const isRecteur = auth?.user?.roles?.[0]?.name === 'recteur';
    const isEntrant = mobilite.type_mobilite === 'entrant';

    const InfoRow = ({ icon: Icon, label, value }) => value ? (
        <div className="flex items-start gap-3">
            <Icon size={13} className="text-slate-500 mt-0.5 flex-shrink-0" />
            <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm text-slate-200 mt-0.5">{value}</p>
            </div>
        </div>
    ) : null;

    return (
        <AppLayout title={`Mobilité ${mobilite.reference}`}>
            <Head title={`Mobilité ${mobilite.reference}`} />

            {/* Header */}
            <div className="page-header">
                <div>
                    <Link href={route('mobilites.index')} className="btn-ghost mb-3 -ml-1">
                        <ArrowLeft size={15} /> Mobilités
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isEntrant ? 'bg-blue-600/10' : 'bg-purple-600/10'}`}>
                            {isEntrant
                                ? <ArrowDownLeft size={20} className="text-blue-400" />
                                : <ArrowUpRight size={20} className="text-purple-400" />
                            }
                        </div>
                        <div>
                            <h2 className="page-title leading-tight">{mobilite.nom_beneficiaire}</h2>
                            <p className="page-subtitle font-mono">{mobilite.reference} · {isEntrant ? 'Entrant' : 'Sortant'} · {BENEF_LABELS[mobilite.type_beneficiaire]}</p>
                        </div>
                    </div>
                </div>
                {!isRecteur && (
                    <Link href={route('mobilites.edit', mobilite.id)} className="btn-secondary">
                        <Edit size={14} /> Modifier
                    </Link>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Main */}
                <div className="lg:col-span-2 space-y-5">

                    {/* Séjour */}
                    <div className="card-glass p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Détails du séjour</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <InfoRow icon={Building2}    label="Institution d'accueil" value={mobilite.institution_accueil} />
                            <InfoRow icon={Globe}        label="Pays de destination"   value={mobilite.pays_destination} />
                            {mobilite.ville_destination && <InfoRow icon={Globe} label="Ville" value={mobilite.ville_destination} />}
                            <InfoRow icon={CalendarDays} label="Date de départ"        value={new Date(mobilite.date_depart).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
                            {mobilite.date_retour && (
                                <InfoRow icon={CalendarDays} label="Date de retour" value={new Date(mobilite.date_retour).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} />
                            )}
                        </div>
                        {mobilite.objet_sejour && (
                            <div>
                                <p className="text-xs text-slate-500 mb-1">Objet du séjour</p>
                                <p className="text-sm text-slate-300 leading-relaxed">{mobilite.objet_sejour}</p>
                            </div>
                        )}
                    </div>

                    {/* Bénéficiaire */}
                    <div className="card-glass p-5 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Bénéficiaire</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <InfoRow icon={User}  label="Nom complet"  value={mobilite.nom_beneficiaire} />
                            <InfoRow icon={User}  label="Profil"       value={BENEF_LABELS[mobilite.type_beneficiaire]} />
                            {mobilite.email_beneficiaire && <InfoRow icon={Mail}  label="Email"     value={mobilite.email_beneficiaire} />}
                            {mobilite.telephone_beneficiaire && <InfoRow icon={Phone} label="Téléphone" value={mobilite.telephone_beneficiaire} />}
                        </div>
                    </div>

                    {/* Financement */}
                    {(mobilite.financement || mobilite.montant_financement) && (
                        <div className="card-glass p-5 space-y-3">
                            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Financement</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                {mobilite.financement && <InfoRow icon={Banknote} label="Source" value={mobilite.financement} />}
                                {mobilite.montant_financement && (
                                    <InfoRow icon={Banknote} label="Montant" value={Number(mobilite.montant_financement).toLocaleString('fr-FR') + ' GNF'} />
                                )}
                            </div>
                        </div>
                    )}

                    {mobilite.observations && (
                        <div className="card-glass p-5">
                            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">Observations</h3>
                            <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{mobilite.observations}</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="card-glass p-5 space-y-3">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Statut</h3>
                        <StatusBadge color={STATUT_COLORS[mobilite.statut] ?? 'gray'} label={STATUT_LABELS[mobilite.statut] ?? mobilite.statut} />
                    </div>

                    <div className="card-glass p-5 space-y-3">
                        <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Informations</h3>
                        <div className="space-y-2 text-xs text-slate-400">
                            <div className="flex items-center gap-2">
                                <Plane size={12} />
                                <span>{isEntrant ? 'Mobilité entrante' : 'Mobilité sortante'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <User size={12} />
                                <span>Par <span className="text-slate-300">{mobilite.creee_par?.name}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <CalendarDays size={12} />
                                <span>{new Date(mobilite.created_at).toLocaleDateString('fr-FR')}</span>
                            </div>
                        </div>
                    </div>

                    <Link href={route('conventions.show', mobilite.convention?.id)} className="card-glass p-4 flex items-center gap-3 hover:border-white/20 transition-all group block">
                        <div className="w-9 h-9 rounded-lg bg-srec-600/20 flex items-center justify-center">
                            <Building2 size={16} className="text-srec-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500">Convention</p>
                            <p className="text-sm font-medium text-white truncate group-hover:text-srec-300 transition-colors">
                                {mobilite.convention?.reference}
                            </p>
                            <p className="text-xs text-slate-500 truncate">{mobilite.convention?.intitule}</p>
                        </div>
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
