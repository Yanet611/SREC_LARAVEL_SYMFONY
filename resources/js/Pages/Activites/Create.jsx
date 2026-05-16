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
        convention_id:       '',
        titre:               '',
        description:         '',
        type:                'formation',
        date_debut:          '',
        date_fin:            '',
        lieu:                '',
        participants_prevus: '',
        observations:        '',
    });

    const submit = e => { e.preventDefault(); post(route('activites.store')); };

    return (
        <AppLayout title="Nouvelle activité">
            <Head title="Nouvelle activité" />
            <div className="page-header">
                <div>
                    <Link href={route('activites.index')} className="btn-ghost mb-3 -ml-1">
                        <ArrowLeft size={15} /> Retour
                    </Link>
                    <h2 className="page-title">Nouvelle activité</h2>
                    <p className="page-subtitle">Enregistrez une activité liée à une convention active</p>
                </div>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={submit} className="card-glass p-6 space-y-5">

                    {/* Icône décorative */}
                    <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                        <div className="w-10 h-10 rounded-xl bg-srec-600/20 flex items-center justify-center">
                            <Activity size={20} className="text-srec-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-white">Informations de l'activité</p>
                            <p className="text-xs text-slate-500">Remplissez les champs requis</p>
                        </div>
                    </div>

                    <Field label="Convention associée" error={errors.convention_id} required>
                        <select className="input" value={data.convention_id} onChange={e => setData('convention_id', e.target.value)}>
                            <option value="">Sélectionner une convention...</option>
                            {conventions.map(c => (
                                <option key={c.id} value={c.id}>{c.reference} — {c.intitule}</option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Titre de l'activité" error={errors.titre} required>
                        <input type="text" className="input" placeholder="ex. Formation en gestion de projets..." value={data.titre} onChange={e => setData('titre', e.target.value)} />
                    </Field>

                    <div className="grid sm:grid-cols-2 gap-4">
                        <Field label="Type" error={errors.type} required>
                            <select className="input" value={data.type} onChange={e => setData('type', e.target.value)}>
                                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </Field>
                        <Field label="Lieu" error={errors.lieu}>
                            <input type="text" className="input" placeholder="ex. Conakry, Campus UGANC..." value={data.lieu} onChange={e => setData('lieu', e.target.value)} />
                        </Field>
                        <Field label="Date de début" error={errors.date_debut} required>
                            <input type="date" className="input" value={data.date_debut} onChange={e => setData('date_debut', e.target.value)} />
                        </Field>
                        <Field label="Date de fin" error={errors.date_fin}>
                            <input type="date" className="input" value={data.date_fin} onChange={e => setData('date_fin', e.target.value)} />
                        </Field>
                        <Field label="Participants prévus" error={errors.participants_prevus}>
                            <input type="number" className="input" min="0" placeholder="0" value={data.participants_prevus} onChange={e => setData('participants_prevus', e.target.value)} />
                        </Field>
                    </div>

                    <Field label="Description" error={errors.description}>
                        <textarea className="input resize-none" rows={3} placeholder="Décrivez l'activité..." value={data.description} onChange={e => setData('description', e.target.value)} />
                    </Field>

                    <Field label="Observations" error={errors.observations}>
                        <textarea className="input resize-none" rows={2} placeholder="Informations complémentaires..." value={data.observations} onChange={e => setData('observations', e.target.value)} />
                    </Field>

                    <div className="flex justify-end gap-3 pt-2">
                        <Link href={route('activites.index')} className="btn-secondary">Annuler</Link>
                        <button type="submit" disabled={processing} className="btn-primary">
                            <Save size={14} /> {processing ? 'Enregistrement...' : 'Créer l\'activité'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
