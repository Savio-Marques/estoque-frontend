import React from 'react';
import Modal from '../Modal';
import { useStockMovements } from '../../hooks/useProducts';

export default function StockMovementsModal({ isOpen, onClose }) {
  const { data: movements = [], isLoading } = useStockMovements({ enabled: isOpen });

  const getBadgeClass = (type) => {
    switch (type) {
      case 'ENTRADA':
      case 'CADASTRO':
        return 'movement-badge green';
      case 'SAIDA':
        return 'movement-badge yellow';
      case 'EXCLUSAO':
        return 'movement-badge red';
      default:
        return 'movement-badge';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="movements-modal">
        <h2>Histórico de Movimentações</h2>
        <p className="movements-subtitle">Últimas 50 alterações registradas no estoque</p>

        {isLoading ? (
          <p className="product-not-found">Carregando histórico...</p>
        ) : movements.length === 0 ? (
          <p className="product-not-found">Nenhuma movimentação registrada ainda.</p>
        ) : (
          <div className="movements-list">
            {movements.map((mov) => (
              <div key={mov.id} className="movement-item">
                <div className="movement-header">
                  <strong>{mov.productName}</strong>
                  <span className={getBadgeClass(mov.movementType)}>{mov.movementType}</span>
                </div>
                <div className="movement-details">
                  <span>
                    Qtd: {mov.previousQuantity} → <strong>{mov.newQuantity}</strong> (
                    {mov.quantityDelta > 0 ? `+${mov.quantityDelta}` : mov.quantityDelta})
                  </span>
                  <span className="movement-date">
                    {new Date(mov.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
