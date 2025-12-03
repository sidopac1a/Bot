import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { Save, Smartphone, Brain, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('whatsapp');
  const queryClient = useQueryClient();

  const { data: settings } = useQuery('settings', api.getSettings);
  const { data: aiModels } = useQuery('aiModels', api.getAIModels);

  const updateSettingsMutation = useMutation(
    ({ category, settings }) => api.updateSettings(category, settings),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('settings');
        toast.success('تم حفظ الإعدادات بنجاح');
      },
      onError: (error) => {
        toast.error('خطأ في حفظ الإعدادات');
      }
    }
  );

  const tabs = [
    { id: 'whatsapp', name: 'واتساب', icon: Smartphone },
    { id: 'ai', name: 'الذكاء الاصطناعي', icon: Brain },
    { id: 'general', name: 'عام', icon: MessageSquare }
  ];

  const WhatsAppSettings = () => {
    const { register, handleSubmit, setValue } = useForm({
      defaultValues: settings?.data?.whatsapp || {}
    });

    React.useEffect(() => {
      if (settings?.data?.whatsapp) {
        Object.entries(settings.data.whatsapp).forEach(([key, value]) => {
          setValue(key, value);
        });
      }
    }, [settings, setValue]);

    const onSubmit = (data) => {
      updateSettingsMutation.mutate({
        category: 'whatsapp',
        settings: data
      });
    };

    const switchConnectionMutation = useMutation(api.switchConnection, {
      onSuccess: () => {
        queryClient.invalidateQueries('botStatus');
        toast.success('تم تبديل نوع الاتصال بنجاح');
      },
      onError: () => {
        toast.error('فشل في تبديل نوع الاتصال');
      }
    });

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            نوع الاتصال
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="meta"
                value="meta"
                {...register('connectionType')}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="meta" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                Meta WhatsApp Business API
              </label>
            </div>
            
            <div className="flex items-center space-x-3">
              <input
                type="radio"
                id="wpp"
                value="wpp"
                {...register('connectionType')}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label htmlFor="wpp" className="text-sm font-medium text-gray-900 dark:text-gray-300">
                WPPConnect (WhatsApp Web)
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            إعدادات Meta API
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Access Token
              </label>
              <input
                type="password"
                {...register('metaAccessToken')}
                className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="أدخل Meta Access Token"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number ID
              </label>
              <input
                type="text"
                {...register('metaPhoneNumberId')}
                className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="أدخل Phone Number ID"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Webhook Verify Token
              </label>
              <input
                type="password"
                {...register('webhookVerifyToken')}
                className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="أدخل Webhook Verify Token"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateSettingsMutation.isLoading}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateSettingsMutation.isLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            حفظ الإعدادات
          </button>
        </div>
      </form>
    );
  };

  const AISettings = () => {
    const { register, handleSubmit, setValue, watch } = useForm({
      defaultValues: settings?.data?.ai || {}
    });

    React.useEffect(() => {
      if (settings?.data?.ai) {
        Object.entries(settings.data.ai).forEach(([key, value]) => {
          setValue(key, value);
        });
      }
    }, [settings, setValue]);

    const onSubmit = (data) => {
      updateSettingsMutation.mutate({
        category: 'ai',
        settings: data
      });
    };

    const selectedModel = watch('model');

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            نموذج الذكاء الاصطناعي
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              اختر النموذج
            </label>
            <select
              {...register('model')}
              className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">اختر نموذج...</option>
              {aiModels?.data?.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Prompt
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              توجيهات النظام
            </label>
            <textarea
              {...register('prompt')}
              rows={6}
              className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              placeholder="أدخل توجيهات البوت..."
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              هذه التوجيهات ستحدد سلوك البوت وطريقة رده على الرسائل
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            إعدادات الرد
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  الرد التلقائي
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  تفعيل الرد التلقائي على الرسائل
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('autoReply')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                رسالة الرد الافتراضية عند الخطأ
              </label>
              <textarea
                {...register('fallbackMessage')}
                rows={3}
                className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="عذراً، حدث خطأ..."
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateSettingsMutation.isLoading}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateSettingsMutation.isLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            حفظ الإعدادات
          </button>
        </div>
      </form>
    );
  };

  const GeneralSettings = () => {
    const { register, handleSubmit, setValue } = useForm({
      defaultValues: settings?.data?.general || {}
    });

    React.useEffect(() => {
      if (settings?.data?.general) {
        Object.entries(settings.data.general).forEach(([key, value]) => {
          setValue(key, value);
        });
      }
    }, [settings, setValue]);

    const onSubmit = (data) => {
      updateSettingsMutation.mutate({
        category: 'general',
        settings: data
      });
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            إعدادات عامة
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                اسم البوت
              </label>
              <input
                type="text"
                {...register('botName')}
                className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="أدخل اسم البوت"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                رسالة الترحيب
              </label>
              <textarea
                {...register('welcomeMessage')}
                rows={4}
                className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                placeholder="مرحباً! كيف يمكنني مساعدتك؟"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                  حفظ السجلات
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  حفظ جميع المحادثات في قاعدة البيانات
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  {...register('saveLogs')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={updateSettingsMutation.isLoading}
            className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateSettingsMutation.isLoading ? (
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin ml-2" />
            ) : (
              <Save className="w-4 h-4 ml-2" />
            )}
            حفظ الإعدادات
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          الإعدادات
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          إدارة إعدادات البوت والاتصال
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <tab.icon className="w-4 h-4 ml-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'whatsapp' && <WhatsAppSettings />}
        {activeTab === 'ai' && <AISettings />}
        {activeTab === 'general' && <GeneralSettings />}
      </div>
    </div>
  );
};

export default Settings