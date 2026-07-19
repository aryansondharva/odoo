import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Index.css';

const Index = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Intersection Observer for fade-up animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.fade-up').forEach((el) => observer.observe(el));

    // Navbar shadow on scroll
    const handleScroll = () => {
      const nav = document.querySelector('nav');
      if (nav) {
        if (window.scrollY > 20) {
          nav.classList.add('shadow-sm');
        } else {
          nav.classList.remove('shadow-sm');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="bg-cream text-charcoal font-sans antialiased min-h-screen">
      {/* ============ NAVBAR ============ */}
      <nav className="nav-glass fixed top-0 left-0 w-full z-50 border-b border-warm/60">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-charcoal rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-cream" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight">RentFlow</span>
            </Link>

            {/* Desktop Links */}
            <div className="hidden lg:flex items-center gap-10">
              <a href="#features" className="nav-link text-sm font-medium text-muted hover:text-charcoal transition-colors">Features</a>
              <a href="#pricing" className="nav-link text-sm font-medium text-muted hover:text-charcoal transition-colors">Pricing</a>
              <a href="#how-it-works" className="nav-link text-sm font-medium text-muted hover:text-charcoal transition-colors">How it Works</a>
              <a href="#contact" className="nav-link text-sm font-medium text-muted hover:text-charcoal transition-colors">Contact</a>
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-4">
              {user ? (
                <Link to="/dashboard" className="btn-primary inline-flex items-center bg-charcoal text-cream px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-accent">
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-muted hover:text-charcoal transition-colors">Login</Link>
                  <Link to="/signup" className="btn-primary inline-flex items-center bg-charcoal text-cream px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-accent">
                    <span>Start Free Trial</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button onClick={toggleMenu} className="lg:hidden flex flex-col gap-1.5 p-2" aria-label="Toggle menu">
              <span 
                className="block w-5 h-0.5 bg-charcoal transition-transform" 
                style={{ transform: menuOpen ? 'rotate(45deg) translate(3px, 3px)' : '' }}
              ></span>
              <span 
                className="block w-5 h-0.5 bg-charcoal transition-opacity" 
                style={{ opacity: menuOpen ? '0' : '1' }}
              ></span>
              <span 
                className="block w-5 h-0.5 bg-charcoal transition-transform" 
                style={{ transform: menuOpen ? 'rotate(-45deg) translate(3px, -3px)' : '' }}
              ></span>
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`mobile-menu lg:hidden ${menuOpen ? 'open' : ''}`}>
            <div className="pb-6 pt-2 flex flex-col gap-4 border-t border-warm/60">
              <a href="#features" onClick={closeMenu} className="text-sm font-medium text-muted hover:text-charcoal transition-colors">Features</a>
              <a href="#pricing" onClick={closeMenu} className="text-sm font-medium text-muted hover:text-charcoal transition-colors">Pricing</a>
              <a href="#how-it-works" onClick={closeMenu} className="text-sm font-medium text-muted hover:text-charcoal transition-colors">How it Works</a>
              <a href="#contact" onClick={closeMenu} className="text-sm font-medium text-muted hover:text-charcoal transition-colors">Contact</a>
              
              {user ? (
                <Link to="/dashboard" onClick={closeMenu} className="btn-primary inline-flex items-center justify-center bg-charcoal text-cream px-6 py-2.5 rounded-full text-sm font-semibold mt-2 w-full">
                  <span>Go to Dashboard</span>
                </Link>
              ) : (
                <div className="flex flex-col gap-3 mt-2">
                  <Link to="/login" onClick={closeMenu} className="text-sm font-medium text-muted hover:text-charcoal text-center py-2 transition-colors">Login</Link>
                  <Link to="/signup" onClick={closeMenu} className="btn-primary inline-flex items-center justify-center bg-charcoal text-cream px-6 py-2.5 rounded-full text-sm font-semibold w-full">
                    <span>Start Free Trial</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <section className="pt-32 lg:pt-44 pb-20 lg:pb-32 px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center fade-up">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-sand border border-warm rounded-full px-4 py-1.5 mb-8">
            <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
            <span className="text-xs font-medium text-muted tracking-wide uppercase">Trusted by 500+ rental businesses</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-[1.08] tracking-tight mb-6">
            Manage your rentals<br className="hidden sm:block" />
            with <span className="italic font-light">effortless</span> clarity
          </h1>

          <p className="text-lg lg:text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Track inventory, automate billing, manage security deposits, and handle late fees — all from one beautiful dashboard built for rental businesses.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard" className="btn-primary inline-flex items-center bg-charcoal text-cream px-8 py-3.5 rounded-full text-sm font-semibold">
                <span>Go to Dashboard</span>
                <svg className="w-4 h-4 ml-2 relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn-primary inline-flex items-center bg-charcoal text-cream px-8 py-3.5 rounded-full text-sm font-semibold">
                  <span>Start Free Trial</span>
                  <svg className="w-4 h-4 ml-2 relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <a href="#how-it-works" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold border border-charcoal/15 hover:border-charcoal/30 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                  </svg>
                  View Demo
                </a>
              </>
            )}
          </div>

          {/* Trust metrics */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 lg:gap-14 text-muted">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-charcoal">500+</div>
              <div className="text-xs font-medium uppercase tracking-wider mt-1">Businesses</div>
            </div>
            <div className="w-px h-10 bg-warm hidden sm:block"></div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-charcoal">50K+</div>
              <div className="text-xs font-medium uppercase tracking-wider mt-1">Rentals Managed</div>
            </div>
            <div className="w-px h-10 bg-warm hidden sm:block"></div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-charcoal">99.9%</div>
              <div className="text-xs font-medium uppercase tracking-wider mt-1">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PROBLEM & SOLUTION ============ */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-sand">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-start">
            {/* Problem */}
            <div className="fade-up">
              <div className="inline-flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-1.5 mb-6">
                <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">The Problem</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-6">
                Running a rental business shouldn't feel like chaos
              </h2>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-muted leading-relaxed">Scattered spreadsheets make it impossible to track which items are rented, returned, or overdue.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-muted leading-relaxed">Manually calculating late fees and security deposits drains hours every week and introduces costly errors.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-red-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-red-500" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <p className="text-muted leading-relaxed">No clear visibility across branches means decisions are made on gut feeling, not data.</p>
                </div>
              </div>
            </div>

            {/* Solution */}
            <div className="fade-up">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-full px-4 py-1.5 mb-6">
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">The Solution</span>
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight mb-6">
                RentFlow brings order, automation, and insight
              </h2>
              <div className="space-y-5">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="text-muted leading-relaxed">A unified dashboard lets you see every product, order, and customer in real time — no more digging through files.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="text-muted leading-relaxed">Late fees, deposits, and invoices are calculated and applied automatically — saving time and eliminating mistakes.</p>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 mt-0.5 rounded-full bg-emerald-100 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <p className="text-muted leading-relaxed">Advanced analytics and multi-branch support give you the clarity to scale confidently across locations.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section id="features" className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <span className="text-xs font-semibold text-muted uppercase tracking-widest">Features</span>
            <h2 className="text-3xl lg:text-5xl font-bold mt-3 mb-4">Everything you need to run rentals</h2>
            <p className="text-muted max-w-xl mx-auto text-lg">Powerful tools designed specifically for rental businesses, wrapped in a simple interface.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="feature-card bg-white border border-warm/60 rounded-2xl p-8 fade-up">
              <div className="w-12 h-12 bg-sand rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Inventory Dashboard</h3>
              <p className="text-muted text-sm leading-relaxed">Get a real-time view of all your rental products — available, rented out, or under maintenance — at a glance.</p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card bg-white border border-warm/60 rounded-2xl p-8 fade-up">
              <div className="w-12 h-12 bg-sand rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Automated Late Fees</h3>
              <p className="text-muted text-sm leading-relaxed">Set your rules once. RentFlow automatically calculates and applies late fees based on your custom policies.</p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card bg-white border border-warm/60 rounded-2xl p-8 fade-up">
              <div className="w-12 h-12 bg-sand rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Security Deposits</h3>
              <p className="text-muted text-sm leading-relaxed">Collect, track, and refund security deposits seamlessly with full audit trails for every transaction.</p>
            </div>

            {/* Feature 4 */}
            <div className="feature-card bg-white border border-warm/60 rounded-2xl p-8 fade-up">
              <div className="w-12 h-12 bg-sand rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted text-sm leading-relaxed">Understand your revenue, top-performing products, and customer trends with clean, actionable reports.</p>
            </div>

            {/* Feature 5 */}
            <div className="feature-card bg-white border border-warm/60 rounded-2xl p-8 fade-up">
              <div className="w-12 h-12 bg-sand rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Customer Management</h3>
              <p className="text-muted text-sm leading-relaxed">Maintain detailed customer profiles with rental history, payment records, and communication logs.</p>
            </div>

            {/* Feature 6 */}
            <div className="feature-card bg-white border border-warm/60 rounded-2xl p-8 fade-up">
              <div className="w-12 h-12 bg-sand rounded-xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-charcoal" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold mb-2">Multi-Branch Support</h3>
              <p className="text-muted text-sm leading-relaxed">Manage multiple locations from one account with branch-level reporting and role-based access control.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <section id="pricing" className="py-20 lg:py-28 px-6 lg:px-8 bg-sand">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <span className="text-xs font-semibold text-muted uppercase tracking-widest">Pricing</span>
            <h2 className="text-3xl lg:text-5xl font-bold mt-3 mb-4">Simple pricing for every stage<br className="hidden sm:block" /> of your rental business</h2>
            <p className="text-muted max-w-xl mx-auto text-lg">No hidden fees. No long-term contracts. Start free and upgrade as you grow.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
            {/* Starter */}
            <div className="pricing-card bg-white border border-warm/60 rounded-2xl p-8 lg:p-10 fade-up">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">Starter</h3>
                <p className="text-sm text-muted">Best for small rental shops</p>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl lg:text-5xl font-bold tracking-tight">₹999</span>
                  <span className="text-muted text-sm font-medium">/ month</span>
                </div>
              </div>
              {/* Coupon Code */}
              <div className="mb-8">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    className="flex-1 px-3 py-2 text-xs border border-warm rounded-lg bg-sand/50 text-charcoal placeholder-muted/60 focus:outline-none focus:ring-1 focus:ring-charcoal/30 transition-all"
                    style={{ minWidth: 0 }}
                  />
                  <button className="px-4 py-2 text-xs font-semibold border border-charcoal/20 rounded-lg text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-200 whitespace-nowrap">
                    Apply
                  </button>
                </div>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-charcoal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium text-charcoal">Basic Dashboard</span>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">Overview of your rentals, orders, and revenue at a glance with a clean, simple interface.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-charcoal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium text-charcoal">Up to 50 Products</span>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">Add, edit, and manage up to 50 rental items with photos, pricing, and availability tracking.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-charcoal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium text-charcoal">Order Management</span>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">Create, track, and fulfil rental orders with status updates and customer notifications.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-charcoal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium text-charcoal">Basic Reports</span>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">Simple revenue and order summaries to understand how your business is performing week-by-week.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-charcoal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium text-charcoal">Email Support</span>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">Get help from our team via email within 24 business hours for setup, bugs, or questions.</p>
                  </div>
                </li>
              </ul>
              {user ? (
                <Link to="/dashboard" className="w-full py-3.5 block text-center rounded-full border-2 border-charcoal text-charcoal font-semibold text-sm hover:bg-charcoal hover:text-cream transition-all duration-300">
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/signup" className="w-full py-3.5 block text-center rounded-full border-2 border-charcoal text-charcoal font-semibold text-sm hover:bg-charcoal hover:text-cream transition-all duration-300">
                  Get Started
                </Link>
              )}
            </div>

            {/* Professional (Most Popular) */}
            <div className="pricing-card relative bg-charcoal text-cream rounded-2xl p-8 lg:p-10 lg:-mt-4 lg:mb-[-16px] shadow-2xl fade-up">
              {/* Badge */}
              <div className="popular-badge absolute -top-3.5 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 text-charcoal text-xs font-bold uppercase tracking-wider px-5 py-1.5 rounded-full shadow-lg">Most Popular</span>
              </div>
              <div className="mb-6 mt-2">
                <h3 className="text-lg font-semibold mb-1">Professional</h3>
                <p className="text-sm text-cream/60">Best for growing rental businesses</p>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl lg:text-5xl font-bold tracking-tight">₹2,999</span>
                  <span className="text-cream/60 text-sm font-medium">/ month</span>
                </div>
              </div>
              {/* Coupon Code */}
              <div className="mb-8">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    className="flex-1 px-3 py-2 text-xs border border-cream/20 rounded-lg bg-cream/10 text-cream placeholder-cream/40 focus:outline-none focus:ring-1 focus:ring-amber-400/50 transition-all"
                    style={{ minWidth: 0 }}
                  />
                  <button className="px-4 py-2 text-xs font-semibold border border-amber-400/40 rounded-lg text-amber-400 hover:bg-amber-400 hover:text-charcoal transition-all duration-200 whitespace-nowrap">
                    Apply
                  </button>
                </div>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium">Everything in Starter</span>
                    <p className="text-xs text-cream/50 mt-0.5 leading-relaxed">All Starter features included — dashboard, orders, reports, and email support.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium">Unlimited Products</span>
                    <p className="text-xs text-cream/50 mt-0.5 leading-relaxed">No cap on inventory. List as many rental items as your business needs.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium">Automated Late Fee Calculation</span>
                    <p className="text-xs text-cream/50 mt-0.5 leading-relaxed">Define custom late-fee rules once. The system applies charges automatically on overdue rentals.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium">Security Deposit Management</span>
                    <p className="text-xs text-cream/50 mt-0.5 leading-relaxed">Collect, hold, and refund deposits with full audit trails and automated accounting.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium">Advanced Analytics</span>
                    <p className="text-xs text-cream/50 mt-0.5 leading-relaxed">Revenue breakdowns, product performance, and customer trends with exportable charts.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium">Priority Support</span>
                    <p className="text-xs text-cream/50 mt-0.5 leading-relaxed">Get responses within 4 hours via email and live chat during business hours.</p>
                  </div>
                </li>
              </ul>
              {user ? (
                <Link to="/dashboard" className="w-full py-3.5 block text-center rounded-full bg-cream text-charcoal font-semibold text-sm hover:bg-cream/90 transition-all duration-300">
                  Go to Dashboard
                </Link>
              ) : (
                <Link to="/signup" className="w-full py-3.5 block text-center rounded-full bg-cream text-charcoal font-semibold text-sm hover:bg-cream/90 transition-all duration-300">
                  Get Started
                </Link>
              )}
            </div>

            {/* Enterprise */}
            <div className="pricing-card bg-white border border-warm/60 rounded-2xl p-8 lg:p-10 fade-up">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-1">Enterprise</h3>
                <p className="text-sm text-muted">Best for multi-location rental companies</p>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl lg:text-5xl font-bold tracking-tight">Custom</span>
                </div>
                <span className="text-muted text-sm font-medium">Tailored to your needs</span>
              </div>
              {/* Coupon Code */}
              <div className="mb-8">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Coupon code"
                    className="flex-1 px-3 py-2 text-xs border border-warm rounded-lg bg-sand/50 text-charcoal placeholder-muted/60 focus:outline-none focus:ring-1 focus:ring-charcoal/30 transition-all"
                    style={{ minWidth: 0 }}
                  />
                  <button className="px-4 py-2 text-xs font-semibold border border-charcoal/20 rounded-lg text-charcoal hover:bg-charcoal hover:text-cream transition-all duration-200 whitespace-nowrap">
                    Apply
                  </button>
                </div>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-charcoal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium text-charcoal">Everything in Professional</span>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">All Professional features — unlimited products, automated fees, deposits, and analytics.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-charcoal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium text-charcoal">Multi-Branch Support</span>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">Manage multiple store locations from one account with per-branch analytics and staff roles.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-charcoal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium text-charcoal">Custom Reports</span>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">Build tailored reports with custom date ranges, filters, and KPIs specific to your operations.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-charcoal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium text-charcoal">Dedicated Account Manager</span>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">A personal point of contact to help with onboarding, training, and strategic growth.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-charcoal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium text-charcoal">API Access</span>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">Full REST API for programmatic access — sync inventory, orders, and billing with your own tools.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <svg className="w-5 h-5 text-charcoal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <div>
                    <span className="font-medium text-charcoal">Custom Integrations</span>
                    <p className="text-xs text-muted mt-0.5 leading-relaxed">Connect with your existing ERP, accounting software, or payment gateways via bespoke integrations.</p>
                  </div>
                </li>
              </ul>
              <a href="#contact" className="w-full py-3.5 block text-center rounded-full border-2 border-charcoal text-charcoal font-semibold text-sm hover:bg-charcoal hover:text-cream transition-all duration-300">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <span className="text-xs font-semibold text-muted uppercase tracking-widest">How it Works</span>
            <h2 className="text-3xl lg:text-5xl font-bold mt-3 mb-4">Up and running in minutes</h2>
            <p className="text-muted max-w-xl mx-auto text-lg">Four simple steps to transform how you manage your rental business.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
            {/* Step 1 */}
            <div className="text-center fade-up">
              <div className="w-14 h-14 bg-charcoal text-cream rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5">1</div>
              <h3 className="text-base font-semibold mb-2">Create Your Account</h3>
              <p className="text-sm text-muted leading-relaxed">Sign up in 30 seconds with just your email. No credit card required to start your free trial.</p>
            </div>

            {/* Step 2 */}
            <div className="text-center fade-up">
              <div className="w-14 h-14 bg-charcoal text-cream rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5">2</div>
              <h3 className="text-base font-semibold mb-2">Add Your Inventory</h3>
              <p className="text-sm text-muted leading-relaxed">Import your products via CSV or add them manually. Set pricing rules, deposit amounts, and late fee policies.</p>
            </div>

            {/* Step 3 */}
            <div className="text-center fade-up">
              <div className="w-14 h-14 bg-charcoal text-cream rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5">3</div>
              <h3 className="text-base font-semibold mb-2">Start Renting</h3>
              <p className="text-sm text-muted leading-relaxed">Create orders, track rentals, and collect payments. Everything is recorded automatically in your dashboard.</p>
            </div>

            {/* Step 4 */}
            <div className="text-center fade-up">
              <div className="w-14 h-14 bg-charcoal text-cream rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-5">4</div>
              <h3 className="text-base font-semibold mb-2">Grow & Scale</h3>
              <p className="text-sm text-muted leading-relaxed">Use analytics to make smarter decisions. Add branches and team members as your business expands.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="py-20 lg:py-28 px-6 lg:px-8 bg-sand">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <span className="text-xs font-semibold text-muted uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl lg:text-5xl font-bold mt-3 mb-4">Loved by rental businesses</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="testimonial-card bg-white border border-warm/60 rounded-2xl p-8 fade-up">
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-muted leading-relaxed mb-6">"RentFlow completely transformed our operations. We went from tracking everything in notebooks to having a clean dashboard that shows us exactly what's happening across all our inventory."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-charcoal rounded-full flex items-center justify-center text-cream text-sm font-bold">RK</div>
                <div>
                  <div className="text-sm font-semibold">Rajesh Kumar</div>
                  <div className="text-xs text-muted">Owner, Kumar Equipment Rentals</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="testimonial-card bg-white border border-warm/60 rounded-2xl p-8 fade-up">
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-muted leading-relaxed mb-6">"The automated late fee calculation alone saves us 10+ hours every week. Our team can now focus on growing the business instead of chasing payments manually."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-charcoal rounded-full flex items-center justify-center text-cream text-sm font-bold">PS</div>
                <div>
                  <div className="text-sm font-semibold">Priya Sharma</div>
                  <div className="text-xs text-muted">Manager, CityRent Solutions</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="testimonial-card bg-white border border-warm/60 rounded-2xl p-8 fade-up">
              <div className="flex gap-1 mb-5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-muted leading-relaxed mb-6">"We manage three branches with RentFlow. The multi-location support and analytics give us visibility we never had before. It's become indispensable for our operations."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-charcoal rounded-full flex items-center justify-center text-cream text-sm font-bold">AM</div>
                <div>
                  <div className="text-sm font-semibold">Arjun Mehta</div>
                  <div className="text-xs text-muted">Director, Mehta Party Rentals</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="py-20 lg:py-28 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center fade-up">
          <h2 className="text-3xl lg:text-5xl font-bold mb-5">Ready to streamline your rental business?</h2>
          <p className="text-lg text-muted mb-10 max-w-xl mx-auto">Join 500+ businesses already using RentFlow to manage inventory, automate billing, and grow faster.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link to="/dashboard" className="btn-primary inline-flex items-center bg-charcoal text-cream px-10 py-4 rounded-full text-sm font-semibold">
                <span>Go to Dashboard</span>
                <svg className="w-4 h-4 ml-2 relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn-primary inline-flex items-center bg-charcoal text-cream px-10 py-4 rounded-full text-sm font-semibold">
                  <span>Start Your Free Trial</span>
                  <svg className="w-4 h-4 ml-2 relative z-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <a href="#contact" className="text-sm font-semibold text-muted hover:text-charcoal transition-colors underline underline-offset-4 decoration-warm hover:decoration-charcoal">Talk to our team →</a>
              </>
            )}
          </div>
          <p className="text-xs text-muted mt-6">No credit card required · 14-day free trial · Cancel anytime</p>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer id="contact" className="bg-charcoal text-cream/80 pt-16 pb-8 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-cream/10 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-cream" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                  </svg>
                </div>
                <span className="text-lg font-bold text-cream">RentFlow</span>
              </div>
              <p className="text-sm leading-relaxed text-cream/50">The modern rental management platform built for businesses that want to grow without the chaos.</p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-cream mb-4 uppercase tracking-wider">Product</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-sm text-cream/50 hover:text-cream transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-cream/50 hover:text-cream transition-colors">Pricing</a></li>
                <li><a href="#how-it-works" className="text-sm text-cream/50 hover:text-cream transition-colors">How it Works</a></li>
                <li><a href="#" className="text-sm text-cream/50 hover:text-cream transition-colors">Integrations</a></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-sm font-semibold text-cream mb-4 uppercase tracking-wider">Company</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-cream/50 hover:text-cream transition-colors">About Us</a></li>
                <li><a href="#" className="text-sm text-cream/50 hover:text-cream transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-cream/50 hover:text-cream transition-colors">Careers</a></li>
                <li><a href="#contact" className="text-sm text-cream/50 hover:text-cream transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-cream mb-4 uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-sm text-cream/50 hover:text-cream transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-cream/50 hover:text-cream transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-cream/50 hover:text-cream transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-cream/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-cream/40">&copy; 2026 RentFlow. All rights reserved.</p>
            <div className="flex items-center gap-5">
              {/* Twitter / X */}
              <a href="#" className="text-cream/40 hover:text-cream transition-colors" aria-label="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="text-cream/40 hover:text-cream transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
                </svg>
              </a>
              {/* Email */}
              <a href="mailto:hello@rentflow.in" className="text-cream/40 hover:text-cream transition-colors" aria-label="Email">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
