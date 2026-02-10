import React from 'react';

interface ProgressMonitorProps {
  task: {
    id: string;
    bvid: string;
    status: string;
    progress: number;
    result?: any;
  };
}

export const ProgressMonitor: React.FC<ProgressMonitorProps> = ({ task }) => {
  const getStatusText = (status: string) => {
    switch (status) {
      case 'running':
        return '准备中';
      case 'crawling':
        return '爬取评论';
      case 'processing':
        return '处理数据';
      case 'analyzing':
        return '分析评论';
      case 'completed':
        return '完成';
      case 'failed':
        return '失败';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">任务进度</h3>
        <span className={`text-sm font-medium ${getStatusColor(task.status)}`}>
          {getStatusText(task.status)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">进度</span>
          <span className="font-medium text-gray-900">{task.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${task.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <div className="flex flex-col space-y-1 text-sm">
          <div>
            <span className="font-medium text-gray-700">视频BV号:</span>
            <span className="ml-2 text-gray-600">{task.bvid}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">任务ID:</span>
            <span className="ml-2 text-gray-600">{task.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
