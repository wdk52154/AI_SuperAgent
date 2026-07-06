import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from './Button.tsx';

interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
}

const App: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    // 从 localStorage 加载数据
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTodo, setNewTodo] = useState<string>('');
  
  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);
  
  const addTodo = () => {
    if (newTodo.trim() === '') return;
    
    const newTodoItem: TodoItem = {
      id: Date.now().toString(),
      text: newTodo.trim(),
      completed: false,
    };
    
    setTodos([...todos, newTodoItem]);
    setNewTodo('');
  };
  
  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };
  
  const deleteTodo = (id: string) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };
  
  const clearCompleted = () => {
    setTodos(todos.filter(todo => !todo.completed));
  };
  
  const remainingCount = todos.filter(todo => !todo.completed).length;
  
  return (
    <div className="container">
      <div className="header">
        <h1>📝 待办清单</h1>
      </div>
      
      <div className="input-section">
        <div className="input-group">
          <input
            type="text"
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            placeholder="输入新的待办事项..."
            aria-label="添加新待办事项"
          />
          <Button variant="primary" onClick={addTodo}>
            添加
          </Button>
        </div>
      </div>
      
      <ul className="todo-list">
        {todos.length === 0 ? (
          <li className="empty-state">
            <p>暂无待办事项</p>
            <p>添加您的第一个任务吧！</p>
          </li>
        ) : (
          todos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
                className="todo-checkbox"
                aria-label={`标记 ${todo.text} 为完成`}
              />
              <span className="todo-text">{todo.text}</span>
              <div className="todo-actions">
                <Button 
                  variant="danger" 
                  onClick={() => deleteTodo(todo.id)}
                  aria-label={`删除 ${todo.text}`}
                >
                  删除
                </Button>
              </div>
            </li>
          ))
        )}
      </ul>
      
      <div className="stats">
        <span>{remainingCount}</span> 项待完成，共 <span>{todos.length}</span> 项
        {todos.some(todo => todo.completed) && (
          <Button 
            variant="primary" 
            onClick={clearCompleted}
            style={{ marginLeft: '16px' }}
          >
            清除已完成
          </Button>
        )}
      </div>
    </div>
  );
};

// 渲染应用
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}

export default App;