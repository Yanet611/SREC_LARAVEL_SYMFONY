import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { StatusBadge } from '@/Components/Ui';
import { ArrowLeft, Globe, Mail, Phone, Edit2, Plus, FileText, GraduationCap, HeartHandshake, Landmark, Briefcase, ClipboardList } from 'lucide-react';

const TYPE_ICONS = { 
    universite: <GraduationCap size={28} className="text-blue-400" />, 
    ong: <HeartHandshake size={28} className="text-rose-400" />, 
    ambassade: <Landmark size={28} className="text-amber-400" />, 
    organisation_internationale: <Globe size={28} className="text-emerald-400" />, 
    entreprise: <Briefcase size={28} className="text-purple-400" />, 
    autre: <ClipboardList size={28} className="text-slate-400" /> 
};
const CONV_COLORS = { brouillon:'gray', soumise_directrice:'yellow', soumise_recteur:'yellow', approuvee:'green', rejetee:'red', revision:'orange', signee:'green', expiree:'slate', archive:'slate' };

export default function Show({ partenaire }) {
    const { auth } = usePage().props;
    const isRecteur = auth?.user?.roles?.[0]?.name === 'recteur';
    const InfoRow = ({ icon: Icon, label, value, href }) => {
        if (!value) return null;
        return (
            <div className="flex items-start gap-3">
                <Icon size={15} className="text-slate-500 mt-0.5 flex-shrink-0" />
                <div>
                    <p className="text-[10px] text-slate-600 uppercase tracking-wider">{label}</p>
                    {href
                        ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-srec-400 hover:text-srec-300">{value}</a>
                        : <p className="text-sm text-slate-200">{value}</p>
                    }
                </div>
            </div>
        );
    };

    return (
        <AppLayout title={partenaire.nom}>
            <Head title={partenaire.nom} />

            <div className="mb-6">
                <Link href={route('partenaires.index')} className="btn-ghost mb-3 -ml-1"><ArrowLeft size={15} /> Retour</Link>
                <div className="flex flex-wrap items-start gap-5">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center flex-shrink-0 border border-white/10 overflow-hidden shadow-inner">
                        {partenaire.logo_url ? (
                            <img src={partenaire.logo_url} alt={partenaire.nom} className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-3xl text-white/50">{partenaire.sigle ? partenaire.sigle.substring(0, 2) : partenaire.nom.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="page-title">{partenaire.nom}</h2>
                            {partenaire.sigle && <span className="chip">{partenaire.sigle}</span>}
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`badge ${partenaire.nature === 'international' ? 'badge-blue' : 'badge-green'}`}>{partenaire.nature}</span>
                            <StatusBadge color={partenaire.statut === 'actif' ? 'green' : 'gray'} label={partenaire.statut} />
                        </div>
                    </div>
                    {!isRecteur && (
                        <Link href={route('partenaires.edit', partenaire.id)} className="btn-secondary"><Edit2 size={14} /> Modifier</Link>
                    )}
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Informations */}
                    <div className="card-glass p-6">
                        <h3 className="text-sm font-semibold text-white mb-5">Informations générales</h3>
                        <div className="grid sm:grid-cols-2 gap-5">
                            <InfoRow icon={Globe} label="Pays" value={partenaire.pays} />
                            <InfoRow icon={Globe} label="Ville" value={partenaire.ville} />
                            <InfoRow icon={Globe} label="Site web" value={partenaire.site_web} href={partenaire.site_web} />
                            <InfoRow icon={Mail} label="Email" value={partenaire.email} href={`mailto:${partenaire.email}`} />
                            <InfoRow icon={Phone} label="Téléphone" value={partenaire.telephone} />
                        </div>
                        {partenaire.notes && (
                            <>
                                <div className="divider" />
                                <div>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Notes</p>
                                    <p className="text-sm text-slate-300 leading-relaxed">{partenaire.notes}</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Contact */}
                    {partenaire.contact_nom && (
                        <div className="card-glass p-6">
                            <h3 className="text-sm font-semibold text-white mb-4">Contact principal</h3>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-srec-700/30 flex items-center justify-center text-lg font-bold text-srec-300">
                                    {partenaire.contact_nom[0]}
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{partenaire.contact_nom}</p>
                                    {partenaire.contact_fonction && <p className="text-xs text-slate-400">{partenaire.contact_fonction}</p>}
                                    <div className="flex items-center gap-3 mt-1">
                                        {partenaire.contact_email && (
                                            <a href={`mailto:${partenaire.contact_email}`} className="text-xs text-srec-400 hover:text-srec-300">{partenaire.contact_email}</a>
                                        )}
                                        {partenaire.contact_telephone && (
                                            <span className="text-xs text-slate-500">{partenaire.contact_telephone}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Conventions */}
                    <div className="card-glass p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-white">Conventions ({partenaire.conventions?.length ?? 0})</h3>
                            {!isRecteur && (
                                <Link href={route('conventions.create', { partenaire_id: partenaire.id })} className="btn-secondary text-xs py-1 px-3"><Plus size={12} /> Nouvelle</Link>
                            )}
                        </div>
                        {partenaire.conventions?.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">Aucune convention enregistrée.</p>
                        ) : (
                            <div className="space-y-3">
                                {partenaire.conventions?.map(c => (
                                    <Link key={c.id} href={route('conventions.show', c.id)} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                                        <div className="w-9 h-9 bg-srec-700/20 rounded-lg flex items-center justify-center"><FileText size={15} className="text-srec-400" /></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-mono text-srec-400">{c.reference}</p>
                                            <p className="text-sm text-slate-200 truncate">{c.intitule}</p>
                                        </div>
                                        <StatusBadge color={CONV_COLORS[c.statut] ?? 'gray'} label={c.statut_label ?? c.statut} />
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats sidebar */}
                <div className="space-y-4">
                    <div className="card-glass p-5">
                        <h3 className="text-sm font-semibold text-white mb-4">Statistiques</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Conventions totales</span>
                                <span className="font-semibold text-white">{partenaire.conventions?.length ?? 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">Conventions signées</span>
                                <span className="font-semibold text-emerald-400">{partenaire.conventions?.filter(c => c.statut === 'signee').length ?? 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-400">En cours</span>
                                <span className="font-semibold text-amber-400">{partenaire.conventions?.filter(c => ['soumise_directrice','soumise_recteur'].includes(c.statut)).length ?? 0}</span>
                            </div>
                        </div>
                    </div>
                    <div className="card-glass p-5">
                        <p className="text-[10px] text-slate-600 uppercase tracking-wider mb-1">Enregistré le</p>
                        <p className="text-sm text-slate-300">{new Date(partenaire.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
