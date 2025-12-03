import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Download,
  ArrowUpDown,
  Calendar,
  User,
  Bot
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import api from '../services/api';

const Logs = () => {
  const [filters, setFilters] = useState({
    search: '',
    direction: '',
    dateFrom: '',
    dateTo: '',
    page: 1
  });
  const [showFilters, setShowFilters] = useState(false);

  const { data: messagesData, isLoading } = useQuery(
    ['messages', filters],
    () => api.getMessages({
      page: filters.page,
      search: filters.search,
      direction: filters.direction,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo
    }),
    {
      keepPreviousData: true
    }
  );

  const messages = messagesData?.data?.messages || [];
  const pagination = messagesData?.data?.pagination || {};

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filtering
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const exportLogs = () => {
    // This would trigger a download of the logs
    toast.success('سيتم تحميل السجلات قريباً...');
  };

  const getMessageIcon = (direction) => {
    return direction === 'incoming' ? (
      <User className="w-4 h-4 text-blue-500" />
    ) : (
      <Bot className="w-4 h-4 text-green-500" />
    );
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    return format(new Date(timestamp), 'dd/MM/yyyy HH:mm', { locale: ar });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            سجلات المحادثات
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            عرض وتصفية جميع الرسائل والمحادثات
          </p>
        </div>
        
        <button
          onClick={exportLogs}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Download className="w-4 h-4 ml-2" />
          تصدير السجلات
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            البحث والتصفية
          </h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Filter className="w-4 h-4 ml-1" />
            {showFilters ? 'إخفاء الفلاتر' : 'إظهار الفلاتر'}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="البحث في الرسائل..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pr-10 px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                نوع الرسالة
              </label>
              <select
                value={filters.direction}
                onChange={(e) => handleFilterChange('direction', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">جميع الرسائل</option>
                <option value="incoming">واردة</option>
                <option value="outgoing">صادرة</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                من تاريخ
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                إلى تاريخ
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Messages List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              الرسائل ({pagination.total || 0})
            </h3>
            <button className="flex items-center px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              <ArrowUpDown className="w-4 h-4 ml-1" />
              ترتيب حسب الوقت
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-gray-500 dark:text-gray-400 mt-2">جاري التحميل...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              لا توجد رسائل
            </p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {messages.map((message) => (
                <div key={message.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                      {getMessageIcon(message.direction)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {message.direction === 'incoming' ? message.from : 'البوت'}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            message.direction === 'incoming' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          }`}>
                            {message.direction === 'incoming' ? 'واردة' : 'صادرة'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          <span>{formatTimestamp(message.timestamp)}</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <p className="text-sm text-gray-900 dark:text-white break-words">
                          {message.body || 'رسالة بدون محتوى نصي'}
                        </p>
                        
                        {message.type && message.type !== 'text' && (
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded">
                              {message.type}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.total > pagination.limit && (
              <div className="p-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    عرض {((pagination.page - 1) * pagination.limit) + 1} إلى{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} من{' '}
                    {pagination.total} نتيجة
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                      className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      السابق
                    </button>
                    
                    <span className="px-3 py-2 text-sm bg-primary text-white rounded">
                      {pagination.page}
                    </span>
                    
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page * pagination.limit >= pagination.total}
                      className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      التالي
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Logs;