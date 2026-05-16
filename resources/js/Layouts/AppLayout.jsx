import { useState, useEffect, useCallback } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard, Mail, Handshake, FileText, Users,
    Activity, Plane, Archive, BarChart3, Bell, Settings,
    ChevronLeft, Menu, LogOut, User, X, Shield, Calendar,
    AlertCircle, CheckCircle2, Info, Zap, CheckCheck
} from 'lucide-react';

const navItems = [
    {
        section: 'Principal',
        items: [
            { label: 'Tableau de bord', icon: LayoutDashboard, route: 'dashboard', roles: ['admin', 'directrice', 'recteur', 'secretariat'] },
        ]
    },
    {
        section: 'Gestion',
        items: [
            { label: 'Courriers',     icon: Mail,       route: 'courriers.index',   roles: ['admin', 'directrice', 'recteur', 'secretariat'] },
            { label: 'Partenaires',   icon: Handshake,  route: 'partenaires.index', roles: ['admin', 'directrice', 'recteur'] },
            { label: 'Conventions',   icon: FileText,   route: 'conventions.index', roles: ['admin', 'directrice', 'recteur'] },
            { label: 'Activités',     icon: Activity,   route: 'activites.index',   roles: ['admin', 'directrice'] },
            { label: 'Mobilités',     icon: Plane,      route: 'mobilites.index',   roles: ['admin', 'directrice', 'recteur'] },
            { label: 'Rendez-vous',   icon: Calendar,   route: 'rendez-vous.index', roles: ['admin', 'directrice'] },
        ]
    },
    {
        section: 'Analyse',
        items: [
            { label: 'Statistiques', icon: BarChart3, route: 'statistiques.index', roles: ['admin', 'directrice'] },
            { label: 'Archives',     icon: Archive,   route: 'archives.index',     roles: ['admin', 'directrice'] },
        ]
    },
    {
        section: 'Administration',
        items: [
            { label: 'Utilisateurs', icon: Users, route: 'users.index', roles: ['admin'] },
        ]
    },
];

function StatusDot({ active }) {
    return (
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]' : 'bg-slate-600'}`} />
    );
}

