import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './style.css';

export default function Login() {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsRegisterMode((prev) => !prev);
    setError('');
    setSuccessMessage('');
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      if (isRegisterMode) {
        await register(name.trim(), username.trim(), password);
        await login(username.trim(), password);
        navigate('/dashboard/stock');
      } else {
        await login(username.trim(), password);
        navigate('/dashboard/stock');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
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
        <h1>{isRegisterMode ? 'Criar nova conta' : 'Entrar na sua conta'}</h1>
        <p>
          {isRegisterMode
            ? 'Preencha os dados abaixo para cadastrar seu acesso'
            : 'Digite suas credenciais para acessar o sistema'}
        </p>

        {error && <p className="login-error">{error}</p>}
        {successMessage && <p className="login-success">{successMessage}</p>}

        {isRegisterMode && (
          <>
            <label htmlFor="name-input">Nome</label>
            <input
              id="name-input"
              type="text"
              placeholder="Insira seu nome ou nome do comércio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </>
        )}

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
          {isSubmitting
            ? isRegisterMode
              ? 'Cadastrando...'
              : 'Entrando...'
            : isRegisterMode
              ? 'Cadastrar e Entrar'
              : 'Entrar'}
        </button>

        <button type="button" className="login-toggle-button" onClick={toggleMode}>
          {isRegisterMode
            ? 'Já possui uma conta? Faça login'
            : 'Não possui uma conta? Cadastre-se'}
        </button>
      </form>
    </div>
  );
}
