import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, UserCog } from 'lucide-react';

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

export default function Edit({ user, roles }) {
    const primaryRole = user.roles?.[0]?.name ?? (roles[0] ?? '');

    const { data, setData, post, processing, errors } = useForm({
        name:                  user.name ?? '',
        email:                 user.email ?? '',
        password:              '',
        password_confirmation: '',
        telephone:             user.telephone ?? '',
        fonction:              user.fonction ?? '',
        service:               user.service ?? '',
        role:                  primaryRole,
        actif:                 user.actif ?? true,
        avatar:                null,
        _method:               'put',
    });

    const submit = e => { e.preventDefault(); post(route('users.update', user.id), { forceFormData: true }); };

    return (
        <AppLayout title={`Modifier — ${user.name}`}>
            <Head title={`Modifier ${user.name}`} />
            <div className="page-header">
                <div>
                    <Link href={route('users.index')} className="btn-ghost mb-3 -ml-1">
                        <ArrowLeft size={15} /> Retour
                    </Link>
                    <h2 className="page-title">Modifier le compte</h2>
                    <p className="page-subtitle">{user.name} · {user.email}</p>
                </div>
            </div>

            <div className="max-w-2xl">
                <form onSubmit={submit} className="space-y-6">

                    {/* Identité */}
                    <div className="card-glass p-6 space-y-5">
                        <div className="flex items-center gap-3 pb-2 border-b border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-srec-600/20 flex items-center justify-center">
                                <UserCog size={20} className="text-srec-400" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Identité</p>
                                <p className="text-xs text-slate-500">Modifiez les informations du compte</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pb-2">
                            <div className="relative group">
                                <div className="w-16 h-16 rounded-full bg-slate-800 p-0.5 border border-white/10 group-hover:border-srec-400/50 transition-colors shadow-lg overflow-hidden flex items-center justify-center">
                                    {data.avatar ? (
                                        <img src={URL.createObjectURL(data.avatar)} className="w-full h-full rounded-full object-cover" alt="Preview" />
                                    ) : (
                                        <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" alt={user.name} />
                                    )}
                                </div>
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity text-[10px] font-medium text-center leading-tight p-1">
                                    Modifier
                                    <input type="file" className="hidden" accept="image/*" onChange={e => setData('avatar', e.target.files[0])} />
                                </label>
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-slate-300">Photo de profil (Optionnel)</p>
                                <p className="text-xs text-slate-500">Format JPG ou PNG, max 2Mo.</p>
                                {errors.avatar && <p className="text-xs text-red-400 mt-1">{errors.avatar}</p>}
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <Field label="Nom complet" error={errors.name} required>
                                    <input type="text" className="input" value={data.name} onChange={e => setData('name', e.target.value)} />
                                </Field>
                            </div>
                            <Field label="Adresse email" error={errors.email} required>
                                <input type="email" className="input" value={data.email} onChange={e => setData('email', e.target.value)} />
                            </Field>
                            <Field label="Téléphone" error={errors.telephone}>
                                <input type="text" className="input" value={data.telephone} onChange={e => setData('telephone', e.target.value)} />
                            </Field>
                            <Field label="Fonction / Titre" error={errors.fonction}>
                                <input type="text" className="input" value={data.fonction} onChange={e => setData('fonction', e.target.value)} />
                            </Field>
                            <Field label="Service" error={errors.service}>
                                <input type="text" className="input" value={data.service} onChange={e => setData('service', e.target.value)} />
                            </Field>
                        </div>
                    </div>

                    {/* Rôle & Statut */}
                    <div className="card-glass p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-300 border-b border-white/5 pb-2">Rôle & statut</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Rôle" error={errors.role} required>
                                <select className="input" value={data.role} onChange={e => setData('role', e.target.value)}>
                                    {roles.map(r => <option key={r} value={r}>{ROLE_LABELS[r] ?? r}</option>)}
                                </select>
                            </Field>
                            <Field label="Statut du compte" error={errors.actif}>
                                <select className="input" value={data.actif ? '1' : '0'} onChange={e => setData('actif', e.target.value === '1')}>
                                    <option value="1">✓ Actif</option>
                                    <option value="0">✗ Inactif (bloqué)</option>
                                </select>
                            </Field>
                        </div>
                    </div>

                    {/* Nouveau mot de passe (optionnel) */}
                    <div className="card-glass p-6 space-y-4">
                        <h3 className="text-sm font-semibold text-slate-300 border-b border-white/5 pb-2">Changer le mot de passe <span className="text-slate-600 font-normal">(optionnel)</span></h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <Field label="Nouveau mot de passe" error={errors.password} hint="Laissez vide pour conserver l'actuel">
                                <input type="password" className="input" placeholder="••••••••" value={data.password} onChange={e => setData('password', e.target.value)} />
                            </Field>
                            <Field label="Confirmer" error={errors.password_confirmation}>
                                <input type="password" className="input" placeholder="••••••••" value={data.password_confirmation} onChange={e => setData('password_confirmation', e.target.value)} />
                            </Field>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href={route('users.index')} className="btn-secondary">Annuler</Link>
                        <button type="submit" disabled={processing} className="btn-primary">
                            <Save size={14} /> {processing ? 'Enregistrement...' : 'Sauvegarder'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