function NavSection({ section, items, collapsed, currentRoute, userRole }) {
    const visible = items.filter(item => item.roles.includes(userRole));
    if (!visible.length) return null;

    return (
        <div className="mb-4">
            {!collapsed && (
                <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest px-4 mb-2">
                    {section}
                </p>
            )}
            <div className="space-y-0.5 px-2">
                {visible.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentRoute === item.route || currentRoute?.startsWith(item.route.replace('.index', ''));
                    return (
                        <Link
                            key={item.route}
                            href={route(item.route)}
                            className={`sidebar-item ${isActive ? 'active' : ''} ${collapsed ? 'justify-center' : ''}`}
                            title={collapsed ? item.label : undefined}
                        >
                            <Icon size={18} className="flex-shrink-0" />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

export default function AppLayout({ children, title }) {
    const { auth, ziggy } = usePage().props;
    const user = auth?.user;
    const userRole = user?.roles?.[0]?.name ?? 'secretariat';

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [notifCount, setNotifCount] = useState(0);
    const [notifs, setNotifs] = useState([]);
    const [notifOpen, setNotifOpen] = useState(false);

    const currentRoute = ziggy?.location
        ? Object.entries(ziggy?.namedRoutes || {}).find(([name, r]) =>
            ziggy.location.includes(r.uri?.split('{')[0]?.replace(/\/$/, '')))?.[0]
        : '';

    // Polling notifications toutes les 60s
    const fetchNotifs = useCallback(async () => {
        try {
            const res = await fetch(route('notifications.index'), {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                }
            });
            if (res.ok) {
                const data = await res.json();
                setNotifCount(data.non_lues ?? 0);
                setNotifs(data.notifications ?? []);
            }
        } catch {}
    }, []);

    useEffect(() => {
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifs]);

    const marquerLue = async (notifId, url) => {
        try {
            await fetch(route('notifications.lue', notifId), {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content,
                }
            });
            await fetchNotifs();
        } catch {}
        if (url) router.visit(url);
        else setNotifOpen(false);
    };

    const marquerToutesLues = async () => {
        try {
            await fetch(route('notifications.tout-lire'), {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]')?.content,
                }
            });
            await fetchNotifs();
        } catch {}
    };

    const tempsRelatif = (dateStr) => {
        const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
        if (diff < 60)   return 'À l\'instant';
        if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
        if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
        return `Il y a ${Math.floor(diff / 86400)}j`;
    };

    const roleLabel = {
        admin: 'Administrateur', directrice: 'Directrice SREC',
        recteur: 'Recteur', secretariat: 'Secrétariat'
    }[userRole] ?? 'Utilisateur';

    const roleColor = {
        admin: 'text-amber-400', directrice: 'text-blue-400',
        recteur: 'text-purple-400', secretariat: 'text-emerald-400'
    }[userRole] ?? 'text-slate-400';

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/5 ${collapsed ? 'justify-center' : ''}`}>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-srec-600 to-srec-800 flex items-center justify-center flex-shrink-0 shadow-glow-blue">
                    <Shield size={18} className="text-white" />
                </div>
                {!collapsed && (
                    <div>
                        <p className="text-sm font-bold text-white leading-tight">SREC</p>
                        <p className="text-[10px] text-slate-500 leading-tight">UGANC</p>
                    </div>
                )}
                {!collapsed && (
                    <button
                        onClick={() => setCollapsed(true)}
                        className="ml-auto text-slate-600 hover:text-slate-300 transition-colors"
                    >
                        <ChevronLeft size={16} />
                    </button>
                )}
            </div>

            {/* User */}
            <div className={`px-4 py-4 border-b border-white/5 ${collapsed ? 'flex justify-center' : ''}`}>
                {collapsed ? (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-srec-600 to-blue-800 flex items-center justify-center text-xs font-bold text-white">
                        {user?.name?.[0] ?? 'U'}
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-srec-600 to-blue-800 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                            {user?.name?.[0] ?? 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                            <p className={`text-[11px] font-medium ${roleColor}`}>{roleLabel}</p>
                        </div>
                        <StatusDot active={true} />
                    </div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
                {navItems.map((section) => (
                    <NavSection
                        key={section.section}
                        {...section}
                        collapsed={collapsed}
                        currentRoute={currentRoute}
                        userRole={userRole}
                    />
                ))}
            </nav>

            {/* Bottom actions */}
            <div className="border-t border-white/5 py-3 px-2 space-y-0.5">
                <Link href={route('profile.edit')} className="sidebar-item">
                    <User size={16} />
                    {!collapsed && <span>Profil</span>}
                </Link>
                <Link href={route('logout')} method="post" as="button" className="sidebar-item w-full text-left">
                    <LogOut size={16} className="text-red-400" />
                    {!collapsed && <span className="text-red-400">Déconnexion</span>}
                </Link>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-surface-900 bg-mesh-gradient">
            {/* Desktop Sidebar */}
            <aside className={`sidebar hidden lg:flex flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'} flex-shrink-0`}>
                {collapsed ? (
                    <div className="flex justify-center py-4 border-b border-white/5">
                        <button onClick={() => setCollapsed(false)} className="text-slate-500 hover:text-white transition-colors p-1">
                            <Menu size={18} />
                        </button>
                    </div>
                ) : null}
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="sidebar absolute left-0 top-0 bottom-0 w-64 flex flex-col z-10 animate-slide-in">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-14 border-b border-white/5 bg-surface-900/70 backdrop-blur-2xl flex items-center px-4 gap-4 flex-shrink-0 z-40 relative">
                    {/* Mobile menu toggle */}
                    <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setMobileOpen(true)}>
                        <Menu size={20} />
                    </button>

                    {/* Title */}
                    <h1 className="text-sm font-semibold text-white flex-1 truncate">{title}</h1>

                    {/* Right actions */}
                    <div className="flex items-center gap-2">
                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setNotifOpen(!notifOpen)}
                                className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                            >
                                <Bell size={17} />
                                {notifCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                        {notifCount > 9 ? '9+' : notifCount}
                                    </span>
                                )}
                            </button>

                            {notifOpen && (
                                <div className="absolute right-0 top-12 w-96 dropdown-glass z-[9999] overflow-hidden slide-up animate-in">
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
                                        <div className="flex items-center gap-2">
                                            <Bell size={14} className="text-srec-400" />
                                            <span className="text-sm font-bold text-white">Notifications</span>
                                            {notifCount > 0 && (
                                                <span className="badge badge-red">{notifCount} non lue{notifCount > 1 ? 's' : ''}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {notifCount > 0 && (
                                                <button
                                                    onClick={marquerToutesLues}
                                                    className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white px-2 py-1 rounded-lg hover:bg-white/10 transition-all"
                                                    title="Tout marquer comme lu"
                                                >
                                                    <CheckCheck size={13} /> Tout lire
                                                </button>
                                            )}
                                            <button onClick={() => setNotifOpen(false)} className="text-slate-500 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-all">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Liste */}
                                    <div className="max-h-[420px] overflow-y-auto divide-y divide-white/5 scrollbar-thin">
                                        {notifs.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center py-10 gap-3">
                                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                                                    <Bell size={20} className="text-slate-600" />
                                                </div>
                                                <p className="text-slate-500 text-sm">Aucune notification</p>
                                            </div>
                                        ) : notifs.map(n => {
                                            const typeConfig = {
                                                action_requise: { icon: AlertCircle, bg: 'bg-amber-500/15', border: 'border-l-amber-400', iconColor: 'text-amber-400' },
                                                alerte:         { icon: AlertCircle, bg: 'bg-red-500/15',   border: 'border-l-red-400',   iconColor: 'text-red-400' },
                                                succes:         { icon: CheckCircle2, bg: 'bg-green-500/15', border: 'border-l-green-400', iconColor: 'text-green-400' },
                                                info:           { icon: Info,         bg: 'bg-blue-500/10',  border: 'border-l-blue-400',  iconColor: 'text-blue-400' },
                                            }[n.type] ?? { icon: Info, bg: 'bg-white/5', border: 'border-l-slate-600', iconColor: 'text-slate-400' };
                                            const Icon = typeConfig.icon;

                                            return (
                                                <button
                                                    key={n.id}
                                                    onClick={() => marquerLue(n.id, n.lien)}
                                                    className={`w-full text-left px-4 py-3.5 hover:bg-white/8 transition-colors cursor-pointer border-l-2 ${typeConfig.border} ${!n.lue ? typeConfig.bg : ''}`}
                                                >
                                                    <div className="flex gap-3 items-start">
                                                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${typeConfig.bg}`}>
                                                            <Icon size={13} className={typeConfig.iconColor} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-xs font-semibold leading-snug ${!n.lue ? 'text-white' : 'text-slate-300'}`}>
                                                                {n.titre}
                                                            </p>
                                                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2 whitespace-pre-line">
                                                                {n.message}
                                                            </p>
                                                            <p className={`text-[10px] mt-1.5 font-medium ${!n.lue ? typeConfig.iconColor : 'text-slate-600'}`}>
                                                                {tempsRelatif(n.date_raw ?? n.date)}
                                                            </p>
                                                        </div>
                                                        {!n.lue && (
                                                            <div className="w-2 h-2 rounded-full bg-srec-400 flex-shrink-0 mt-1.5" />
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-srec-600 to-blue-800 flex items-center justify-center text-xs font-bold text-white">
                            {user?.name?.[0] ?? 'U'}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6 relative z-0">
                    <div className="max-w-screen-xl mx-auto animate-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
