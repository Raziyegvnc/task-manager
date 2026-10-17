
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [token, setToken] = useState('');
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState('all');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [editingTaskDescription, setEditingTaskDescription] = useState('');
  const [editingTaskPriority, setEditingTaskPriority] = useState('medium');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isLogin
        ? `http://localhost:5000/api/auth/login`
        : `http://localhost:5000/api/auth/register`;

      const requestBody = { email, password };

      if (!isLogin) {
        requestBody.name = name;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Bir hata oluştu!');
      }

      if (isLogin) {
        if (!data.token) {
          throw new Error('Sunucudan giriş tokenı alınamadı.');
        }

        setToken(data.token);
      } else {
        setIsLogin(true);
        setPassword('');
        alert(data.message || 'Kayıt başarılı! Şimdi giriş yapabilirsin.');
      }
    } catch (error) {
      console.error('Giriş/kayıt hatası:', error);
      setError(error.message);
    }
  };

  const handleAddTask = async (e) =>{
    e.preventDefault();
    setError('');

    try {
       if(!taskTitle.trim()){
        setError('Başlık boş olamaz!');
        return;
    }
    setAddingTask(true);

    const response = await fetch(
        `http://localhost:5000/api/tasks`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({title: taskTitle,description: taskDescription, priority: taskPriority}),
        });
      
        const data = await response.json();

        if (!response.ok) {
        throw new Error(data.message || 'Bir hata oluştu!');
      }

      await fetchTasks();
      setTaskTitle('');
      setTaskDescription('');
      setTaskPriority('medium');

    } catch (error) {
      setError(error.message);
    }finally {
      setAddingTask(false);
    }
};

const handleDeleteTask = async (taskId) =>{
  try {
    const response = await fetch(
        `http://localhost:5000/api/tasks/${taskId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Görev silinemedi!");
        }
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
  } catch (error) {
    setError(error.message);
  }
}

const handleUpdateTask = async (taskId) =>{
  setError('');

  if(!editingTaskTitle.trim()){
    setError('Başlık boş olamaz!');
        return;
  }

  try {
    const response = await fetch(
        `http://localhost:5000/api/tasks/${taskId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({title: editingTaskTitle,description: editingTaskDescription, priority: editingTaskPriority}),

        });
       if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Görev güncellenemedi!");
        }
      await fetchTasks();
      setEditingTaskId(null);
  } catch (error) {
    setError(error.message);
  }
}

