import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiRequest } from '../utils/api';
import { API_ENDPOINTS } from '../config/api';
import SuccessToast from '../components/SuccessToast';
import {
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  FolderTree,
  AlertCircle,
  X,
  Loader,
  Smile
} from 'lucide-react';

interface Category {
  _id: string;
  CategoryName: string;
  CategoryEmoji: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryStats {
  total: number;
  active: number;
  inactive: number;
}

export default function JobCategories() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats>({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    CategoryName: '',
    CategoryEmoji: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Common job-related emojis
  const jobEmojis = [
    '💻', '🌐', '📱', '🔧', '⚙️', '🎨', '📊', '📈', '💼', '🏢',
    '👨‍💼', '👩‍💼', '👨‍💻', '👩‍💻', '👨‍🔧', '👩‍🔧', '👨‍⚕️', '👩‍⚕️', '👨‍🏫', '👩‍🏫',
    '🎓', '📚', '🔬', '🧪', '💡', '🚀', '⭐', '🎯', '💎', '🔥',
    '📝', '✍️', '📷', '🎬', '🎵', '🎤', '🏥', '🏪', '🍽️', '🏨',
    '🚗', '✈️', '🚢', '🏗️', '🔨', '⚡', '🌍', '💰', '💳', '📦'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiRequest(API_ENDPOINTS.CATEGORY, { method: 'GET' }, token);
      
      if (data.data) {
        setCategories(data.data);
        calculateStats(data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (cats: Category[]) => {
    const total = cats.length;
    const active = cats.filter(c => c.isActive).length;
    const inactive = total - active;
    setStats({ total, active, inactive });
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ CategoryName: '', CategoryEmoji: '', isActive: true });
    setShowEmojiPicker(false);
    setShowModal(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      CategoryName: category.CategoryName,
      CategoryEmoji: category.CategoryEmoji,
      isActive: category.isActive,
    });
    setShowEmojiPicker(false);
    setShowModal(true);
  };

  const selectEmoji = (emoji: string) => {
    setFormData({ ...formData, CategoryEmoji: emoji });
    setShowEmojiPicker(false);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
    setShowDeleteModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (editingCategory) {
        // Update
        await apiRequest(
          `${API_ENDPOINTS.CATEGORY}/${editingCategory._id}`,
          {
            method: 'PUT',
            body: JSON.stringify(formData),
          },
          token
        );
        setSuccessMessage('Category Updated Successfully');
      } else {
        // Create
        await apiRequest(
          API_ENDPOINTS.CATEGORY,
          {
            method: 'POST',
            body: JSON.stringify(formData),
          },
          token
        );
        setSuccessMessage('Category Created Successfully');
      }

      setShowSuccess(true);
      setShowModal(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;

    try {
      setSubmitting(true);
      await apiRequest(
        `${API_ENDPOINTS.CATEGORY}/${deletingCategory._id}`,
        { method: 'DELETE' },
        token
      );
      setSuccessMessage('Category Deleted Successfully');
      setShowSuccess(true);
      setShowDeleteModal(false);
      setDeletingCategory(null);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (category: Category) => {
    try {
      await apiRequest(
        `${API_ENDPOINTS.CATEGORY}/${category._id}/status`,
        {
          method: 'PUT',
          body: JSON.stringify({ isActive: !category.isActive }),
        },
        token
      );
      setSuccessMessage(
        category.isActive ? 'Category Deactivated Successfully' : 'Category Activated Successfully'
      );
      setShowSuccess(true);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Job Categories</h1>
          <p className="text-gray-600 mt-1">Manage job categories and their settings</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30"
        >
          <Plus className="w-5 h-5" />
          Add Category
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Categories</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderTree className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Categories</p>
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
              <p className="text-sm font-medium text-gray-600">Inactive Categories</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.inactive}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ToggleLeft className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-3 text-gray-600">Loading categories...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12">
            <FolderTree className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No categories found</p>
            <p className="text-gray-500 text-sm mt-2">Create your first category to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Emoji
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
                {categories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {category.CategoryName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-2xl">{category.CategoryEmoji}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          category.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(category.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(category)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title={category.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {category.isActive ? (
                            <ToggleRight className="w-5 h-5" />
                          ) : (
                            <ToggleLeft className="w-5 h-5" />
                          )}
                        </button>
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCategory ? 'Edit Category' : 'Create Category'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setShowEmojiPicker(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.CategoryName}
                  onChange={(e) =>
                    setFormData({ ...formData, CategoryName: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Software Development"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Emoji *
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        value={formData.CategoryEmoji}
                        onChange={(e) =>
                          setFormData({ ...formData, CategoryEmoji: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-2xl text-center"
                        placeholder="💻"
                        required
                        disabled={submitting}
                        maxLength={2}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-gray-700"
                      disabled={submitting}
                    >
                      <Smile className="w-5 h-5" />
                      <span className="text-sm">Pick Emoji</span>
                    </button>
                  </div>
                  
                  {showEmojiPicker && (
                    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 max-h-64 overflow-y-auto">
                      <p className="text-xs font-medium text-gray-700 mb-3">Select an emoji:</p>
                      <div className="grid grid-cols-10 gap-2">
                        {jobEmojis.map((emoji, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => selectEmoji(emoji)}
                            className={`text-2xl p-2 rounded-lg hover:bg-white transition ${
                              formData.CategoryEmoji === emoji
                                ? 'bg-blue-100 ring-2 ring-blue-500'
                                : 'hover:shadow-md'
                            }`}
                            title={`Select ${emoji}`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500">
                    Click "Pick Emoji" to select from list or type manually
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={submitting}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setShowEmojiPicker(false);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={submitting}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      {editingCategory ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : editingCategory ? (
                    'Update Category'
                  ) : (
                    'Create Category'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Delete Category</h2>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-gray-900 font-medium mb-1">
                    Are you sure you want to delete this category?
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="text-2xl mr-2">{deletingCategory.CategoryEmoji}</span>
                    <span className="font-medium">{deletingCategory.CategoryName}</span>
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    This action cannot be undone.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2 mb-4">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletingCategory(null);
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
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader className="w-4 h-4 animate-spin" />
                      Deleting...
                    </span>
                  ) : (
                    'Delete Category'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
