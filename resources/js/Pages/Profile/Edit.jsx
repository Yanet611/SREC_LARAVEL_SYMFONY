import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { User, Shield, Key } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AppLayout title="Mon Profil">
            <Head title="Profil" />

            <div className="page-header">
                <div>
                    <h2 className="page-title flex items-center gap-2">
                        <User size={20} className="text-srec-400" /> Mon Profil
                    </h2>
                    <p className="page-subtitle">Gérez vos informations personnelles et vos paramètres de sécurité</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 max-w-6xl">
                <div className="space-y-6">
                    <div className="card-glass p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center">
                                <User size={20} />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Informations Personnelles</h3>
                        </div>
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="card-glass p-6">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-purple-600/10 text-purple-400 flex items-center justify-center">
                                <Key size={20} />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Sécurité du compte</h3>
                        </div>
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="card-glass p-6 border-red-500/20">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/10">
                            <div className="w-10 h-10 rounded-xl bg-red-600/10 text-red-400 flex items-center justify-center">
                                <Shield size={20} />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Zone Dangereuse</h3>
                        </div>
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
