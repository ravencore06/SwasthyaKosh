import React, { useState } from 'react';
import { SidebarLayout } from '../components/SidebarLayout';
import { dbService } from '../services/db';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Search, Cpu } from 'lucide-react';

const HospitalPrescriptions = () => {
  const { user } = useAuth();
  const [patientId, setPatientId] = useState('');
  const [medications, setMedications] = useState('');
  const [notes, setNotes] = useState('');
  
  const [aiInsight, setAiInsight] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const handleAnalyze = async () => {
    if (!medications) return;
    setIsAnalyzing(true);
    setAiInsight('');
    const medsArray = medications.split(',').map(m => m.trim());
    const insight = await dbService.analyzePrescription(medsArray);
    setAiInsight(insight);
    setIsAnalyzing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientId || !medications) return;
    
    setIsSubmitting(true);
    try {
      const rxData = {
        patientId,
        hospitalId: user.id,
        hospitalName: user.name,
        medications: medications.split(',').map(m => m.trim()),
        notes
      };
      await dbService.createPrescription(rxData);
      setMessage('Prescription successfully created and securely linked to patient.');
      setPatientId('');
      setMedications('');
      setNotes('');
      setAiInsight('');
    } catch (err) {
      setMessage('Error creating prescription.');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setMessage(''), 4000);
    }
  };

  return (
    <SidebarLayout title="Manage Prescriptions">
      <div className="glass-panel" style={{ padding: '32px', maxWidth: '800px' }}>
        <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle color="var(--hospital-color)" /> Create New Prescription
        </h3>
        
        {message && (
          <div className="badge badge-success" style={{ padding: '12px', fontSize: '1rem', width: '100%', justifyContent: 'center', marginBottom: '24px' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-col" style={{ gap: '20px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Patient ID / Email</label>
            <div className="flex" style={{ gap: '8px' }}>
              <input 
                type="text" 
                value={patientId} 
                onChange={e => setPatientId(e.target.value)} 
                required 
                className="input-hospital w-full"
                placeholder="e.g. p1"
              />
              <button type="button" className="badge badge-primary" style={{ border: 'none', cursor: 'pointer', padding: '0 16px' }}>
                <Search size={18} />
              </button>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Medications (comma separated)</label>
            <textarea 
              value={medications}
              onChange={e => setMedications(e.target.value)}
              required
              className="input-hospital w-full"
              style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', minHeight: '80px', fontFamily: 'inherit' }}
              placeholder="Amoxicillin 500mg, Ibuprofen 400mg"
            />
          </div>

          <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={handleAnalyze} 
              disabled={isAnalyzing || !medications}
              className="badge"
              style={{ background: '#f3e8ff', color: '#7e22ce', border: '1px solid #d8b4fe', cursor: 'pointer', padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}
            >
              <Cpu size={16} /> {isAnalyzing ? 'Analyzing...' : 'AI Drug Interaction Check'}
            </button>
          </div>

          {aiInsight && (
            <div className="animate-fade-in" style={{ padding: '16px', background: '#f8fafc', borderLeft: '4px solid #8b5cf6', borderRadius: '8px' }}>
              <strong>AI Insight:</strong> {aiInsight}
            </div>
          )}

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Doctor's Notes</label>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input-hospital w-full"
              style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', minHeight: '100px', fontFamily: 'inherit' }}
            />
          </div>

          <button 
             type="submit" 
             className="submit-btn btn-hospital"
             disabled={isSubmitting}
             style={{ marginTop: '12px' }}
          >
            {isSubmitting ? 'Securing & Saving...' : 'Issue Prescription'}
          </button>
        </form>
      </div>
    </SidebarLayout>
  );
};

export default HospitalPrescriptions;
