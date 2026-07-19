import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminSettings.css'; // New CSS
import './AdminStyles.css'; // Structure

const AdminSettings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('general');

    // Mock Data for Periods
    const [periods, setPeriods] = useState([
        { id: 1, name: 'Daily', duration: 1, unit: 'Day' },
        { id: 2, name: 'Weekly', duration: 1, unit: 'Week' },
        { id: 3, name: 'Weekend', duration: 2, unit: 'Day' },
    ]);

    // Mock Data for Attributes
    const [attributes, setAttributes] = useState([
        { id: 1, name: 'Brand', type: 'Select', values: 'Sony, Canon, Nikon' },
        { id: 2, name: 'Color', type: 'Color', values: '#000000, #FFFFFF' },
    ]);

    return (
        <div className="admin-dashboard-page">
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="nav-left">
                        <Link to="/admin/dashboard" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h1>RentFlow <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>ADMIN</span></h1>
                        </Link>
                        <div className="nav-tabs">
                            <Link to="/admin/dashboard" className="nav-tab">Dashboard</Link>
                            <Link to="/admin/users" className="nav-tab">Users</Link>
                            <Link to="/admin/products" className="nav-tab">Products</Link>
                            <Link to="/admin/orders" className="nav-tab">Orders</Link>
                            <Link to="/admin/reports" className="nav-tab">Reports</Link>
                            <Link to="/admin/settings" className="nav-tab active">Settings</Link>
                        </div>
                    </div>
                    <div className="nav-right">
                        <div className="user-menu">
                            <div className="user-avatar" style={{ background: 'var(--primary)' }}>AD</div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="admin-settings-container">
                <aside className="settings-sidebar">
                    <button
                        className={`settings-nav-item ${activeTab === 'general' ? 'active' : ''}`}
                        onClick={() => setActiveTab('general')}
                    >
                        General & Profile
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'periods' ? 'active' : ''}`}
                        onClick={() => setActiveTab('periods')}
                    >
                        Rental Periods
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'attributes' ? 'active' : ''}`}
                        onClick={() => setActiveTab('attributes')}
                    >
                        Attributes
                    </button>
                    <button
                        className={`settings-nav-item ${activeTab === 'security' ? 'active' : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Security
                    </button>
                </aside>

                <main className="settings-content-area">
                    <div className="settings-breadcrumb">&gt; Setting</div>
                    <h2 className="settings-section-title">Account Settings</h2>
                    <p className="settings-section-subtitle">Manage your preferences, security, and connected tools all in one place.</p>

                    {activeTab === 'general' && (
                        <div>
                            <div className="profile-info-section">
                                <h3 className="profile-section-heading">Personal Information</h3>
                                <p className="profile-section-subtext">Edit your personal details</p>

                                <div className="profile-avatar-row">
                                    <div className="profile-avatar-circle">
                                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'AD'}
                                    </div>
                                    <button className="btn-upload-image">Upload An Image</button>
                                    <button className="btn-delete-avatar" aria-label="Delete avatar">🗑️</button>
                                </div>

                                <div className="settings-form-grid">
                                    <div className="form-group-item">
                                        <label>First name <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" defaultValue={user?.name ? user.name.split(' ')[0] : 'Admin'} />
                                    </div>
                                    <div className="form-group-item">
                                        <label>Last name <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" defaultValue={user?.name ? user.name.split(' ').slice(1).join(' ') : 'User'} />
                                    </div>
                                    <div className="form-group-item">
                                        <label>Email <span className="text-danger">*</span></label>
                                        <input type="email" className="form-control" defaultValue={user?.email} disabled />
                                    </div>
                                    <div className="form-group-item">
                                        <label>Company Name <span className="text-danger">*</span></label>
                                        <input type="text" className="form-control" defaultValue="RentFlow HQ" />
                                    </div>
                                    <div className="form-group-item">
                                        <label>System Currency <span className="text-danger">*</span></label>
                                        <select className="form-control">
                                            <option>USD ($)</option>
                                            <option>EUR (€)</option>
                                            <option>INR (₹)</option>
                                        </select>
                                    </div>
                                    <div className="form-group-item">
                                        <label>Language <span className="text-danger">*</span></label>
                                        <select className="form-control">
                                            <option>English</option>
                                            <option>Spanish</option>
                                            <option>French</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: '2.5rem' }}>
                                <button className="settings-action-btn btn-add">Save Changes</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'periods' && (
                        <div>
                            <div className="settings-header-actions">
                                <h3 className="profile-section-heading" style={{ marginBottom: 0 }}>Rental Periods</h3>
                                <button className="settings-action-btn btn-add">+ New Period</button>
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Define the standard durations available for rental products.</p>

                            <table className="settings-table-wrapper">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Duration</th>
                                        <th>Unit</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {periods.map(p => (
                                        <tr key={p.id}>
                                            <td>{p.name}</td>
                                            <td>{p.duration}</td>
                                            <td>{p.unit}</td>
                                            <td>
                                                <button className="settings-action-btn btn-edit">Edit</button>
                                                <button className="settings-action-btn btn-delete">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'attributes' && (
                        <div>
                            <div className="settings-header-actions">
                                <h3 className="profile-section-heading" style={{ marginBottom: 0 }}>Product Attributes</h3>
                                <button className="settings-action-btn btn-add">+ New Attribute</button>
                            </div>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Configure global attributes like Brand, Color, Size that vendors can use.</p>

                            <table className="settings-table-wrapper">
                                <thead>
                                    <tr>
                                        <th>Attribute Name</th>
                                        <th>Display Type</th>
                                        <th>Sample Values</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attributes.map(a => (
                                        <tr key={a.id}>
                                            <td>{a.name}</td>
                                            <td><span className="badge-purple">{a.type}</span></td>
                                            <td style={{ color: 'var(--text-muted)' }}>{a.values}</td>
                                            <td>
                                                <button className="settings-action-btn btn-edit">Config</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div>
                            <h3 className="profile-section-heading">Security</h3>
                            <p className="profile-section-subtext">Manage your password and credentials</p>

                            <div className="settings-form-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '500px' }}>
                                <div className="form-group-item">
                                    <label>Change Password <span className="text-danger">*</span></label>
                                    <input type="password" placeholder="New Password" className="form-control" />
                                </div>
                            </div>
                            <div style={{ marginTop: '2.5rem' }}>
                                <button className="settings-action-btn btn-add">Update Password</button>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminSettings;
