import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  File, 
  FileText, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Clock,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const KnowledgeBase = () => {
  const [uploadProgress, setUploadProgress] = useState({});
  const queryClient = useQueryClient();

  const { data: knowledgeData, isLoading } = useQuery(
    'knowledge',
    () => api.getKnowledge(),
    {
      refetchInterval: 5000, // Refetch every 5 seconds to check processing status
    }
  );

  const uploadMutation = useMutation(
    (file) => api.uploadKnowledgeFile(file, (percentage) => {
      setUploadProgress(prev => ({ ...prev, [file.name]: percentage }));
    }),
    {
      onSuccess: (response, file) => {
        queryClient.invalidateQueries('knowledge');
        toast.success(`تم رفع ${file.name} بنجاح`);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      },
      onError: (error, file) => {
        toast.error(`فشل في رفع ${file.name}`);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }
    }
  );

  const deleteMutation = useMutation(api.deleteKnowledge, {
    onSuccess: () => {
      queryClient.invalidateQueries('knowledge');
      toast.success('تم الحذف بنجاح');
    },
    onError: () => {
      toast.error('فشل في الحذف');
    }
  });

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach(file => {
      uploadMutation.mutate(file);
    });
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: true
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'processing':
        return 'قيد المعالجة';
      case 'error':
        return 'خطأ';
      case 'uploaded':
        return 'تم الرفع';
      default:
        return 'غير محدد';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const showConfirmDialog = (message, onConfirm) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
        <p class="text-gray-700 dark:text-gray-300 mb-4">${message}</p>
        <div class="flex justify-end space-x-3">
          <button class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cancel-btn">إلغاء</button>
          <button class="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded confirm-btn">تأكيد</button>
        </div>
      </div>
    `;
    
    modal.querySelector('.cancel-btn').onclick = () => modal.remove();
    modal.querySelector('.confirm-btn').onclick = () => {
      modal.remove();
      onConfirm();
    };
    
    document.body.appendChild(modal);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          قاعدة المعرفة
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          رفع ومعالجة الملفات لتدريب البوت
        </p>
      </div>

      {/* Upload Area */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          رفع ملفات جديدة
        </h3>
        
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-300 dark:border-gray-600 hover:border-primary hover:bg-primary/5'
          }`}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-lg text-primary">أسقط الملفات هنا...</p>
          ) : (
            <div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                اسحب الملفات هنا أو انقر للاختيار
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                الأنواع المدعومة: PDF, TXT, XLSX, XLS
              </p>
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {Object.keys(uploadProgress).length > 0 && (
          <div className="mt-4 space-y-2">
            {Object.entries(uploadProgress).map(([fileName, progress]) => (
              <div key={fileName} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {fileName}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Knowledge Files List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            الملفات المرفوعة
          </h3>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-gray-500 dark:text-gray-400 mt-2">جاري التحميل...</p>
          </div>
        ) : knowledgeData?.data?.knowledge?.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              لا توجد ملفات مرفوعة بعد
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {knowledgeData?.data?.knowledge
              ?.filter(item => item.type === 'file')
              ?.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <File className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.filename}
                        </h4>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {formatFileSize(item.size)}
                          </span>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(item.status)}
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {getStatusText(item.status)}
                            </span>
                          </div>
                        </div>
                        {item.timestamp && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            تم الرفع: {new Date(item.timestamp).toLocaleString('ar-SA')}
                          </p>
                        )}
                        {item.error && (
                          <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                            خطأ: {item.error}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => showConfirmDialog(
                          'هل أنت متأكد من حذف هذا الملف؟',
                          () => deleteMutation.mutate(item.id)
                        )}
                        disabled={deleteMutation.isLoading}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Processing Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {knowledgeData?.data?.knowledge?.filter(item => 
                  item.type === 'file' && item.status === 'completed'
                ).length || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">ملفات مكتملة</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Clock className="w-8 h-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {knowledgeData?.data?.knowledge?.filter(item => 
                  item.type === 'file' && item.status === 'processing'
                ).length || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">قيد المعالجة</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <FileText className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {knowledgeData?.data?.knowledge?.filter(item => 
                  item.type === 'processed'
                ).length || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">نصوص معالجة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;