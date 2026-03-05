import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';
import SuccessToast from '../components/SuccessToast';
import {
  Briefcase,
  Plus,
  X,
  Trash2,
  AlertCircle,
  Loader,
  Building2,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  Edit,
  Eye,
  ToggleLeft,
  ToggleRight,
  Filter,
  Search
} from 'lucide-react';

interface Category {
  _id: string;
  CategoryName: string;
  CategoryEmoji: string;
  isActive: boolean;
}

interface Job {
  _id: string;
  JobTitle: string;
  CompanyName: string;
  CompanyLogo?: string;
  JobImage?: string;
  Category: Category | string;
  Salary: { min: string; max: string };
  Experience?: { min: number; max: number };
  Location: string;
  JobType: string;
  WorkMode: string;
  HiringStatus: string;
  CompanyVerified: boolean;
  MatchPercentage?: number;
  AboutCompany?: string;
  JobDescription?: string[];
  RequiredSkills?: string[];
  InterviewProcess?: Array<{ step: string; description: string; duration: string }>;
  ApplyURL?: string;
  isActive: boolean;
  isTrending?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InterviewStep {
  step: string;
  description: string;
  duration: string;
}

interface JobStats {
  total: number;
  active: number;
  inactive: number;
}

export default function Jobs() {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<JobStats>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);
  const [deletingJob, setDeletingJob] = useState<Job | null>(null);
  const [categoryJob, setCategoryJob] = useState<Job | null>(null);
  
  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    JobTitle: '',
    CompanyName: '',
    CompanyLogo: '',
    JobImage: '',
    Category: '',
    Salary: { min: '', max: '' },
    Experience: { min: '', max: '' },
    Location: '',
    JobType: 'Full Time',
    WorkMode: 'On-site',
    HiringStatus: 'Actively Hiring',
    CompanyVerified: false,
    MatchPercentage: '',
    AboutCompany: '',
    JobDescription: [''],
    RequiredSkills: [''],
    InterviewProcess: [{ step: '', description: '', duration: '' }],
    ApplyURL: '',
    isActive: true,
    isTrending: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchJobs();
    fetchCategories();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest(API_ENDPOINTS.JOB, { method: 'GET' }, token);
      
