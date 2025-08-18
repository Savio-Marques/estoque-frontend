import React from 'react';
import { Package } from "lucide-react";
import './style.css';

export default function Login() {
  return (
        <div className="login-container">
            <form className="login-form" action="">

              <div className='package'><Package color='white' size={36}/></div>
              <h1>Entrar na sua conta</h1>
              <p>Digite suas credenciais para acessar o sistema</p>

              <label htmlFor="text">Nome de Usuário</label>
              <input type="text" placeholder='Insira seu Nome de Usuário'/>

              <label htmlFor="password">Senha</label>
              <input type="password" placeholder='Insira sua senha' />

              <button type='submit'>Entrar</button>
            </form>
        </div>
  );
}