import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Card, { CardHeader, CardTitle } from '../../components/ui/Card';
import Badge, { formatStatus } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

const BackBtn = styled.button`
  background: none; border: none; color: ${({ theme }) => theme.colors.primary};
  cursor: pointer; font-size: 14px; font-weight: 600; margin-bottom: 16px; padding: 0;
  &:hover { text-decoration: underline; }
`;
const Grid = styled.div`display: grid; grid-template-columns: 2fr 1fr; gap: 20px; @media(max-width:900px){grid-template-columns:1fr;}`;
const Section = styled.div`margin-bottom: 20px;`;
const SectionTitle = styled.h4`font-size: 14px; font-weight: 700; color: ${({ theme }) => theme.colors.textSecondary}; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;`;
const Content = styled.p`font-size: 14px; color: ${({ theme }) => theme.colors.text}; line-height: 1.6; white-space: pre-wrap;`;
const InfoRow = styled.div`display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight}; font-size: 14px;`;
const InfoLabel = styled.span`color: ${({ theme }) => theme.colors.textSecondary};`;
const InfoValue = styled.span`font-weight: 600; color: ${({ theme }) => theme.colors.text};`;

const ScoreBar = styled.div`
  height: 8px; border-radius: 4px;
  background: ${({ theme }) => theme.colors.border};
  margin-top: 4px; overflow: hidden;
`;
const ScoreFill = styled.div`
  height: 100%; border-radius: 4px;
  background: ${({ theme }) => theme.colors.gradient};
  width: ${({ score }) => (score / 10) * 100}%;
  transition: width 0.5s ease;
`;

const EvalCard = styled.div`
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  margin-bottom: 12px;
`;

const StatusSelect = styled.select`
  padding: 10px 14px; border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.bg}; color: ${({ theme }) => theme.colors.text};
  font-size: 14px; width: 100%; outline: none; margin-bottom: 12px;
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [app, setApp] = useState(null);
  const [evaluations, setEvaluations] = useState([]);
  const [evalSummary, setEvalSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const canManage = ['hr_staff', 'admin'].includes(user?.role);
  const canEvaluate = ['committee_member', 'hr_staff', 'admin'].includes(user?.role);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get application from all applications list
        const appsRes = await api.get('/applications?limit=1000');
        const found = appsRes.data.data.find(a => a.id === id);
        if (found) {
          setApp(found);
          setNewStatus(found.status);
        }
        if (canEvaluate) {
          const evalRes = await api.get(`/evaluations/application/${id}`);
          setEvaluations(evalRes.data.data);
          setEvalSummary(evalRes.data.summary);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, canEvaluate]);

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await api.patch(`/applications/${id}/status`, { status: newStatus });
      toast.success('Status updated');
      setApp(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!app) return <div style={{ padding: 40, textAlign: 'center' }}>Application not found</div>;

  return (
    <div>
      <BackBtn onClick={() => navigate(-1)}>← Back</BackBtn>
      <Grid>
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
              <Badge status={app.status}>{formatStatus(app.status)}</Badge>
            </CardHeader>

            <Section>
              <SectionTitle>Applicant</SectionTitle>
              <InfoRow><InfoLabel>Name</InfoLabel><InfoValue>{app.first_name} {app.last_name}</InfoValue></InfoRow>
              <InfoRow><InfoLabel>Email</InfoLabel><InfoValue>{app.email}</InfoValue></InfoRow>
              {app.phone && <InfoRow><InfoLabel>Phone</InfoLabel><InfoValue>{app.phone}</InfoValue></InfoRow>}
            </Section>

            <Section>
              <SectionTitle>Job</SectionTitle>
              <InfoRow><InfoLabel>Position</InfoLabel><InfoValue>{app.job_title}</InfoValue></InfoRow>
              <InfoRow><InfoLabel>Department</InfoLabel><InfoValue>{app.department}</InfoValue></InfoRow>
              <InfoRow><InfoLabel>Applied</InfoLabel><InfoValue>{format(new Date(app.submitted_at), 'MMMM d, yyyy')}</InfoValue></InfoRow>
            </Section>

            {app.cover_letter && (
              <Section>
                <SectionTitle>Cover Letter</SectionTitle>
                <Content>{app.cover_letter}</Content>
              </Section>
            )}

            {app.cv_url && (
              <Section>
                <SectionTitle>CV / Resume</SectionTitle>
                <Button variant="ghost" size="sm" onClick={() => window.open(app.cv_url, '_blank')}>
                  📄 View CV
                </Button>
              </Section>
            )}
          </Card>

          {canEvaluate && evaluations.length > 0 && (
            <Card style={{ marginTop: 20 }}>
              <CardHeader>
                <CardTitle>Evaluations ({evaluations.length})</CardTitle>
                {evalSummary && <span style={{ fontSize: 14, fontWeight: 700, color: '#667eea' }}>Avg: {evalSummary.avg_score}/10</span>}
              </CardHeader>
              {evaluations.map(ev => (
                <EvalCard key={ev.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <strong style={{ fontSize: 14 }}>{ev.evaluator_name}</strong>
                    <Badge status={ev.recommendation?.replace('_', ' ')}>{formatStatus(ev.recommendation)}</Badge>
                  </div>
                  {[['Technical', ev.technical_score], ['Communication', ev.communication_score], ['Experience', ev.experience_score]].map(([label, score]) => (
                    <div key={label} style={{ marginBottom: 8 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span>{label}</span><span style={{ fontWeight: 700 }}>{score}/10</span>
                      </div>
                      <ScoreBar><ScoreFill score={score} /></ScoreBar>
                    </div>
                  ))}
                  {ev.comments && <p style={{ fontSize: 13, color: '#718096', marginTop: 8 }}>{ev.comments}</p>}
                </EvalCard>
              ))}
            </Card>
          )}
        </div>

        <div>
          {canManage && (
            <Card>
              <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
              <StatusSelect value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                {['submitted','under_review','shortlisted','interview_scheduled','interviewed','offered','hired','rejected'].map(s => (
                  <option key={s} value={s}>{formatStatus(s)}</option>
                ))}
              </StatusSelect>
              <Button fullWidth loading={updating} onClick={handleStatusUpdate} disabled={newStatus === app.status}>
                Update Status
              </Button>
            </Card>
          )}

          {canEvaluate && (
            <Card style={{ marginTop: 16 }}>
              <CardHeader><CardTitle>Evaluation</CardTitle></CardHeader>
              <Button fullWidth variant="secondary" onClick={() => navigate(`/evaluations?application=${id}`)}>
                ⭐ Add Evaluation
              </Button>
            </Card>
          )}
        </div>
      </Grid>
    </div>
  );
};

export default ApplicationDetail;
