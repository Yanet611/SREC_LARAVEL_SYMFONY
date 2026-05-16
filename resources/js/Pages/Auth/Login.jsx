import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, ArrowRight, ShieldCheck, Globe, GraduationCap, Handshake } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-surface-950 flex font-sans">
            <Head title="Connexion - SREC UGANC" />

            {/* Left Column - Information & Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-surface-900 border-r border-white/5 overflow-hidden flex-col justify-between p-12">
                {/* Background Ambient Effects */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-srec-600/20 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none" />
                
                {/* Content */}
                <div className="relative z-10 flex flex-col h-full">
                    <div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-srec-600 to-srec-400 p-0.5 shadow-lg shadow-srec-600/20">
                                <div className="w-full h-full bg-surface-900 rounded-[10px] flex items-center justify-center">
                                    <Globe size={24} className="text-srec-400" />
                                </div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-white leading-none">SREC</h1>
                                <span className="text-srec-400 font-semibold tracking-widest uppercase text-[10px]">UGANC</span>
                            </div>
                        </div>

                        <h2 className="text-4xl font-bold text-white leading-tight mb-6 mt-16">
                            Gérez vos relations <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-srec-400 to-amber-200">
                                extérieures avec excellence.
                            </span>
                        </h2>

                        <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-lg">
                            Le Service des Relations Extérieures et de la Coopération (SREC) est la vitrine internationale de l'Université Gamal Abdel Nasser de Conakry. Nous pilotons les partenariats stratégiques, la mobilité académique et le rayonnement scientifique.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-1">
                                    <Handshake size={20} className="text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium mb-1">Partenariats Stratégiques</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">Suivi rigoureux des conventions, accords-cadres et mémorandums avec nos partenaires mondiaux.</p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 mt-1">
                                    <GraduationCap size={20} className="text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-medium mb-1">Mobilité Académique</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">Gestion des flux de chercheurs, d'enseignants et d'étudiants pour favoriser l'échange de connaissances.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto">
                        <p className="text-xs text-slate-600 font-medium">
                            &copy; {new Date().getFullYear()} Université Gamal Abdel Nasser de Conakry. Tous droits réservés.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Column - Login Form */}
            <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-6 sm:px-8 lg:px-16 xl:px-24 relative overflow-hidden">
                {/* Ambient glow for mobile */}
                <div className="absolute top-0 right-0 w-full h-[500px] bg-srec-600/10 rounded-full blur-[120px] pointer-events-none lg:hidden" />
                
                <div className="relative z-10 w-full max-w-[400px] mx-auto">
                    {/* Mobile Branding (hidden on desktop) */}
                    <div className="lg:hidden flex flex-col items-center mb-10">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-srec-600 to-srec-400 p-0.5 shadow-lg shadow-srec-600/20 mb-4">
                            <div className="w-full h-full bg-surface-900 rounded-[14px] flex items-center justify-center">
                                <ShieldCheck size={32} className="text-srec-400" />
                            </div>
                        </div>
                        <h2 className="text-center text-3xl font-bold tracking-tight text-white mb-2">
                            SREC <span className="gradient-text-gold">UGANC</span>
                        </h2>
                    </div>

                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">Connexion</h3>
                        <p className="text-sm text-slate-400">Entrez vos identifiants pour accéder au portail administratif sécurisé.</p>
                    </div>

                    {status && (
                        <div className="mb-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-sm font-medium text-emerald-400 text-center">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div className="form-group">
                            <label className="label">Adresse Email</label>
                            <div className="relative mt-1">
                                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className="input pl-10"
                                    placeholder="exemple@srec-uganc.gn"
                                    autoComplete="username"
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-400 mt-1.5">{errors.email}</p>}
                        </div>

                        <div className="form-group">
                            <div className="flex items-center justify-between">
                                <label className="label mb-0">Mot de passe</label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-xs font-medium text-srec-400 hover:text-srec-300 transition-colors">
                                        Mot de passe oublié ?
                                    </Link>
                                )}
                            </div>
                            <div className="relative mt-1">
                                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    className="input pl-10"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-400 mt-1.5">{errors.password}</p>}
                        </div>

                        <div className="flex items-center">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                    className="w-4 h-4 rounded border-white/10 bg-surface-800 text-srec-500 focus:ring-srec-500/30 focus:ring-offset-0"
                                />
                                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Se souvenir de moi</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full btn-primary justify-center py-2.5 text-sm group mt-4"
                        >
                            {processing ? 'Connexion en cours...' : (
                                <>
                                    Se connecter 
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
