import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

export default function Edit({ courrier }) {
    const { data, setData, patch, processing, errors } = useForm({
        objet:        courrier.objet,
        expediteur:   courrier.expediteur,
        destinataire: courrier.destinataire,
        observations: courrier.observations ?? '',
    });

    const submit = e => { e.preventDefault(); patch(route('courriers.update', courrier.id)); };

    const Field = ({ label, error, required, children }) => (
        <div className="form-group">
            <label className="label">{label} {required && <span className="text-red-400">*</span>}</label>
            {children}
            {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
        </div>
    );

    return (
        <AppLayout title={`Modifier ${courrier.numero}`}>
            <Head title={`Modifier ${courrier.numero}`} />
            <div className="page-header">
                <div>
                    <Link href={route('courriers.show', courrier.id)} className="btn-ghost mb-3 -ml-1"><ArrowLeft size={15} /> Retour</Link>
                    <h2 className="page-title">Modifier le courrier <span className="gradient-text">{courrier.numero}</span></h2>
                </div>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={submit} className="card-glass p-6 space-y-5">
                    <Field label="Objet du courrier" error={errors.objet} required>
                        <input type="text" className="input" value={data.objet} onChange={e => setData('objet', e.target.value)} />
                    </Field>
                    <Field label="Expéditeur" error={errors.expediteur} required>
                        <input type="text" className="input" value={data.expediteur} onChange={e => setData('expediteur', e.target.value)} />
                    </Field>
                    <Field label="Destinataire" error={errors.destinataire} required>
                        <input type="text" className="input" value={data.destinataire} onChange={e => setData('destinataire', e.target.value)} />
                    </Field>
                    <Field label="Observations" error={errors.observations}>
                        <textarea className="input resize-none" rows={4} value={data.observations} onChange={e => setData('observations', e.target.value)} />
                    </Field>
                    <div className="flex justify-end gap-3 pt-2">
                        <Link href={route('courriers.show', courrier.id)} className="btn-secondary">Annuler</Link>
                        <button type="submit" disabled={processing} className="btn-primary">
                            <Save size={14} /> {processing ? 'Enregistrement...' : 'Sauvegarder'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
