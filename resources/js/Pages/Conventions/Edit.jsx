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

const Field = ({ label, error, required, children }) => (
    <div className="form-group">
        <label className="label">{label} {required && <span className="text-red-400">*</span>}</label>
        {children}
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
);

export default function Edit({ convention, partenaires }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        intitule: convention.intitule || '',
        type: convention.type || 'accord_cadre',
        date_debut: convention.date_debut ? convention.date_debut.split('T')[0] : '',
        date_fin: convention.date_fin ? convention.date_fin.split('T')[0] : '',
        reconductible: !!convention.reconductible,
        description: convention.description || '',
        document_pdf: null,
    });

    const submit = e => { 
        e.preventDefault(); 
        post(route('conventions.update', convention.id), { forceFormData: true }); 
    };

    const selected = partenaires.find(p => p.id === convention.partenaire_id);

    return (
        <AppLayout title="Modifier la convention">
            <Head title="Modifier la convention" />
            <div className="page-header">
                <div>
                    <Link href={route('conventions.show', convention.id)} className="btn-ghost mb-3 -ml-1">
                        <ArrowLeft size={15} /> Retour
                    </Link>
                    <h2 className="page-title">Modifier la convention</h2>
                    <p className="page-subtitle">Mise à jour des informations du document (Réf: {convention.reference})</p>
                </div>
            </div>

            <form onSubmit={submit} encType="multipart/form-data">
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Partenaire (Lecture seule) */}
                        <div className="card-glass p-6">
                            <div className="flex items-center gap-3 pb-2 mb-5 border-b border-white/5">
                                <div className="w-10 h-10 rounded-xl bg-srec-600/20 flex items-center justify-center">
                                    <Handshake size={20} className="text-srec-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Partenaire concerné</p>
                                    <p className="text-xs text-slate-500">Le partenaire ne peut pas être modifié après création.</p>
                                </div>
                            </div>
                            
                            {selected && (
                                <div className="bg-srec-900/50 border border-srec-700/30 rounded-xl p-4 flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-srec-600/20 flex items-center justify-center flex-shrink-0">
                                        <Handshake size={14} className="text-srec-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{selected.nom}</p>
                                        <p className="text-xs text-slate-400">{selected.pays}</p>
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
                            
                            {convention.document_pdf && (
                                <div className="mb-4 p-3 bg-white/5 rounded-lg border border-white/10 text-xs">
                                    <p className="text-slate-400 mb-2">Document actuel :</p>
                                    <a href={`/storage/${convention.document_pdf}`} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline break-all">
                                        Voir le document existant
                                    </a>
                                </div>
                            )}

                            <label className="flex flex-col items-center gap-3 p-5 border-2 border-dashed border-white/15 rounded-xl hover:border-srec-500/40 cursor-pointer transition-colors group">
                                <Upload size={22} className="text-slate-600 group-hover:text-srec-400 transition-colors" />
                                <div className="text-center">
                                    <p className="text-xs font-medium text-slate-300">Remplacer le fichier</p>
                                    <p className="text-xs text-slate-600 mt-0.5">PDF, max 20 MB</p>
                                </div>
                                {data.document_pdf && <span className="badge badge-green text-[10px]">{data.document_pdf.name}</span>}
                                <input type="file" accept=".pdf" className="hidden" onChange={e => setData('document_pdf', e.target.files[0])} />
                            </label>
                            {errors.document_pdf && <p className="text-xs text-red-400 mt-2">{errors.document_pdf}</p>}
                        </div>

                        <div className="card-glass p-5">
                            <h3 className="text-sm font-semibold text-white mb-3">Sauvegarde</h3>
                            <button type="submit" disabled={processing} className="btn-primary w-full justify-center">
                                <Save size={15} /> {processing ? 'Mise à jour...' : 'Enregistrer les modifications'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
