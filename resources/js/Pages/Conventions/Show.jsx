import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { StatusBadge, Timeline, Modal } from '@/Components/Ui';
import { useState, useEffect } from 'react';
import { ArrowLeft, SendHorizonal, CheckCircle2, XCircle, RotateCcw, FileText, Activity, Plane, Handshake, Plus, PenTool, ShieldCheck } from 'lucide-react';

const STATUT_COLORS = {
    brouillon:'gray', soumise_directrice:'yellow', soumise_recteur:'yellow',
    approuvee:'green', rejetee:'red', revision:'orange', signee:'green', expiree:'slate', archive:'slate'
};

const TRANSITIONS = {
    brouillon:           [{ to: 'soumise_directrice', label: 'Soumettre à la Directrice', color: 'yellow', icon: SendHorizonal }],
    soumise_directrice:  [
        { to: 'soumise_recteur', label: 'Soumettre au Recteur', color: 'yellow', icon: SendHorizonal },
        { to: 'revision',        label: 'Renvoyer en révision', color: 'orange', icon: RotateCcw },
    ],
    soumise_recteur:     [
        { to: 'approuvee', label: 'Approuver',          color: 'green',  icon: CheckCircle2 },
        { to: 'rejetee',   label: 'Rejeter',             color: 'red',    icon: XCircle },
        { to: 'revision',  label: 'Demander révision',   color: 'orange', icon: RotateCcw },
    ],
    revision:            [{ to: 'soumise_directrice', label: 'Resoumettre', color: 'yellow', icon: SendHorizonal }],
    approuvee:           [], // Géré par le bouton Signature Numérique du Recteur
};

