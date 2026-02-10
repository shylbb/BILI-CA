import React, { useState, useMemo } from 'react';

interface HistoryItem {
  id: string;
  bvid: string;
  title: string;
  status: string;
  timestamp: string;
  result: {
    classifications: Record<string, number>;
    total: number;
  };
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onDelete: (id: string) => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredHistory = useMemo(() => {
    if (!searchTerm) return history;
    const term = searchTerm.toLowerCase();
    return history.filter(item => 
      item.title.toLowerCase().includes(term) ||
      item.bvid.toLowerCase().includes(term)
    );
  }, [history, searchTerm]);

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        暂无历史记录
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 搜索框 */}
      <div className="relative">
        <input
          type="text"
          placeholder="搜索历史记录（标题或BV号）"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        )}
      </div>

      {/* 历史记录列表 */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          没有找到匹配的历史记录
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((item) => (
            <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.title}</h4>
                  <div className="text-sm text-gray-500">
                    BV号: {item.bvid} • {formatDate(item.timestamp)}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {item.status === 'completed' ? '完成' : item.status}
                  </span>
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-sm text-red-600 hover:text-red-800 focus:outline-none"
                    title="删除记录"
                  >
                    删除
                  </button>
                </div>
              </div>

              {item.result && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-sm font-medium text-gray-700 mb-2">分类结果</div>
                  <div className="grid grid-cols-5 gap-2 text-center">
                    {Object.entries(item.result.classifications).map(([category, count]) => (
                      <div key={category} className="text-xs">
                        <div className="font-medium text-gray-900">{count}</div>
                        <div className="text-gray-500">{category}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-right">
                    总计: {item.result.total} 条评论
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
