import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { format } from 'date-fns';

const Title = styled.h2`font-size: 22px; font-weight: 800; color: ${({ theme }) => theme.colors.text}; margin-bottom: 24px;`;
const Form = styled.form`display: flex; flex-direction: column; gap: 20px;`;
const Row = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 16px; @media(max-width:600px){grid-template-columns:1fr;}`;
const Label = styled.label`font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.textSecondary}; display: block; margin-bottom: 6px;`;
const Select = styled.select`
  width: 100%; padding: 10px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px; outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;
const Textarea = styled.textarea`
  width: 100%; padding: 12px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px; resize: vertical; min-height: 120px; outline: none; font-family: inherit;
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;
const BackBtn = styled.button`
  background: none; border: none; color: ${({ theme }) => theme.colors.primary};
  cursor: pointer; font-size: 14px; font-weight: 600; margin-bottom: 16px; padding: 0;
  &:hover { text-decoration: underline; }
`;

const EditJob = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({});

  useEffect(() => {
    api.get(`/jobs/${id}`).then(r => {
      const j = r.data.data;
      setForm({
        title: j.title, department: j.department, description: j.description,
        requirements: j.requirements, responsibilities: j.responsibilities || '',
        location: j.location || '', job_type: j.job_type, salary_min: j.salary_min || '',
        salary_max: j.salary_max || '', deadline: format(new Date(j.deadline), 'yyyy-MM-dd'),
        positions_available: j.positions_available, status: j.status,
      });
    }).catch(() => navigate('/jobs')).finally(() => setFetching(false));
  }, [id, navigate]);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put(`/jobs/${id}`, form);
      toast.success('Job updated!');
      navigate(`/jobs/${id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update job');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <LoadingSpinner />;

  return (
    <div>
      <BackBtn onClick={() => navigate(`/jobs/${id}`)}>← Back to Job</BackBtn>
      <Title>Edit Job Vacancy</Title>
      <Card>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Input label="Job Title *" value={form.title || ''} onChange={set('title')} required />
            <Input label="Department *" value={form.department || ''} onChange={set('department')} required />
          </Row>
          <Row>
            <Input label="Location" value={form.location || ''} onChange={set('location')} />
            <div>
              <Label>Job Type</Label>
              <Select value={form.job_type || 'full_time'} onChange={set('job_type')}>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </Select>
            </div>
          </Row>
          <Row>
            <div>
              <Label>Status</Label>
              <Select value={form.status || 'open'} onChange={set('status')}>
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
                <option value="cancelled">Cancelled</option>
              </Select>
            </div>
            <Input label="Positions Available" type="number" min="1" value={form.positions_available || 1} onChange={set('positions_available')} />
          </Row>
          <Row>
            <Input label="Salary Min ($)" type="number" value={form.salary_min || ''} onChange={set('salary_min')} />
            <Input label="Salary Max ($)" type="number" value={form.salary_max || ''} onChange={set('salary_max')} />
          </Row>
          <Input label="Application Deadline *" type="date" value={form.deadline || ''} onChange={set('deadline')} required />
          <div>
            <Label>Description *</Label>
            <Textarea value={form.description || ''} onChange={set('description')} required />
          </div>
          <div>
            <Label>Requirements *</Label>
            <Textarea value={form.requirements || ''} onChange={set('requirements')} required />
          </div>
          <div>
            <Label>Responsibilities</Label>
            <Textarea value={form.responsibilities || ''} onChange={set('responsibilities')} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => navigate(`/jobs/${id}`)}>Cancel</Button>
            <Button type="submit" loading={loading}>Save Changes</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default EditJob;
