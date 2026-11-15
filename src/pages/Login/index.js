import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './style.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(username.trim(), password);
      navigate('/dashboard/stock');
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Usuário ou senha inválidos, ou servidor indisponível.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <div className="package">
          <Package color="white" size={36} />
        </div>
        <h1>Entrar na sua conta</h1>
        <p>Acesso restrito — digite suas credenciais autorizadas</p>

        {error && <p className="login-error">{error}</p>}

        <label htmlFor="username-input">Nome de Usuário</label>
        <input
          id="username-input"
          type="text"
          placeholder="Insira seu Nome de Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="password-input">Senha</label>
        <input
          id="password-input"
          type="password"
          placeholder="Insira sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
