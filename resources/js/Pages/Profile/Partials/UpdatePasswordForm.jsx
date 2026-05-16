import { useRef } from 'react';
import { useForm } from '@inertiajs/react';
import { Transition } from '@headlessui/react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const { data, setData, errors, put, reset, processing, recentlySuccessful } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();
        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }
                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <p className="text-sm text-slate-400 mb-6">
                Assurez-vous que votre compte utilise un mot de passe long et aléatoire pour rester sécurisé.
            </p>

            <form onSubmit={updatePassword} className="space-y-4">
                <div className="form-group">
                    <label htmlFor="current_password" className="label">Mot de passe actuel</label>
                    <input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type="password"
                        className="input"
                        autoComplete="current-password"
                    />
                    {errors.current_password && <p className="text-xs text-red-400 mt-1">{errors.current_password}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="password" className="label">Nouveau mot de passe</label>
                    <input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type="password"
                        className="input"
                        autoComplete="new-password"
                    />
                    {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="password_confirmation" className="label">Confirmer le mot de passe</label>
                    <input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type="password"
                        className="input"
                        autoComplete="new-password"
                    />
                    {errors.password_confirmation && <p className="text-xs text-red-400 mt-1">{errors.password_confirmation}</p>}
                </div>

                <div className="flex items-center gap-4 mt-6">
                    <button type="submit" className="btn-primary" disabled={processing}>
                        Mettre à jour le mot de passe
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-y-1"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0 translate-y-1"
                    >
                        <p className="text-sm text-emerald-400 font-medium">Mot de passe mis à jour.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
