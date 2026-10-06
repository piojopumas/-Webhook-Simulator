import { useState } from 'react';

interface Props {
  hottok: string;
  onClose: () => void;
  onRegenerate: () => void;
}

export default function HottokModal({ hottok, onClose, onRegenerate }: Props) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'nodejs' | 'python' | 'php'>('nodejs');

  const handleCopy = () => {
    navigator.clipboard.writeText(hottok);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippets = {
    nodejs: `// Node.js (Express)
app.post('/webhook', (req, res) => {
  const receivedHottok = req.headers['x-hotmart-hottok'];
  const EXPECTED_HOTTOK = '${hottok}';

  if (!receivedHottok || receivedHottok !== EXPECTED_HOTTOK) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Hottok' });
  }

  const eventData = req.body;
  console.log('Evento Hotmart recibido:', eventData.event);

  // Procesa tu lógica aquí (ej. activar suscripción)
  return res.status(200).send('Webhook verificado y procesado con éxito');
});`,
    python: `# Python (Flask)
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def webhook():
    received_hottok = request.headers.get('X-Hotmart-Hottok')
    EXPECTED_HOTTOK = '${hottok}'

    if not received_hottok or received_hottok != EXPECTED_HOTTOK:
        return jsonify({'error': 'Unauthorized: Invalid Hottok'}), 401

    event_data = request.json
    print(f"Evento Hotmart recibido: {event_data.get('event')}")

    # Procesa tu lógica aquí
    return 'OK', 200`,
    php: `// PHP (Vanilla / Laravel)
$headers = getallheaders();
$received_hottok = $headers['X-Hotmart-Hottok'] ?? $_SERVER['HTTP_X_HOTMART_HOTTOK'] ?? '';
$expected_hottok = '${hottok}';

if (empty($received_hottok) || $received_hottok !== $expected_hottok) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized: Invalid Hottok']);
    exit;
}

$payload = json_decode(file_get_contents('php://input'), true);
// Procesa tu lógica aquí
http_response_code(200);
echo 'OK';`
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
      <div className="bg-[#1a1a2e] w-full max-w-[800px] max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl border border-gray-700">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-[#0f0f0f]">
          <h2 className="text-xl font-bold flex items-center gap-2">🔒 Hottok de Verificación y Seguridad</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-lg font-bold">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-sm text-gray-300 mb-2">
              El <strong>Hottok</strong> es el token de seguridad único que Hotmart envía en el header <code className="text-[#a29bfe]">X-Hotmart-Hottok</code> de cada webhook para garantizar que las solicitudes son legítimas.
            </p>
            <div className="bg-[#0f0f0f] p-4 rounded border border-gray-700 flex items-center justify-between gap-2 mt-3">
              <code className="text-[#55efc4] font-mono text-sm break-all">{hottok}</code>
              <div className="flex gap-2 shrink-0">
                <button 
                  onClick={handleCopy} 
                  className="bg-[#00b894] hover:brightness-110 text-white px-3 py-1.5 rounded text-xs font-bold transition"
                >
                  {copied ? '¡Copiado!' : '📋 Copiar'}
                </button>
                <button 
                  onClick={onRegenerate} 
                  className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-xs font-bold transition"
                  title="Generar nuevo Hottok aleatorio"
                >
                  🔄 Regenerar
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-md font-semibold mb-3">💻 Código de ejemplo para verificar el Hottok en tu Backend</h3>
            <div className="flex gap-2 mb-3">
              {(['nodejs', 'python', 'php'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded text-xs font-bold uppercase transition ${activeTab === tab ? 'bg-[#e94560] text-white' : 'bg-[#0f0f0f] text-gray-400 hover:text-white'}`}
                >
                  {tab === 'nodejs' ? 'Node.js (Express)' : tab === 'python' ? 'Python (Flask)' : 'PHP'}
                </button>
              ))}
            </div>
            <pre className="bg-[#0f0f0f] p-4 rounded text-xs font-mono overflow-x-auto text-[#a29bfe] border border-gray-800 leading-relaxed">
              {codeSnippets[activeTab]}
            </pre>
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-700">
            <button 
              onClick={onClose}
              className="bg-gray-700 hover:bg-gray-600 px-6 py-2 rounded text-white font-bold text-sm transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
