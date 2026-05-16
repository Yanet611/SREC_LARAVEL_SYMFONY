import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import { ArrowLeft, Save, Upload, Sparkles } from 'lucide-react';

const TYPES = [
    { value: 'demande_partenariat', label: 'Demande de partenariat' },
    { value: 'demande_convention',  label: 'Demande de convention' },
    { value: 'invitation',          label: 'Invitation' },
    { value: 'information',         label: 'Information' },
    { value: 'autre',               label: 'Autre' },
];

export default function Create({ prefill = null }) {
    const isConvocation = !!prefill;

    const { data, setData, post, processing, errors } = useForm({
        objet:         prefill?.objet         ?? '',
        sens:          prefill?.sens          ?? 'entrant',
        type:          prefill?.type          ?? 'demande_partenariat',
        date_courrier: prefill?.date_courrier ?? new Date().toISOString().split('T')[0],
        expediteur:    prefill?.expediteur    ?? '',
        destinataire:  prefill?.destinataire  ?? 'SREC - UGANC',
        observations:  prefill?.observations  ?? '',
        piece_jointe:  null,
    });

    const submit = e => {
        e.preventDefault();
        post(route('courriers.store'), { forceFormData: true });
    };

    const Field = ({ label, error, required, children }) => (
        <div className="form-group">
            <label className="label">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );

    return (
        <AppLayout title={isConvocation ? 'Créer une convocation' : 'Nouveau courrier'}>
            <Head title={isConvocation ? 'Créer une convocation' : 'Nouveau courrier'} />

            <div className="page-header">
                <div>
                    <Link href={route('courriers.index')} className="btn-ghost mb-3 -ml-1">
                        <ArrowLeft size={15} /> Retour
                    </Link>
                    <h2 className="page-title">{isConvocation ? 'Créer une convocation' : 'Nouveau courrier'}</h2>
                    <p className="page-subtitle">
                        {isConvocation
                            ? 'Courrier sortant pré-rempli depuis le rendez-vous planifié'
                            : 'Enregistrer un courrier entrant ou sortant'}
                    </p>
                </div>
            </div>

            {/* Bandeau pré-remplissage */}
            {isConvocation && (
                <div className="mb-6 flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl">
                    <Sparkles size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-200">
                        Formulaire <strong>pré-rempli automatiquement</strong> depuis le rendez-vous planifié.
                        Vérifiez les informations avant d'enregistrer.
                    </p>
                </div>
            )}

            <form onSubmit={submit} encType="multipart/form-data">
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Formulaire principal */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Identification */}
                        <div className="card-glass p-6">
                            <h3 className="text-sm font-semibold text-white mb-5">Identification du courrier</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Sens du courrier" error={errors.sens} required>
                                    <div className="flex gap-3">
                                        {['entrant', 'sortant'].map(s => (
                                            <label key={s} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="radio" name="sens" value={s}
                                                    checked={data.sens === s}
                                                    onChange={e => setData('sens', e.target.value)}
                                                    className="accent-srec-600"
                                                />
                                                <span className="text-sm text-slate-300 capitalize">{s}</span>
                                            </label>
                                        ))}
                                    </div>
                                </Field>

                                <Field label="Type de courrier" error={errors.type} required>
                                    <select className="input" value={data.type} onChange={e => setData('type', e.target.value)}>
                                        {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </Field>

                                <Field label="Date du courrier" error={errors.date_courrier} required>
                                    <input type="date" className="input" value={data.date_courrier}
                                        onChange={e => setData('date_courrier', e.target.value)} />
                                </Field>
                            </div>
                        </div>

                        {/* Parties */}
                        <div className="card-glass p-6">
                            <h3 className="text-sm font-semibold text-white mb-5">Parties concernées</h3>
                            <div className="space-y-4">
                                <Field label="Expéditeur" error={errors.expediteur} required>
                                    <input type="text" className="input"
                                        placeholder="Ex: SREC — UGANC"
                                        value={data.expediteur}
                                        onChange={e => setData('expediteur', e.target.value)} />
                                </Field>
                                <Field label="Destinataire" error={errors.destinataire} required>
                                    <input type="text" className="input"
                                        value={data.destinataire}
                                        onChange={e => setData('destinataire', e.target.value)} />
                                </Field>
                            </div>
                        </div>

                        {/* Contenu */}
                        <div className="card-glass p-6">
                            <h3 className="text-sm font-semibold text-white mb-5">Contenu</h3>
                            <div className="space-y-4">
                                <Field label="Objet du courrier" error={errors.objet} required>
                                    <input type="text" className="input"
                                        placeholder="Ex: Convocation — Rendez-vous du 20 mai 2026"
                                        value={data.objet}
                                        onChange={e => setData('objet', e.target.value)} />
                                </Field>
                                <Field label="Observations / Corps du message" error={errors.observations}>
                                    <textarea className="input resize-none" rows={5}
                                        placeholder="Contenu du courrier..."
                                        value={data.observations}
                                        onChange={e => setData('observations', e.target.value)} />
                                </Field>
                            </div>
                        </div>
                    </div>

                    {/* Panneau latéral */}
                    <div className="space-y-4">
                        {/* Pièce jointe */}
                        <div className="card-glass p-5">
                            <h3 className="text-sm font-semibold text-white mb-4">Pièce jointe</h3>
                            <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-white/15 rounded-xl hover:border-srec-500/40 cursor-pointer transition-colors group">
                                <Upload size={24} className="text-slate-600 group-hover:text-srec-400 transition-colors" />
                                <div className="text-center">
                                    <p className="text-xs font-medium text-slate-300">Glissez ou cliquez</p>
                                    <p className="text-xs text-slate-600 mt-0.5">PDF uniquement, max 10 MB</p>
                                </div>
                                {data.piece_jointe && (
                                    <span className="badge badge-green">{data.piece_jointe.name}</span>
                                )}
                                <input type="file" accept=".pdf" className="hidden"
                                    onChange={e => setData('piece_jointe', e.target.files[0])} />
                            </label>
                            {errors.piece_jointe && <p className="text-xs text-red-400 mt-2">{errors.piece_jointe}</p>}
                        </div>

                        {/* Récap */}
                        <div className="card-glass p-5">
                            <h3 className="text-sm font-semibold text-white mb-3">Récapitulatif</h3>
                            <div className="space-y-2 text-xs text-slate-400">
                                <div className="flex justify-between">
                                    <span>Sens</span>
                                    <span className="text-slate-200 capitalize">{data.sens}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Type</span>
                                    <span className="text-slate-200">{TYPES.find(t => t.value === data.type)?.label}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Statut initial</span>
                                    {data.sens === 'entrant'
                                        ? <span className="badge badge-yellow">Soumis — Directrice</span>
                                        : <span className="badge badge-blue">Courrier sortant</span>
                                    }
                                </div>
                            </div>
                            <div className="divider" />
                            <button type="submit" disabled={processing} className="btn-primary w-full justify-center">
                                <Save size={15} />
                                {processing ? 'Enregistrement...' : (isConvocation ? 'Enregistrer la convocation' : 'Enregistrer le courrier')}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
