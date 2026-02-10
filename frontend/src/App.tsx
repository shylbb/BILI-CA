import { useState, useEffect } from 'react';
import { TaskForm } from './components/TaskForm';
import { ProgressMonitor } from './components/ProgressMonitor';
import { ResultDisplay } from './components/ResultDisplay';
import { HistoryPanel } from './components/HistoryPanel';

function App() {
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [taskHistory, setTaskHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 模拟历史任务数据
  useEffect(() => {
    const mockHistory = [
      {
        id: 'task_123',
        bvid: 'BV1xx411c7mW',
        title: '测试视频',
        status: 'completed',
        timestamp: new Date().toISOString(),
        result: {
          classifications: { 优: 45, 良: 30, 中: 15, 差: 8, 不明意义: 2 },
          total: 100
        }
      }
    ];
    setTaskHistory(mockHistory);
  }, []);

  const handleTaskSubmit = async (bvid: string, maxComments: number, apiKey: string, model: string) => {
    setIsLoading(true);
    setError(null);
    
    // 立即初始化任务状态，显示任务正在启动
    const tempTaskId = `task_${Date.now()}_temp`;
    setCurrentTask({
      id: tempTaskId,
      bvid,
      status: 'running',
      progress: 0
    });
    
    try {
      // 1. 调用后端API爬取评论
      console.log('开始爬取评论...');
      const crawlResponse = await fetch('http://localhost:8000/api/crawl', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bvid, max_comments: maxComments })
      });
      
      if (!crawlResponse.ok) {
        throw new Error('爬取评论失败');
      }
      
      const crawlResult = await crawlResponse.json();
      console.log('爬取结果:', crawlResult);
      
      const crawlTaskId = crawlResult.task_id;
      
      // 更新任务状态为真实的后端任务状态
      setCurrentTask({
        id: crawlTaskId,
        bvid,
        status: crawlResult.status,
        progress: crawlResult.progress
      });
      
      // 2. 轮询获取爬取任务的真实进度
      const crawlProgressInterval = setInterval(async () => {
        try {
          const statusResponse = await fetch(`http://localhost:8000/api/task/${crawlTaskId}`);
          if (statusResponse.ok) {
            const statusResult = await statusResponse.json();
            console.log('爬取任务状态:', statusResult);
            
            setCurrentTask(prev => ({
              ...prev,
              status: statusResult.status,
              progress: statusResult.progress
            }));
            
            // 如果爬取任务完成，停止轮询并开始分析
            if (statusResult.status === 'completed') {
              clearInterval(crawlProgressInterval);
              
              // 3. 调用后端API分析评论
              console.log('开始分析评论...');
              const analyzeResponse = await fetch('http://localhost:8000/api/analyze', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  file_path: statusResult.result.file_path,
                  api_key: apiKey,
                  model: model
                })
              });
              
              if (!analyzeResponse.ok) {
                throw new Error('分析评论失败');
              }
              
              const analyzeResult = await analyzeResponse.json();
              console.log('分析结果:', analyzeResult);
              
              const analyzeTaskId = analyzeResult.task_id;
              
              // 更新任务状态为分析中
              setCurrentTask(prev => ({
                ...prev,
                id: analyzeTaskId,
                status: analyzeResult.status,
                progress: analyzeResult.progress
              }));
              
              // 4. 轮询获取分析任务的真实进度
              const analyzeProgressInterval = setInterval(async () => {
                try {
                  const analyzeStatusResponse = await fetch(`http://localhost:8000/api/task/${analyzeTaskId}`);
                  if (analyzeStatusResponse.ok) {
                    const analyzeStatusResult = await analyzeStatusResponse.json();
                    console.log('分析任务状态:', analyzeStatusResult);
                    
                    setCurrentTask(prev => ({
                      ...prev,
                      status: analyzeStatusResult.status,
                      progress: analyzeStatusResult.progress
                    }));
                    
                    // 如果分析任务完成，停止轮询并获取结果
                    if (analyzeStatusResult.status === 'completed') {
                      clearInterval(analyzeProgressInterval);
                      
                      // 5. 获取分析结果详情
                      console.log('获取分析结果详情...');
                      const resultFile = analyzeStatusResult.result.result_file;
                      // 对文件路径进行编码，确保URL安全
                      const encodedFilePath = encodeURIComponent(resultFile);
                      const resultResponse = await fetch(`http://localhost:8000/api/results/${encodedFilePath}`);
                      
                      if (!resultResponse.ok) {
                        throw new Error('获取分析结果失败');
                      }
                      
                      const analysisResult = await resultResponse.json();
                      console.log('分析结果详情:', analysisResult);
                      
                      // 6. 更新任务状态和历史记录
                      setCurrentTask({
                        id: analyzeTaskId,
                        bvid,
                        status: 'completed',
                        progress: 100,
                        result: analysisResult
                      });
                      
                      setTaskHistory(prev => [{
                        id: analyzeTaskId,
                        bvid,
                        title: '测试视频',
                        status: 'completed',
                        timestamp: new Date().toISOString(),
                        result: analysisResult
                      }, ...prev]);
                      
                      setIsLoading(false);
                    }
                  }
                } catch (error) {
                  console.error('获取分析任务状态失败:', error);
                }
              }, 1000); // 每1秒更新一次分析进度
            }
          }
        } catch (error) {
          console.error('获取爬取任务状态失败:', error);
        }
      }, 1000); // 每1秒更新一次爬取进度
    } catch (err) {
      console.error('任务执行失败:', err);
      setError('任务执行失败: ' + (err instanceof Error ? err.message : String(err)));
      setIsLoading(false);
    }
  };

  const handleDeleteHistory = (id: string) => {
    setTaskHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">BILI Comment Analysis</h1>
          <p className="mt-2 text-sm text-gray-500">
            爬取、分析、可视化视频评论情感
          </p>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左侧：任务表单 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">开始分析</h2>
              <TaskForm onSubmit={handleTaskSubmit} isLoading={isLoading} />
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：结果显示 */}
          <div className="lg:col-span-2 space-y-6">
            {currentTask && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <ProgressMonitor task={currentTask} />
                {currentTask.status === 'completed' && currentTask.result && (
                  <ResultDisplay result={currentTask.result} />
                )}
              </div>
            )}

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">历史记录</h2>
              <HistoryPanel history={taskHistory} onDelete={handleDeleteHistory} />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            BILI Comment Analysis © {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
