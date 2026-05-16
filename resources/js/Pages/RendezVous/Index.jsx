import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { StatusBadge, EmptyState, Pagination } from '@/Components/Ui';
import { useState } from 'react';
import { Calendar, Plus, MapPin, Clock, Search, Filter, X, FileText, CheckCircle, Mail } from 'lucide-react';

const STATUT_COLORS = {
    planifie: 'blue', realise: 'green', annule: 'red',
};
const STATUT_LABELS = {
    planifie: 'Planifié', realise: 'Réalisé', annule: 'Annulé',
};

// Modal simple pour créer un RDV
const CreateModal = ({ isOpen, onClose, courriers }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        courrier_id: '',
        date_heure: '',
        lieu: '',
        ordre_du_jour: '',
        notes: '',
    });

    if (!isOpen) return null;

    const submit = e => {
        e.preventDefault();
        post(route('rendez-vous.store'), {
            onSuccess: () => { reset(); onClose(); }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="card-glass w-full max-w-lg p-6 animate-slide-up">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Calendar size={18} className="text-srec-400" /> Planifier un Rendez-vous
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>
                <form onSubmit={submit} className="space-y-4">
                    <div className="form-group">
                        <label className="label">Courrier associé <span className="text-red-400">*</span></label>
                        <select className="input" value={data.courrier_id} onChange={e => setData('courrier_id', e.target.value)} required>
                            <option value="">Sélectionner un courrier...</option>
                            {courriers.map(c => <option key={c.id} value={c.id}>{c.numero} — {c.objet}</option>)}
                        </select>
                        {errors.courrier_id && <p className="text-xs text-red-400 mt-1">{errors.courrier_id}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="label">Date & Heure <span className="text-red-400">*</span></label>
                            <input type="datetime-local" className="input" value={data.date_heure} onChange={e => setData('date_heure', e.target.value)} required />
                            {errors.date_heure && <p className="text-xs text-red-400 mt-1">{errors.date_heure}</p>}
                        </div>
                        <div className="form-group">
                            <label className="label">Lieu</label>
                            <input type="text" className="input" placeholder="Salle de réunion..." value={data.lieu} onChange={e => setData('lieu', e.target.value)} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="label">Ordre du jour</label>
                        <textarea className="input resize-none" rows={2} value={data.ordre_du_jour} onChange={e => setData('ordre_du_jour', e.target.value)}></textarea>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
                        <button type="submit" disabled={processing} className="btn-primary">
                            {processing ? 'Planification...' : 'Planifier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function Index({ rendezVous, courriers, filtres }) {
    const [statut, setStatut] = useState(filtres.statut ?? '');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const applyFilters = (extra = {}) =>
        router.get(route('rendez-vous.index'), {
            statut: extra.statut ?? statut,
        }, { preserveState: true, replace: true });

    return (
        <AppLayout title="Rendez-vous & Entretiens">
            <Head title="Rendez-vous" />
            
            <div className="page-header">
                <div>
                    <h2 className="page-title">Rendez-vous & Entretiens</h2>
                    <p className="page-subtitle">Gérez les réunions liées aux courriers</p>
                </div>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary">
                    <Plus size={15} /> Planifier un RDV
                </button>
            </div>

            <div className="card-glass p-4 mb-6 flex gap-3">
                <select value={statut} onChange={e => { setStatut(e.target.value); applyFilters({ statut: e.target.value }); }} className="input w-auto min-w-40">
                    <option value="">Tous les statuts</option>
                    <option value="planifie">Planifiés</option>
                    <option value="realise">Réalisés</option>
                    <option value="annule">Annulés</option>
                </select>
                {statut && <button onClick={() => { setStatut(''); applyFilters({ statut: '' }); }} className="btn-ghost"><X size={14} /> Reset</button>}
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
                {rendezVous.data.length === 0 ? (
                    <div className="lg:col-span-2 card-glass p-8">
                        <EmptyState 
                            icon={Calendar} 
                            title="Aucun rendez-vous trouvé" 
                            description="Il n'y a pas de rendez-vous correspondant à vos critères."
                            action={<button onClick={() => setIsModalOpen(true)} className="btn-primary mt-4"><Plus size={14} /> Planifier un RDV</button>}
                        />
                    </div>
                ) : (
                    rendezVous.data.map(rdv => (
                        <div key={rdv.id} className="card-glass p-5 flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${rdv.statut === 'realise' ? 'bg-green-600/10 text-green-400' : 'bg-blue-600/10 text-blue-400'}`}>
                                        {rdv.statut === 'realise' ? <CheckCircle size={20} /> : <Calendar size={20} />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white flex items-center gap-2">
                                            {new Date(rdv.date_heure).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <StatusBadge color={STATUT_COLORS[rdv.statut]} label={STATUT_LABELS[rdv.statut]} />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-2 text-sm text-slate-300 bg-white/5 p-3 rounded-lg">
                                <div className="flex gap-2">
                                    <Mail size={14} className="text-slate-500 mt-0.5 shrink-0" />
                                    <span className="truncate">Courrier: <span className="font-mono text-srec-300">{rdv.courrier?.numero}</span></span>
                                </div>
                                {rdv.lieu && (
                                    <div className="flex gap-2">
                                        <MapPin size={14} className="text-slate-500 mt-0.5 shrink-0" />
                                        <span>{rdv.lieu}</span>
                                    </div>
                                )}
                                {rdv.ordre_du_jour && (
                                    <div className="flex gap-2">
                                        <FileText size={14} className="text-slate-500 mt-0.5 shrink-0" />
                                        <span className="line-clamp-2">{rdv.ordre_du_jour}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-2 border-t border-white/5">
                                {/* Pour simplifier, un bouton pour marquer comme réalisé */}
                                {rdv.statut === 'planifie' && (
                                    <Link href={route('rendez-vous.update', rdv.id)} method="put" data={{ statut: 'realise', date_heure: rdv.date_heure }} className="btn-ghost text-emerald-400 text-xs py-1">
                                        <CheckCircle size={14} /> Marquer réalisé
                                    </Link>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
            
            <div className="mt-4"><Pagination links={rendezVous.links} /></div>

            <CreateModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} courriers={courriers} />
        </AppLayout>
    );
}