function ActionModal({ open, onClose, transition, conventionId }) {
    const { data, setData, post, processing, reset } = useForm({
        statut:      transition?.to ?? '',
        commentaire: '',
        motif_rejet: '',
    });

    useEffect(() => {
        if (transition) {
            setData({
                statut: transition.to,
                commentaire: '',
                motif_rejet: ''
            });
        }
    }, [transition]);

    const handleSubmit = () => {
        post(route('conventions.statut', conventionId), {
            onSuccess: () => { reset(); onClose(); }
        });
    };

    if (!open) return null;
    const needsMotif = transition?.to === 'rejetee';

    return (
        <Modal open={open} onClose={onClose} title={transition?.label}>
            <div className="space-y-4">
                {needsMotif && (
                    <div className="form-group">
                        <label className="label">Motif du rejet <span className="text-red-400">*</span></label>
                        <textarea className="input resize-none" rows={3} value={data.motif_rejet} onChange={e => setData('motif_rejet', e.target.value)} placeholder="Expliquez le motif du rejet..." />
                    </div>
                )}
                <div className="form-group">
                    <label className="label">Commentaire (optionnel)</label>
                    <textarea className="input resize-none" rows={3} value={data.commentaire} onChange={e => setData('commentaire', e.target.value)} placeholder="Observations complémentaires..." />
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="btn-secondary">Annuler</button>
                    <button onClick={handleSubmit} disabled={processing} className={`btn ${transition?.color === 'green' ? 'btn-success' : transition?.color === 'red' ? 'btn-danger' : 'btn-primary'}`}>
                        <SendHorizonal size={14} /> Confirmer
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default function Show({ convention, historique }) {
    const { auth } = usePage().props;
    const userRole = auth?.user?.roles?.[0]?.name ?? '';
    const [modal, setModal]             = useState(null);
    const [signerLoading, setSignerLoading] = useState(false);
    const { post: postSigner, processing: signing } = useForm();

    const handleSigner = () => {
        if (!window.confirm('Vous êtes sur le point d\'apposer votre signature électronique officielle sur cette convention. Cette action est irréversible. Confirmer ?')) return;
        postSigner(route('conventions.signer', convention.id));
    };

    const currentTransitions = TRANSITIONS[convention.statut] ?? [];

    const canTransition = (t) => {
        if (userRole === 'admin') return true;
        if (t.to === 'soumise_directrice' || t.to === 'revision') return ['directrice', 'admin'].includes(userRole);
        if (t.to === 'soumise_recteur') return ['directrice', 'admin'].includes(userRole);
        if (['approuvee', 'rejetee'].includes(t.to)) return ['recteur', 'admin'].includes(userRole);
        if (t.to === 'signee') return ['directrice', 'admin'].includes(userRole);
        return false;
    };

    const InfoRow = ({ label, value }) => (
        <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">{label}</span>
            <span className="text-sm text-slate-200">{value || '—'}</span>
        </div>
    );

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR') : '—';

    return (
        <AppLayout title={`Convention ${convention.reference}`}>
            <Head title={`Convention ${convention.reference}`} />

            <div className="mb-6">
                <Link href={route('conventions.index')} className="btn-ghost mb-3 -ml-1"><ArrowLeft size={15} /> Retour</Link>
                <div className="flex flex-wrap items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-srec-400 font-bold text-sm">{convention.reference}</span>
                            <StatusBadge color={STATUT_COLORS[convention.statut]} label={convention.statut_label} />
                        </div>
                        <h2 className="page-title">{convention.intitule}</h2>
                        {convention.partenaire && (
                            <Link href={route('partenaires.show', convention.partenaire.id)} className="text-sm flex items-center gap-2 text-srec-400 hover:text-srec-300 mt-1">
                                <Handshake size={14} /> {convention.partenaire.nom}
                            </Link>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {currentTransitions.filter(canTransition).map(t => {
                            const Icon = t.icon;
                            return (
                                <button key={t.to} onClick={() => setModal(t)}
                                    className={`btn ${t.color === 'green' ? 'btn-success' : t.color === 'red' ? 'btn-danger' : t.color === 'orange' ? 'btn-warning' : 'btn-primary'}`}>
                                    <Icon size={14} /> {t.label}
                                </button>
                            );
                        })}

                        {/* Bouton Signature Numérique (Recteur uniquement, sur convention approuvée non signée) */}
                        {convention.statut === 'approuvee' && !convention.signature_token && ['recteur', 'admin'].includes(userRole) && (
                            <button
                                onClick={handleSigner}
                                disabled={signing}
                                className="btn-success flex items-center gap-2 animate-pulse"
                            >
                                <PenTool size={14} />
                                {signing ? 'Signature en cours...' : '✍️ Apposer ma signature électronique'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Fiche principale */}
                <div className="lg:col-span-2 space-y-5">
                    <div className="card-glass p-6">
                        <h3 className="text-sm font-semibold text-white mb-5">Détails de la convention</h3>
                        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
                            <InfoRow label="Type" value={convention.type?.replace(/_/g,' ')} />
                            <InfoRow label="Reconductible" value={convention.reconductible ? 'Oui' : 'Non'} />
                            <InfoRow label="Date de début" value={formatDate(convention.date_debut)} />
                            <InfoRow label="Date de fin" value={formatDate(convention.date_fin)} />
                            <InfoRow label="Date de signature" value={formatDate(convention.date_signature)} />
                            <InfoRow label="Créée par" value={convention.creee_par?.name} />
                            <InfoRow label="Soumise par" value={convention.soumise_par?.name} />
                            <InfoRow label="Décidée par" value={convention.decidee_par?.name} />
                        </div>
                        {convention.description && (
                            <>
                                <div className="divider" />
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">Description</span>
                                    <p className="text-sm text-slate-300 leading-relaxed">{convention.description}</p>
                                </div>
                            </>
                        )}
                        {convention.motif_rejet && (
                            <>
                                <div className="divider" />
                                <div className="p-4 bg-red-950/30 border border-red-800/30 rounded-xl">
                                    <span className="text-xs font-semibold text-red-400 block mb-1">Motif du rejet</span>
                                    <p className="text-sm text-slate-300">{convention.motif_rejet}</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Document PDF */}
                    {convention.document_pdf && (
                        <div className="card-glass p-5">
                            <h3 className="text-sm font-semibold text-white mb-3">Document de convention</h3>
                            <a href={`/storage/${convention.document_pdf}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                                <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                                    <FileText size={18} className="text-red-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-200">Texte de la convention (PDF)</p>
                                    <p className="text-xs text-slate-500">Cliquer pour ouvrir</p>
                                </div>
                            </a>
                        </div>
                    )}

                    {/* Activités */}
                    <div className="card-glass p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Activity size={15} className="text-slate-500" />
                                <h3 className="text-sm font-semibold text-white">Activités ({convention.activites?.length ?? 0})</h3>
                            </div>
                            {['approuvee', 'signee'].includes(convention.statut) && userRole !== 'recteur' && (
                                <Link
                                    href={route('activites.create', { convention_id: convention.id })}
                                    className="btn-secondary text-xs py-1 px-3"
                                >
                                    <Plus size={12} /> Nouvelle activité
                                </Link>
                            )}
                        </div>
                        {convention.activites?.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">Aucune activité enregistrée.</p>
                        ) : (
                            <div className="space-y-2">
                                {convention.activites?.map(a => (
                                    <Link key={a.id} href={route('activites.show', a.id)} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-200 group-hover:text-white">{a.titre}</p>
                                            <p className="text-xs text-slate-500">{a.type} · {new Date(a.date_debut).toLocaleDateString('fr-FR')}</p>
                                        </div>
                                        <span className={`badge ${a.statut === 'realisee' ? 'badge-green' : a.statut === 'planifiee' ? 'badge-blue' : 'badge-gray'}`}>
                                            {a.statut}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Mobilités */}
                    <div className="card-glass p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Plane size={15} className="text-slate-500" />
                                <h3 className="text-sm font-semibold text-white">Mobilités ({convention.mobilites?.length ?? 0})</h3>
                            </div>
                            {['approuvee', 'signee'].includes(convention.statut) && userRole !== 'recteur' && (
                                <Link
                                    href={route('mobilites.create', { convention_id: convention.id })}
                                    className="btn-secondary text-xs py-1 px-3"
                                >
                                    <Plus size={12} /> Nouvelle mobilité
                                </Link>
                            )}
                        </div>
                        {convention.mobilites?.length === 0 ? (
                            <p className="text-sm text-slate-500 text-center py-4">Aucune mobilité enregistrée.</p>
                        ) : (
                            <div className="space-y-2">
                                {convention.mobilites?.map(m => (
                                    <Link key={m.id} href={route('mobilites.show', m.id)} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-200 group-hover:text-white">{m.nom_beneficiaire}</p>
                                            <p className="text-xs text-slate-500">{m.type_mobilite} · {m.pays_destination}</p>
                                        </div>
                                        <span className="font-mono text-xs text-srec-400">{m.reference}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    {/* Tampon de Signature Numérique */}
                    {convention.signature_token && (
                        <div className="card-glass p-5 border border-emerald-500/30 bg-emerald-950/20">
                            <div className="flex items-center gap-2 mb-4">
                                <ShieldCheck size={16} className="text-emerald-400" />
                                <h3 className="text-sm font-semibold text-emerald-300">Signature électronique</h3>
                            </div>
                            {/* Tampon visuel */}
                            <div className="flex justify-center mb-4">
                                <div className="relative w-40 h-40">
                                    {/* Cercle extérieur */}
                                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/60 flex items-center justify-center">
                                        <div className="absolute inset-2 rounded-full border-2 border-emerald-500/30" />
                                        <div className="text-center z-10 px-4">
                                            <CheckCircle2 size={22} className="text-emerald-400 mx-auto mb-1" />
                                            <p className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest leading-tight">CERTIFIÉ</p>
                                            <p className="text-[8px] text-emerald-500 leading-tight">SREC — UGANC</p>
                                        </div>
                                    </div>
                                    {/* Étoile décorative */}
                                    {[...Array(8)].map((_,i) => (
                                        <div key={i}
                                            className="absolute w-1.5 h-1.5 bg-emerald-500/50 rounded-full"
                                            style={{
                                                top: `${50 - 46 * Math.cos((i * 45 * Math.PI) / 180)}%`,
                                                left: `${50 + 46 * Math.sin((i * 45 * Math.PI) / 180)}%`,
                                                transform: 'translate(-50%,-50%)'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Signé le</span>
                                    <span className="text-emerald-300 font-medium">
                                        {convention.date_signature_electronique
                                            ? new Date(convention.date_signature_electronique).toLocaleString('fr-FR')
                                            : '—'}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-slate-500">Token de vérification</span>
                                    <span className="font-mono text-[9px] text-emerald-600 break-all bg-white/5 p-2 rounded">
                                        {convention.signature_token?.substring(0, 32)}...
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="card-glass p-5">
                        <h3 className="text-sm font-semibold text-white mb-4">Statut actuel</h3>
                        <StatusBadge color={STATUT_COLORS[convention.statut]} label={convention.statut_label} />
                    </div>
                    <div className="card-glass p-5">
                        <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                            <span>Historique</span>
                        </h3>
                        <Timeline items={historique} />
                    </div>
                </div>
            </div>

            <ActionModal open={!!modal} onClose={() => setModal(null)} transition={modal} conventionId={convention.id} />
        </AppLayout>
    );
}
