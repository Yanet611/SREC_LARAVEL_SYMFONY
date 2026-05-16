import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { Mail, Building2, Plane, Activity, BarChart3, TrendingUp, Archive as ArchiveIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

export default function Index({ kpis, charts }) {
    const KpiCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
        <div className="card-glass p-6 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl ${bgClass} flex items-center justify-center flex-shrink-0`}>
                <Icon size={24} className={colorClass} />
            </div>
            <div>
                <p className="text-sm font-medium text-slate-400">{title}</p>
                <p className="text-3xl font-bold text-white mt-1">{value}</p>
            </div>
        </div>
    );

    return (
        <AppLayout title="Statistiques">
            <Head title="Tableau de bord analytique" />
            
            <div className="page-header">
                <div>
                    <h2 className="page-title flex items-center gap-2"><BarChart3 size={20} className="text-srec-400" /> Analytique globale</h2>
                    <p className="page-subtitle">Vue d'ensemble des performances du SREC</p>
                </div>
            </div>

            {/* KPIs */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <KpiCard title="Total Courriers" value={kpis.totalCourriers} icon={Mail} colorClass="text-blue-400" bgClass="bg-blue-600/10" />
                <KpiCard title="Conventions Actives" value={kpis.conventionsActives} icon={Building2} colorClass="text-purple-400" bgClass="bg-purple-600/10" />
                <KpiCard title="Mobilités en cours" value={kpis.mobilitesEnCours} icon={Plane} colorClass="text-emerald-400" bgClass="bg-emerald-600/10" />
                <KpiCard title="Activités à venir" value={kpis.activitesPlanifiees} icon={Activity} colorClass="text-amber-400" bgClass="bg-amber-600/10" />
            </div>

            {/* Charts Grid */}
            <div className="grid lg:grid-cols-2 gap-6">
                
                {/* Evolution des courriers */}
                <div className="card-glass p-6">
                    <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
                        <TrendingUp size={16} className="text-slate-400" /> Évolution des courriers (6 mois)
                    </h3>
                    <div className="h-64 w-full">
                        {charts.evolutionCourriers.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.evolutionCourriers}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                                    <XAxis dataKey="mois" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: '#334155', opacity: 0.4 }} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                    <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500 text-sm">Données insuffisantes</div>
                        )}
                    </div>
                </div>

                {/* Répartition par type de courrier */}
                <div className="card-glass p-6">
                    <h3 className="text-sm font-semibold text-white mb-6 flex items-center gap-2">
                        <Mail size={16} className="text-slate-400" /> Flux de courriers
                    </h3>
                    <div className="h-64 w-full">
                        {charts.courriersParType.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={charts.courriersParType} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {charts.courriersParType.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-500 text-sm">Données insuffisantes</div>
                        )}
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}
