import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Activity } from 'lucide-react';

const TYPES = [
    { value: 'formation',  label: 'Formation' },
    { value: 'recherche',  label: 'Recherche' },
    { value: 'echange',    label: 'Échange' },
    { value: 'conference', label: 'Conférence' },
    { value: 'stage',      label: 'Stage' },
    { value: 'autre',      label: 'Autre' },
];

const STATUTS = [
    { value: 'planifiee', label: 'Planifiée' },
    { value: 'en_cours',  label: 'En cours' },
    { value: 'realisee',  label: 'Réalisée' },
    { value: 'annulee',   label: 'Annulée' },
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

export default function Edit({ activite, conventions }) {
    const { data, setData, put, processing, errors } = useForm({
        convention_id:       activite.convention_id ?? '',
        titre:               activite.titre ?? '',
        description:         activite.description ?? '',
        type:                activite.type ?? 'formation',
        date_debut:          activite.date_debut ? activite.date_debut.substring(0, 10) : '',
        date_fin:            activite.date_fin ? activite.date_fin.substring(0, 10) : '',
        lieu:                activite.lieu ?? '',
        participants_prevus: activite.participants_prevus ?? '',
        participants_reels:  activite.participants_reels ?? '',
        statut:              activite.statut ?? 'planifiee',
        observations:        activite.observations ?? '',
    });

    const submit = e => { e.preventDefault(); put(route('activites.update', activite.id)); };

    return (
        <AppLayout title={`Modifier — ${activite.titre}`}>
            <Head title={`Modifier ${activite.titre}`} />
            <div className="page-header">
                <div>
                    <Link href={route('activites.show', activite.id)} className="btn-ghost mb-3 -ml-1">
                        <ArrowLeft size={15} /> Retour
                    </Link>
                    <h2 className="page-title">Modifier l'activité</h2>
                    <p className="page-subtitle">{activite.titre}</p>
                </div>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={submit} className="card-glass p-6 space-y-5">

                    <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-srec-600/20 flex items-center justify-center">
                            <Activity size={20} className="text-srec-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Modifier l'activité</p>
                            <p className="text-xs text-slate-500">{activite.convention?.reference}</p>
                        </div>
                    </div>

                    <Field label="Convention associée" error={errors.convention_id} required>
                        <select className="input" value={data.convention_id} onChange={e => setData('convention_id', e.target.value)}>
                            <option value="">Sélectionner...</option>
                            {conventions.map(c => (
                                <option key={c.id} value={c.id}>{c.reference} — {c.intitule}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Titre" error={errors.titre} required>
                        <input type="text" className="input" value={data.titre} onChange={e => setData('titre', e.target.value)} />
                    </Field>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Type" error={errors.type} required>
                            <select className="input" value={data.type} onChange={e => setData('type', e.target.value)}>
                                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Statut" error={errors.statut} required>
                            <select className="input" value={data.statut} onChange={e => setData('statut', e.target.value)}>
                                {STATUTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Date de début" error={errors.date_debut} required>
                            <input type="date" className="input" value={data.date_debut} onChange={e => setData('date_debut', e.target.value)} />
                        </Field>
                        <Field label="Date de fin" error={errors.date_fin}>
                            <input type="date" className="input" value={data.date_fin} onChange={e => setData('date_fin', e.target.value)} />
                        </Field>
                        <Field label="Lieu" error={errors.lieu}>
                            <input type="text" className="input" value={data.lieu} onChange={e => setData('lieu', e.target.value)} />
                        </Field>
                        <Field label="Participants prévus" error={errors.participants_prevus}>
                            <input type="number" className="input" min="0" value={data.participants_prevus} onChange={e => setData('participants_prevus', e.target.value)} />
                        </Field>
                        <Field label="Participants réels" error={errors.participants_reels}>
                            <input type="number" className="input" min="0" value={data.participants_reels} onChange={e => setData('participants_reels', e.target.value)} />
                        </Field>
                    </div>

                    <Field label="Description" error={errors.description}>
                        <textarea className="input resize-none" rows={3} value={data.description} onChange={e => setData('description', e.target.value)} />
                    </Field>

                    <Field label="Observations" error={errors.observations}>
                        <textarea className="input resize-none" rows={2} value={data.observations} onChange={e => setData('observations', e.target.value)} />
                    </Field>

                    <div className="flex justify-end gap-3 pt-2">
                        <Link href={route('activites.show', activite.id)} className="btn-secondary">Annuler</Link>
                        <button type="submit" disabled={processing} className="btn-primary">
                            <Save size={14} /> {processing ? 'Enregistrement...' : 'Sauvegarder'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
