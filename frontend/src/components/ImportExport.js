import React, { useState, useCallback } from 'react';
import { useMutation } from 'react-query';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Download, 
  FileText, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Package
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const ImportExport = () => {
  const [importProgress, setImportProgress] = useState(null);
  const [exportProgress, setExportProgress] = useState(false);

  const exportMutation = useMutation(api.exportSettings, {
    onSuccess: (response) => {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([JSON.stringify(response.data, null, 2)]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `chatbot-backup-${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      setExportProgress(false);
      toast.success('تم تصدير البيانات بنجاح');
    },
    onError: () => {
      setExportProgress(false);
      toast.error('فشل في تصدير البيانات');
    }
  });

  const importMutation = useMutation(api.importSettings, {
    onSuccess: (response) => {
      const result = response.data.data;
      setImportProgress({
        status: 'success',
        result
      });
      toast.success('تم استيراد البيانات بنجاح');
    },
    onError: (error) => {
      setImportProgress({
        status: 'error',
        error: error.response?.data?.error || 'فشل في استيراد البيانات'
      });
      toast.error('فشل في استيراد البيانات');
    }
  });

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setImportProgress({ status: 'uploading' });
      importMutation.mutate(file);
    }
  }, [importMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    multiple: false
  });

  const handleExport = () => {
    setExportProgress(true);
    exportMutation.mutate();
  };

  const showConfirmDialog = (message, onConfirm) => {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
        <div class="flex items-center mb-4">
          <div class="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center ml-3">
            <svg class="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 class="text-lg font-medium text-gray-900 dark:text-white">تحذير</h3>
        </div>
        <p class="text-gray-700 dark:text-gray-300 mb-4">${message}</p>
        <div class="flex justify-end space-x-3">
          <button class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cancel-btn">إلغاء</button>
          <button class="px-4 py-2 bg-yellow-500 text-white hover:bg-yellow-600 rounded confirm-btn">متابعة</button>
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
          الاستيراد والتصدير
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          نسخ احتياطي وحفظ إعدادات البوت
        </p>
      </div>

      {/* Warning Notice */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 ml-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              تنبيه مهم
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              تأكد من إنشاء نسخة احتياطية قبل استيراد إعدادات جديدة. قد يؤدي الاستيراد إلى استبدال الإعدادات الحالية.
            </p>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg ml-4">
            <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              تصدير البيانات
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              إنشاء نسخة احتياطية من جميع الإعدادات وقاعدة المعرفة
            </p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            سيتم تصدير:
          </h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
              إعدادات واتساب والاتصال
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
              إعدادات الذكاء الاصطناعي والنماذج
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
              النصوص المعالجة من قاعدة المعرفة
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
              الإعدادات العامة للبوت
            </li>
          </ul>
        </div>

        <button
          onClick={handleExport}
          disabled={exportProgress}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {exportProgress ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
          ) : (
            <Download className="w-5 h-5 ml-2" />
          )}
          {exportProgress ? 'جاري التصدير...' : 'تصدير البيانات'}
        </button>
      </div>

      {/* Import Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg ml-4">
            <Upload className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              استيراد البيانات
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              استعادة الإعدادات من ملف نسخة احتياطية
            </p>
          </div>
        </div>

        {/* Import Progress */}
        {importProgress && (
          <div className={`mb-6 p-4 rounded-lg ${
            importProgress.status === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : importProgress.status === 'error'
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
              : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
          }`}>
            {importProgress.status === 'uploading' && (
              <div className="flex items-center">
                <div className="w-5 h-5 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin ml-3" />
                <span className="text-blue-800 dark:text-blue-200">جاري رفع الملف...</span>
              </div>
            )}

            {importProgress.status === 'success' && (
              <div>
                <div className="flex items-center mb-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 ml-2" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    تم الاستيراد بنجاح
                  </span>
                </div>
                <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                  <p>الإعدادات المستوردة: {importProgress.result.settings || 0}</p>
                  <p>عناصر المعرفة: {importProgress.result.knowledge || 0}</p>
                  {importProgress.result.errors && importProgress.result.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">تحذيرات:</p>
                      {importProgress.result.errors.map((error, index) => (
                        <p key={index} className="text-xs">• {error}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {importProgress.status === 'error' && (
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 ml-2" />
                <span className="text-red-800 dark:text-red-200">
                  {importProgress.error}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
          }`}
        >
          <input {...getInputProps()} />
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          {isDragActive ? (
            <p className="text-lg text-blue-600 dark:text-blue-400">أسقط الملف هنا...</p>
          ) : (
            <div>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                اسحب ملف النسخة الاحتياطية هنا أو انقر للاختيار
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                يجب أن يكون الملف بصيغة JSON فقط
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2">
            ملاحظات مهمة:
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• تأكد من أن الملف من نفس إصدار المنصة</li>
            <li>• سيتم استبدال الإعدادات الحالية بالإعدادات المستوردة</li>
            <li>• لن يتم حذف قاعدة المعرفة الحالية، بل ستتم إضافة البيانات الجديدة</li>
            <li>• يُنصح بعمل نسخة احتياطية قبل الاستيراد</li>
          </ul>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          إجراءات سريعة
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => showConfirmDialog(
              'هذا الإجراء سيؤدي إلى حذف جميع البيانات. هل أنت متأكد؟',
              () => toast.success('سيتم تنفيذ إعادة التعيين قريباً...')
            )}
            className="flex items-center justify-center px-4 py-3 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <XCircle className="w-5 h-5 ml-2" />
            إعادة تعيين البوت
          </button>
          
          <button
            onClick={() => toast.success('سيتم إنشاء نسخة احتياطية تلقائية قريباً...')}
            className="flex items-center justify-center px-4 py-3 border-2 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          >
            <Package className="w-5 h-5 ml-2" />
            جدولة نسخ احتياطية
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportExport;