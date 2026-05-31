import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Title = styled.h2`font-size: 22px; font-weight: 800; color: ${({ theme }) => theme.colors.text}; margin-bottom: 24px;`;
const Grid = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 20px; @media(max-width:900px){grid-template-columns:1fr;}`;
const Label = styled.label`font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.textSecondary}; display: block; margin-bottom: 6px;`;
const Select = styled.select`
  width: 100%; padding: 10px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.bg}; color: ${({ theme }) => theme.colors.text};
  font-size: 14px; outline: none; margin-bottom: 16px;
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;
const Textarea = styled.textarea`
  width: 100%; padding: 12px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.bg}; color: ${({ theme }) => theme.colors.text};
  font-size: 14px; resize: vertical; min-height: 100px; outline: none; font-family: inherit;
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const ScoreInput = styled.div`
  margin-bottom: 16px;
`;

const ScoreSlider = styled.input`
  width: 100%; margin: 8px 0;
  accent-color: ${({ theme }) => theme.colors.primary};
`;

const ScoreDisplay = styled.span`
  font-size: 20px; font-weight: 800;
  background: ${({ theme }) => theme.colors.gradient};
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
`;

const EvalItem = styled.div`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: 12px;
`;

const Evaluations = () => {
  const [searchParams] = useSearchParams();
  const prefilledApp = searchParams.get('application');
  const [applications, setApplications] = useState([]);
  const [myEvals, setMyEvals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    application_id: prefilledApp || '',
    technical_score: 5,
    communication_score: 5,
    experience_score: 5,
    recommendation: 'neutral',
    comments: '',
  });

  useEffect(() => {
    Promise.all([
      api.get('/applications?limit=100'),
      api.get('/evaluations/my'),
    ]).then(([appsRes, evalsRes]) => {
      setApplications(appsRes.data.data);
      setMyEvals(evalsRes.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/evaluations', form);
      toast.success('Evaluation submitted!');
      const evalsRes = await api.get('/evaluations/my');
      setMyEvals(evalsRes.data.data);
      setForm(p => ({ ...p, application_id: '', technical_score: 5, communication_score: 5, experience_score: 5, recommendation: 'neutral', comments: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit evaluation');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <Title>Evaluations</Title>
      <Grid>
        <Card>
          <CardHeader><CardTitle>Submit Evaluation</CardTitle></CardHeader>
          <form onSubmit={handleSubmit}>
            <Label>Select Application *</Label>
            <Select value={form.application_id} onChange={set('application_id')} required>
              <option value="">Choose an application...</option>
              {applications.map(a => (
                <option key={a.id} value={a.id}>{a.first_name} {a.last_name} — {a.job_title}</option>
              ))}
            </Select>

            {[
              { field: 'technical_score', label: '🔧 Technical Skills' },
              { field: 'communication_score', label: '💬 Communication' },
              { field: 'experience_score', label: '📚 Experience' },
            ].map(({ field, label }) => (
              <ScoreInput key={field}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Label style={{ marginBottom: 0 }}>{label}</Label>
                  <ScoreDisplay>{form[field]}/10</ScoreDisplay>
                </div>
                <ScoreSlider type="range" min="1" max="10" value={form[field]} onChange={set(field)} />
              </ScoreInput>
            ))}

            <Label>Recommendation</Label>
            <Select value={form.recommendation} onChange={set('recommendation')}>
              <option value="strongly_recommend">Strongly Recommend</option>
              <option value="recommend">Recommend</option>
              <option value="neutral">Neutral</option>
              <option value="not_recommend">Not Recommend</option>
              <option value="strongly_not_recommend">Strongly Not Recommend</option>
            </Select>

            <Label>Comments (optional)</Label>
            <Textarea placeholder="Add your evaluation notes..." value={form.comments} onChange={set('comments')} style={{ marginBottom: 16 }} />

            <Button type="submit" loading={submitting} fullWidth>Submit Evaluation</Button>
          </form>
        </Card>

        <Card>
          <CardHeader><CardTitle>My Evaluations ({myEvals.length})</CardTitle></CardHeader>
          {myEvals.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#718096', padding: '40px 0' }}>No evaluations yet</p>
          ) : (
            myEvals.map(ev => (
              <EvalItem key={ev.id}>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>{ev.applicant_name}</div>
                <div style={{ fontSize: 13, color: '#718096', marginBottom: 8 }}>{ev.job_title}</div>
                <div style={{ display: 'flex', gap: 12, fontSize: 13 }}>
                  <span>🔧 {ev.technical_score}</span>
                  <span>💬 {ev.communication_score}</span>
                  <span>📚 {ev.experience_score}</span>
                  <span style={{ fontWeight: 700, color: '#667eea' }}>Avg: {ev.overall_score}</span>
                </div>
              </EvalItem>
            ))
          )}
        </Card>
      </Grid>
    </div>
  );
};

export default Evaluations;
