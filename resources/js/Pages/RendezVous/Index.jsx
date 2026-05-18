import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { StatusBadge, EmptyState, Pagination } from '@/Components/Ui';
import { useState } from 'react';
import { Calendar, Plus, MapPin, FileText, CheckCircle, Mail, List, X, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const STATUT_COLORS = { planifie: 'blue', realise: 'green', annule: 'red' };
const STATUT_LABELS = { planifie: 'Planifié', realise: 'Réalisé', annule: 'Annulé' };
const STATUT_DOT = { planifie: 'bg-blue-400', realise: 'bg-emerald-400', annule: 'bg-red-400' };

// ─── Modal création RDV ────────────────────────────────────────────────────
const CreateModal = ({ isOpen, onClose, courriers }) => {
    const { data, setData, post, processing, errors, reset } = useForm({
        courrier_id: '', date_heure: '', lieu: '', ordre_du_jour: '', notes: '', type_rdv: 'en_presentiel',
    });
    if (!isOpen) return null;
    const submit = e => { e.preventDefault(); post(route('rendez-vous.store'), { onSuccess: () => { reset(); onClose(); } }); };
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
                            <label className="label">Type</label>
                            <select className="input" value={data.type_rdv} onChange={e => setData('type_rdv', e.target.value)}>
                                <option value="en_presentiel">En présentiel</option>
                                <option value="en_video">Visioconférence</option>
                                <option value="par_telephone">Par téléphone</option>
                                <option value="autre">Autre</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="label">Lieu</label>
                        <input type="text" className="input" placeholder="Salle de réunion, bâtiment..." value={data.lieu} onChange={e => setData('lieu', e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label className="label">Ordre du jour</label>
                        <textarea className="input resize-none" rows={2} value={data.ordre_du_jour} onChange={e => setData('ordre_du_jour', e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
                        <button type="submit" disabled={processing} className="btn-primary">
                            <Calendar size={14} /> {processing ? 'Planification...' : 'Planifier'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ─── Vue Calendrier ────────────────────────────────────────────────────────
function CalendarView({ rdvList, onNew }) {
    const today = new Date();
    const [year, setYear] = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth()); // 0-indexed
    const [tooltip, setTooltip] = useState(null);

    const MOIS_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
    const JOURS_FR = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];

    const prev = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
    const next = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

    // Calcul des cellules du mois
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    // Day-of-week of 1st (0=Sun → convert to Mon-based)
    let startDow = firstDay.getDay(); // 0=Sun
    startDow = startDow === 0 ? 6 : startDow - 1; // Mon=0
    const daysInMonth = lastDay.getDate();
    const cells = Array.from({ length: startDow + daysInMonth }, (_, i) => i < startDow ? null : i - startDow + 1);
    // Pad to full weeks
    while (cells.length % 7 !== 0) cells.push(null);

    // Group RDV by day key "YYYY-MM-DD"
    const rdvByDay = {};
    (rdvList || []).forEach(rdv => {
        if (!rdv.date_heure) return;
        const d = new Date(rdv.date_heure);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        if (!rdvByDay[key]) rdvByDay[key] = [];
        rdvByDay[key].push(rdv);
    });

    const todayKey = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

    return (
        <div className="card-glass p-6">
            {/* Nav mois */}
            <div className="flex items-center justify-between mb-6">
                <button onClick={prev} className="btn-ghost p-2"><ChevronLeft size={16} /></button>
                <h3 className="text-base font-semibold text-white">{MOIS_FR[month]} {year}</h3>
                <button onClick={next} className="btn-ghost p-2"><ChevronRight size={16} /></button>
            </div>

            {/* En-têtes jours */}
            <div className="grid grid-cols-7 mb-2">
                {JOURS_FR.map(j => (
                    <div key={j} className="text-center text-[10px] font-semibold text-slate-500 uppercase tracking-wider py-1">{j}</div>
                ))}
            </div>

            {/* Cellules */}
            <div className="grid grid-cols-7 gap-px bg-white/5 rounded-xl overflow-hidden">
                {cells.map((day, idx) => {
                    if (!day) return <div key={idx} className="bg-srec-950/60 min-h-[80px]" />;
                    const key = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                    const rdvs = rdvByDay[key] || [];
                    const isToday = key === todayKey;
                    return (
                        <div key={idx}
                            className={`bg-srec-950/60 min-h-[80px] p-1.5 relative group cursor-default ${isToday ? 'ring-1 ring-inset ring-srec-500/50' : ''}`}
                        >
                            <span className={`text-xs font-medium block text-right mb-1 w-6 h-6 flex items-center justify-center rounded-full ml-auto
                                ${isToday ? 'bg-srec-500 text-white' : 'text-slate-500'}`}>
                                {day}
                            </span>
                            <div className="space-y-0.5">
                                {rdvs.slice(0, 2).map((rdv, ri) => {
                                    const h = new Date(rdv.date_heure).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'});
                                    return (
                                        <div key={ri}
                                            className={`text-[9px] px-1 py-0.5 rounded truncate flex items-center gap-1 cursor-pointer
                                                ${rdv.statut === 'realise' ? 'bg-emerald-500/20 text-emerald-300' :
                                                  rdv.statut === 'annule'  ? 'bg-red-500/20 text-red-300' :
                                                  'bg-blue-500/20 text-blue-300'}`}
                                            onClick={() => setTooltip(tooltip?.id === rdv.id ? null : { ...rdv, key })}
                                        >
                                            <Clock size={8} />
                                            <span>{h}</span>
                                            <span className="truncate">{rdv.courrier?.objet || rdv.courrier?.numero || '—'}</span>
                                        </div>
                                    );
                                })}
                                {rdvs.length > 2 && (
                                    <span className="text-[9px] text-slate-500 pl-1">+{rdvs.length - 2} de plus</span>
                                )}
                            </div>
                            {/* Tooltip */}
                            {tooltip && rdvs.some(r => r.id === tooltip.id) && (
                                <div className="absolute z-20 left-0 top-full mt-1 w-56 card-glass p-3 shadow-2xl text-xs space-y-1.5 border border-srec-500/30"
                                    onClick={e => e.stopPropagation()}>
                                    <p className="font-semibold text-white">{tooltip.courrier?.objet || '—'}</p>
                                    <p className="text-slate-400 font-mono">{tooltip.courrier?.numero}</p>
                                    <div className="flex items-center gap-1.5 text-slate-300">
                                        <Clock size={10} /> {new Date(tooltip.date_heure).toLocaleString('fr-FR',{hour:'2-digit',minute:'2-digit'})}
                                    </div>
                                    {tooltip.lieu && <div className="flex items-center gap-1.5 text-slate-300"><MapPin size={10} /> {tooltip.lieu}</div>}
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] ${STATUT_DOT[tooltip.statut]} bg-opacity-20`}>
                                        {STATUT_LABELS[tooltip.statut]}
                                    </span>
                                    <button onClick={() => setTooltip(null)} className="absolute top-2 right-2 text-slate-500 hover:text-white"><X size={12} /></button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Légende */}
            <div className="flex items-center gap-4 mt-4 text-[10px] text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-500/30 inline-block" />Planifié</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/30 inline-block" />Réalisé</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/30 inline-block" />Annulé</span>
            </div>
        </div>
    );
}

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────
export default function Index({ rendezVous, courriers, filtres }) {
    const [statut, setStatut]       = useState(filtres.statut ?? '');
    const [isModalOpen, setModal]   = useState(false);
    const [viewMode, setViewMode]   = useState('list'); // 'list' | 'calendar'

    const applyFilters = (extra = {}) =>
        router.get(route('rendez-vous.index'), { statut: extra.statut ?? statut }, { preserveState: true, replace: true });

    // All rdv for calendar (pagination makes this tricky — we use rendezVous.data for the current page)
    const allRdv = rendezVous.data;

    return (
        <AppLayout title="Rendez-vous & Entretiens">
            <Head title="Rendez-vous" />

            <div className="page-header">
                <div>
                    <h2 className="page-title">Rendez-vous & Entretiens</h2>
                    <p className="page-subtitle">Gérez les réunions liées aux courriers</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Toggle Liste / Calendrier */}
                    <div className="flex bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-srec-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <List size={13} /> Liste
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === 'calendar' ? 'bg-srec-600 text-white' : 'text-slate-400 hover:text-white'}`}
                        >
                            <Calendar size={13} /> Calendrier
                        </button>
                    </div>
                    <button onClick={() => setModal(true)} className="btn-primary">
                        <Plus size={15} /> Planifier un RDV
                    </button>
                </div>
            </div>

            {/* Filtres (visible seulement en vue liste) */}
            {viewMode === 'list' && (
                <div className="card-glass p-4 mb-6 flex gap-3">
                    <select value={statut} onChange={e => { setStatut(e.target.value); applyFilters({ statut: e.target.value }); }} className="input w-auto min-w-40">
                        <option value="">Tous les statuts</option>
                        <option value="planifie">Planifiés</option>
                        <option value="realise">Réalisés</option>
                        <option value="annule">Annulés</option>
                    </select>
                    {statut && <button onClick={() => { setStatut(''); applyFilters({ statut: '' }); }} className="btn-ghost"><X size={14} /> Reset</button>}
                </div>
            )}

            {/* ── Vue Calendrier ── */}
            {viewMode === 'calendar' && (
                <CalendarView rdvList={allRdv} onNew={() => setModal(true)} />
            )}

            {/* ── Vue Liste ── */}
            {viewMode === 'list' && (
                <>
                    <div className="grid lg:grid-cols-2 gap-4">
                        {rendezVous.data.length === 0 ? (
                            <div className="lg:col-span-2 card-glass p-8">
                                <EmptyState
                                    icon={Calendar}
                                    title="Aucun rendez-vous trouvé"
                                    description="Il n'y a pas de rendez-vous correspondant à vos critères."
                                    action={<button onClick={() => setModal(true)} className="btn-primary mt-4"><Plus size={14} /> Planifier un RDV</button>}
                                />
                            </div>
                        ) : (
                            rendezVous.data.map(rdv => (
                                <div key={rdv.id} className="card-glass p-5 flex flex-col gap-4 hover:border-white/10 transition-all">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${rdv.statut === 'realise' ? 'bg-emerald-600/15 text-emerald-400' : rdv.statut === 'annule' ? 'bg-red-600/15 text-red-400' : 'bg-blue-600/15 text-blue-400'}`}>
                                                {rdv.statut === 'realise' ? <CheckCircle size={20} /> : <Calendar size={20} />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-white">
                                                    {new Date(rdv.date_heure).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                <StatusBadge color={STATUT_COLORS[rdv.statut]} label={STATUT_LABELS[rdv.statut]} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-sm text-slate-300 bg-white/5 p-3 rounded-lg">
                                        <div className="flex gap-2">
                                            <Mail size={14} className="text-slate-500 mt-0.5 shrink-0" />
                                            <span className="truncate">Courrier: <span className="font-mono text-srec-300">{rdv.courrier?.numero}</span> — {rdv.courrier?.objet}</span>
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

                                    <div className="flex justify-between items-center pt-2 border-t border-white/5">
                                        <p className="text-[11px] text-slate-600">
                                            Organisé par {rdv.organise_par?.name || '—'}
                                        </p>
                                        {rdv.statut === 'planifie' && (
                                            <Link href={route('courriers.show', rdv.courrier?.id)} className="btn-ghost text-xs py-1">
                                                Voir le dossier →
                                            </Link>
                                        )}
                                        {rdv.rapport && (
                                            <span className="badge badge-green text-[10px]"><FileText size={10} /> Rapport soumis</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <div className="mt-4"><Pagination links={rendezVous.links} /></div>
                </>
            )}

            <CreateModal isOpen={isModalOpen} onClose={() => setModal(false)} courriers={courriers} />
        </AppLayout>
    );
}
