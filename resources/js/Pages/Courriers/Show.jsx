import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, usePage, router } from '@inertiajs/react';
import { StatusBadge, Timeline, Modal } from '@/Components/Ui';
import { useState, useEffect } from 'react';
import {
    ArrowLeft, Edit2, Archive, CheckCircle2, XCircle,
    SendHorizonal, FileText, Paperclip, Clock, Calendar,
    Handshake, Building, UserCheck, AlertCircle, Mail
} from 'lucide-react';

const STATUT_COLORS = {
    soumis_directrice: 'yellow',
    examine_directrice: 'orange',
    rdv_planifie:      'orange',
    entretien_realise: 'purple',
    soumis_recteur:    'yellow',
    valide:            'green',
    rejete:            'red',
    archive:           'gray',
};

// Labels lisibles pour chaque statut
const STATUT_LABELS = {
    soumis_directrice: 'En attente — Directrice',
    examine_directrice: 'Pris en charge',
    rdv_planifie:      'RDV planifié',
    entretien_realise: 'Entretien réalisé',
    soumis_recteur:    'En attente — Recteur',
    valide:            'Validé',
    rejete:            'Rejeté',
    archive:           'Archivé',
};

// Machine à états dynamique selon le sens et le type du courrier
const getTransitions = (courrier, dernier_rdv) => {
    const isSortant      = courrier.sens === 'sortant';
    const isPartenariat  = courrier.type === 'demande_partenariat';
    const isRdvRealise = dernier_rdv?.statut === 'realise';
    
    const rdvTransitions = isRdvRealise 
        ? [{ to: 'entretien_realise', label: 'Soumettre le rapport du RDV', color: 'purple', icon: FileText, roles: ['directrice'], action: 'rapport' }]
        : [{ to: 'rdv_planifie', label: 'Marquer le RDV comme réalisé', color: 'primary', icon: CheckCircle2, roles: ['directrice'], action: 'marquer_rdv_realise' }];

    // Courrier SORTANT : workflow simplifié (Directrice prend connaissance, Recteur n'intervient pas)
    if (isSortant) {
        return {
            soumis_directrice:  [{ to: 'examine_directrice', label: 'Prendre connaissance', color: 'orange', icon: UserCheck, roles: ['directrice'] }],
            examine_directrice: [],
        };
    }

    // Courrier ENTRANT — DEMANDE DE PARTENARIAT : workflow complet avec RDV
    if (isPartenariat) {
        return {
            soumis_directrice:  [{ to: 'examine_directrice', label: 'Prendre en charge', color: 'orange', icon: UserCheck, roles: ['directrice'] }],
            examine_directrice: [{ to: 'rdv_planifie', label: 'Planifier un Rendez-vous', color: 'primary', icon: Calendar, roles: ['directrice'], action: 'rdv' }],
            rdv_planifie:       rdvTransitions,
            entretien_realise:  [{ to: 'soumis_recteur', label: 'Soumettre au Recteur', color: 'warning', icon: SendHorizonal, roles: ['directrice'] }],
            soumis_recteur:     [], // Géré par le bloc personnalisé du Recteur
        };
    }

    // Courrier ENTRANT — DEMANDE DE CONVENTION : lecture obligatoire, sans RDV
    if (courrier.type === 'demande_convention') {
        return {
            soumis_directrice:  [{ to: 'examine_directrice', label: 'Prendre en charge', color: 'orange', icon: UserCheck, roles: ['directrice'] }],
            examine_directrice: [], // Géré par le bloc personnalisé Directrice
            soumis_recteur:     [], // Géré par le bloc personnalisé du Recteur
        };
    }

    // Courrier ENTRANT — RENDEZ-VOUS : workflow direct (pas de recteur, RDV dès la prise en charge)
    if (courrier.type === 'rendez_vous') {
        return {
            soumis_directrice:  [{ to: 'examine_directrice', label: 'Prendre en charge', color: 'orange', icon: UserCheck, roles: ['directrice'] }],
            examine_directrice: [{ to: 'rdv_planifie', label: 'Planifier le Rendez-vous', color: 'primary', icon: Calendar, roles: ['directrice'], action: 'rdv' }],
            rdv_planifie:       rdvTransitions,
            entretien_realise:  [{ to: 'valide', label: 'Clôturer le dossier', color: 'success', icon: CheckCircle2, roles: ['directrice'] }],
        };
    }

    // Courrier ENTRANT — INVITATION : Workflow rapide
    if (courrier.type === 'invitation') {
        return {
            soumis_directrice:  [{ to: 'examine_directrice', label: 'Prendre en charge', color: 'orange', icon: UserCheck, roles: ['directrice'] }],
            examine_directrice: [{ to: 'soumis_recteur', label: 'Accepter à mon niveau', color: 'success', icon: SendHorizonal, roles: ['directrice'] }],
            soumis_recteur:     [], // Géré par le bloc personnalisé du Recteur
        };
    }

    // Courrier ENTRANT — AUTRE TYPE (ex: information) : pas de RDV, directrice soumet directement au Recteur
    return {
        soumis_directrice:  [{ to: 'examine_directrice', label: 'Prendre en charge', color: 'orange', icon: UserCheck, roles: ['directrice'] }],
        examine_directrice: [{ to: 'soumis_recteur', label: 'Soumettre au Recteur', color: 'warning', icon: SendHorizonal, roles: ['directrice'] }],
        soumis_recteur:     [], // Géré par le bloc personnalisé du Recteur
    };
};

