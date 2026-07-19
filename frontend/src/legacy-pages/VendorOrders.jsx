import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import Modal from '../components/Modal';
import './VendorOrders.css';

const VendorOrders = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const isVendor = user?.role === 'VENDOR';
    const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'list'
    const [activeFilter, setActiveFilter] = useState('Total');
    const [checkedItems, setCheckedItems] = useState({});
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/', { replace: true });
    };

    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [returnOrder, setReturnOrder] = useState(null);
    const [isReturning, setIsReturning] = useState(false);
    const [returnError, setReturnError] = useState('');
    const [actionDialog, setActionDialog] = useState(null);
    const [isActionPending, setIsActionPending] = useState(false);
    const [actionError, setActionError] = useState('');
    const fileInputRef = React.useRef(null);

    React.useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders');
                if (res.data.success) {
                    setOrders(Array.isArray(res.data.data) ? res.data.data : []);
                }
            } catch (error) {
                console.error("Failed to fetch orders", error);
                // setOrders([]); // Keep it as initialized [] on error
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const toggleSettings = () => {
        setIsSettingsOpen(!isSettingsOpen);
    };

    const showNotice = (title, description) => {
        setActionError('');
        setActionDialog({ kind: 'notice', title, description });
    };

    const requestConfirmation = ({ title, description, confirmLabel, onConfirm, tone = 'primary' }) => {
        setActionError('');
        setActionDialog({ kind: 'confirm', title, description, confirmLabel, onConfirm, tone });
    };

    const closeActionDialog = () => {
        if (isActionPending) return;
        setActionError('');
        setActionDialog(null);
    };

    const confirmActionDialog = async () => {
        if (!actionDialog?.onConfirm || isActionPending) return;

        setIsActionPending(true);
        setActionError('');

        try {
            const outcome = await actionDialog.onConfirm();
            setActionDialog({
                kind: 'notice',
                title: outcome?.title || 'Action completed',
                description: outcome?.description || 'Your changes have been saved.',
            });
        } catch (error) {
            console.error('Order action failed', error);
            setActionError(error.response?.data?.message || error.message || 'Unable to complete this action. Please try again.');
        } finally {
            setIsActionPending(false);
        }
    };

    const handleExport = async () => {
        setIsSettingsOpen(false);
        try {
            const response = await api.get('/orders/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `orders_export_${Date.now()}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Export failed', error);
            showNotice('Export unavailable', 'We could not export orders. Make sure there is at least one order and try again.');
        }
    };

    const handleImportClick = () => {
        setIsSettingsOpen(false);
        fileInputRef.current.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            // await api.post('/orders/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            showNotice('File selected', `${file.name} is ready. Order import will be available once the import endpoint is connected.`);
        } catch (error) {
            showNotice('Import unavailable', 'The selected file could not be prepared for import. Please try again.');
        } finally {
            e.target.value = '';
        }
    };



    const toggleCheckbox = (id) => {
        setCheckedItems(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const handleConfirmOrder = (orderId) => {
        requestConfirmation({
            title: 'Confirm rental order',
            description: 'This will reserve the required stock and move the quotation to a sales order.',
            confirmLabel: 'Confirm order',
            onConfirm: async () => {
                const res = await api.post(`/orders/${orderId}/confirm`);
                if (!res.data.success) throw new Error(res.data?.message || 'Failed to confirm order.');
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'SALES_ORDER' } : o));
                return { title: 'Order confirmed', description: 'Stock has been reserved and the rental is ready for invoicing.' };
            },
        });
    };

    const handlePayOrder = (orderId) => {
        requestConfirmation({
            title: 'Proceed with payment',
            description: 'This records payment for the rental and makes the order ready for pickup.',
            confirmLabel: 'Record payment',
            onConfirm: async () => {
                const res = await api.post(`/orders/${orderId}/pay`);
                if (!res.data.success) throw new Error(res.data?.message || 'Payment failed.');
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'PAID' } : o));
                return { title: 'Payment recorded', description: 'The invoice has been generated and the order is ready for pickup.' };
            },
        });
    };

    const handlePrintInvoice = (orderId) => {
        showNotice('Invoice preview', `Invoice for order #${orderId} is ready to print. Printing is currently a preview-only feature.`);
        // window.open(`/api/invoices/${orderId}`, '_blank');
    };

    const handlePickup = (orderId) => {
        requestConfirmation({
            title: 'Confirm equipment pickup',
            description: 'The rental will be marked as picked up and the item will no longer be available in stock.',
            confirmLabel: 'Confirm pickup',
            onConfirm: async () => {
                const res = await api.post(`/orders/${orderId}/pickup`);
                if (!res.data.success) throw new Error(res.data?.message || 'Failed to pickup order.');
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'PICKED_UP' } : o));
                return { title: 'Pickup confirmed', description: 'Stock has been updated and the rental is now in progress.' };
            },
        });
    };

    const handleReturn = async (orderId) => {
        try {
            const res = await api.post(`/orders/${orderId}/return`);
            if (res.data.success) {
                const lateFee = res.data.lateFee;
                setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'RETURNED', lateFee: lateFee } : o));
                return { success: true, lateFee };
            }
            return { success: false, message: res.data?.message || 'Unable to complete this return.' };
        } catch (error) {
            console.error("Return Error", error);
            return { success: false, message: error.response?.data?.message || 'Failed to return the order.' };
        }
    };

    const openReturnModal = (order) => {
        setReturnError('');
        setReturnOrder(order);
    };

    const closeReturnModal = () => {
        if (isReturning) return;
        setReturnError('');
        setReturnOrder(null);
    };

    const confirmReturn = async () => {
        if (!returnOrder) return;
        setIsReturning(true);
        setReturnError('');
        const result = await handleReturn(returnOrder.id);
        setIsReturning(false);

        if (result.success) {
            setReturnError('');
            setReturnOrder(null);
        } else {
            setReturnError(result.message);
        }
    };

    const handleCreateInvoice = (orderId) => {
        requestConfirmation({
            title: 'Create rental invoice',
            description: 'An invoice will be created for this confirmed rental so the customer can complete payment.',
            confirmLabel: 'Create invoice',
            onConfirm: async () => {
                const res = await api.post(`/invoice/create/${orderId}`);
                if (!res.data.success) throw new Error(res.data?.message || 'Failed to create invoice.');
                return { title: 'Invoice created', description: 'The customer can now complete payment for this rental.' };
            },
        });
    };

    const handlePrintPickup = (orderId) => showNotice('Pickup slip preview', `Pickup slip for order #${orderId} is ready to print. Printing is currently a preview-only feature.`);
    const handlePrintReturn = (orderId) => showNotice('Return receipt preview', `Return receipt for order #${orderId} is ready to print. Printing is currently a preview-only feature.`);

    const getSelectedOrderIds = () => {
        return Object.entries(checkedItems)
            .filter(([id, isChecked]) => isChecked && id !== 'all')
            .map(([id]) => id);
    };

    const handleBulkAction = (actionType) => {
        const selectedIds = getSelectedOrderIds();
        if (selectedIds.length === 0) {
            showNotice('Select an order first', `Select at least one order before starting a ${actionType.toLowerCase()} action.`);
            return;
        }

        requestConfirmation({
            title: `Confirm bulk ${actionType.toLowerCase()}`,
            description: `${selectedIds.length} selected ${selectedIds.length === 1 ? 'order' : 'orders'} will be marked as ${actionType.toLowerCase()}. Review your selection before continuing.`,
            confirmLabel: `Confirm ${actionType.toLowerCase()}`,
            onConfirm: async () => {
                const completedOrders = new Map();
                let failCount = 0;

                // Process sequentially so stock-related updates remain predictable.
                for (const id of selectedIds) {
                    try {
                        const endpoint = actionType === 'Pickup' ? `/orders/${id}/pickup` : `/orders/${id}/return`;
                        const res = await api.post(endpoint);
                        if (res.data.success) {
                            completedOrders.set(id, { lateFee: res.data.lateFee });
                        } else {
                            failCount++;
                        }
                    } catch (error) {
                        console.error(`${actionType} failed for ${id}`, error);
                        failCount++;
                    }
                }

                const nextStatus = actionType === 'Pickup' ? 'PICKED_UP' : 'RETURNED';
                setOrders(prev => prev.map(order => {
                    const completed = completedOrders.get(order.id);
                    return completed ? { ...order, status: nextStatus, ...(completed.lateFee !== undefined ? { lateFee: completed.lateFee } : {}) } : order;
                }));
                setCheckedItems(prev => {
                    const next = { ...prev };
                    selectedIds.forEach(id => { delete next[id]; });
                    return next;
                });

                const successCount = completedOrders.size;
                return {
                    title: `Bulk ${actionType.toLowerCase()} complete`,
                    description: `${successCount} ${successCount === 1 ? 'order was' : 'orders were'} updated${failCount ? `. ${failCount} could not be updated; check their current status and try again.` : '.'}`,
                };
            },
        });
    };

    // --- Filtering Logic ---
    // --- Filtering Logic ---
    const safeOrders = Array.isArray(orders) ? orders : [];

    const filteredOrders = safeOrders.filter(order => {
        // 1. Status Filter
        if (activeFilter !== 'Total') {
            // Map readable Name to status enum if necessary, or just match direct string
            // Our filters are 'Sale order', 'Quotation' etc. Status is 'SALES_ORDER', 'QUOTATION'
            // Let's normalize
            const f = activeFilter.toUpperCase().replace(' ', '_');
            const s = (order.status || '').toUpperCase(); // Safety check

            // Special handling for 'Sale Order' -> 'SALES_ORDER' mismatch
            if (f === 'SALE_ORDER' && s !== 'SALES_ORDER') return false;

            // Standard check
            if (f !== 'SALE_ORDER' && s !== f && order.status !== activeFilter) {
                if (s !== f) return false;
            }
        }

        // 2. Search Filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const orderNum = order.orderNumber?.toLowerCase() || '';
            const custName = order.user?.name?.toLowerCase() || '';
            const prodName = order.items?.[0]?.product?.name?.toLowerCase() || '';
            return orderNum.includes(q) || custName.includes(q) || prodName.includes(q);
        }
        return true;
    });

    // --- Dynamic Counts ---
    const getCount = (filterName) => {
        const safeOrders = Array.isArray(orders) ? orders : [];
        if (filterName === 'Total') return safeOrders.length;
        const f = filterName.toUpperCase().replace(' ', '_');
        return safeOrders.filter(o => {
            const s = (o.status || '').toUpperCase();
            if (f === 'SALE_ORDER') return s === 'SALES_ORDER';
            return s === f;
        }).length;
    };

    const filters = [
        { name: 'Total', count: getCount('Total') },
        { name: 'Sale order', count: getCount('Sale order') },
        { name: 'Quotation', count: getCount('Quotation') },
        { name: 'Invoiced', count: getCount('Invoiced') || getCount('Paid') }, // Paid implies invoiced usually
        { name: 'Confirmed', count: getCount('Confirmed') },
        { name: 'Cancelled', count: getCount('Cancelled') },
        { name: 'Picked Up', count: getCount('Picked Up') }, // Added new status
        { name: 'Returned', count: getCount('Returned') },
    ];

    return (
        <div className="vendor-orders-page">
            {/* Top Navigation */}
            <nav className="top-nav">
                <div className="nav-container">
                    <div className="nav-left">
                        <Link to="/dashboard" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <h1>RentFlow</h1>
                        </Link>
                        <div className="nav-tabs">
                            <Link to="/dashboard" className="nav-tab" style={{ textDecoration: 'none' }}>Dashboard</Link>
                            <Link to="/vendor/orders" className="nav-tab active" style={{ textDecoration: 'none' }}>Orders</Link>
                            <Link to="/vendor/products" className="nav-tab" style={{ textDecoration: 'none' }}>Products</Link>
                            <Link to="/vendor/reports" className="nav-tab" style={{ textDecoration: 'none' }}>Reports</Link>
                            <Link to="/vendor/settings" className="nav-tab" style={{ textDecoration: 'none' }}>Settings</Link>
                        </div>
                    </div>

                    <div className="nav-right">
                        <div className="user-menu" onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ cursor: 'pointer', position: 'relative' }}>
                            <div className="user-avatar">{user?.name ? user.name.substring(0, 2).toUpperCase() : 'VR'}</div>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user?.name || 'User'}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{isVendor ? 'Vendor' : 'Customer'}</div>
                            </div>

                            {isDropdownOpen && (
                                <div className="user-dropdown-menu">
                                    <Link to="/vendor/profile" className="dropdown-item">
                                        <span>👤</span> Profile
                                    </Link>
                                    <button onClick={handleLogout} className="dropdown-item">
                                        <span>🚪</span> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Header */}
            <div className="main-header">
                <div className="header-left">
                    <h1 className="page-title">{isVendor ? 'Vendor Orders' : 'My Orders'}</h1>
                    <div style={{ position: 'relative' }}>
                        <button className="settings-btn" onClick={toggleSettings}>⚙️</button>
                        {isSettingsOpen && (
                            <div className="settings-dropdown">
                                <button className="settings-option" onClick={handleExport}><span className="option-icon">↑</span><span>Export Records</span></button>
                                <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', margin: '0.2rem 0' }}></div>
                                <button className="settings-option" onClick={handleImportClick}><span className="option-icon">↓</span><span>Import Records</span></button>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept=".csv, .xlsx" onChange={handleFileChange} />
                    </div>
                    <Link to="/vendor/orders/new" className="btn-new" style={{ textDecoration: 'none' }}>New</Link>
                </div>

                <div className="header-actions">
                    <div className="search-box">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button className="search-btn">🔍</button>
                    </div>

                    {isVendor && (
                        <div className="action-btns">
                            <button className="action-btn" onClick={() => handleBulkAction('Pickup')}>Pickup</button>
                            <button className="action-btn" onClick={() => handleBulkAction('Return')}>Return</button>
                        </div>
                    )}

                    <div className="view-controls">
                        <button
                            className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                            onClick={() => setViewMode('kanban')}
                        >
                            ▦
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            ☰
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Wrapper */}
            <div className="content-wrapper">
                {/* Sidebar Filter */}
                <aside className="sidebar">
                    <div className="filter-section">
                        <div className="filter-title">
                            <span>Rental Status</span>
                            <span className="filter-count">{orders.length}</span>
                        </div>

                        {filters.map((filter) => (
                            <div
                                key={filter.name}
                                className={`filter-item ${filter.name === activeFilter ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter.name)}
                            >
                                <span>{filter.name}</span>
                                {/* Mock counts would need real logic */}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Main Content */}
                <div className="main-content">
                    {/* Kanban View */}
                    <div className={`kanban-view ${viewMode === 'kanban' ? 'active' : ''}`}>
                        <div className="kanban-grid">
                            {filteredOrders.map((order) => (
                                <div key={order.id} className="kanban-card">
                                    {/* Checkbox for selection */}
                                    <div
                                        className={`custom-checkbox ${checkedItems[order.id] ? 'checked' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleCheckbox(order.id);
                                        }}
                                        style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 10 }}
                                    >
                                        {checkedItems[order.id] && '✓'}
                                    </div>

                                    <div className="card-header">
                                        <div>
                                            <div className="card-customer">{order.user?.name || 'Guest'}</div>
                                            <div className="card-order">{order.orderNumber}</div>
                                        </div>
                                    </div>
                                    <div className="card-product">
                                        {order.items?.[0]?.product?.name || 'Item'}
                                        {order.items?.length > 1 && ` (+${order.items.length - 1})`}
                                    </div>
                                    <div className="card-price">
                                        R{Number(order.totalAmount).toFixed(2)}
                                        {Number(order.lateFee) > 0 && (
                                            <div style={{ color: 'var(--accent)', fontSize: '0.75rem', marginTop: '2px' }}>
                                                + Late Fee: R{Number(order.lateFee).toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="card-duration">
                                        {order.items?.[0]?.startDate ?
                                            `${new Date(order.items[0].startDate).toLocaleDateString()} - ${new Date(order.items[0].endDate).toLocaleDateString()}`
                                            : 'No dates'}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                                        <div className={`status-badge status-${order.status.toLowerCase().replace('_', '-')}`}>
                                            {order.status.replace('_', ' ')}
                                        </div>

                                        {/* Vendor Actions */}
                                        {isVendor && order.status === 'QUOTATION' && (
                                            <button className="btn-confirm" onClick={() => handleConfirmOrder(order.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                Confirm
                                            </button>
                                        )}
                                        {isVendor && (order.status === 'SALES_ORDER' || order.status === 'CONFIRMED') && (
                                            <button className="btn-confirm" onClick={() => handleCreateInvoice(order.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                Create Invoice
                                            </button>
                                        )}

                                        {/* Customer Actions */}
                                        {!isVendor && (order.status === 'SALES_ORDER' || order.status === 'CONFIRMED') && (
                                            <button className="btn-pay" onClick={() => handlePayOrder(order.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                Pay Now
                                            </button>
                                        )}

                                        {/* Invoice Action */}
                                        {order.status === 'PAID' && (
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                {isVendor && (
                                                    <button className="btn-confirm" onClick={() => handlePickup(order.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--accent-warm)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                        Pickup
                                                    </button>
                                                )}
                                                <button className="btn-invoice" onClick={() => handlePrintInvoice(order.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--surface-light)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>
                                                    Inv 📄
                                                </button>
                                                <button className="btn-invoice" onClick={() => handlePrintPickup(order.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--surface-light)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>
                                                    Slip 🚚
                                                </button>
                                            </div>
                                        )}

                                        {/* Return Action */}
                                        {isVendor && order.status === 'PICKED_UP' && (
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button className="btn-confirm" onClick={() => openReturnModal(order)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--success)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                                    Return
                                                </button>
                                            </div>
                                        )}

                                        {/* Completed/Returned Actions */}
                                        {order.status === 'RETURNED' && (
                                            <button className="btn-invoice" onClick={() => handlePrintReturn(order.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', background: 'var(--surface-light)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer' }}>
                                                Receipt 🧾
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!orders || orders.length === 0) && !loading && <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>No orders found.</div>}
                        </div>
                    </div>

                    {/* List View */}
                    <div className={`list-view ${viewMode === 'list' ? 'active' : ''}`}>
                        {/* Simplified list view rendering for brevity, matching Kanban logic in columns */}
                        <div className="list-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th className="checkbox-cell">
                                            <div
                                                className={`custom-checkbox ${checkedItems['all'] ? 'checked' : ''}`}
                                                onClick={() => toggleCheckbox('all')}
                                            >
                                                {checkedItems['all'] && '✓'}
                                            </div>
                                        </th>
                                        <th>Order Reference</th>
                                        <th>Order Date</th>
                                        <th>Customer Name</th>
                                        <th>Product</th>
                                        <th>Total</th>
                                        <th>Rental Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="checkbox-cell">
                                                <div
                                                    className={`custom-checkbox ${checkedItems[order.id] ? 'checked' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleCheckbox(order.id);
                                                    }}
                                                >
                                                    {checkedItems[order.id] && '✓'}
                                                </div>
                                            </td>
                                            <td>{order.orderNumber}</td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>{order.user?.name || 'Unknown'}</td>
                                            <td>{order.items?.[0]?.product?.name || 'Multiple Items'} {order.items?.length > 1 ? `+${order.items.length - 1} more` : ''}</td>
                                            <td>R{Number(order.totalAmount).toFixed(2)}</td>
                                            <td>
                                                <span className={`status-badge status-${order.status.toLowerCase().replace('_', '-')}`}>
                                                    {order.status.replace('_', ' ')}
                                                </span>
                                            </td>
                                            <td>
                                                {isVendor && order.status === 'QUOTATION' && (
                                                    <button onClick={() => handleConfirmOrder(order.id)} style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Confirm</button>
                                                )}
                                                {isVendor && (order.status === 'SALES_ORDER' || order.status === 'CONFIRMED') && (
                                                    <button onClick={() => handleCreateInvoice(order.id)} style={{ fontSize: '0.8rem', cursor: 'pointer', color: 'var(--primary)', marginRight: '8px' }}>Create Invoice</button>
                                                )}
                                                {!isVendor && (order.status === 'SALES_ORDER' || order.status === 'CONFIRMED') && (
                                                    <button onClick={() => handlePayOrder(order.id)} style={{ fontSize: '0.8rem', cursor: 'pointer', color: 'var(--accent)' }}>Pay Now</button>
                                                )}
                                                {order.status === 'PAID' && (
                                                    <button onClick={() => handlePrintInvoice(order.id)} style={{ fontSize: '0.8rem', cursor: 'pointer' }}>Invoice</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!orders || orders.length === 0) && !loading && (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>No orders found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                open={Boolean(actionDialog)}
                onClose={closeActionDialog}
                title={actionDialog?.title || ''}
                description={actionDialog?.description}
                size="sm"
                footer={actionDialog?.kind === 'confirm' ? (
                    <>
                        <button
                            type="button"
                            data-modal-autofocus
                            onClick={closeActionDialog}
                            disabled={isActionPending}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmActionDialog}
                            disabled={isActionPending}
                            className={`inline-flex min-h-11 items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-wait disabled:opacity-60 ${actionDialog?.tone === 'danger' ? 'bg-rose-400 text-rose-950 hover:bg-rose-300 focus:ring-rose-300' : 'bg-cyan-400 text-slate-950 hover:bg-cyan-300 focus:ring-cyan-300'}`}
                        >
                            {isActionPending ? 'Saving changesâ€¦' : actionDialog?.confirmLabel || 'Confirm'}
                        </button>
                    </>
                ) : (
                    <button
                        type="button"
                        data-modal-autofocus
                        onClick={closeActionDialog}
                        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900"
                    >
                        Done
                    </button>
                )}
            >
                <div className="space-y-4">
                    <div className="rounded-xl border border-cyan-300/15 bg-cyan-300/[0.06] p-4">
                        <p className="text-sm leading-6 text-slate-200">
                            {actionDialog?.kind === 'confirm'
                                ? 'Please confirm this action. The order timeline and available stock may be updated immediately.'
                                : 'You can safely close this message and continue working with your orders.'}
                        </p>
                    </div>
                    {actionError && (
                        <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm leading-6 text-rose-200">
                            {actionError}
                        </p>
                    )}
                </div>
            </Modal>

            <Modal
                open={Boolean(returnOrder)}
                onClose={closeReturnModal}
                title="Confirm rental return"
                description="Review the return before inventory is restored. This action updates the order status immediately."
                size="sm"
                footer={(
                    <>
                        <button
                            type="button"
                            data-modal-autofocus
                            onClick={closeReturnModal}
                            disabled={isReturning}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmReturn}
                            disabled={isReturning}
                            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition-colors hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:cursor-wait disabled:opacity-60"
                        >
                            {isReturning ? 'Processing return…' : 'Confirm return'}
                        </button>
                    </>
                )}
            >
                <div className="space-y-4">
                    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                        <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-500">Order</p>
                        <p className="mt-1 text-base font-semibold text-white">{returnOrder?.orderNumber || 'Rental order'}</p>
                        <p className="mt-1 text-sm text-slate-400">{returnOrder?.user?.name || 'Customer'} · {returnOrder?.items?.[0]?.product?.name || 'Rental item'}</p>
                    </div>
                    <p className="text-sm leading-6 text-slate-300">The item will be marked as returned and its stock will become available again.</p>
                    {returnError && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">{returnError}</p>}
                </div>
            </Modal>
        </div>
    );
};

export default VendorOrders;
