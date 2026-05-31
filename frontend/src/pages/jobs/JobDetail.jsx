import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Badge, { formatStatus } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 16px;
  padding: 0;

  &:hover { text-decoration: underline; }
`;

const Title = styled.h1`font-size: 28px; font-weight: 800; color: ${({ theme }) => theme.colors.text};`;
const Dept = styled.p`font-size: 16px; color: ${({ theme }) => theme.colors.primary}; font-weight: 600; margin-top: 4px;`;

const MetaGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 16px 0;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Content = styled.div`
  font-size: 14px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: pre-wrap;
`;

const ApplyModal = styled(motion.div)`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 24px;
`;

const ModalCard = styled(Card)`
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalTitle = styled.h3`font-size: 20px; font-weight: 700; color: ${({ theme }) => theme.colors.text}; margin-bottom: 16px;`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  resize: vertical;
  min-height: 120px;
  outline: none;
  font-family: inherit;

  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;

const FileInput = styled.div`
  border: 2px dashed ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;

  &:hover { border-color: ${({ theme }) => theme.colors.primary}; background: ${({ theme }) => theme.colors.primaryLight}; }

  input { display: none; }
`;

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApply, setShowApply] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvFile, setCvFile] = useState(null);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    api.get(`/jobs/${id}`).then(r => setJob(r.data.data)).catch(() => navigate('/jobs')).finally(() => setLoading(false));
    if (user?.role === 'applicant') {
      api.get('/applications/my').then(r => {
        setHasApplied(r.data.data.some(a => a.job_id === id));
      }).catch(() => {});
    }
  }, [id, navigate, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const formData = new FormData();
      formData.append('job_id', id);
      if (coverLetter) formData.append('cover_letter', coverLetter);
      if (cvFile) formData.append('cv', cvFile);
      await api.post('/applications', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Application submitted successfully!');
      setShowApply(false);
      setHasApplied(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!job) return null;

  const isExpired = new Date(job.deadline) < new Date();
  const canApply = user?.role === 'applicant' && job.status === 'open' && !isExpired && !hasApplied;
  const canManage = ['hr_staff', 'admin'].includes(user?.role);

  return (
    <div>
      <BackBtn onClick={() => navigate('/jobs')}>← Back to Jobs</BackBtn>

      <Card>
        <Header>
          <div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
              <Badge status={job.status}>{formatStatus(job.status)}</Badge>
              <Badge status={job.job_type}>{formatStatus(job.job_type)}</Badge>
            </div>
            <Title>{job.title}</Title>
            <Dept>{job.department}</Dept>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {canManage && (
              <Button variant="ghost" onClick={() => navigate(`/jobs/${id}/edit`)}>✏️ Edit</Button>
            )}
            {canApply && (
              <Button onClick={() => setShowApply(true)} size="lg">Apply Now 🚀</Button>
            )}
            {hasApplied && (
              <Button variant="ghost" disabled>✅ Applied</Button>
            )}
            {isExpired && user?.role === 'applicant' && (
              <Button variant="ghost" disabled>⏰ Deadline Passed</Button>
            )}
          </div>
        </Header>

        <MetaGrid>
          {job.location && <MetaItem>📍 {job.location}</MetaItem>}
          <MetaItem>👥 {job.positions_available} position{job.positions_available > 1 ? 's' : ''}</MetaItem>
          <MetaItem>📋 {job.application_count} applicants</MetaItem>
          <MetaItem>📅 Deadline: {format(new Date(job.deadline), 'MMMM d, yyyy')}</MetaItem>
          {job.salary_min && <MetaItem>💰 ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}</MetaItem>}
          <MetaItem>👤 Posted by {job.created_by_name}</MetaItem>
        </MetaGrid>

        <Section>
          <SectionTitle>📝 Description</SectionTitle>
          <Content>{job.description}</Content>
        </Section>

        <Section>
          <SectionTitle>✅ Requirements</SectionTitle>
          <Content>{job.requirements}</Content>
        </Section>

        {job.responsibilities && (
          <Section>
            <SectionTitle>🎯 Responsibilities</SectionTitle>
            <Content>{job.responsibilities}</Content>
          </Section>
        )}
      </Card>

      {showApply && (
        <ApplyModal initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={e => e.target === e.currentTarget && setShowApply(false)}>
          <ModalCard as={motion.div} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <ModalTitle>Apply for {job.title}</ModalTitle>
            <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 6 }}>Cover Letter (optional)</label>
                <Textarea
                  placeholder="Tell us why you're a great fit for this role..."
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#718096', display: 'block', marginBottom: 6 }}>Upload CV (PDF, DOC, DOCX - max 5MB)</label>
                <FileInput onClick={() => document.getElementById('cv-upload').click()}>
                  <input id="cv-upload" type="file" accept=".pdf,.doc,.docx" onChange={e => setCvFile(e.target.files[0])} />
                  {cvFile ? `✅ ${cvFile.name}` : '📎 Click to upload your CV'}
                </FileInput>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button type="button" variant="ghost" fullWidth onClick={() => setShowApply(false)}>Cancel</Button>
                <Button type="submit" loading={applying} fullWidth>Submit Application</Button>
              </div>
            </form>
          </ModalCard>
        </ApplyModal>
      )}
    </div>
  );
};

export default JobDetail;
