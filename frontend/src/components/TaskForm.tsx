import React, { useState } from 'react';

interface TaskFormProps {
  onSubmit: (bvid: string, maxComments: number, apiKey: string, model: string) => void;
  isLoading: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onSubmit, isLoading }) => {
  const [bvid, setBvid] = useState('');
  const [maxComments, setMaxComments] = useState(10000);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('default');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bvid.trim()) return;
    if (model !== 'default' && !apiKey.trim()) return;
    onSubmit(bvid, maxComments, apiKey, model);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          视频BV号
        </label>
        <input
          type="text"
          value={bvid}
          onChange={(e) => setBvid(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="例如：BV1xx411c7mW"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          最大评论数
        </label>
        <input
          type="number"
          value={maxComments}
          onChange={(e) => setMaxComments(parseInt(e.target.value) || 10000)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          min="1"
          max="100000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          模型选择
        </label>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="default">默认免费模型</option>
          <option value="openai">OpenAI API</option>
          <option value="other">其他API</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          API Key
        </label>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${model === 'default' ? 'bg-gray-100' : ''}`}
          placeholder={model === 'default' ? '默认API已配置' : 'sk-...'}
          disabled={model === 'default'}
          required={model !== 'default'}
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? '分析中...' : '开始分析'}
      </button>
    </form>
  );
};
