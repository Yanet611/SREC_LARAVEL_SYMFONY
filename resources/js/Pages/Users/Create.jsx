import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, UserPlus } from 'lucide-react';

const ROLE_LABELS = {
    admin:       'Administrateur système',
    directrice:  'Directrice SREC',
    recteur:     'Recteur',
    secretariat: 'Secrétariat',
};

const Field = ({ label, error, required, hint, children }) => (
    <div className="form-group">
        <label className="label">
            {label} {required && <span className="text-red-400">*</span>}
        </label>
        {children}
        {hint && !error && <p className="text-xs text-slate-600 mt-1">{hint}</p>}
        {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
);

export default function Create({ roles }) {
    const { data, setData, post, processing, errors } = useForm({
        name:                  '',
        email:                 '',
        password:              '',
        password_confirmation: '',
        telephone:             '',
        fonction:              '',
        service:               '',
        role:                  roles[0] ?? 'secretariat',
    });

    const submit = e => { e.preventDefault(); post(route('users.store')); };

    return (
        <AppLayout title="Nouveau compte">
            <Head title="Créer un compte utilisateur" />
            <div className="page-header">
                <div>
                    <Link href={route('users.index')} className="btn-ghost mb-3 -ml-1">
                        <ArrowLeft size={15} /> Retour
                    </Link>
                    <h2 className="page-title">Nouveau compte</h2>
                    <p className="page-subtitle">Créez un compte et assignez un rôle d'accès</p>
                </div>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={submit} className="space-y-6">

                    {/* Identité */}
                    <div className="card-glass p-6 space-y-5">
                        <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-srec-600/20 flex items-center justify-center">
                                <UserPlus size={20} className="text-srec-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Identité</p>
                                <p className="text-xs text-slate-500">Informations de l'utilisateur</p>
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <Field label="Nom complet" error={errors.name} required>
                                    <input type="text" className="input" placeholder="Prénom NOM" value={data.name} onChange={e => setData('name', e.target.value)} />
                                </Field>
                            </div>
                            <Field label="Adresse email" error={errors.email} required>
                                <input type="email" className="input" placeholder="email@uganc.edu.gn" value={data.email} onChange={e => setData('email', e.target.value)} />
                            </Field>
                            <Field label="Téléphone" error={errors.telephone}>
                                <input type="text" className="input" placeholder="+224 XXX XXX XXX" value={data.telephone} onChange={e => setData('telephone', e.target.value)} />
                            </Field>
                            <Field label="Fonction / Titre" error={errors.fonction}>
                                <input type="text" className="input" placeholder="Directrice, Recteur..." value={data.fonction} onChange={e => setData('fonction', e.target.value)} />
                            </Field>
                            <Field label="Service / Département" error={errors.service}>
                                <input type="text" className="input" placeholder="SREC, Rectorat..." value={data.service} onChange={e => setData('service', e.target.value)} />
                            </Field>
                        </div>
                    </div>

                    {/* Rôle & Accès */}
                    <div className="card-glass p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-300 border-b border-white/5 pb-2">Rôle & accès</h3>
                        <Field label="Rôle" error={errors.role} required hint="Le rôle détermine les permissions et le dashboard par défaut.">
                            <select className="input" value={data.role} onChange={e => setData('role', e.target.value)}>
                                {roles.map(r => <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>)}
                            </select>
                        </Field>
                    </div>

                    {/* Mot de passe */}
                    <div className="card-glass p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-300 border-b border-white/5 pb-2">Mot de passe</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Mot de passe" error={errors.password} required hint="8 caractères minimum">
                                <input type="password" className="input" placeholder="••••••••" value={data.password} onChange={e => setData('password', e.target.value)} />
                            </Field>
                            <Field label="Confirmer le mot de passe" error={errors.password_confirmation} required>
                                <input type="password" className="input" placeholder="••••••••" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />
                            </Field>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href={route('users.index')} className="btn-secondary">Annuler</Link>
                        <button type="submit" disabled={processing} className="btn-primary">
                            <Save size={14} /> {processing ? 'Création...' : 'Créer le compte'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
