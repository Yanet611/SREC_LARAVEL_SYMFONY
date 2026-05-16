import { useRef, useState } from 'react';
import { useForm } from '@inertiajs/react';
import { X } from 'lucide-react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <section className={className}>
            <p className="text-sm text-slate-400 mb-6">
                Une fois votre compte supprimé, toutes ses ressources et données seront effacées de manière permanente.
                Veuillez télécharger toutes les données ou informations que vous souhaitez conserver avant de supprimer votre compte.
            </p>

            <button className="px-4 py-2 bg-red-500/20 text-red-400 text-sm font-medium rounded-lg hover:bg-red-500/30 transition-colors" onClick={confirmUserDeletion}>
                Supprimer le compte
            </button>

            {confirmingUserDeletion && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="card-glass w-full max-w-lg p-6 animate-slide-up border border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.15)]">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-lg font-semibold text-white">Êtes-vous sûr de vouloir supprimer votre compte ?</h3>
                            <button onClick={closeModal} className="text-slate-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <p className="text-sm text-slate-400 mb-6">
                            Une fois votre compte supprimé, toutes ses données seront effacées de manière permanente. 
                            Veuillez entrer votre mot de passe pour confirmer que vous souhaitez supprimer définitivement votre compte.
                        </p>

                        <form onSubmit={deleteUser} className="space-y-4">
                            <div className="form-group">
                                <label htmlFor="password_delete" className="label sr-only">Mot de passe</label>
                                <input
                                    id="password_delete"
                                    type="password"
                                    ref={passwordInput}
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="input focus:border-red-500 focus:ring-red-500/20"
                                    placeholder="Votre mot de passe..."
                                    autoFocus
                                />
                                {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password}</p>}
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button type="button" onClick={closeModal} className="btn-secondary">
                                    Annuler
                                </button>
                                <button type="submit" disabled={processing} className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-500 transition-colors disabled:opacity-50">
                                    {processing ? 'Suppression...' : 'Supprimer le compte'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </section>
    );
}
