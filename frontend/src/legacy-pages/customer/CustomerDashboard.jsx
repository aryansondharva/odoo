import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import OrderStatusBadge from '../../components/OrderStatusBadge';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        activeRentals: 0,
        pendingPayments: 0,
        upcomingReturns: 0,
        totalSpent: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const initials = (user?.name || 'Customer')
        .split(/\s+/)
        .map((name) => name[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

    useEffect(() => {
        if (!user || user.role !== 'CUSTOMER') {
            navigate('/');
            return;
        }
        fetchDashboardData();
    }, [user, navigate]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const response = await api.get('/orders');

            if (response.data.success) {
                const orders = response.data.data;

                // Calculate stats
                const activeRentals = orders.filter(o => o.status === 'PICKED_UP').length;
                const pendingPayments = orders.filter(o =>
                    ['SALES_ORDER', 'CONFIRMED'].includes(o.status)
                ).length;

                // Get upcoming returns (orders picked up, return date within 7 days)
                const now = new Date();
                const upcomingReturns = orders.filter(o => {
                    if (o.status !== 'PICKED_UP') return false;
                    const returnDate = new Date(o.items[0]?.endDate);
                    const daysUntilReturn = Math.ceil((returnDate - now) / (1000 * 60 * 60 * 24));
                    return daysUntilReturn >= 0 && daysUntilReturn <= 7;
                }).length;

                const totalSpent = orders
                    .filter(o => o.status === 'PAID' || o.status === 'PICKED_UP' || o.status === 'RETURNED')
                    .reduce((sum, o) => sum + o.totalAmount, 0);

                setStats({
                    activeRentals,
                    pendingPayments,
                    upcomingReturns,
                    totalSpent
                });

                // Get recent 5 orders
                setRecentOrders(orders.slice(0, 5));
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const formatCurrency = (amount) => {
        return `Rs ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="customer-dashboard">
                <div className="loading-state">Loading dashboard...</div>
            </div>
        );
    }

    return (
        <div className="customer-dashboard">
            <nav className="customer-nav" aria-label="Customer navigation">
                <div className="customer-nav-inner">
                    <Link to="/customer/dashboard" className="customer-brand">
                        RentFlow<span>.</span> <small>CUSTOMER</small>
                    </Link>
                    <div className="customer-nav-tabs">
                        <Link to="/customer/dashboard" className="customer-nav-tab active">Dashboard</Link>
                        <Link to="/dashboard" className="customer-nav-tab">Browse</Link>
                        <Link to="/customer/orders" className="customer-nav-tab">Orders</Link>
                        <Link to="/cart" className="customer-nav-tab">Cart</Link>
                        <Link to="/customer/settings" className="customer-nav-tab">Settings</Link>
                    </div>
                    <div className="customer-nav-account">
                        <span className="customer-avatar" aria-hidden="true">{initials}</span>
                        <div className="customer-nav-name">
                            <strong>{user?.name || 'Customer'}</strong>
                            <small>Customer workspace</small>
                        </div>
                        <button type="button" className="customer-nav-signout" onClick={handleLogout} aria-label="Sign out" title="Sign out">
                            <LogOut size={17} strokeWidth={2.2} />
                        </button>
                    </div>
                </div>
            </nav>

            <main className="customer-dashboard-main">
            <div className="dashboard-header">
                <div>
                    <span className="customer-eyebrow">CUSTOMER / 01</span>
                    <h1>Your rentals,<br /><span>in one place.</span></h1>
                    <p className="header-subtitle">Manage your rentals and orders</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📦</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.activeRentals}</div>
                        <div className="stat-label">Active Rentals</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💳</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.pendingPayments}</div>
                        <div className="stat-label">Pending Payments</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">⏰</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.upcomingReturns}</div>
                        <div className="stat-label">Upcoming Returns</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <div className="stat-value">{formatCurrency(stats.totalSpent)}</div>
                        <div className="stat-label">Total Spent</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-buttons">
                    <Link to="/dashboard" className="action-btn">
                        <span className="action-icon">🛍️</span>
                        <span>Browse Products</span>
                    </Link>
                    <Link to="/customer/orders" className="action-btn">
                        <span className="action-icon">📋</span>
                        <span>View All Orders</span>
                    </Link>
                    <Link to="/cart" className="action-btn">
                        <span className="action-icon">🛒</span>
                        <span>Go to Cart</span>
                    </Link>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="recent-orders">
                <div className="section-header">
                    <h2>Recent Orders</h2>
                    <Link to="/customer/orders" className="view-all-link">
                        View All →
                    </Link>
                </div>

                {recentOrders.length === 0 ? (
                    <div className="empty-state">
                        <p>No orders yet</p>
                        <Link to="/dashboard" className="browse-btn">
                            Browse Products
                        </Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {recentOrders.map(order => (
                            <Link
                                key={order.id}
                                to={`/customer/orders/${order.id}`}
                                className="order-card"
                            >
                                <div className="order-header">
                                    <div>
                                        <div className="order-number">#{order.orderNumber}</div>
                                        <div className="order-date">{formatDate(order.createdAt)}</div>
                                    </div>
                                    <OrderStatusBadge status={order.status} />
                                </div>

                                <div className="order-items">
                                    {order.items.slice(0, 2).map((item, idx) => (
                                        <div key={idx} className="order-item-preview">
                                            {item.product.name} × {item.quantity}
                                        </div>
                                    ))}
                                    {order.items.length > 2 && (
                                        <div className="more-items">
                                            +{order.items.length - 2} more
                                        </div>
                                    )}
                                </div>

                                <div className="order-footer">
                                    <div className="order-total">
                                        {formatCurrency(order.totalAmount)}
                                    </div>
                                    <div className="order-action">View Details →</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
            </main>
        </div>
    );
};

export default CustomerDashboard;
