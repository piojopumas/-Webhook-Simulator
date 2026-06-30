import { WebhookLog } from '../types';

interface Props {
  log: WebhookLog;
  onClose: () => void;
  onRetry: () => void;
}

const getStatusDescription = (status: number | undefined) => {
  if (!status) return "Error de red";
  if (status >= 200 && status < 300) return "Tu servicio informó que el evento fue recibido con éxito.";
  if (status === 400) return "Tu servicio rechazó la solicitud (Bad Request).";
  if (status === 401) return "Tu servicio requiere autenticación.";
  return `Error ${status}`;
};

export default function WebhookDetailModal({ log, onClose, onRetry }: Props) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a2e] w-full max-w-[900px] max-h-[90vh] overflow-y-auto rounded-lg shadow-xl border border-gray-700">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#0f0f0f]">
          <h2 className="text-xl font-bold">Detalles de la Solicitud</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>
        
        <div className="p-6 space-y-6 text-sm">
          <div>
            <h3 className="font-bold mb-2">Payload JSON</h3>
            <pre className="bg-[#0f0f0f] p-4 rounded text-xs font-mono overflow-x-auto text-[#a29bfe]">
              {JSON.stringify(log.request.body, null, 2)}
            </pre>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <p className="font-bold">Status Code: {log.response.status || 'N/A'}</p>
            <p className="text-gray-400">{getStatusDescription(log.response.status)}</p>
            <p className="text-gray-400 mt-2">Tiempo de respuesta: {log.duration} ms</p>
          </div>

          <div>
            <h3 className="font-bold mb-2">Cuerpo de Respuesta</h3>
            <pre className="bg-[#0f0f0f] p-4 rounded text-xs font-mono overflow-x-auto text-[#55efc4]">
              {JSON.stringify(log.response.body, null, 2)}
            </pre>
          </div>

          {log.status === 'failure' && (
            <button onClick={onRetry} className="bg-[#e94560] px-4 py-2 rounded text-white font-bold">🔄 Reintentar este envío</button>
          )}
        </div>
      </div>
    </div>
  );
}
