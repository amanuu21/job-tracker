import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import api from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Title = styled.h2`font-size: 22px; font-weight: 800; color: ${({ theme }) => theme.colors.text}; margin-bottom: 24px;`;
const Form = styled.form`display: flex; flex-direction: column; gap: 20px;`;
const Row = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: 16px; @media(max-width:600px){grid-template-columns:1fr;}`;
const Label = styled.label`font-size: 13px; font-weight: 600; color: ${({ theme }) => theme.colors.textSecondary}; display: block; margin-bottom: 6px;`;
const Select = styled.select`
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.bg};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  outline: none;
  &:focus { border-color: ${({ theme }) => theme.colors.primary}; }
`;
const Textarea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
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

const BackBtn = styled.button`
  background: none; border: none; color: ${({ theme }) => theme.colors.primary};
  cursor: pointer; font-size: 14px; font-weight: 600; margin-bottom: 16px; padding: 0;
  &:hover { text-decoration: underline; }
`;

const CreateJob = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', department: '', description: '', requirements: '', responsibilities: '',
    location: '', job_type: 'full_time', salary_min: '', salary_max: '',
    deadline: '', positions_available: 1,
  });

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/jobs', form);
      toast.success('Job vacancy created!');
      navigate(`/jobs/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <BackBtn onClick={() => navigate('/jobs')}>← Back to Jobs</BackBtn>
      <Title>Post New Job Vacancy</Title>
      <Card>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Input label="Job Title *" placeholder="e.g. Senior Software Engineer" value={form.title} onChange={set('title')} required />
            <Input label="Department *" placeholder="e.g. Engineering" value={form.department} onChange={set('department')} required />
          </Row>
          <Row>
            <Input label="Location" placeholder="e.g. Addis Ababa / Remote" value={form.location} onChange={set('location')} />
            <div>
              <Label>Job Type</Label>
              <Select value={form.job_type} onChange={set('job_type')}>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
                <option value="remote">Remote</option>
              </Select>
            </div>
          </Row>
          <Row>
            <Input label="Salary Min ($)" type="number" placeholder="e.g. 50000" value={form.salary_min} onChange={set('salary_min')} />
            <Input label="Salary Max ($)" type="number" placeholder="e.g. 80000" value={form.salary_max} onChange={set('salary_max')} />
          </Row>
          <Row>
            <Input label="Application Deadline *" type="date" value={form.deadline} onChange={set('deadline')} required />
            <Input label="Positions Available" type="number" min="1" value={form.positions_available} onChange={set('positions_available')} />
          </Row>
          <div>
            <Label>Job Description *</Label>
            <Textarea placeholder="Describe the role, company culture, and what makes this opportunity exciting..." value={form.description} onChange={set('description')} required />
          </div>
          <div>
            <Label>Requirements *</Label>
            <Textarea placeholder="List the required qualifications, skills, and experience..." value={form.requirements} onChange={set('requirements')} required />
          </div>
          <div>
            <Label>Responsibilities (optional)</Label>
            <Textarea placeholder="Describe the key responsibilities and day-to-day tasks..." value={form.responsibilities} onChange={set('responsibilities')} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button type="button" variant="ghost" onClick={() => navigate('/jobs')}>Cancel</Button>
            <Button type="submit" loading={loading}>Post Job Vacancy</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CreateJob;