      if (data.data) {
        setJobs(data.data);
        calculateStats(data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (jobsList: Job[]) => {
    const total = jobsList.length;
    const active = jobsList.filter(j => j.isActive).length;
    const inactive = total - active;
    setStats({ total, active, inactive });
  };

  const fetchCategories = async () => {
    try {
      const data = await apiRequest(API_ENDPOINTS.CATEGORY_ACTIVE, { method: 'GET' }, token);
      if (data.data) {
        setCategories(data.data);
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const handleCreate = () => {
    setEditingJob(null);
    setFormData({
      JobTitle: '',
      CompanyName: '',
      CompanyLogo: '',
      JobImage: '',
      Category: '',
      Salary: { min: '', max: '' },
      Experience: { min: '', max: '' },
      Location: '',
      JobType: 'Full Time',
      WorkMode: 'On-site',
      HiringStatus: 'Actively Hiring',
      CompanyVerified: false,
      MatchPercentage: '',
      AboutCompany: '',
      JobDescription: [''],
      RequiredSkills: [''],
      InterviewProcess: [{ step: '', description: '', duration: '' }],
      ApplyURL: '',
      isActive: true,
      isTrending: false,
    });
    setShowModal(true);
  };

  const handleEdit = (job: Job) => {
    setEditingJob(job);
    const categoryId = typeof job.Category === 'object' ? job.Category._id : job.Category;
    setFormData({
      JobTitle: job.JobTitle,
      CompanyName: job.CompanyName,
      CompanyLogo: job.CompanyLogo || '',
      JobImage: job.JobImage || '',
      Category: categoryId || '',
      Salary: job.Salary || { min: '', max: '' },
      Experience: job.Experience 
        ? { min: job.Experience.min.toString(), max: job.Experience.max.toString() }
        : { min: '', max: '' },
      Location: job.Location,
      JobType: job.JobType,
      WorkMode: job.WorkMode,
      HiringStatus: job.HiringStatus,
      CompanyVerified: job.CompanyVerified,
      MatchPercentage: job.MatchPercentage?.toString() || '',
      AboutCompany: job.AboutCompany || '',
      JobDescription: job.JobDescription && job.JobDescription.length > 0 ? job.JobDescription : [''],
      RequiredSkills: job.RequiredSkills && job.RequiredSkills.length > 0 ? job.RequiredSkills : [''],
      InterviewProcess: job.InterviewProcess && job.InterviewProcess.length > 0 
        ? job.InterviewProcess 
        : [{ step: '', description: '', duration: '' }],
      ApplyURL: job.ApplyURL || '',
      isActive: job.isActive,
      isTrending: job.isTrending || false,
    });
    setShowModal(true);
  };

  const handleView = async (jobId: string) => {
    try {
      const data = await apiRequest(`${API_ENDPOINTS.JOB}/${jobId}`, { method: 'GET' }, token);
      if (data.data) {
        setViewingJob(data.data);
        setShowViewModal(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch job details');
    }
  };

  const handleDelete = (job: Job) => {
    setDeletingJob(job);
    setShowDeleteModal(true);
  };

  const handleCategoryAssign = (job: Job) => {
    setCategoryJob(job);
    const categoryId = typeof job.Category === 'object' ? job.Category._id : job.Category;
    setSelectedCategory(categoryId || '');
    setShowCategoryModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        Category: formData.Category,
        Salary: {
          min: formData.Salary.min,
          max: formData.Salary.max,
        },
        Experience: {
          min: parseInt(formData.Experience.min) || 0,
          max: parseInt(formData.Experience.max) || 0,
        },
        MatchPercentage: parseInt(formData.MatchPercentage) || 0,
        JobDescription: formData.JobDescription.filter(desc => desc.trim() !== ''),
        RequiredSkills: formData.RequiredSkills.filter(skill => skill.trim() !== ''),
        InterviewProcess: formData.InterviewProcess.filter(
          process => process.step.trim() !== '' && process.description.trim() !== ''
        ),
      };

      if (editingJob) {
        await apiRequest(
          `${API_ENDPOINTS.JOB}/${editingJob._id}`,
          {
            method: 'PUT',
            body: JSON.stringify(submitData),
          },
          token
        );
        setSuccessMessage('Job Updated Successfully');
      } else {
        await apiRequest(API_ENDPOINTS.JOB, {
          method: 'POST',
          body: JSON.stringify(submitData),
        }, token);
        setSuccessMessage('Job Created Successfully');
      }

      setShowSuccess(true);
      setShowModal(false);
      fetchJobs();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingJob) return;

    try {
      setSubmitting(true);
      await apiRequest(
        `${API_ENDPOINTS.JOB}/${deletingJob._id}`,
        { method: 'DELETE' },
        token
      );
      setSuccessMessage('Job Deleted Successfully');
      setShowSuccess(true);
      setShowDeleteModal(false);
      setDeletingJob(null);
      fetchJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to delete job');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (job: Job) => {
    try {
      await apiRequest(
        `${API_ENDPOINTS.JOB}/${job._id}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({ isActive: !job.isActive }),
        },
        token
      );
      setSuccessMessage(
        job.isActive ? 'Job Deactivated Successfully' : 'Job Activated Successfully'
      );
      setShowSuccess(true);
      fetchJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
  };

  const assignCategory = async () => {
    if (!categoryJob || !selectedCategory) return;

    try {
      setSubmitting(true);
      await apiRequest(
        `${API_ENDPOINTS.JOB}/${categoryJob._id}/category`,
        {
          method: 'PUT',
          body: JSON.stringify({ Category: selectedCategory }),
        },
        token
      );
      setSuccessMessage('Category Assigned Successfully');
      setShowSuccess(true);
      setShowCategoryModal(false);
      setCategoryJob(null);
      fetchJobs();
    } catch (err: any) {
      setError(err.message || 'Failed to assign category');
    } finally {
      setSubmitting(false);
    }
  };

  // Filter jobs
  const filteredJobs = jobs.filter(job => {
    const matchesCategory = !filterCategory || 
      (typeof job.Category === 'object' ? job.Category._id === filterCategory : job.Category === filterCategory);
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && job.isActive) || 
      (filterStatus === 'inactive' && !job.isActive);
    const matchesSearch = !searchQuery || 
      job.JobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.CompanyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.Location.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Helper functions for dynamic lists (same as before)
  const addJobDescription = () => {
    setFormData({
      ...formData,
      JobDescription: [...formData.JobDescription, ''],
    });
  };

  const removeJobDescription = (index: number) => {
    setFormData({
      ...formData,
      JobDescription: formData.JobDescription.filter((_, i) => i !== index),
    });
  };

  const updateJobDescription = (index: number, value: string) => {
    const updated = [...formData.JobDescription];
    updated[index] = value;
    setFormData({ ...formData, JobDescription: updated });
  };

  const addRequiredSkill = () => {
    setFormData({
      ...formData,
      RequiredSkills: [...formData.RequiredSkills, ''],
    });
  };

  const removeRequiredSkill = (index: number) => {
    setFormData({
      ...formData,
      RequiredSkills: formData.RequiredSkills.filter((_, i) => i !== index),
    });
  };

  const updateRequiredSkill = (index: number, value: string) => {
    const updated = [...formData.RequiredSkills];
    updated[index] = value;
    setFormData({ ...formData, RequiredSkills: updated });
  };

  const addInterviewStep = () => {
    setFormData({
      ...formData,
      InterviewProcess: [...formData.InterviewProcess, { step: '', description: '', duration: '' }],
    });
  };

  const removeInterviewStep = (index: number) => {
    setFormData({
      ...formData,
      InterviewProcess: formData.InterviewProcess.filter((_, i) => i !== index),
    });
  };

  const updateInterviewStep = (index: number, field: keyof InterviewStep, value: string) => {
    const updated = [...formData.InterviewProcess];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, InterviewProcess: updated });
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <SuccessToast
          message={successMessage}
          onClose={() => setShowSuccess(false)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs Management</h1>
          <p className="text-gray-600 mt-1">Manage job postings and their settings</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-5 h-5" />
          Add Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Jobs</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ToggleRight className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Jobs</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactive}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ToggleLeft className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Search jobs..."
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.CategoryEmoji} {cat.CategoryName}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          {(filterCategory || filterStatus !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setFilterCategory('');
                setFilterStatus('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Jobs Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading jobs...</span>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No jobs found</p>
            <p className="text-gray-500 text-sm mt-2">Create your first job to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Salary
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredJobs.map((job) => {
                  const category = typeof job.Category === 'object' ? job.Category : null;
                  return (
                    <tr key={job._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{job.JobTitle}</div>
                        <div className="text-xs text-gray-500">{job.JobType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{job.CompanyName}</div>
                        {job.CompanyVerified && (
                          <span className="text-xs text-blue-600">✓ Verified</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {category ? (
                          <span className="text-sm text-gray-900">
                            {category.CategoryEmoji} {category.CategoryName}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">No Category</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {job.Location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {job.Salary?.min && job.Salary?.max
                          ? `${job.Salary.min} - ${job.Salary.max}`
                          : 'Not specified'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            job.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {job.createdAt ? (
                          <div>
                            <div>{new Date(job.createdAt).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(job.createdAt).toLocaleTimeString()}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(job._id)}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => toggleStatus(job)}
                            className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                            title={job.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {job.isActive ? (
                              <ToggleRight className="w-5 h-5" />
                            ) : (
                              <ToggleLeft className="w-5 h-5" />
                            )}
                          </button>
                          <button
                            onClick={() => handleCategoryAssign(job)}
                            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                            title="Assign Category"
                          >
                            <Filter className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEdit(job)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(job)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal - This would be the same large form from before, but I'll include a simplified version */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingJob ? 'Edit Job' : 'Create New Job'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Basic Information */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                    <input
                      type="text"
                      value={formData.JobTitle}
                      onChange={(e) => setFormData({ ...formData, JobTitle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select
                      value={formData.Category}
                      onChange={(e) => setFormData({ ...formData, Category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                      disabled={submitting}
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.CategoryEmoji} {cat.CategoryName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                    <input
                      type="text"
                      value={formData.CompanyName}
                      onChange={(e) => setFormData({ ...formData, CompanyName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      value={formData.Location}
                      onChange={(e) => setFormData({ ...formData, Location: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo URL</label>
                    <input
                      type="url"
                      value={formData.CompanyLogo}
                      onChange={(e) => setFormData({ ...formData, CompanyLogo: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Image URL</label>
                    <input
                      type="url"
                      value={formData.JobImage}
                      onChange={(e) => setFormData({ ...formData, JobImage: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      disabled={submitting}
                    />
                  </div>
                </div>
              </div>

              {/* Salary & Experience */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Salary & Experience
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.Salary.min}
                        onChange={(e) => setFormData({ ...formData, Salary: { ...formData.Salary, min: e.target.value } })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Min"
                        disabled={submitting}
                      />
                      <input
                        type="text"
                        value={formData.Salary.max}
                        onChange={(e) => setFormData({ ...formData, Salary: { ...formData.Salary, max: e.target.value } })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Max"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Experience (Years)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.Experience.min}
                        onChange={(e) => setFormData({ ...formData, Experience: { ...formData.Experience, min: e.target.value } })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Min"
                        disabled={submitting}
                      />
                      <input
                        type="number"
                        value={formData.Experience.max}
                        onChange={(e) => setFormData({ ...formData, Experience: { ...formData.Experience, max: e.target.value } })}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Max"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  Job Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Type *</label>
                    <select
                      value={formData.JobType}
                      onChange={(e) => setFormData({ ...formData, JobType: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                      disabled={submitting}
                    >
                      <option value="Full Time">Full Time</option>
                      <option value="Part Time">Part Time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Work Mode *</label>
                    <select
                      value={formData.WorkMode}
                      onChange={(e) => setFormData({ ...formData, WorkMode: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                      disabled={submitting}
                    >
                      <option value="On-site">On-site</option>
                      <option value="Remote">Remote</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hiring Status *</label>
                    <select
                      value={formData.HiringStatus}
                      onChange={(e) => setFormData({ ...formData, HiringStatus: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      required
                      disabled={submitting}
                    >
                      <option value="Actively Hiring">Actively Hiring</option>
                      <option value="Not Hiring">Not Hiring</option>
                      <option value="Hiring Soon">Hiring Soon</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Match Percentage</label>
                    <input
                      type="number"
                      value={formData.MatchPercentage}
                      onChange={(e) => setFormData({ ...formData, MatchPercentage: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      min="0"
                      max="100"
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="CompanyVerified"
                      checked={formData.CompanyVerified}
                      onChange={(e) => setFormData({ ...formData, CompanyVerified: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={submitting}
                    />
                    <label htmlFor="CompanyVerified" className="text-sm font-medium text-gray-700">Company Verified</label>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="CompanyVerified"
                      checked={formData.CompanyVerified}
                      onChange={(e) => setFormData({ ...formData, CompanyVerified: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={submitting}
                    />
                    <label htmlFor="CompanyVerified" className="text-sm font-medium text-gray-700">Company Verified</label>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={submitting}
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input
                      type="checkbox"
                      id="isTrending"
                      checked={formData.isTrending}
                      onChange={(e) => setFormData({ ...formData, isTrending: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={submitting}
                    />
                    <label htmlFor="isTrending" className="text-sm font-medium text-gray-700">Trending</label>
                  </div>
                </div>
              </div>

              {/* About Company */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-orange-600" />
                  About Company
                </h3>
                <textarea
                  value={formData.AboutCompany}
                  onChange={(e) => setFormData({ ...formData, AboutCompany: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  rows={4}
                  disabled={submitting}
                />
              </div>

              {/* Job Description */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                    Job Description
                  </h3>
                  <button type="button" onClick={addJobDescription} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition" disabled={submitting}>
                    <Plus className="w-4 h-4" /> Add Point
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.JobDescription.map((desc, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={desc}
                        onChange={(e) => updateJobDescription(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        disabled={submitting}
                      />
                      {formData.JobDescription.length > 1 && (
                        <button type="button" onClick={() => removeJobDescription(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" disabled={submitting}>
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Required Skills */}
              <div className="border-b border-gray-200 pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Required Skills
                  </h3>
                  <button type="button" onClick={addRequiredSkill} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition" disabled={submitting}>
                    <Plus className="w-4 h-4" /> Add Skill
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.RequiredSkills.map((skill, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => updateRequiredSkill(index, e.target.value)}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        disabled={submitting}
                      />
                      {formData.RequiredSkills.length > 1 && (
                        <button type="button" onClick={() => removeRequiredSkill(index)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" disabled={submitting}>
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Apply URL */}
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-indigo-600" />
                  Application URL
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Apply URL
                  </label>
                  <input
                    type="url"
                    value={formData.ApplyURL}
                    onChange={(e) => setFormData({ ...formData, ApplyURL: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="https://example.com/careers/apply/job-id"
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    URL where users can apply for this job
                  </p>
                </div>
              </div>

              {/* Interview Process */}
              <div className="pb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                    Interview Process
                  </h3>
                  <button type="button" onClick={addInterviewStep} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition" disabled={submitting}>
                    <Plus className="w-4 h-4" /> Add Step
                  </button>
                </div>
                <div className="space-y-4">
                  {formData.InterviewProcess.map((step, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Step {index + 1}</span>
                        {formData.InterviewProcess.length > 1 && (
                          <button type="button" onClick={() => removeInterviewStep(index)} className="p-1 text-red-600 hover:bg-red-50 rounded transition" disabled={submitting}>
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        value={step.step}
                        onChange={(e) => updateInterviewStep(index, 'step', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Step name"
                        disabled={submitting}
                      />
                      <input
                        type="text"
                        value={step.description}
                        onChange={(e) => updateInterviewStep(index, 'description', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Description"
                        disabled={submitting}
                      />
                      <input
                        type="text"
                        value={step.duration}
                        onChange={(e) => updateInterviewStep(index, 'duration', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        placeholder="Duration"
                        disabled={submitting}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      {editingJob ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      {editingJob ? 'Update Job' : 'Create Job'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Job Title</p>
                  <p className="font-semibold">{viewingJob.JobTitle}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-semibold">{viewingJob.CompanyName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">{viewingJob.Location}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Job Type</p>
                  <p className="font-semibold">{viewingJob.JobType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Work Mode</p>
                  <p className="font-semibold">{viewingJob.WorkMode}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hiring Status</p>
                  <p className="font-semibold">{viewingJob.HiringStatus}</p>
                </div>
                {viewingJob.Salary && (
                  <div>
                    <p className="text-sm text-gray-600">Salary</p>
                    <p className="font-semibold">
                      {viewingJob.Salary.min} - {viewingJob.Salary.max}
                    </p>
                  </div>
                )}
                {viewingJob.Experience && (
                  <div>
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="font-semibold">
                      {viewingJob.Experience.min} - {viewingJob.Experience.max} years
                    </p>
                  </div>
                )}
              </div>
              {viewingJob.AboutCompany && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">About Company</p>
                  <p className="text-gray-900">{viewingJob.AboutCompany}</p>
                </div>
              )}
              {viewingJob.JobDescription && viewingJob.JobDescription.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Job Description</p>
                  <ul className="list-disc list-inside space-y-1">
                    {viewingJob.JobDescription.map((desc, idx) => (
                      <li key={idx} className="text-gray-900">{desc}</li>
                    ))}
                  </ul>
                </div>
              )}
              {viewingJob.RequiredSkills && viewingJob.RequiredSkills.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {viewingJob.RequiredSkills.map((skill, idx) => (
                      <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {viewingJob.ApplyURL && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Apply URL</p>
                  <a
                    href={viewingJob.ApplyURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline break-all"
                  >
                    {viewingJob.ApplyURL}
                  </a>
                </div>
              )}
              {viewingJob.createdAt && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Created At</p>
                  <p className="text-gray-900">
                    {new Date(viewingJob.createdAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Delete Job</h2>
            </div>
            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium mb-1">
                    Are you sure you want to delete this job?
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">{deletingJob.JobTitle}</span> at {deletingJob.CompanyName}
                  </p>
                  <p className="text-xs text-red-600 mt-2">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingJob(null);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? 'Deleting...' : 'Delete Job'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Assignment Modal */}
      {showCategoryModal && categoryJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Assign Category</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Job: {categoryJob.JobTitle}</p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Category *
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.CategoryEmoji} {cat.CategoryName}
                    </option>
                  ))}
                </select>
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800">{error}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setCategoryJob(null);
                    setError('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={assignCategory}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting || !selectedCategory}
                >
                  {submitting ? 'Assigning...' : 'Assign Category'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
