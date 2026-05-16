import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

export default function Edit({ partenaire }) {
    const { data, setData, patch, processing, errors } = useForm({
        nom:              partenaire.nom,
        sigle:            partenaire.sigle ?? '',
        pays:             partenaire.pays,
        ville:            partenaire.ville ?? '',
        site_web:         partenaire.site_web ?? '',
        email:            partenaire.email ?? '',
        contact_nom:      partenaire.contact_nom ?? '',
        contact_email:    partenaire.contact_email ?? '',
        statut:           partenaire.statut,
        notes:            partenaire.notes ?? '',
    });

    const submit = e => { e.preventDefault(); patch(route('partenaires.update', partenaire.id)); };

    const Field = ({ label, error, children }) => (
        <div className="form-group">
            <label className="label">{label}</label>
            {children}
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );

    return (
        <AppLayout title={`Modifier ${partenaire.nom}`}>
            <Head title={`Modifier ${partenaire.nom}`} />
            <div className="page-header">
                <div>
                    <Link href={route('partenaires.show', partenaire.id)} className="btn-ghost mb-3 -ml-1"><ArrowLeft size={15} /> Retour</Link>
                    <h2 className="page-title">Modifier le partenaire</h2>
                </div>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={submit} className="card-glass p-6 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Nom" error={errors.nom}>
                            <input type="text" className="input" value={data.nom} onChange={e => setData('nom', e.target.value)} />
                        </Field>
                        <Field label="Sigle" error={errors.sigle}>
                            <input type="text" className="input" value={data.sigle} onChange={e => setData('sigle', e.target.value)} />
                        </Field>
                        <Field label="Pays" error={errors.pays}>
                            <input type="text" className="input" value={data.pays} onChange={e => setData('pays', e.target.value)} />
                        </Field>
                        <Field label="Ville" error={errors.ville}>
                            <input type="text" className="input" value={data.ville} onChange={e => setData('ville', e.target.value)} />
                        </Field>
                        <Field label="Site web" error={errors.site_web}>
                            <input type="url" className="input" value={data.site_web} onChange={e => setData('site_web', e.target.value)} />
                        </Field>
                        <Field label="Email" error={errors.email}>
                            <input type="email" className="input" value={data.email} onChange={e => setData('email', e.target.value)} />
                        </Field>
                        <Field label="Contact — Nom" error={errors.contact_nom}>
                            <input type="text" className="input" value={data.contact_nom} onChange={e => setData('contact_nom', e.target.value)} />
                        </Field>
                        <Field label="Contact — Email" error={errors.contact_email}>
                            <input type="email" className="input" value={data.contact_email} onChange={e => setData('contact_email', e.target.value)} />
                        </Field>
                        <Field label="Statut" error={errors.statut}>
                            <select className="input" value={data.statut} onChange={e => setData('statut', e.target.value)}>
                                <option value="actif">Actif</option>
                                <option value="inactif">Inactif</option>
                                <option value="suspendu">Suspendu</option>
                            </select>
                        </Field>
                    </div>
                    <Field label="Notes" error={errors.notes}>
                        <textarea className="input resize-none" rows={3} value={data.notes} onChange={e => setData('notes', e.target.value)} />
                    </Field>
                    <div className="flex justify-end gap-3 pt-2">
                        <Link href={route('partenaires.show', partenaire.id)} className="btn-secondary">Annuler</Link>
                        <button type="submit" disabled={processing} className="btn-primary">
                            <Save size={14} /> {processing ? 'Enregistrement...' : 'Sauvegarder'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