function TransitionModal({ open, onClose, transition, courrierId }) {
    const { data, setData, post, processing, reset } = useForm({
        statut: transition?.to ?? '',
        commentaire: '',
    });

    useEffect(() => {
        if (transition) setData({ statut: transition.to, commentaire: '' });
    }, [transition]);

    const handleSubmit = () => {
        post(route('courriers.statut', courrierId), {
            onSuccess: () => { reset(); onClose(); }
        });
    };

    const isRejet = transition?.to === 'rejete';

    return (
        <Modal open={open} onClose={onClose} title={`Action : ${transition?.label}`}>
            <div className="space-y-4">
                {isRejet && (
                    <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-red-300">Ce courrier sera <strong>archivé automatiquement</strong> avec la mention "Rejeté".</p>
                    </div>
                )}
                <div className="form-group">
                    <label className="label">Commentaire {isRejet ? <span className="text-red-400">*</span> : '(optionnel)'}</label>
                    <textarea
                        className="input resize-none" rows={3}
                        placeholder={isRejet ? 'Motif du rejet...' : 'Ajouter une note...'}
                        value={data.commentaire}
                        onChange={e => setData('commentaire', e.target.value)}
                    />
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="btn-secondary">Annuler</button>
                    <button
                        onClick={handleSubmit}
                        disabled={processing || (isRejet && !data.commentaire.trim())}
                        className={isRejet ? 'btn-danger' : 'btn-primary'}
                    >
                        <SendHorizonal size={14} /> Confirmer
                    </button>
                </div>
            </div>
        </Modal>
    );
}

