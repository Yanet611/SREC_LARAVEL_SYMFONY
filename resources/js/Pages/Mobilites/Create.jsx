import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Plane } from 'lucide-react';

const TYPES_BENEF = [
    { value: 'etudiant',       label: 'Étudiant' },
    { value: 'enseignant',     label: 'Enseignant' },
    { value: 'chercheur',      label: 'Chercheur' },
    { value: 'personnel_admin',label: 'Personnel administratif' },
];

const Field = ({ label, error, required, children }) => (
    <div className="form-group">
        <label className="label">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        {children}
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
);

export default function Create({ conventions }) {
    const { data, setData, post, processing, errors } = useForm({
        convention_id:         '',
        nom_beneficiaire:      '',
        email_beneficiaire:    '',
        telephone_beneficiaire:'',
        type_beneficiaire:     'etudiant',
        type_mobilite:         'sortant',
        institution_accueil:   '',
        pays_destination:      '',
        ville_destination:     '',
        objet_sejour:          '',
        date_depart:           '',
        date_retour:           '',
        financement:           '',
        montant_financement:   '',
        observations:          '',
    });

    const submit = e => { e.preventDefault(); post(route('mobilites.store')); };

    return (
        <AppLayout title="Nouvelle mobilité">
            <Head title="Nouvelle mobilité académique" />
            <div className="page-header">
                <div>
                    <Link href={route('mobilites.index')} className="btn-ghost mb-3 -ml-1">
                        <ArrowLeft size={15} /> Retour
                    </Link>
                    <h2 className="page-title">Nouvelle mobilité académique</h2>
                    <p className="page-subtitle">Enregistrez un flux de mobilité lié à une convention</p>
                </div>
            </div>

            <form onSubmit={submit} className="max-w-3xl space-y-6">

                {/* Section 1 — Convention */}
                <div className="card-glass p-6 space-y-5">
                    <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                            <Plane size={20} className="text-blue-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Convention & sens</p>
                            <p className="text-xs text-slate-500">Associez la mobilité à une convention active</p>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Field label="Convention" error={errors.convention_id} required>
                                <select className="input" value={data.convention_id} onChange={e => setData('convention_id', e.target.value)}>
                                    <option value="">Sélectionner une convention...</option>
                                    {conventions.map(c => (
                                        <option key={c.id} value={c.id}>{c.reference} — {c.intitule}</option>
                                    ))}
                                </select>
                            </Field>
                        </div>
                        <Field label="Sens de la mobilité" error={errors.type_mobilite} required>
                            <select className="input" value={data.type_mobilite} onChange={e => setData('type_mobilite', e.target.value)}>
                                <option value="sortant">↑ Sortant (UGANC → partenaire)</option>
                                <option value="entrant">↓ Entrant (partenaire → UGANC)</option>
                            </select>
                        </Field>
                        <Field label="Type de bénéficiaire" error={errors.type_beneficiaire} required>
                            <select className="input" value={data.type_beneficiaire} onChange={e => setData('type_beneficiaire', e.target.value)}>
                                {TYPES_BENEF.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </Field>
                    </div>
                </div>

                {/* Section 2 — Bénéficiaire */}
                <div className="card-glass p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-300 border-b border-white/5 pb-2">Informations du bénéficiaire</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Field label="Nom complet" error={errors.nom_beneficiaire} required>
                                <input type="text" className="input" placeholder="Prénom NOM" value={data.nom_beneficiaire} onChange={e => setData('nom_beneficiaire', e.target.value)} />
                            </Field>
                        </div>
                        <Field label="Email" error={errors.email_beneficiaire}>
                            <input type="email" className="input" placeholder="email@exemple.com" value={data.email_beneficiaire} onChange={e => setData('email_beneficiaire', e.target.value)} />
                        </Field>
                        <Field label="Téléphone" error={errors.telephone_beneficiaire}>
                            <input type="text" className="input" placeholder="+224 XXX XXX XXX" value={data.telephone_beneficiaire} onChange={e => setData('telephone_beneficiaire', e.target.value)} />
                        </Field>
                    </div>
                </div>

                {/* Section 3 — Séjour */}
                <div className="card-glass p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-300 border-b border-white/5 pb-2">Détails du séjour</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <Field label="Institution d'accueil" error={errors.institution_accueil} required>
                                <input type="text" className="input" placeholder="Université de..." value={data.institution_accueil} onChange={e => setData('institution_accueil', e.target.value)} />
                            </Field>
                        </div>
                        <Field label="Pays" error={errors.pays_destination} required>
                            <input type="text" className="input" placeholder="France, Maroc..." value={data.pays_destination} onChange={e => setData('pays_destination', e.target.value)} />
                        </Field>
                        <Field label="Ville" error={errors.ville_destination}>
                            <input type="text" className="input" placeholder="Paris, Rabat..." value={data.ville_destination} onChange={e => setData('ville_destination', e.target.value)} />
                        </Field>
                        <Field label="Date de départ" error={errors.date_depart} required>
                            <input type="date" className="input" value={data.date_depart} onChange={e => setData('date_depart', e.target.value)} />
                        </Field>
                        <Field label="Date de retour prévue" error={errors.date_retour}>
                            <input type="date" className="input" value={data.date_retour} onChange={e => setData('date_retour', e.target.value)} />
                        </Field>
                        <div className="sm:col-span-2">
                            <Field label="Objet du séjour" error={errors.objet_sejour} required>
                                <textarea className="input resize-none" rows={2} placeholder="Master, thèse, formation, conférence..." value={data.objet_sejour} onChange={e => setData('objet_sejour', e.target.value)} />
                            </Field>
                        </div>
                    </div>
                </div>

                {/* Section 4 — Financement */}
                <div className="card-glass p-6 space-y-4">
                    <h3 className="text-sm font-semibold text-slate-300 border-b border-white/5 pb-2">Financement & observations</h3>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Source de financement" error={errors.financement}>
                            <input type="text" className="input" placeholder="Bourse, autofinancement..." value={data.financement} onChange={e => setData('financement', e.target.value)} />
                        </Field>
                        <Field label="Montant (GNF)" error={errors.montant_financement}>
                            <input type="number" className="input" min="0" step="0.01" placeholder="0.00" value={data.montant_financement} onChange={e => setData('montant_financement', e.target.value)} />
                        </Field>
                        <div className="sm:col-span-2">
                            <Field label="Observations" error={errors.observations}>
                                <textarea className="input resize-none" rows={2} value={data.observations} onChange={e => setData('observations', e.target.value)} />
                            </Field>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link href={route('mobilites.index')} className="btn-secondary">Annuler</Link>
                    <button type="submit" disabled={processing} className="btn-primary">
                        <Save size={14} /> {processing ? 'Enregistrement...' : 'Créer la mobilité'}
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
