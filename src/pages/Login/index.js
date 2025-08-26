import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom'
import { Package } from "lucide-react";
import api from "../../services/api"
import './style.css';

export default function Login() {

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const navigate = useNavigate();

  async function login(e) {
    e.preventDefault();

    setError('');

    const data = {
      username,
      password,
    };

    try {
      const response = await api.post('auth/login', data)

      localStorage.setItem('username', username);
      localStorage.setItem('accessToken', response.data.token);

      navigate('/dashboard/stock');
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Não foi possível conectar ao servidor. Tente novamente mais tarde.");
      }
    }

  };

  return (
    <div className="login-container">
      <form className="login-form" action="" onSubmit={login}>

        <div className='package'><Package color='white' size={36} /></div>
        <h1>Entrar na sua conta</h1>
        <p>Digite suas credenciais para acessar o sistema</p>

        {error && <p className="login-error">{error}</p>}


        <label htmlFor="text">Nome de Usuário</label>
        <input type="text" placeholder='Insira seu Nome de Usuário' value={username} onChange={e => setUsername(e.target.value)} />

        <label htmlFor="password">Senha</label>
        <input type="password" placeholder='Insira sua senha' value={password} onChange={e => setPassword(e.target.value)} />

        <button type='submit'>Entrar</button>
      </form>
    </div>
  );
}