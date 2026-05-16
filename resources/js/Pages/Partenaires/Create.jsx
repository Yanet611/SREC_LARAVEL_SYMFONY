import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

const TYPES = [
    { value: 'universite', label: 'Université' },
    { value: 'ong', label: 'ONG' },
    { value: 'ambassade', label: 'Ambassade' },
    { value: 'organisation_internationale', label: 'Organisation Internationale' },
    { value: 'entreprise', label: 'Entreprise' },
    { value: 'autre', label: 'Autre' },
];

export default function Create({ source_courrier_id, nom_predefini }) {
    const { data, setData, post, processing, errors } = useForm({
        courrier_id: source_courrier_id || '',
        nom: nom_predefini || '', sigle: '', type: 'universite', nature: 'international',
        pays: '', ville: '', adresse: '', site_web: '', email: '', telephone: '',
        contact_nom: '', contact_fonction: '', contact_email: '', contact_telephone: '',
        notes: '',
    });

    const submit = e => { e.preventDefault(); post(route('partenaires.store')); };

    const Field = ({ label, error, required, children }) => (
        <div className="form-group">
            <label className="label">{label} {required && <span className="text-red-400">*</span>}</label>
            {children}
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );

    return (
        <AppLayout title="Nouveau partenaire">
            <Head title="Nouveau partenaire" />
            <div className="page-header">
                <div>
                    <Link href={route('partenaires.index')} className="btn-ghost mb-3 -ml-1"><ArrowLeft size={15} /> Retour</Link>
                    <h2 className="page-title">Nouveau partenaire</h2>
                    <p className="page-subtitle">Enregistrer un nouveau partenaire institutionnel</p>
                </div>
            </div>

            {source_courrier_id && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Save size={14} />
                    </div>
                    <p>Ce partenaire sera automatiquement lié au courrier sélectionné.</p>
                </div>
            )}

            <form onSubmit={submit}>
                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        {/* Identité */}
                        <div className="card-glass p-6">
                            <h3 className="text-sm font-semibold text-white mb-5">Identité de l'institution</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Nom complet" error={errors.nom} required>
                                    <input type="text" className="input" placeholder="Ex: Université de Paris" value={data.nom} onChange={e => setData('nom', e.target.value)} />
                                </Field>
                                <Field label="Sigle / Acronyme" error={errors.sigle}>
                                    <input type="text" className="input" placeholder="Ex: UPD" value={data.sigle} onChange={e => setData('sigle', e.target.value)} />
                                </Field>
                                <Field label="Type d'institution" error={errors.type} required>
                                    <select className="input" value={data.type} onChange={e => setData('type', e.target.value)}>
                                        {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </Field>
                                <Field label="Nature" error={errors.nature} required>
                                    <div className="flex gap-4 pt-1">
                                        {['national', 'international'].map(n => (
                                            <label key={n} className="flex items-center gap-2 cursor-pointer">
                                                <input type="radio" name="nature" value={n} checked={data.nature === n} onChange={e => setData('nature', e.target.value)} className="accent-srec-600" />
                                                <span className="text-sm text-slate-300 capitalize">{n}</span>
                                            </label>
                                        ))}
                                    </div>
                                </Field>
                                <Field label="Pays" error={errors.pays} required>
                                    <input type="text" className="input" placeholder="Ex: France" value={data.pays} onChange={e => setData('pays', e.target.value)} />
                                </Field>
                                <Field label="Ville" error={errors.ville}>
                                    <input type="text" className="input" placeholder="Ex: Paris" value={data.ville} onChange={e => setData('ville', e.target.value)} />
                                </Field>
                                <Field label="Site web" error={errors.site_web}>
                                    <input type="url" className="input" placeholder="https://..." value={data.site_web} onChange={e => setData('site_web', e.target.value)} />
                                </Field>
                                <Field label="Email institutionnel" error={errors.email}>
                                    <input type="email" className="input" value={data.email} onChange={e => setData('email', e.target.value)} />
                                </Field>
                            </div>
                        </div>

                        {/* Contact */}
                        <div className="card-glass p-6">
                            <h3 className="text-sm font-semibold text-white mb-5">Personne contact principal</h3>
                            <div className="grid sm:grid-cols-2 gap-4">
                                <Field label="Nom" error={errors.contact_nom}>
                                    <input type="text" className="input" value={data.contact_nom} onChange={e => setData('contact_nom', e.target.value)} />
                                </Field>
                                <Field label="Fonction" error={errors.contact_fonction}>
                                    <input type="text" className="input" placeholder="Ex: Directeur des RI" value={data.contact_fonction} onChange={e => setData('contact_fonction', e.target.value)} />
                                </Field>
                                <Field label="Email" error={errors.contact_email}>
                                    <input type="email" className="input" value={data.contact_email} onChange={e => setData('contact_email', e.target.value)} />
                                </Field>
                                <Field label="Téléphone" error={errors.contact_telephone}>
                                    <input type="text" className="input" value={data.contact_telephone} onChange={e => setData('contact_telephone', e.target.value)} />
                                </Field>
                            </div>
                        </div>

                        <div className="card-glass p-6">
                            <h3 className="text-sm font-semibold text-white mb-4">Notes</h3>
                            <textarea className="input resize-none" rows={4} placeholder="Informations complémentaires sur ce partenaire..." value={data.notes} onChange={e => setData('notes', e.target.value)} />
                        </div>
                    </div>

                    {/* Actions */}
                    <div>
                        <div className="card-glass p-5 sticky top-6">
                            <h3 className="text-sm font-semibold text-white mb-4">Enregistrement</h3>
                            <div className="space-y-3 text-xs text-slate-400 mb-5">
                                <div className="flex justify-between"><span>Statut initial</span><span className="badge badge-green">Actif</span></div>
                                <div className="flex justify-between"><span>Type</span><span className="text-slate-200">{TYPES.find(t => t.value === data.type)?.label}</span></div>
                                <div className="flex justify-between"><span>Nature</span><span className="text-slate-200 capitalize">{data.nature}</span></div>
                            </div>
                            <button type="submit" disabled={processing} className="btn-primary w-full justify-center">
                                <Save size={15} /> {processing ? 'Enregistrement...' : 'Créer le partenaire'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </AppLayout>
    );
}
