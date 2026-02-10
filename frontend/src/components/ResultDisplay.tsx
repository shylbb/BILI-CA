import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ResultDisplayProps {
  result: {
    classifications: Record<string, number>;
    total: number;
  };
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const { classifications, total } = result;
  
  // 转换数据格式用于图表
  const chartData = Object.entries(classifications).map(([name, value]) => ({
    name,
    value,
    percentage: ((value / total) * 100).toFixed(1)
  }));

  // 颜色映射
  const colorMap: Record<string, string> = {
    '优': '#10B981',  // 绿色
    '良': '#3B82F6',  // 蓝色
    '中': '#F59E0B',  // 橙色
    '差': '#EF4444',  // 红色
    '不明意义': '#6B7280'  // 灰色
  };

  return (
    <div className="space-y-6 pt-6 border-t border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900">分析结果</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 数据统计 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">分类统计</h4>
          <div className="space-y-2">
            {Object.entries(classifications).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{category}</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                  <span className="text-xs text-gray-500">
                    ({((count / total) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">总计</span>
              <span className="text-sm font-bold text-gray-900">{total}</span>
            </div>
          </div>
        </div>

        {/* 图表 */}
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, _name: any, props: any) => [
                  `${value} (${props.payload.percentage}%)`,
                  '数量'
                ]}
              />
              <Bar 
                dataKey="value" 
                radius={[4, 4, 0, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorMap[entry.name] || '#8884d8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 分析总结 */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">分析总结</h4>
        <p className="text-sm text-gray-600">
          共分析了 <span className="font-semibold">{total}</span> 条评论，
          其中正面评论（优+良）占比 
          <span className="font-semibold text-green-600"> 
            {(((classifications['优'] || 0) + (classifications['良'] || 0)) / total * 100).toFixed(1)}%
          </span>，
          负面评论占比 
          <span className="font-semibold text-red-600"> 
            {((classifications['差'] || 0) / total * 100).toFixed(1)}%
          </span>。
        </p>
      </div>
    </div>
  );
};