function RapportViewModal({ open, onClose, rapport, rdv, onFileClick }) {
    if (!open || !rapport) return null;

    const DECISION_LABELS = {
        favorable: { label: '✅ Favorable', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
        defavorable: { label: '❌ Défavorable', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
        en_attente: { label: '⏳ En attente', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
    };
    const dec = DECISION_LABELS[rapport.decision_recommandee] ?? DECISION_LABELS['en_attente'];
    const isPdf = rapport.fichier && rapport.fichier.toLowerCase().endsWith('.pdf');

    return (
        <Modal open={open} onClose={onClose} title="Rapport de Rendez-vous" size={isPdf ? 'xl' : 'md'}>
            <div className={isPdf ? "grid lg:grid-cols-2 gap-6" : "space-y-5"}>
                {/* Colonne détails */}
                <div className="space-y-5">
                    {/* Décision */}
                    <div className={`flex items-center gap-3 p-3 rounded-xl border ${dec.color}`}>
                        <span className={`text-sm font-semibold ${dec.color.split(' ')[0]}`}>
                            Décision recommandée : {dec.label}
                        </span>
                    </div>

                    {/* Compte rendu */}
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Compte rendu</p>
                        <div className="p-4 bg-white/5 rounded-xl text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                            {rapport.compte_rendu}
                        </div>
                    </div>

                    {/* Observations */}
                    {rapport.observations && (
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Observations complémentaires</p>
                            <div className="p-4 bg-white/5 rounded-xl text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                                {rapport.observations}
                            </div>
                        </div>
                    )}

                    {/* Fichier non-pdf fallback */}
                    {!isPdf && rapport.fichier && (
                        <a href={`/storage/${rapport.fichier}`} target="_blank" rel="noopener noreferrer"
                            onClick={() => onFileClick && onFileClick()}
                            className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                            <div className="w-9 h-9 bg-red-600/20 rounded-lg flex items-center justify-center">
                                <FileText size={16} className="text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-200">Document joint</p>
                                <p className="text-xs text-slate-500">Cliquer pour télécharger/ouvrir</p>
                            </div>
                        </a>
                    )}
                </div>

                {/* Colonne PDF */}
                {isPdf && (
                    <div className="flex flex-col h-[500px] border border-white/10 rounded-xl overflow-hidden bg-white/5">
                        <div className="bg-srec-800/50 p-2 border-b border-white/10 flex items-center gap-2">
                            <FileText size={14} className="text-red-400" />
                            <span className="text-xs font-semibold text-white">Aperçu du document PDF</span>
                        </div>
                        <iframe
                            src={`/storage/${rapport.fichier}`}
                            className="w-full flex-1"
                            title="Rapport PDF"
                            onLoad={() => onFileClick && onFileClick()}
                        />
                    </div>
                )}
            </div>

            <div className="flex justify-end mt-6">
                <button onClick={onClose} className="btn-secondary">Fermer</button>
            </div>
        </Modal>
    );
}

function CreateRdvModal({ open, onClose, courrier }) {
    const TYPE_RDV_OPTIONS = [
        { value: 'en_presentiel', label: '🏢 En présentiel' },
        { value: 'en_video',      label: '📹 En vidéo' },
        { value: 'en_ligne',      label: '💻 En ligne' },
        { value: 'par_telephone', label: '📞 Par téléphone' },
        { value: 'autre',         label: '🔹 Autre' },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        courrier_id:   courrier.id,
        date_heure:    '',
        type_rdv:      'en_presentiel',
        lieu:          '',
        ordre_du_jour: '',
        notes:         '',
    });

    useEffect(() => {
        if (open) setData('courrier_id', courrier.id);
    }, [open]);

    const submit = e => {
        e.preventDefault();
        post(route('rendez-vous.store'), {
            onSuccess: () => {
                reset();
                onClose();
                router.post(
                    route('courriers.statut', courrier.id),
                    { statut: 'rdv_planifie', commentaire: 'Rendez-vous planifié par la Directrice' },
                    { preserveScroll: true }
                );
            }
        });
    };

    return (
        <Modal open={open} onClose={onClose} title="Planifier un Rendez-vous">
            <form onSubmit={submit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                        <label className="label">Date &amp; Heure <span className="text-red-400">*</span></label>
                        <input type="datetime-local" className="input" value={data.date_heure}
                            onChange={e => setData('date_heure', e.target.value)} required />
                        {errors.date_heure && <p className="text-xs text-red-400 mt-1">{errors.date_heure}</p>}
                    </div>
                    <div className="form-group">
                        <label className="label">Type de RDV <span className="text-red-400">*</span></label>
                        <select className="input" value={data.type_rdv}
                            onChange={e => setData('type_rdv', e.target.value)} required>
                            {TYPE_RDV_OPTIONS.map(o => (
                                <option key={o.value} value={o.value}>{o.label}</option>
                            ))}
                        </select>
                        {errors.type_rdv && <p className="text-xs text-red-400 mt-1">{errors.type_rdv}</p>}
                    </div>
                </div>
                <div className="form-group">
                    <label className="label">Lieu</label>
                    <input type="text" className="input" placeholder="Ex: Salle SREC, Zoom..." value={data.lieu}
                        onChange={e => setData('lieu', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="label">Ordre du jour</label>
                    <textarea className="input resize-none" rows={2} value={data.ordre_du_jour}
                        onChange={e => setData('ordre_du_jour', e.target.value)} />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Planification...' : 'Planifier & Notifier le Secrétariat'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

function CreateRapportModal({ open, onClose, courrier }) {
    const dernierRdv = courrier.rendez_vous?.[courrier.rendez_vous.length - 1];

    const { data, setData, post, processing, errors, reset } = useForm({
        compte_rendu:         '',
        decision_recommandee: 'favorable',
        observations:         '',
        fichier:              null,
    });

    const submit = e => {
        e.preventDefault();
        if (!dernierRdv) { alert('Aucun rendez-vous trouvé.'); return; }
        post(route('rendez-vous.rapport', dernierRdv.id), {
            onSuccess: () => { reset(); onClose(); }
        });
    };

    return (
        <Modal open={open} onClose={onClose} title="Soumettre le Rapport de Rendez-vous">
            <form onSubmit={submit} className="space-y-4">
                <div className="form-group">
                    <label className="label">Compte rendu <span className="text-red-400">*</span></label>
                    <textarea className="input resize-none" rows={4} value={data.compte_rendu}
                        onChange={e => setData('compte_rendu', e.target.value)} required />
                    {errors.compte_rendu && <p className="text-xs text-red-400 mt-1">{errors.compte_rendu}</p>}
                </div>
                <div className="form-group">
                    <label className="label">Décision recommandée <span className="text-red-400">*</span></label>
                    <select className="input" value={data.decision_recommandee}
                        onChange={e => setData('decision_recommandee', e.target.value)} required>
                        <option value="favorable">Favorable</option>
                        <option value="defavorable">Défavorable</option>
                        <option value="en_attente">En attente / À revoir</option>
                    </select>
                </div>
                <div className="form-group">
                    <label className="label">Observations (Optionnel)</label>
                    <textarea className="input resize-none" rows={2} value={data.observations}
                        onChange={e => setData('observations', e.target.value)} />
                </div>
                <div className="form-group">
                    <label className="label">Fichier (PDF, DOC) <span className="text-red-400">*</span></label>
                    <input type="file" className="input file-input" accept=".pdf,.doc,.docx"
                        onChange={e => setData('fichier', e.target.files[0])} required />
                    {errors.fichier && <p className="text-xs text-red-400 mt-1">{errors.fichier}</p>}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
                    <button type="submit" disabled={processing} className="btn-primary">
                        {processing ? 'Soumission...' : 'Soumettre le rapport'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

export default function Show({ courrier, historique, partenaire_potentiel, dernier_rdv }) {
    const { auth } = usePage().props;
    const userRole = auth?.user?.roles?.[0]?.name ?? '';

    const [modal, setModal] = useState(null);
    const [rdvModalOpen, setRdvModalOpen] = useState(false);
    const [rapportModalOpen, setRapportModalOpen] = useState(false);
    const [rapportViewOpen, setRapportViewOpen] = useState(false);
    const [rapportLu, setRapportLu] = useState(false);
    const [documentLu, setDocumentLu] = useState(false);
    const { post: postArchive, processing: archiving } = useForm();

    // Transitions disponibles pour le statut actuel, filtrées par rôle et selon type/sens du courrier
    const TRANSITIONS = getTransitions(courrier, dernier_rdv);
    const currentTransitions = (TRANSITIONS[courrier.statut] ?? []).filter(t => t.roles.includes(userRole));
    const hasRapport = !!(dernier_rdv?.rapport);
    const isSortant = courrier.sens === 'sortant';

    const genererBrouillon = (partenaireId) => {
        router.post(route('conventions.brouillon', courrier.id), { partenaire_id: partenaireId });
    };

    const handleMarquerRdvRealise = () => {
        if (!dernier_rdv) return;
        if (confirm('Confirmer que le rendez-vous a bien eu lieu ? Vous pourrez ensuite rédiger le rapport.')) {
            router.put(route('rendez-vous.update', dernier_rdv.id), {
                date_heure: dernier_rdv.date_heure,
                lieu: dernier_rdv.lieu,
                ordre_du_jour: dernier_rdv.ordre_du_jour,
                notes: dernier_rdv.notes,
                statut: 'realise',
            }, { preserveScroll: true });
        }
    };

    const handleArchiver = () => {
        if (confirm('Archiver ce courrier ?')) {
            postArchive(route('courriers.archiver', courrier.id));
        }
    };

    const getBtnClass = (color) => {
        const map = {
            success: 'btn-success',
            danger:  'btn-danger',
            warning: 'btn-warning',
            primary: 'btn-primary',
            orange:  'btn-primary',
            purple:  'btn-secondary',
        };
        return map[color] ?? 'btn-primary';
    };

    const InfoRow = ({ label, value }) => (
        <div className="flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider">{label}</span>
            <span className="text-sm text-slate-200">{value || '—'}</span>
        </div>
    );

    const isRejete = courrier.statut === 'rejete';

    return (
        <AppLayout title={`Courrier ${courrier.numero}`}>
            <Head title={`Courrier ${courrier.numero}`} />

            {/* Header */}
            <div className="mb-6">
                <Link href={route('courriers.index')} className="btn-ghost mb-3 -ml-1">
                    <ArrowLeft size={15} /> Retour aux courriers
                </Link>
                <div className="flex flex-wrap items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-srec-400 font-bold text-sm">{courrier.numero}</span>
                            <StatusBadge
                                color={STATUT_COLORS[courrier.statut]}
                                label={STATUT_LABELS[courrier.statut] ?? courrier.statut_label ?? courrier.statut}
                            />
                            {isRejete && (
                                <span className="badge badge-red flex items-center gap-1">
                                    <XCircle size={11} /> Rejeté & Archivé
                                </span>
                            )}
                            {courrier.archive && !isRejete && (
                                <span className="badge badge-gray">Archivé</span>
                            )}
                        </div>
                        <h2 className="page-title">{courrier.objet}</h2>
                    </div>

                    {/* ═══ ZONE D'ACTIONS — workflow linéaire strict ═══ */}
                    {!courrier.archive && (
                        <div className="flex flex-wrap gap-2">

                            {/* Étape 1 → 4 : boutons pour Directrice (un seul à la fois) */}
                            {currentTransitions.map(t => {
                                const Icon = t.icon;
                                return (
                                    <button
                                        key={t.to}
                                        onClick={() => {
                                            if (t.action === 'rdv')          setRdvModalOpen(true);
                                            else if (t.action === 'rapport') setRapportModalOpen(true);
                                            else if (t.action === 'marquer_rdv_realise') handleMarquerRdvRealise();
                                            else                             setModal(t);
                                        }}
                                        className={getBtnClass(t.color)}
                                    >
                                        <Icon size={14} /> {t.label}
                                    </button>
                                );
                            })}

                            {/* Bloc personnalisé Directrice (pour demande_convention) */}
                            {courrier.type === 'demande_convention' && courrier.statut === 'examine_directrice' && ['directrice', 'admin'].includes(userRole) && (
                                <>
                                    {!documentLu ? (
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => {
                                                    setDocumentLu(true);
                                                    if (courrier.piece_jointe) window.open(`/storage/${courrier.piece_jointe}`, '_blank');
                                                }} 
                                                className="btn-warning animate-pulse"
                                            >
                                                <FileText size={14} /> 👁️ Consulter le projet de convention
                                            </button>
                                            <span className="text-[11px] text-amber-400/80 italic">Lecture obligatoire avant soumission</span>
                                        </div>
                                    ) : (
                                        <>
                                            <button 
                                                onClick={() => {
                                                    if (courrier.piece_jointe) window.open(`/storage/${courrier.piece_jointe}`, '_blank');
                                                }} 
                                                className="btn-ghost text-xs"
                                            >
                                                <FileText size={13} /> Relire le projet
                                            </button>
                                            <button
                                                onClick={() => setModal({ to: 'soumis_recteur', label: 'Soumettre au Recteur', icon: SendHorizonal, color: 'warning' })}
                                                className="btn-warning"
                                            >
                                                <SendHorizonal size={14} /> Soumettre au Recteur
                                            </button>
                                        </>
                                    )}
                                </>
                            )}

                            {/* Recteur — valider/rejeter (UNIQUEMENT si entrant, jamais si sortant) */}
                            {courrier.statut === 'soumis_recteur' && !isSortant && ['recteur', 'admin'].includes(userRole) && (
                                <>
                                    {courrier.type === 'demande_partenariat' && hasRapport && !rapportLu && (
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => setRapportViewOpen(true)} className="btn-warning animate-pulse">
                                                <FileText size={14} /> 📋 Lire le rapport du RDV
                                            </button>
                                            <span className="text-[11px] text-amber-400/80 italic">Lecture obligatoire avant décision</span>
                                        </div>
                                    )}
                                    {courrier.type === 'demande_convention' && !documentLu && (
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => {
                                                    setDocumentLu(true);
                                                    if (courrier.piece_jointe) window.open(`/storage/${courrier.piece_jointe}`, '_blank');
                                                }} 
                                                className="btn-warning animate-pulse"
                                            >
                                                <FileText size={14} /> 👁️ Lire la convention
                                            </button>
                                            <span className="text-[11px] text-amber-400/80 italic">Lecture obligatoire avant décision</span>
                                        </div>
                                    )}
                                    {((courrier.type === 'demande_partenariat' && hasRapport && rapportLu) || 
                                      (courrier.type === 'demande_convention' && documentLu) || 
                                      (!['demande_partenariat', 'demande_convention'].includes(courrier.type))) && (
                                        <>
                                            {courrier.type === 'demande_partenariat' && hasRapport && (
                                                <button onClick={() => setRapportViewOpen(true)} className="btn-ghost text-xs">
                                                    <FileText size={13} /> Relire le rapport
                                                </button>
                                            )}
                                            {courrier.type === 'demande_convention' && (
                                                <button 
                                                    onClick={() => {
                                                        if (courrier.piece_jointe) window.open(`/storage/${courrier.piece_jointe}`, '_blank');
                                                    }} 
                                                    className="btn-ghost text-xs"
                                                >
                                                    <FileText size={13} /> Relire la convention
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setModal({ to: 'valide', label: 'Valider le dossier', icon: CheckCircle2, color: 'success' })}
                                                className="btn-success"
                                            >
                                                <CheckCircle2 size={14} /> Valider
                                            </button>
                                            <button
                                                onClick={() => setModal({ to: 'rejete', label: 'Rejeter le dossier', icon: XCircle, color: 'danger' })}
                                                className="btn-danger"
                                            >
                                                <XCircle size={14} /> Rejeter
                                            </button>
                                        </>
                                    )}

                                </>
                            )}

                            {/* Secrétariat — modifier uniquement */}
                            {userRole === 'secretariat' && ['soumis_directrice'].includes(courrier.statut) && (
                                <Link href={route('courriers.edit', courrier.id)} className="btn-secondary">
                                    <Edit2 size={14} /> Modifier
                                </Link>
                            )}

                            {/* Archivage manuel après validation */}
                            {courrier.statut === 'valide' && ['directrice', 'admin'].includes(userRole) && (
                                <button onClick={handleArchiver} disabled={archiving} className="btn-ghost">
                                    <Archive size={14} /> Archiver
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Carte convocation Secrétariat */}
                {userRole === 'secretariat' && courrier.statut === 'rdv_planifie' && dernier_rdv && (
                    <div className="mt-5 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-wrap items-start gap-4">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-amber-300 flex items-center gap-2 mb-1">
                                <Calendar size={15} /> Action requise — Convocation à envoyer
                            </p>
                            <p className="text-xs text-slate-300 leading-relaxed">
                                La Directrice a planifié un rendez-vous
                                {dernier_rdv.date_heure && (
                                    <> le <strong className="text-white">
                                        {new Date(dernier_rdv.date_heure).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' })}
                                    </strong></>
                                )}
                                {dernier_rdv.lieu && <> au <strong className="text-white">{dernier_rdv.lieu}</strong></>}.
                                Une convocation formelle doit être envoyée au partenaire.
                            </p>
                        </div>
                        <Link
                            href={route('courriers.convocation', dernier_rdv.id)}
                            className="btn-primary flex-shrink-0"
                        >
                            <Mail size={14} /> Créer la convocation
                        </Link>
                    </div>
                )}

                {/* Transformation intelligente (post-validation) */}
                {!courrier.archive && courrier.statut === 'valide' && ['directrice', 'recteur', 'admin'].includes(userRole) && (
                    <div className="mt-5 p-4 bg-srec-900/50 border border-srec-500/20 rounded-2xl">
                        <h3 className="text-sm font-semibold text-white mb-3">Suite à donner (Validation Recteur)</h3>
                        {courrier.conventions?.length > 0 ? (
                            <p className="text-sm text-green-400 flex items-center gap-2">
                                <CheckCircle2 size={16} /> Convention déjà générée.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {courrier.partenaires?.length > 0 ? (
                                    <button onClick={() => genererBrouillon(courrier.partenaires[0].id)} className="btn-success self-start">
                                        <Handshake size={14} /> Générer le brouillon de Convention
                                    </button>
                                ) : partenaire_potentiel ? (
                                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                        <p className="text-sm text-blue-300 mb-2">
                                            Partenaire existant détecté : <strong>{partenaire_potentiel.nom}</strong>
                                        </p>
                                        <div className="flex gap-2">
                                            <button onClick={() => genererBrouillon(partenaire_potentiel.id)} className="btn-primary">
                                                <Handshake size={14} /> Générer Convention
                                            </button>
                                            <Link href={`${route('partenaires.create')}?source_courrier_id=${courrier.id}&nom_predefini=${encodeURIComponent(courrier.expediteur)}`} className="btn-secondary">
                                                Créer un nouveau partenaire
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <Link href={`${route('partenaires.create')}?source_courrier_id=${courrier.id}&nom_predefini=${encodeURIComponent(courrier.expediteur)}`} className="btn-success self-start">
                                        <Building size={14} /> Créer le profil Partenaire
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Fiche principale */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="card-glass p-6">
                        <h3 className="text-sm font-semibold text-white mb-5">Informations du courrier</h3>
                        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
                            <InfoRow label="Sens" value={courrier.sens === 'entrant' ? '↓ Entrant' : '↑ Sortant'} />
                            <InfoRow label="Type" value={courrier.type?.replace(/_/g, ' ')} />
                            <InfoRow label="Date du courrier" value={new Date(courrier.date_courrier).toLocaleDateString('fr-FR')} />
                            <InfoRow label="Date d'enregistrement" value={new Date(courrier.created_at).toLocaleDateString('fr-FR')} />
                            <InfoRow label="Expéditeur" value={courrier.expediteur} />
                            <InfoRow label="Destinataire" value={courrier.destinataire} />
                            <InfoRow label="Soumis par" value={courrier.soumis_par_user?.name} />
                            <InfoRow label="Pris en charge par" value={courrier.pris_en_charge_par_user?.name} />
                        </div>
                        {courrier.observations && (
                            <>
                                <div className="divider" />
                                <div>
                                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-2">Observations</span>
                                    <p className="text-sm text-slate-300 leading-relaxed">{courrier.observations}</p>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Pièce jointe */}
                    {courrier.piece_jointe && (
                        <div className="card-glass p-5">
                            <h3 className="text-sm font-semibold text-white mb-3">Pièce jointe</h3>
                            <a href={`/storage/${courrier.piece_jointe}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                                <div className="w-10 h-10 bg-red-600/20 rounded-lg flex items-center justify-center">
                                    <FileText size={18} className="text-red-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-200">Document PDF</p>
                                    <p className="text-xs text-slate-500">Cliquer pour ouvrir</p>
                                </div>
                                <Paperclip size={14} className="text-slate-600 group-hover:text-srec-400 ml-auto transition-colors" />
                            </a>
                        </div>
                    )}

                    {/* Partenaires liés */}
                    {courrier.partenaires?.length > 0 && (
                        <div className="card-glass p-5">
                            <h3 className="text-sm font-semibold text-white mb-3">Partenaires liés</h3>
                            <div className="space-y-2">
                                {courrier.partenaires.map(p => (
                                    <Link key={p.id} href={route('partenaires.show', p.id)}
                                        className="flex items-center gap-3 p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                                        <span className="badge badge-blue">{p.nature}</span>
                                        <span className="text-sm text-slate-200">{p.nom}</span>
                                        <span className="text-xs text-slate-500 ml-auto">{p.pays}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Statut */}
                    <div className="card-glass p-5">
                        <h3 className="text-sm font-semibold text-white mb-4">Statut actuel</h3>
                        <StatusBadge
                            color={STATUT_COLORS[courrier.statut]}
                            label={STATUT_LABELS[courrier.statut] ?? courrier.statut_label ?? courrier.statut}
                        />
                        {courrier.archive && (
                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                <Archive size={13} />
                                Archivé le {new Date(courrier.date_archivage).toLocaleDateString('fr-FR')}
                            </div>
                        )}
                    </div>

                    {/* RDV résumé */}
                    {dernier_rdv && (
                        <div className="card-glass p-5">
                            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                <Calendar size={14} className="text-srec-400" /> Rendez-vous
                            </h3>
                            <div className="space-y-2 text-xs text-slate-300">
                                <p><span className="text-slate-500">Date : </span>
                                    {new Date(dernier_rdv.date_heure).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                                </p>
                                {dernier_rdv.lieu && <p><span className="text-slate-500">Lieu : </span>{dernier_rdv.lieu}</p>}
                                {dernier_rdv.ordre_du_jour && <p><span className="text-slate-500">ODJ : </span>{dernier_rdv.ordre_du_jour}</p>}
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div className="card-glass p-5">
                        <div className="flex items-center gap-2 mb-4">
                            <Clock size={15} className="text-slate-500" />
                            <h3 className="text-sm font-semibold text-white">Historique</h3>
                        </div>
                        <Timeline items={historique} />
                    </div>
                </div>
            </div>

            {/* Modals */}
            <TransitionModal
                open={!!modal}
                onClose={() => setModal(null)}
                transition={modal}
                courrierId={courrier.id}
            />
            <CreateRdvModal
                open={rdvModalOpen}
                onClose={() => setRdvModalOpen(false)}
                courrier={courrier}
            />
            <CreateRapportModal
                open={rapportModalOpen}
                onClose={() => setRapportModalOpen(false)}
                courrier={courrier}
            />
            <RapportViewModal
                open={rapportViewOpen}
                onClose={() => setRapportViewOpen(false)}
                rapport={dernier_rdv?.rapport}
                rdv={dernier_rdv}
                onFileClick={() => setRapportLu(true)}
            />
        </AppLayout>
    );
}
