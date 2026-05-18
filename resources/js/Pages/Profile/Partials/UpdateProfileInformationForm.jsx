import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            avatar: null,
            _method: 'patch',
        });

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'), { preserveScroll: true, forceFormData: true });
    };

    return (
        <section className={className}>
            <p className="text-sm text-slate-400 mb-6">
                Mettez à jour les informations de votre profil et votre adresse e-mail.
            </p>

            <form onSubmit={submit} className="space-y-4" encType="multipart/form-data">
                <div className="flex items-center gap-6 mb-6">
                    <div className="relative group">
                        <div className="w-20 h-20 rounded-full bg-slate-800 p-0.5 border border-white/10 group-hover:border-srec-400/50 transition-colors shadow-lg overflow-hidden">
                            {data.avatar ? (
                                <img src={URL.createObjectURL(data.avatar)} className="w-full h-full rounded-full object-cover" alt="Preview" />
                            ) : (
                                <img src={user.avatar_url} className="w-full h-full rounded-full object-cover" alt={user.name} />
                            )}
                        </div>
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity text-xs font-medium">
                            Modifier
                            <input type="file" className="hidden" accept="image/*" onChange={e => setData('avatar', e.target.files[0])} />
                        </label>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-white">Photo de profil</h4>
                        <p className="text-xs text-slate-400 mt-1">Cliquez sur l'image pour la modifier. JPG, PNG (Max. 2MB)</p>
                        {errors.avatar && <p className="text-xs text-red-400 mt-1">{errors.avatar}</p>}
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="name" className="label">Nom complet</label>
                    <input
                        id="name"
                        className="input"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        autoComplete="name"
                    />
                    {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="email" className="label">Adresse Email</label>
                    <input
                        id="email"
                        type="email"
                        className="input"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="username"
                    />
                    {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                        <p className="text-sm text-amber-200/80">
                            Votre adresse email n'est pas vérifiée.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="ml-2 font-medium text-amber-400 hover:underline focus:outline-none"
                            >
                                Cliquez ici pour renvoyer le lien.
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-emerald-400">
                                Un nouveau lien de vérification a été envoyé à votre adresse e-mail.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 mt-6">
                    <button type="submit" className="btn-primary" disabled={processing}>
                        Enregistrer
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-y-1"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <p className="text-sm text-emerald-400 font-medium">Sauvegardé.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
