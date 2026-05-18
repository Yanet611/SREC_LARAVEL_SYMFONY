import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

// ─── Particules flottantes magiques ───────────────────────────────────────
function FloatingParticles() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationId;
        let particles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.pulse = Math.random() * Math.PI * 2;
                this.pulseSpeed = Math.random() * 0.02 + 0.005;
                const colors = [
                    'rgba(59,130,246,', // blue
                    'rgba(251,191,36,', // gold
                    'rgba(147,197,253,', // light blue
                    'rgba(255,255,255,', // white
                ];
                this.color = colors[Math.floor(Math.random() * colors.length)];
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.pulse += this.pulseSpeed;
                if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
                if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
            }
            draw() {
                const o = this.opacity * (0.5 + 0.5 * Math.sin(this.pulse));
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color + o + ')';
                ctx.fill();
                // glow
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
                ctx.fillStyle = this.color + (o * 0.15) + ')';
                ctx.fill();
            }
        }

        for (let i = 0; i < 60; i++) particles.push(new Particle());

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => { p.update(); p.draw(); });

            // draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = `rgba(59,130,246,${0.06 * (1 - dist / 120)})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
            animationId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 z-0 pointer-events-none" />;
}

// ─── Orbes lumineuses animées ─────────────────────────────────────────────
function GlowOrbs() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full opacity-30"
                style={{
                    background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)',
                    animation: 'orbFloat1 12s ease-in-out infinite',
                }} />
            <div className="absolute -bottom-[15%] -right-[10%] w-[450px] h-[450px] rounded-full opacity-25"
                style={{
                    background: 'radial-gradient(circle, rgba(251,191,36,0.35) 0%, transparent 70%)',
                    animation: 'orbFloat2 15s ease-in-out infinite',
                }} />
            <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 70%)',
                    animation: 'orbFloat3 10s ease-in-out infinite',
                }} />
        </div>
    );
}

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [focusedField, setFocusedField] = useState(null);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(t);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center font-sans relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #030712 0%, #0a0f1e 30%, #0d1f3c 60%, #0a0f1e 100%)' }}>
            <Head title="Connexion - SREC UGANC" />

            {/* CSS Animations */}
            <style>{`
                @keyframes orbFloat1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -40px) scale(1.05); }
                    66% { transform: translate(-20px, 20px) scale(0.95); }
                }
                @keyframes orbFloat2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-40px, 30px) scale(1.08); }
                    66% { transform: translate(25px, -25px) scale(0.92); }
                }
                @keyframes orbFloat3 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(40px, -30px) scale(1.1); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                @keyframes borderGlow {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 0.8; }
                }
                @keyframes cardEntry {
                    from { opacity: 0; transform: translateY(30px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes logoSpin {
                    from { opacity: 0; transform: scale(0.5) rotate(-10deg); }
                    to { opacity: 1; transform: scale(1) rotate(0deg); }
                }
                @keyframes titleSlide {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes inputReveal {
                    from { opacity: 0; transform: translateX(-15px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                @keyframes buttonPulse {
                    0%, 100% { box-shadow: 0 0 20px rgba(37,99,235,0.3), 0 0 60px rgba(37,99,235,0.1); }
                    50% { box-shadow: 0 0 30px rgba(37,99,235,0.5), 0 0 80px rgba(37,99,235,0.2); }
                }
                @keyframes ringPulse {
                    0% { transform: scale(1); opacity: 0.15; }
                    50% { transform: scale(1.08); opacity: 0.25; }
                    100% { transform: scale(1); opacity: 0.15; }
                }
                .login-card {
                    animation: cardEntry 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .logo-anim {
                    animation: logoSpin 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;
                }
                .title-anim {
                    animation: titleSlide 0.5s ease-out 0.5s both;
                }
                .subtitle-anim {
                    animation: titleSlide 0.5s ease-out 0.65s both;
                }
                .input-anim-1 {
                    animation: inputReveal 0.5s ease-out 0.7s both;
                }
                .input-anim-2 {
                    animation: inputReveal 0.5s ease-out 0.85s both;
                }
                .remember-anim {
                    animation: inputReveal 0.5s ease-out 0.95s both;
                }
                .btn-anim {
                    animation: inputReveal 0.5s ease-out 1.05s both;
                }
            `}</style>

            {/* Background layers */}
            <GlowOrbs />
            <FloatingParticles />

            {/* Subtle grid */}
            <div className="absolute inset-0 z-0 opacity-[0.04]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }} />

            {/* Main Card */}
            <div className={`w-full max-w-[440px] relative z-10 px-5 ${mounted ? 'login-card' : 'opacity-0'}`}>

                {/* Outer glow ring */}
                <div className="absolute -inset-[1px] rounded-[2.2rem] z-0"
                    style={{
                        background: 'linear-gradient(135deg, rgba(37,99,235,0.3), rgba(251,191,36,0.15), rgba(139,92,246,0.2), rgba(37,99,235,0.1))',
                        animation: 'ringPulse 4s ease-in-out infinite',
                        filter: 'blur(1px)',
                    }} />

                {/* Card glass */}
                <div className="relative rounded-[2rem] overflow-hidden"
                    style={{
                        background: 'linear-gradient(145deg, rgba(15,23,42,0.85) 0%, rgba(10,15,30,0.92) 100%)',
                        backdropFilter: 'blur(40px) saturate(1.8)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 25px 80px -12px rgba(0,0,0,0.8), 0 0 40px rgba(37,99,235,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}>

                    {/* Top shimmer line */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] overflow-hidden">
                        <div className="h-full w-full"
                            style={{
                                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), rgba(251,191,36,0.3), rgba(255,255,255,0.2), transparent)',
                                animation: 'shimmer 4s ease-in-out infinite',
                            }} />
                    </div>

                    {/* Inner content */}
                    <div className="p-8 sm:p-10">
                        {/* Logo */}
                        <div className="flex flex-col items-center text-center mb-8">
                            <div className="logo-anim relative mb-5">
                                {/* Logo glow */}
                                <div className="absolute -inset-3 rounded-2xl opacity-40"
                                    style={{
                                        background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)',
                                        animation: 'ringPulse 3s ease-in-out infinite',
                                    }} />
                                <div className="w-[72px] h-[72px] rounded-2xl relative overflow-hidden"
                                    style={{
                                        background: 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(30,64,175,0.3))',
                                        border: '1px solid rgba(59,130,246,0.2)',
                                        boxShadow: '0 8px 32px rgba(37,99,235,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                                    }}>
                                    <img src="/images/srec-logo.png" alt="SREC Logo"
                                        className="w-full h-full object-cover p-1.5 relative z-10" />
                                </div>
                            </div>

                            <h1 className="title-anim text-[26px] font-bold text-white tracking-tight leading-tight">
                                SREC{' '}
                                <span style={{
                                    background: 'linear-gradient(135deg, #fbbf24, #f59e0b, #d97706)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>UGANC</span>
                            </h1>
                            <p className="subtitle-anim text-[13px] text-slate-400 mt-1.5 font-light tracking-wide">
                                Portail Administratif Sécurisé
                            </p>
                        </div>

                        {/* Status */}
                        {status && (
                            <div className="mb-6 p-3 rounded-xl flex items-center gap-2.5"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.06))',
                                    border: '1px solid rgba(16,185,129,0.2)',
                                }}>
                                <ShieldCheck size={15} className="text-emerald-400 flex-shrink-0" />
                                <span className="text-xs font-medium text-emerald-300">{status}</span>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={submit} className="space-y-5">
                            {/* Email */}
                            <div className="input-anim-1 space-y-2">
                                <label className="text-[13px] font-medium text-slate-300 ml-0.5 flex items-center gap-1.5">
                                    <Mail size={12} className="text-slate-500" />
                                    Adresse Email
                                </label>
                                <div className="relative group">
                                    <div className={`absolute -inset-[1px] rounded-xl transition-opacity duration-500 ${focusedField === 'email' ? 'opacity-100' : 'opacity-0'}`}
                                        style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.4), rgba(59,130,246,0.1), rgba(251,191,36,0.2))', filter: 'blur(1px)' }} />
                                    <input
                                        id="login-email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        onFocus={() => setFocusedField('email')}
                                        onBlur={() => setFocusedField(null)}
                                        className="relative w-full rounded-xl pl-4 pr-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300"
                                        style={{
                                            background: focusedField === 'email'
                                                ? 'rgba(15,23,42,0.9)'
                                                : 'rgba(15,23,42,0.6)',
                                            border: '1px solid',
                                            borderColor: focusedField === 'email'
                                                ? 'rgba(59,130,246,0.4)'
                                                : 'rgba(255,255,255,0.07)',
                                            boxShadow: focusedField === 'email'
                                                ? '0 0 20px rgba(37,99,235,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
                                                : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                                        }}
                                        placeholder="email@uganc.edu.gn"
                                        autoComplete="username"
                                        required
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-xs text-red-400 mt-1 ml-0.5 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-red-400" />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="input-anim-2 space-y-2">
                                <div className="flex items-center justify-between ml-0.5">
                                    <label className="text-[13px] font-medium text-slate-300 flex items-center gap-1.5">
                                        <Lock size={12} className="text-slate-500" />
                                        Mot de passe
                                    </label>
                                    {canResetPassword && (
                                        <Link href={route('password.request')}
                                            className="text-[11px] font-medium transition-all duration-300 hover:brightness-125"
                                            style={{
                                                background: 'linear-gradient(135deg, #60a5fa, #fbbf24)',
                                                WebkitBackgroundClip: 'text',
                                                WebkitTextFillColor: 'transparent',
                                            }}>
                                            Mot de passe oublié ?
                                        </Link>
                                    )}
                                </div>
                                <div className="relative group">
                                    <div className={`absolute -inset-[1px] rounded-xl transition-opacity duration-500 ${focusedField === 'password' ? 'opacity-100' : 'opacity-0'}`}
                                        style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.4), rgba(59,130,246,0.1), rgba(251,191,36,0.2))', filter: 'blur(1px)' }} />
                                    <input
                                        id="login-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        onFocus={() => setFocusedField('password')}
                                        onBlur={() => setFocusedField(null)}
                                        className="relative w-full rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 outline-none transition-all duration-300"
                                        style={{
                                            background: focusedField === 'password'
                                                ? 'rgba(15,23,42,0.9)'
                                                : 'rgba(15,23,42,0.6)',
                                            border: '1px solid',
                                            borderColor: focusedField === 'password'
                                                ? 'rgba(59,130,246,0.4)'
                                                : 'rgba(255,255,255,0.07)',
                                            boxShadow: focusedField === 'password'
                                                ? '0 0 20px rgba(37,99,235,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
                                                : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                                        }}
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        required
                                    />
                                    <button type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors z-10 p-1">
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-red-400 mt-1 ml-0.5 flex items-center gap-1">
                                        <span className="w-1 h-1 rounded-full bg-red-400" />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            {/* Remember */}
                            <div className="remember-anim flex items-center ml-0.5 pt-1">
                                <label className="flex items-center gap-2.5 cursor-pointer group select-none">
                                    <div className="relative">
                                        <input
                                            id="login-remember"
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="sr-only peer"
                                        />
                                        <div className="w-[18px] h-[18px] rounded-md border transition-all duration-300 flex items-center justify-center
                                            peer-checked:border-blue-500 peer-checked:bg-blue-500/20"
                                            style={{ borderColor: data.remember ? 'rgba(59,130,246,0.6)' : 'rgba(255,255,255,0.15)', background: data.remember ? 'rgba(59,130,246,0.15)' : 'transparent' }}>
                                            {data.remember && (
                                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                    <path d="M1 4L3.5 6.5L9 1" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[13px] text-slate-400 group-hover:text-slate-200 transition-colors">
                                        Mémoriser ma session
                                    </span>
                                </label>
                            </div>

                            {/* Submit */}
                            <div className="btn-anim pt-2">
                                <button
                                    id="login-submit"
                                    type="submit"
                                    disabled={processing}
                                    className="w-full relative py-3.5 px-6 rounded-xl font-semibold text-[14px] text-white overflow-hidden group transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{
                                        background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #1d4ed8 100%)',
                                        boxShadow: '0 0 20px rgba(37,99,235,0.3), 0 4px 15px rgba(37,99,235,0.2), inset 0 1px 0 rgba(255,255,255,0.15)',
                                        animation: !processing ? 'buttonPulse 3s ease-in-out infinite' : 'none',
                                    }}>
                                    {/* Hover sweep */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 50%, #2563eb 100%)' }} />
                                    {/* Shimmer */}
                                    <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-100">
                                        <div className="absolute inset-0"
                                            style={{
                                                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
                                                animation: 'shimmer 2s ease-in-out infinite',
                                            }} />
                                    </div>
                                    <span className="relative z-10 flex items-center justify-center gap-2.5">
                                        {processing ? (
                                            <>
                                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                </svg>
                                                Connexion en cours...
                                            </>
                                        ) : (
                                            <>
                                                Se connecter
                                                <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-300" />
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Bottom gradient line */}
                    <div className="h-[2px]"
                        style={{ background: 'linear-gradient(90deg, transparent, rgba(37,99,235,0.3), rgba(251,191,36,0.2), rgba(139,92,246,0.2), transparent)' }} />
                </div>

                {/* Footer */}
                <div className="text-center mt-8 space-y-1">
                    <p className="text-[11px] text-slate-500 font-medium tracking-wider uppercase">
                        © {new Date().getFullYear()} Université Gamal Abdel Nasser de Conakry
                    </p>
                    <p className="text-[10px] text-slate-600 tracking-wide">
                        Service des Relations Extérieures et de la Coopération
                    </p>
                </div>
            </div>
        </div>
    );
}
