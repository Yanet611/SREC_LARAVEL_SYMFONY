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
    en_cours:          'orange',
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
    en_cours:          'Pris en charge',
    rdv_planifie:      'RDV planifié',
    entretien_realise: 'Entretien réalisé',
    soumis_recteur:    'En attente — Recteur',
    valide:            'Validé',
    rejete:            'Rejeté',
    archive:           'Archivé',
};

// Machine à états : chaque statut n'expose qu'une seule action à la fois
const TRANSITIONS = {
    soumis_directrice: [
        { to: 'en_cours', label: 'Prendre en charge', color: 'orange', icon: UserCheck, roles: ['directrice', 'admin'] },
    ],
    en_cours: [
        { to: 'rdv_planifie', label: 'Planifier un Rendez-vous', color: 'primary', icon: Calendar, roles: ['directrice', 'admin'], action: 'rdv' },
    ],
    rdv_planifie: [
        { to: 'entretien_realise', label: 'Soumettre le rapport du RDV', color: 'purple', icon: FileText, roles: ['directrice', 'admin'], action: 'rapport' },
    ],
    entretien_realise: [
        { to: 'soumis_recteur', label: 'Soumettre au Recteur', color: 'warning', icon: SendHorizonal, roles: ['directrice', 'admin'] },
    ],
    soumis_recteur: [
        { to: 'valide',  label: 'Valider',  color: 'success', icon: CheckCircle2, roles: ['recteur', 'admin'] },
        { to: 'rejete',  label: 'Rejeter',  color: 'danger',  icon: XCircle,      roles: ['recteur', 'admin'] },
    ],
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

function CreateRdvModal({ open, onClose, courrier }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        courrier_id:   courrier.id,
        date_heure:    '',
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
                        <label className="label">Date & Heure <span className="text-red-400">*</span></label>
                        <input type="datetime-local" className="input" value={data.date_heure}
                            onChange={e => setData('date_heure', e.target.value)} required />
                        {errors.date_heure && <p className="text-xs text-red-400 mt-1">{errors.date_heure}</p>}
                    </div>
                    <div className="form-group">
                        <label className="label">Lieu</label>
                        <input type="text" className="input" placeholder="Ex: Salle SREC..." value={data.lieu}
                            onChange={e => setData('lieu', e.target.value)} />
                    </div>
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
                    <label className="label">Fichier (PDF, DOC) Optionnel</label>
                    <input type="file" className="input file-input" accept=".pdf,.doc,.docx"
                        onChange={e => setData('fichier', e.target.files[0])} />
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
    const { post: postArchive, processing: archiving } = useForm();

    const currentTransitions = TRANSITIONS[courrier.statut] ?? [];

    const genererBrouillon = (partenaireId) => {
        router.post(route('conventions.brouillon', courrier.id), { partenaire_id: partenaireId });
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

                    {/* Actions */}
                    {!courrier.archive && (
                        <div className="flex flex-wrap gap-2">
                            {currentTransitions.map(t => {
                                if (!t.roles.includes(userRole)) return null;
                                const Icon = t.icon;
                                return (
                                    <button
                                        key={t.to}
                                        onClick={() => {
                                            if (t.action === 'rdv')     setRdvModalOpen(true);
                                            else if (t.action === 'rapport') setRapportModalOpen(true);
                                            else setModal(t);
                                        }}
                                        className={getBtnClass(t.color)}
                                    >
                                        <Icon size={14} /> {t.label}
                                    </button>
                                );
                            })}

                            {/* Bouton Modifier — secrétariat seulement */}
                            {userRole === 'secretariat' && (
                                <Link href={route('courriers.edit', courrier.id)} className="btn-secondary">
                                    <Edit2 size={14} /> Modifier
                                </Link>
                            )}

                            {/* Archivage manuel si validé */}
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
                {!courrier.archive && courrier.statut === 'valide' && userRole === 'directrice' && (
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
        </AppLayout>
    );
}
