// Badge de statut coloré
export function StatusBadge({ statut, color, label }) {
    const colorMap = {
        blue:   'badge-blue',
        green:  'badge-green',
        red:    'badge-red',
        orange: 'badge-orange',
        yellow: 'badge-yellow',
        purple: 'badge-purple',
        gray:   'badge-gray',
        slate:  'badge-slate',
    };

    const dotColor = {
        blue:   'bg-blue-400',
        green:  'bg-emerald-400',
        red:    'bg-red-400',
        orange: 'bg-orange-400',
        yellow: 'bg-amber-400',
        purple: 'bg-purple-400',
        gray:   'bg-slate-400',
        slate:  'bg-slate-500',
    };

    return (
        <span className={`badge ${colorMap[color] ?? 'badge-gray'}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${dotColor[color] ?? 'bg-slate-400'}`} />
            {label ?? statut}
        </span>
    );
}

// Card de KPI
export function KpiCard({ title, value, subtitle, icon: Icon, color = 'blue', trend }) {
    const colorStyles = {
        blue:   { bg: 'from-srec-600/20 to-srec-900/20', border: 'border-srec-500/30', icon: 'text-srec-400', iconBg: 'bg-srec-600/20' },
        green:  { bg: 'from-emerald-600/20 to-emerald-900/20', border: 'border-emerald-500/30', icon: 'text-emerald-400', iconBg: 'bg-emerald-600/20' },
        amber:  { bg: 'from-amber-600/20 to-amber-900/20', border: 'border-amber-500/30', icon: 'text-amber-400', iconBg: 'bg-amber-600/20' },
        purple: { bg: 'from-purple-600/20 to-purple-900/20', border: 'border-purple-500/30', icon: 'text-purple-400', iconBg: 'bg-purple-600/20' },
        red:    { bg: 'from-red-600/20 to-red-900/20', border: 'border-red-500/30', icon: 'text-red-400', iconBg: 'bg-red-600/20' },
    };
    const s = colorStyles[color] ?? colorStyles.blue;

    return (
        <div className={`kpi-card bg-gradient-to-br ${s.bg} border ${s.border}`}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
                    <p className="text-3xl font-bold text-white mt-2">{value}</p>
                    {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
                </div>
                <div className={`w-11 h-11 rounded-xl ${s.iconBg} flex items-center justify-center`}>
                    <Icon size={22} className={s.icon} />
                </div>
            </div>
            {trend !== undefined && (
                <div className="flex items-center gap-1 text-xs">
                    <span className={trend >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
                    </span>
                    <span className="text-slate-600">vs mois dernier</span>
                </div>
            )}
        </div>
    );
}

// Timeline d'historique
export function Timeline({ items }) {
    const actionLabel = (action) => ({
        created:       'Créé',
        updated:       'Modifié',
        statut_change: 'Statut changé',
        archived:      'Archivé',
    }[action] ?? action);

    const actionColor = (action) => ({
        created:       'bg-srec-600 text-white',
        updated:       'bg-slate-600 text-white',
        statut_change: 'bg-amber-600 text-white',
        archived:      'bg-slate-700 text-slate-300',
    }[action] ?? 'bg-slate-600 text-white');

    if (!items?.length) {
        return <p className="text-slate-500 text-sm text-center py-4">Aucun historique disponible.</p>;
    }

    return (
        <div className="relative">
            {items.map((item, i) => (
                <div key={item.id ?? i} className="timeline-item">
                    <div className={`timeline-dot ${actionColor(item.action)}`}>
                        <span className="text-[9px] font-bold">{actionLabel(item.action)[0]}</span>
                    </div>
                    <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-white">{actionLabel(item.action)}</span>
                            {item.ancien_statut && item.nouveau_statut && (
                                <span className="text-xs text-slate-500">
                                    {item.ancien_statut} → <span className="text-slate-300">{item.nouveau_statut}</span>
                                </span>
                            )}
                        </div>
                        {item.commentaire && (
                            <p className="text-xs text-slate-400 italic mb-1">"{item.commentaire}"</p>
                        )}
                        <div className="flex items-center gap-2 text-[11px] text-slate-600">
                            <span>{item.user}</span>
                            <span>•</span>
                            <span>{item.date}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Table vide
export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <Icon size={32} className="text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-300">{title}</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-xs">{description}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

// Modal simple
export function Modal({ open, onClose, title, children, size = 'md' }) {
    if (!open) return null;

    const sizeClass = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    }[size] ?? 'max-w-lg';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className={`relative w-full ${sizeClass} card-glass-lg animate-slide-up p-6`}>
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-white">{title}</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

// Pagination wrapper Inertia
export function Pagination({ links }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex items-center gap-1 mt-4 justify-center">
            {links.map((link, i) => (
                link.url ? (
                    <a
                        key={i}
                        href={link.url}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            link.active
                                ? 'bg-srec-600 text-white'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                    />
                ) : (
                    <span
                        key={i}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-700"
                    />
                )
            ))}
        </div>
    );
}
