import { apiFetch } from '../api';
import React, { useState, useEffect } from 'react';
import { Ticket, Send, CheckCircle, HelpCircle, MessageSquare, AlertCircle } from 'lucide-react';

export default function SupportTickets({ token, showToast }) {
  const [tickets, setTickets] = useState([]);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [activeTicket, setActiveTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      const res = await apiFetch('/api/tickets/my-tickets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to retrieve support tickets');
      const data = await res.json();
      setTickets(data);
      
      // Keep active ticket detailed view synchronized if it was open
      if (activeTicket) {
        const updated = data.find(t => t.id === activeTicket.id);
        if (updated) setActiveTicket(updated);
      }
    } catch (err) {
      console.error(err);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!subject || !message) {
      showToast('Subject and message are required to file a ticket', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiFetch('/api/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subject, message })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit ticket');

      showToast('Support ticket filed successfully!', 'success');
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      const res = await apiFetch(`/api/tickets/${activeTicket.id}/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: replyText })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send reply');

      setReplyText('');
      showToast('Reply submitted', 'success');
      
      // Update in-memory ticket list
      fetchTickets();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
        Initializing helpdesk modules...
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ marginTop: '20px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Ticket size={28} style={{ color: 'var(--accent-cyan)' }} />
        <span>Velocraft Support Registry</span>
      </h1>

      <div className="catalog-layout">
        {/* Left Side: Create Ticket Form or Ticket Selection Sidebar */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              File Inquiry Ticket
            </h3>
            <form onSubmit={handleCreateTicket}>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Model Scale Defect"
                  value={subject} 
                  onChange={(e) => setSubject(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">Message Details</label>
                <textarea 
                  className="form-input" 
                  rows="4" 
                  placeholder="Provide precise details regarding your replica order or query..."
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  style={{ resize: 'none' }}
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '10px' }}
                disabled={submitting}
              >
                <span>{submitting ? 'Filing Inquiry...' : 'Submit Inquiry'}</span>
              </button>
            </form>
          </div>

          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              Active Inquiries
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {tickets.length === 0 ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                  No historical inquiries logged.
                </div>
              ) : (
                tickets.map(t => (
                  <button
                    key={t.id}
                    className={`crm-sidebar-btn ${activeTicket?.id === t.id ? 'active' : ''}`}
                    onClick={() => setActiveTicket(t)}
                    style={{ fontSize: '0.85rem', padding: '10px 12px' }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                        {t.subject}
                      </span>
                      <span className={`badge ${t.status === 'Resolved' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                        {t.status}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </aside>

        {/* Right Side: Active Ticket Timeline Details */}
        <main>
          {activeTicket ? (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '400px' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '16px',
                marginBottom: '20px'
              }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ticket #{activeTicket.id}</span>
                  <h2 style={{ fontSize: '1.4rem', color: 'var(--text-primary)', marginTop: '2px' }}>{activeTicket.subject}</h2>
                </div>
                <span className={`badge ${activeTicket.status === 'Resolved' ? 'badge-success' : activeTicket.status === 'In Progress' ? 'badge-info' : 'badge-warning'}`}>
                  {activeTicket.status}
                </span>
              </div>

              {/* Original customer message */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <strong>Alex Mercer (Customer)</strong>
                  <span>{new Date(activeTicket.createdAt).toLocaleString()}</span>
                </div>
                <p style={{ fontSize: '0.95rem', lineHeight: '1.5', color: 'var(--text-primary)' }}>{activeTicket.message}</p>
              </div>

              {/* Replies Timeline */}
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={14} />
                  <span>Discussion Stream</span>
                </h4>
                
                <div className="ticket-replies" style={{ borderTop: 'none', paddingTop: 0 }}>
                  {activeTicket.replies.map((reply, idx) => (
                    <div 
                      key={idx} 
                      className={`reply-bubble ${reply.sender === 'admin' ? 'reply-admin' : 'reply-customer'}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', gap: '20px' }}>
                        <strong>{reply.sender === 'admin' ? 'Velocraft Support' : 'You'}</strong>
                        <span>{new Date(reply.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p>{reply.message}</p>
                    </div>
                  ))}
                  {activeTicket.replies.length === 0 && (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '20px 0' }}>
                      Awaiting response from Velocraft technicians.
                    </div>
                  )}
                </div>
              </div>

              {/* Send Reply box */}
              {activeTicket.status !== 'Resolved' ? (
                <form onSubmit={handleSendReply} style={{ display: 'flex', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Type follow-up message..." 
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0 18px' }}>
                    <Send size={16} />
                  </button>
                </form>
              ) : (
                <div style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--accent-green)',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  justifyContent: 'center'
                }}>
                  <CheckCircle size={16} />
                  <span>This inquiry ticket has been marked Resolved. Replies are locked.</span>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <HelpCircle size={48} style={{ color: 'var(--border-color)', marginBottom: '16px' }} />
              <h3>Select or File a Support Inquiry</h3>
              <p style={{ fontSize: '0.85rem', marginTop: '6px' }}>We provide 24/7 technical support regarding all replica packaging, parts, or collections.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