const handleToggleTask = async (task) => {
  try {
    const response = await fetch(
        `http://localhost:5000/api/tasks/${task._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({title: task.title,description: task.description, completed: !task.completed}),

        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || "Görev durumu değiştirilemedi!");
        }
      await fetchTasks();
  } catch (error) {
    setError(error.message);
  }
};


  const fetchTasks = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `http://localhost:5000/api/tasks`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Görevler alınamadı.');
      }

      setTasks(Array.isArray(data) ? data : data.tasks || []);
    } catch (error) {
      console.error('Görevleri getirme hatası:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const handleLogout = () => {
    setToken('');
    setTasks([]);
    setEmail('');
    setPassword('');
    setName('');
    setError('');
  };

  let filteredTasks ;
  if(taskFilter==='all'){
    filteredTasks = tasks;
  }else if(taskFilter === 'active'){
    filteredTasks = tasks.filter((task) => task.completed === false)
  }else{
    filteredTasks = tasks.filter((task) => task.completed === true)
  }
    

  return (
    <div className="app">
      <h1>Task Manager</h1>
      <p>Görevlerini tek bir yerden yönet.</p>

      {!token && (
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={isLogin ? 'active-tab' : ''}
              type="button"
              onClick={() => {
                setIsLogin(true);
                setError('');
              }}
            >
              Giriş Yap
            </button>

            <button className={!isLogin ? 'active-tab' : ''}
              type="button"
              onClick={() => {
                setIsLogin(false);
                setError('');
              }}
            >
              Kayıt Ol
            </button>
          </div>

          <h2>{isLogin ? 'Giriş Yap' : 'Kayıt Ol'}</h2>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label>Ad:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label>E-posta:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label>Şifre:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" disabled={addingTask}>
              {addingTask ? 'Görev Ekleniyor...' : 'Görev Ekle'}
            </button>
          </form>
        </div>
      )}

      {token && (
        <section>
          <h2>Görevlerim</h2>

          <div className="task-filters">
            <button className={taskFilter === 'all' ? 'active-filter' : ''} type="button" onClick={() => setTaskFilter('all')}>Tümü</button>
            <button className={taskFilter === 'completed' ? 'active-filter' : ''} type="button" onClick={() => setTaskFilter('completed')}>Tamamlananlar</button>
            <button className={taskFilter === 'active' ? 'active-filter' : ''} type="button" onClick={() => setTaskFilter('active')}>Tamamlanmayanlar</button>
          </div>

          <form onSubmit={handleAddTask}>

            <div>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <textarea
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                />
              </div>

              <div>
                <label>Öncelik:</label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                >
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                </select>
              </div>

              <button type="submit">{loading ? 'Görev Ekleniyor...' : 'Görev Ekle'}</button>

          </form>

          <button className="secondary-button" type="button" onClick={handleLogout}>
            Çıkış Yap
          </button>

          <button className="secondary-button" type="button" onClick={fetchTasks}>
            Görevleri Yenile
          </button>

          {loading && <p>Görevler yükleniyor...</p>}

          {error && <p role="alert">{error}</p>}

          {!loading && !error && tasks.length === 0 && (
            <p>Henüz görevin bulunmuyor.</p>
          )}

          <ul>
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
              <li key={task._id}>
                {editingTaskId === task._id ? (
                  <>
                  <input
                  type="text"
                  value={editingTaskTitle}
                  onChange={(e) => setEditingTaskTitle(e.target.value)}/>

                  <textarea
                  value={editingTaskDescription}
                  onChange={(e) => setEditingTaskDescription(e.target.value)}/>

                  <label>Öncelik:</label>
                    <select
                      value={editingTaskPriority}
                      onChange={(e) => setEditingTaskPriority(e.target.value)}
                    >
                      <option value="low">Düşük</option>
                      <option value="medium">Orta</option>
                      <option value="high">Yüksek</option>
                    </select>

                  <button type="button" onClick={() => handleDeleteTask(task._id)}>Sil</button>

                  <button type="button" onClick={() => setEditingTaskId(null)}>İptal</button>
                  <button type="button" onClick={() => handleUpdateTask(task._id)}>Kaydet</button>
                  
                  </>
                  ) : (
                    <>
                    <input type="checkbox"
                    checked={task.completed}
                    onChange={()=>handleToggleTask(task)}/>
                <div className="task-info">
                <span style={{
                textDecoration: task.completed ? 'line-through' : 'none'
                }}>{task.title}</span>
                <span style={{
                textDecoration: task.completed ? 'line-through' : 'none'
                }}>{task.description && ` - ${task.description}`}</span>
                </div>

                <div className={`task-priority priority-${task.priority || 'medium'}`}>
                  Öncelik: {
                    task.priority === 'high'
                      ? 'Yüksek'
                      : task.priority === 'low'
                        ? 'Düşük'
                        : 'Orta'
                  }
                </div>

                <div className="task-actions">
                <button className="delete-button" type="button" onClick={() => handleDeleteTask(task._id)}>Sil</button>
                <button type="button" onClick={() => {
                  setEditingTaskId(task._id)
                  setEditingTaskTitle(task.title) 
                  setEditingTaskDescription(task.description)
                  setEditingTaskPriority(task.priority || 'medium');
                }}
                >Düzenle</button>
                </div>
              </>
              )}
              </li>
              ))
                ) : (
               <li>Görev bulunamadı.</li>
            )}
          </ul>
        </section>
      )}

      {!token && error && <p role="alert">{error}</p>}
    </div>
  );
}

export default App;
