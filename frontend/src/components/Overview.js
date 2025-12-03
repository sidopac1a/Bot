import React from 'react';
import { useQuery } from 'react-query';
import { 
  MessageSquare, 
  Users, 
  Zap, 
  TrendingUp,
  Smartphone,
  Brain,
  Wifi,
  WifiOff
} from 'lucide-react';
import api from '../services/api';

const Overview = () => {
  const { data: botStatus } = useQuery('botStatus', api.getBotStatus, {
    refetchInterval: 5000
  });

  const { data: messageStats } = useQuery('messageStats', api.getMessageStats);

  const stats = [
    {
      name: 'رسائل اليوم',
      value: messageStats?.data?.today?.total || 0,
      change: messageStats?.data?.change?.percentage || 0,
      icon: MessageSquare,
      color: 'bg-blue-500'
    },
    {
      name: 'رسائل واردة',
      value: messageStats?.data?.today?.incoming || 0,
      change: '+12%',
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      name: 'رسائل صادرة',
      value: messageStats?.data?.today?.outgoing || 0,
      change: '+8%',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      name: 'معدل الاستجابة',
      value: '95%',
      change: '+2%',
      icon: Zap,
      color: 'bg-yellow-500'
    }
  ];

  const ConnectionStatus = () => {
    const isConnected = botStatus?.data?.connected;
    const connectionType = botStatus?.data?.type;

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              حالة الاتصال
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {connectionType === 'meta' ? 'Meta WhatsApp API' : 'WPPConnect'}
            </p>
          </div>
          <div className={`p-3 rounded-full ${isConnected ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
            {isConnected ? (
              <Wifi className="w-6 h-6 text-green-600 dark:text-green-400" />
            ) : (
              <WifiOff className="w-6 h-6 text-red-600 dark:text-red-400" />
            )}
          </div>
        </div>
        <div className="mt-4">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
              : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          }`}>
            <div className={`w-2 h-2 rounded-full ml-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            {isConnected ? 'متصل' : 'غير متصل'}
          </div>
        </div>
      </div>
    );
  };

  const QRCodeDisplay = () => {
    const { data: qrData } = useQuery('qrCode', api.getQRCode, {
      refetchInterval: 3000,
      enabled: botStatus?.data?.type === 'wpp' && !botStatus?.data?.connected
    });

    if (botStatus?.data?.type !== 'wpp' || botStatus?.data?.connected) {
      return null;
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          رمز QR للاتصال
        </h3>
        {qrData?.data?.qrCode ? (
          <div className="text-center">
            <img 
              src={qrData.data.qrCode} 
              alt="QR Code"
              className="mx-auto w-48 h-48 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
              امسح الكود باستخدام واتساب لربط حسابك
            </p>
          </div>
        ) : (
          <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          نظرة عامة
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          مراقبة أداء البوت والإحصائيات
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {stat.change}
                </p>
              </div>
              <div className={`p-3 rounded-full ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connection and QR Code */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ConnectionStatus />
        <QRCodeDisplay />
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          النشاط الأخير
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((item) => (
            <div key={item} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="p-2 bg-primary rounded-full">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  تم الرد على رسالة من +966xxxxxxxxx
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  منذ {item * 2} دقائق
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;