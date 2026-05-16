import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Upload, Handshake } from 'lucide-react';

const TYPES = [
    { value: 'accord_cadre',      label: 'Accord cadre' },
    { value: 'memorandum',        label: 'Mémorandum' },
    { value: 'accord_specifique', label: 'Accord spécifique' },
    { value: 'protocole',         label: 'Protocole' },
    { value: 'autre',             label: 'Autre' },
];

export default function Create({ partenaires, source_courrier_id, partenaire_id_predefini }) {
    const { data, setData, post, processing, errors } = useForm({
        courrier_id: source_courrier_id || '',
        partenaire_id: partenaire_id_predefini || '',
        intitule: '',
        type: 'accord_cadre',
        date_debut: '',
        date_fin: '',
        reconductible: false,
        description: '',
        document_pdf: null,
    });

    const submit = e => { e.preventDefault(); post(route('conventions.store'), { forceFormData: true }); };

    const Field = ({ label, error, required, children }) => (
        <div className="form-group">
            <label className="label">{label} {required && <span className="text-red-400">*</span>}</label>
            {children}
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );

    const selected = partenaires.find(p => p.id == data.partenaire_id);

    return (
        <AppLayout title="Nouvelle convention">
            <Head title="Nouvelle convention" />
            <div className="page-header">
                <div>
                    <Link href={route('conventions.index')} className="btn-ghost mb-3 -ml-1"><ArrowLeft size={15} /> Retour</Link>
                    <h2 className="page-title">Nouvelle convention</h2>
                    <p className="page-subtitle">Créer un nouvel accord ou protocole avec un partenaire</p>
                </div>
            </div>

            {source_courrier_id && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Save size={14} />
                    </div>
                    <p>Cette convention sera automatiquement liée au courrier sélectionné.</p>
                </div>
            )}

            <form onSubmit={submit} encType="multipart/form-data">
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Partenaire */}
                        <div className="card-glass p-6">
                            <h3 className="text-sm font-semibold text-white mb-5">Partenaire concerné</h3>
                            <Field label="Sélectionner le partenaire" error={errors.partenaire_id} required>
                                <select className="input" value={data.partenaire_id} onChange={e => setData('partenaire_id', e.target.value)}>
                                    <option value="">-- Choisir un partenaire --</option>
                                    {partenaires.map(p => (
                                        <option key={p.id} value={p.id}>{p.nom}{p.sigle ? ` (${p.sigle})` : ''} — {p.pays}</option>
                                    ))}
                                </select>
                            </Field>
                            {selected && (
                                <div className="mt-3 flex items-center gap-3 p-3 bg-srec-950/50 rounded-xl border border-srec-800/40">
                                    <div className="w-9 h-9 rounded-lg bg-srec-700/30 flex items-center justify-center text-lg"><Handshake size={18} className="text-srec-400" /></div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{selected.nom}</p>
                                        <p className="text-xs text-slate-500">{selected.pays}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Identification */}
                        <div className="card-glass p-6">
                            <h3 className="text-sm font-semibold text-white mb-5">Identification</h3>
                            <div className="space-y-4">
                                <Field label="Intitulé de la convention" error={errors.intitule} required>
                                    <input type="text" className="input" placeholder="Ex: Accord de coopération scientifique et pédagogique" value={data.intitule} onChange={e => setData('intitule', e.target.value)} />
                                </Field>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Field label="Type" error={errors.type} required>
                                        <select className="input" value={data.type} onChange={e => setData('type', e.target.value)}>
                                            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                        </select>
                                    </Field>
                                    <Field label="Reconductible ?" error={errors.reconductible}>
                                        <div className="flex items-center gap-3 pt-2">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input type="checkbox" checked={data.reconductible} onChange={e => setData('reconductible', e.target.checked)} className="w-4 h-4 accent-srec-600" />
                                                <span className="text-sm text-slate-300">Oui, reconductible</span>
                                            </label>
                                        </div>
                                    </Field>
                                </div>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <Field label="Date de début" error={errors.date_debut}>
                                        <input type="date" className="input" value={data.date_debut} onChange={e => setData('date_debut', e.target.value)} />
                                    </Field>
                                    <Field label="Date de fin" error={errors.date_fin}>
                                        <input type="date" className="input" value={data.date_fin} onChange={e => setData('date_fin', e.target.value)} />
                                    </Field>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="card-glass p-6">
                            <h3 className="text-sm font-semibold text-white mb-4">Description</h3>
                            <textarea className="input resize-none" rows={5} placeholder="Décrivez les objectifs et le périmètre de cette convention..." value={data.description} onChange={e => setData('description', e.target.value)} />
                        </div>
                    </div>

                    {/* Panneau latéral */}
                    <div className="space-y-4">
                        <div className="card-glass p-5">
                            <h3 className="text-sm font-semibold text-white mb-4">Document PDF</h3>
                            <label className="flex flex-col items-center gap-3 p-5 border-2 border-dashed border-white/15 rounded-xl hover:border-srec-500/40 cursor-pointer transition-colors group">
                                <Upload size={22} className="text-slate-600 group-hover:text-srec-400 transition-colors" />
                                <div className="text-center">
                                    <p className="text-xs font-medium text-slate-300">Joindre le texte</p>
                                    <p className="text-xs text-slate-600 mt-0.5">PDF, max 20 MB</p>
                                </div>
                                {data.document_pdf && <span className="badge badge-green text-[10px]">{data.document_pdf.name}</span>}
                                <input type="file" accept=".pdf" className="hidden" onChange={e => setData('document_pdf', e.target.files[0])} />
                            </label>
                        </div>

                        <div className="card-glass p-5">
                            <h3 className="text-sm font-semibold text-white mb-3">Résumé</h3>
                            <div className="space-y-2 text-xs text-slate-400 mb-5">
                                <div className="flex justify-between"><span>Statut initial</span><span className="badge badge-gray">Brouillon</span></div>
                                <div className="flex justify-between"><span>Type</span><span className="text-slate-200">{TYPES.find(t => t.value === data.type)?.label}</span></div>
                                <div className="flex justify-between"><span>Reconductible</span><span className="text-slate-200">{data.reconductible ? 'Oui' : 'Non'}</span></div>
                            </div>
                            <button type="submit" disabled={processing} className="btn-primary w-full justify-center">
                                <Save size={15} /> {processing ? 'Création...' : 'Créer la convention'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
