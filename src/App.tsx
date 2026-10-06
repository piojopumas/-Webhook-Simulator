/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { WebhookConfig, WebhookLog } from './types';
import { getConfigs, saveConfig, deleteConfig, getLogs, addLog } from './lib/storage';
import WebhookDetailModal from './components/WebhookDetailModal';
import HottokModal from './components/HottokModal';

export default function App() {
  const [configs, setConfigs] = useState<WebhookConfig[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'welcome' | 'form'>('welcome');
  const [selectedLog, setSelectedLog] = useState<WebhookLog | null>(null);
  const [showHottokModal, setShowHottokModal] = useState(false);
  
  const generateNewHottok = () => {
    const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `E1${randomHex}-${crypto.randomUUID()}`;
  };

  const [config, setConfig] = useState<Partial<WebhookConfig>>({
    name: '',
    url: '',
    events: [],
    buyerData: {
      name: 'Hugo Belmonte',
      email: 'huedbelgo@hotmail.com',
      document: '2021138',
      documentType: 'DNI',
      country: 'BO',
      city: 'Santa Cruz',
      productName: 'AI Metabolic Food Scanner',
      productUcode: '59ebc1fa-4506-42c4-aa38-c5ff0f936166',
      planName: 'Mensual',
      price: 654.00,
      currency: 'BOB',
      hottok: generateNewHottok()
    }
  });
  const [statusMessage, setStatusMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isBuyerDataExpanded, setIsBuyerDataExpanded] = useState(true);

  useEffect(() => {
    setConfigs(getConfigs());
    setLogs(getLogs());
  }, []);

  const selectedConfig = configs.find(c => c.id === selectedConfigId);

  const handleSaveConfig = () => {
    if (!config.name || !config.url || !config.events || config.events.length === 0) {
      setStatusMessage({ text: 'Por favor, completa todos los campos obligatorios (Nombre, URL y al menos un evento).', type: 'error' });
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }
    const newConfig: WebhookConfig = {
      id: selectedConfigId || crypto.randomUUID(),
      name: config.name!,
      url: config.url!,
      events: config.events || [],
      buyerData: {
        ...config.buyerData!,
        hottok: config.buyerData?.hottok || generateNewHottok()
      }
    };
    saveConfig(newConfig);
    setSelectedConfigId(newConfig.id);
    setConfigs(getConfigs());
    setStatusMessage({ text: 'Configuración guardada correctamente.', type: 'success' });
    setTimeout(() => {
      setStatusMessage(null);
      setConfig({
        name: '',
        url: '',
        events: [],
        buyerData: {
          name: 'Hugo Belmonte',
          email: 'huedbelgo@hotmail.com',
          document: '2021138',
          documentType: 'DNI',
          country: 'BO',
          city: 'Santa Cruz',
          productName: 'AI Metabolic Food Scanner',
          productUcode: '59ebc1fa-4506-42c4-aa38-c5ff0f936166',
          planName: 'Mensual',
          price: 654.00,
          currency: 'BOB',
          hottok: generateNewHottok()
        }
      });
      setSelectedConfigId(null);
      setActiveView('welcome');
    }, 1500);
  };

  const handleSend = async (conf: WebhookConfig, event: string) => {
    const playSound = () => {
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        audio.play().catch(e => console.log('Audio playback failed', e));
    };
    playSound();
    const start = performance.now();
    const names = conf.buyerData.name.split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    const baseData = {
        product: {
            id: Math.floor(Math.random() * 1000000),
            ucode: conf.buyerData.productUcode,
            name: conf.buyerData.productName,
            warranty_date: new Date().toISOString(),
            has_co_production: false,
            is_physical_product: false,
            product_format_id: 8
        },
        affiliates: [{ affiliate_code: "", name: "" }],
        buyer: {
            email: conf.buyerData.email,
            name: conf.buyerData.name,
            first_name: firstName,
            last_name: lastName,
            address: { 
                city: conf.buyerData.city, 
                country: conf.buyerData.country, 
                country_iso: conf.buyerData.country,
                zipcode: "", address: "", complement: ""
            },
            document: conf.buyerData.document,
            document_type: conf.buyerData.documentType
        },
        producer: {
            name: "PRODUCER NAME",
            document: "12345678",
            legal_nature: "Pessoa Física"
        },
        purchase: {
            approved_date: Date.now(),
            full_price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
            price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
            checkout_country: { name: conf.buyerData.country, iso: conf.buyerData.country },
            order_bump: { is_order_bump: false },
            buyer_ip: "127.0.0.1",
            original_offer_price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
            order_date: Date.now(),
            status: event === 'PURCHASE_CANCELED' ? 'CANCELED' : event === 'PURCHASE_COMPLETE' ? 'COMPLETED' : event === 'PURCHASE_EXPIRED' ? 'EXPIRED' : event === 'PURCHASE_BILLET_PRINTED' ? 'BILLET_PRINTED' : event === 'PURCHASE_PROTEST' ? 'DISPUTE' : event === 'PURCHASE_REFUNDED' ? 'REFUNDED' : event === 'PURCHASE_CHARGEBACK' ? 'CHARGEBACK' : event.includes('APPROVED') ? 'APPROVED' : 'PENDING',
            transaction: "HP" + Math.floor(Math.random() * 1000000000),
            payment: { installments_number: 1, type: "CREDIT_CARD" },
            offer: { code: "offer_code", coupon_code: "APERTURA", name: "APERTURA", description: "DESCUENTO" },
            invoice_by: "SELLER",
            subscription_anticipation_purchase: false,
            date_next_charge: Date.now() + 30 * 24 * 60 * 60 * 1000,
            recurrence_number: 1,
            is_funnel: false,
            business_model: "A"
        },
        subscription: {
            status: "ACTIVE",
            plan: { id: 12345, name: conf.buyerData.planName },
            subscriber: { code: "SUBCODE" }
        }
    };

    let payload: any;
    if (event === 'SUBSCRIPTION_CANCELLATION') {
        payload = {
            id: crypto.randomUUID(),
            creation_date: Date.now(),
            event: event,
            version: "2.0.0",
            hottok: conf.buyerData.hottok,
            data: {
                actual_recurrence_value: 0,
                cancellation_date: Date.now(),
                date_next_charge: Date.now() + 30 * 24 * 60 * 60 * 1000,
                product: { id: 7662057, name: conf.buyerData.productName },
                subscriber: { code: "SUBCODE", name: conf.buyerData.name, email: conf.buyerData.email, phone: { phone: "59172022420", cell: "62531645" } },
                subscription: { id: 12345, plan: { id: 1234, name: conf.buyerData.planName } }
            }
        };
    } else if (event === 'UPDATE_SUBSCRIPTION_CHARGE_DATE') {
        payload = {
            id: crypto.randomUUID(),
            creationDate: Date.now(),
            event: event,
            version: "2.0.0",
            hottok: conf.buyerData.hottok,
            data: {
                subscription: {
                    dateNextCharge: new Date().toISOString(),
                    newChargeDay: 1,
                    oldChargeDay: 7,
                    status: "ACTIVE",
                    product: { id: 0, name: conf.buyerData.productName }
                },
                subscriber: {
                    name: conf.buyerData.name,
                    email: conf.buyerData.email,
                    code: "00000000"
                },
                plan: {
                    id: 0,
                    name: conf.buyerData.planName,
                    offer: { code: "000000" }
                }
            }
        };
    } else if (event === 'SWITCH_PLAN') {
        payload = {
            id: crypto.randomUUID(),
            creation_date: Date.now(),
            event: event,
            version: "2.0.0",
            hottok: conf.buyerData.hottok,
            data: {
                switch_plan_date: Date.now(),
                subscription: {
                    subscriber_code: "9W2LNSG4",
                    status: "ACTIVE",
                    product: {
                        id: 0,
                        name: conf.buyerData.productName
                    },
                    user: {
                        email: conf.buyerData.email
                    }
                },
                plans: [
                    {
                        id: 654321,
                        name: conf.buyerData.planName,
                        offer: {
                            key: "n6hup357"
                        },
                        current: true
                    },
                    {
                        id: 123456,
                        name: "Plano anterior",
                        offer: {
                            key: "n6hup355"
                        },
                        current: false
                    }
                ]
            }
        };
    } else if (event === 'PURCHASE_DELAYED') {
        payload = {
            id: crypto.randomUUID(),
            creation_date: Date.now(),
            event: event,
            version: "2.0.0",
            hottok: conf.buyerData.hottok,
            data: {
                product: {
                    id: 0,
                    ucode: conf.buyerData.productUcode,
                    name: conf.buyerData.productName,
                    warranty_date: "2017-12-27T00:00:00Z",
                    has_co_production: false,
                    is_physical_product: false,
                    product_format_id: 1,
                    content: {
                        has_physical_products: true,
                        products: []
                    }
                },
                affiliates: [{ affiliate_code: "Q58388177J", name: "Affiliate name" }],
                buyer: {
                    email: conf.buyerData.email,
                    name: conf.buyerData.name,
                    first_name: firstName,
                    last_name: lastName,
                    checkout_phone_code: "999999999",
                    checkout_phone: "99999999900",
                    address: {
                        city: conf.buyerData.city,
                        country: conf.buyerData.country,
                        country_iso: conf.buyerData.country,
                        state: "Minas Gerais",
                        neighborhood: "Tubalina",
                        zipcode: "38400123",
                        address: "Avenida Francisco Galassi",
                        number: "10",
                        complement: "Perto do shopping"
                    },
                    document: conf.buyerData.document,
                    document_type: conf.buyerData.documentType
                },
                producer: {
                    name: "Producer Test Name",
                    document: "12345678965",
                    legal_nature: "Pessoa Física"
                },
                purchase: {
                    approved_date: Date.now(),
                    full_price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
                    price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
                    checkout_country: { name: conf.buyerData.country, iso: conf.buyerData.country },
                    order_bump: { is_order_bump: true, parent_purchase_transaction: "HP02316330308193" },
                    buyer_ip: "00.00.00.00",
                    original_offer_price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
                    order_date: Date.now(),
                    status: 'DELAYED',
                    transaction: "HP16015479281022",
                    payment: { installments_number: 12, type: "CREDIT_CARD" },
                    offer: { code: "test", coupon_code: "SHHUHA" },
                    is_funnel: false,
                    business_model: "I"
                },
                shipping: {
                    cost: { value: "25.50", currency_value: "BRL" },
                    estimated_delivery_days: 7,
                    carrier: { name: "CORREIOS", service: "SEDEX" },
                    fulfillment: { service: "MANUAL" }
                },
                subscription: {
                    status: "ACTIVE",
                    plan: { id: 123, name: conf.buyerData.planName },
                    subscriber: { code: "I9OT62C3" }
                }
            }
        };
    } else if (event === 'PURCHASE_REFUNDED') {
        payload = {
            id: crypto.randomUUID(),
            creation_date: Date.now(),
            event: event,
            version: "2.0.0",
            hottok: conf.buyerData.hottok,
            data: {
                product: {
                    id: 0,
                    ucode: conf.buyerData.productUcode,
                    name: conf.buyerData.productName,
                    warranty_date: "2017-12-27T00:00:00Z",
                    has_co_production: false,
                    is_physical_product: false,
                    product_format_id: 1,
                    content: {
                        has_physical_products: true,
                        products: []
                    }
                },
                affiliates: [{ affiliate_code: "Q58388177J", name: "Affiliate name" }],
                buyer: {
                    email: conf.buyerData.email,
                    name: conf.buyerData.name,
                    first_name: firstName,
                    last_name: lastName,
                    checkout_phone_code: "999999999",
                    checkout_phone: "99999999900",
                    address: {
                        city: conf.buyerData.city,
                        country: conf.buyerData.country,
                        country_iso: conf.buyerData.country,
                        state: "Minas Gerais",
                        neighborhood: "Tubalina",
                        zipcode: "38400123",
                        address: "Avenida Francisco Galassi",
                        number: "10",
                        complement: "Perto do shopping"
                    },
                    document: conf.buyerData.document,
                    document_type: conf.buyerData.documentType
                },
                producer: {
                    name: "Producer Test Name",
                    document: "12345678965",
                    legal_nature: "Pessoa Física"
                },
                purchase: {
                    approved_date: Date.now(),
                    full_price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
                    price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
                    checkout_country: { name: conf.buyerData.country, iso: conf.buyerData.country },
                    order_bump: { is_order_bump: true, parent_purchase_transaction: "HP02316330308193" },
                    buyer_ip: "00.00.00.00",
                    original_offer_price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
                    order_date: Date.now(),
                    status: 'REFUNDED',
                    transaction: "HP16015479281022",
                    payment: { installments_number: 12, type: "CREDIT_CARD" },
                    offer: { code: "test", coupon_code: "SHHUHA" },
                    is_funnel: false,
                    business_model: "I"
                },
                shipping: {
                    cost: { value: "25.50", currency_value: "BRL" },
                    estimated_delivery_days: 7,
                    carrier: { name: "CORREIOS", service: "SEDEX" },
                    fulfillment: { service: "MANUAL" }
                },
                subscription: {
                    status: "ACTIVE",
                    plan: { id: 123, name: conf.buyerData.planName },
                    subscriber: { code: "I9OT62C3" }
                }
            }
        };
    } else if (event === 'PURCHASE_CHARGEBACK') {
        payload = {
            id: crypto.randomUUID(),
            creation_date: Date.now(),
            event: event,
            version: "2.0.0",
            hottok: conf.buyerData.hottok,
            data: {
                product: {
                    id: 0,
                    ucode: conf.buyerData.productUcode,
                    name: conf.buyerData.productName,
                    warranty_date: "2017-12-27T00:00:00Z",
                    has_co_production: false,
                    is_physical_product: false,
                    product_format_id: 1,
                    content: {
                        has_physical_products: true,
                        products: []
                    }
                },
                affiliates: [{ affiliate_code: "Q58388177J", name: "Affiliate name" }],
                buyer: {
                    email: conf.buyerData.email,
                    name: conf.buyerData.name,
                    first_name: firstName,
                    last_name: lastName,
                    checkout_phone_code: "999999999",
                    checkout_phone: "99999999900",
                    address: {
                        city: conf.buyerData.city,
                        country: conf.buyerData.country,
                        country_iso: conf.buyerData.country,
                        state: "Minas Gerais",
                        neighborhood: "Tubalina",
                        zipcode: "38400123",
                        address: "Avenida Francisco Galassi",
                        number: "10",
                        complement: "Perto do shopping"
                    },
                    document: conf.buyerData.document,
                    document_type: conf.buyerData.documentType
                },
                producer: {
                    name: "Producer Test Name",
                    document: "12345678965",
                    legal_nature: "Pessoa Física"
                },
                purchase: {
                    approved_date: Date.now(),
                    full_price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
                    price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
                    checkout_country: { name: conf.buyerData.country, iso: conf.buyerData.country },
                    order_bump: { is_order_bump: true, parent_purchase_transaction: "HP02316330308193" },
                    buyer_ip: "00.00.00.00",
                    original_offer_price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
                    order_date: Date.now(),
                    status: 'CHARGEBACK',
                    transaction: "HP16015479281022",
                    payment: { installments_number: 12, type: "CREDIT_CARD" },
                    offer: { code: "test", coupon_code: "SHHUHA" },
                    is_funnel: false,
                    business_model: "I"
                },
                shipping: {
                    cost: { value: "25.50", currency_value: "BRL" },
                    estimated_delivery_days: 7,
                    carrier: { name: "CORREIOS", service: "SEDEX" },
                    fulfillment: { service: "MANUAL" }
                },
                subscription: {
                    status: "ACTIVE",
                    plan: { id: 123, name: conf.buyerData.planName },
                    subscriber: { code: "I9OT62C3" }
                }
            }
        };
    } else if (event === 'PURCHASE_CANCELED') {
        payload = {
            id: crypto.randomUUID(),
            creation_date: Date.now(),
            event: event,
            version: "2.0.0",
            hottok: conf.buyerData.hottok,
            data: {
                product: {
                    id: 0,
                    ucode: conf.buyerData.productUcode,
                    name: conf.buyerData.productName,
                    warranty_date: "2017-12-27T00:00:00Z",
                    has_co_production: false,
                    is_physical_product: false,
                    product_format_id: 1,
                    content: {
                        has_physical_products: true,
                        products: []
                    }
                },
                affiliates: [{ affiliate_code: "Q58388177J", name: "Affiliate name" }],
                buyer: {
                    email: conf.buyerData.email,
                    name: conf.buyerData.name,
                    first_name: firstName,
                    last_name: lastName,
                    checkout_phone_code: "999999999",
                    checkout_phone: "99999999900",
                    address: {
                        city: conf.buyerData.city,
                        country: conf.buyerData.country,
                        country_iso: conf.buyerData.country,
                        state: "Minas Gerais",
                        neighborhood: "Tubalina",
                        zipcode: "38400123",
                        address: "Avenida Francisco Galassi",
                        number: "10",
                        complement: "Perto do shopping"
                    },
                    document: conf.buyerData.document,
                    document_type: conf.buyerData.documentType
                },
                producer: {
                    name: "Producer Test Name",
                    document: "12345678965",
                    legal_nature: "Pessoa Física"
                },
                purchase: {
                    approved_date: Date.now(),
                    full_price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
                    price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
                    checkout_country: { name: conf.buyerData.country, iso: conf.buyerData.country },
                    order_bump: { is_order_bump: true, parent_purchase_transaction: "HP02316330308193" },
                    buyer_ip: "00.00.00.00",
                    original_offer_price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
                    order_date: Date.now(),
                    status: 'CANCELED',
                    transaction: "HP16015479281022",
                    payment: { installments_number: 12, type: "CREDIT_CARD" },
                    offer: { code: "test", coupon_code: "SHHUHA" },
                    is_funnel: false,
                    business_model: "I"
                },
                shipping: {
                    cost: { value: "25.50", currency_value: "BRL" },
                    estimated_delivery_days: 7,
                    carrier: { name: "CORREIOS", service: "SEDEX" },
                    fulfillment: { service: "MANUAL" }
                },
                subscription: {
                    status: "ACTIVE",
                    plan: { id: 123, name: conf.buyerData.planName },
                    subscriber: { code: "I9OT62C3" }
                }
            }
        };
    } else if (event === 'PURCHASE_EXPIRED') {
        payload = {
            id: crypto.randomUUID(),
            creation_date: Date.now(),
            event: event,
            version: "2.0.0",
            hottok: conf.buyerData.hottok,
            data: {
                product: {
                    id: 0,
                    ucode: conf.buyerData.productUcode,
                    name: conf.buyerData.productName,
                    warranty_date: "2017-12-27T00:00:00Z",
                    has_co_production: false,
                    is_physical_product: false,
                    product_format_id: 1,
                    content: {
                        has_physical_products: true,
                        products: []
                    }
                },
                affiliates: [{ affiliate_code: "Q58388177J", name: "Affiliate name" }],
                buyer: {
                    email: conf.buyerData.email,
                    name: conf.buyerData.name,
                    first_name: firstName,
                    last_name: lastName,
                    checkout_phone_code: "999999999",
                    checkout_phone: "99999999900",
                    address: {
                        city: conf.buyerData.city,
                        country: conf.buyerData.country,
                        country_iso: conf.buyerData.country,
                        state: "Minas Gerais",
                        neighborhood: "Tubalina",
                        zipcode: "38400123",
                        address: "Avenida Francisco Galassi",
                        number: "10",
                        complement: "Perto do shopping"
                    },
                    document: conf.buyerData.document,
                    document_type: conf.buyerData.documentType
                },
                producer: {
                    name: "Producer Test Name",
                    document: "12345678965",
                    legal_nature: "Pessoa Física"
                },
                purchase: {
                    approved_date: Date.now(),
                    full_price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
                    price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
                    checkout_country: { name: conf.buyerData.country, iso: conf.buyerData.country },
                    order_bump: { is_order_bump: true, parent_purchase_transaction: "HP02316330308193" },
                    buyer_ip: "00.00.00.00",
                    original_offer_price: { value: conf.buyerData.price, currency_value: conf.buyerData.currency },
                    order_date: Date.now(),
                    status: 'EXPIRED',
                    transaction: "HP16015479281022",
                    payment: { installments_number: 12, type: "CREDIT_CARD" },
                    offer: { code: "test", coupon_code: "SHHUHA" },
                    is_funnel: false,
                    business_model: "I"
                },
                shipping: {
                    cost: { value: "25.50", currency_value: "BRL" },
                    estimated_delivery_days: 7,
                    carrier: { name: "CORREIOS", service: "SEDEX" },
                    fulfillment: { service: "MANUAL" }
                },
                subscription: {
                    status: "ACTIVE",
                    plan: { id: 123, name: conf.buyerData.planName },
                    subscriber: { code: "I9OT62C3" }
                }
            }
        };
    } else {
        payload = {
            id: crypto.randomUUID(),
            creation_date: Date.now(),
            event: event,
            version: "2.0.0",
            data: baseData,
            hottok: conf.buyerData.hottok
        };
    }
    const requestHeaders = { 
        'Content-Type': 'application/json',
        'X-Hotmart-Event': event,
        'X-Hotmart-Hottok': conf.buyerData.hottok
    };
    
    try {
      const response = await fetch(conf.url, {
        method: 'POST',
        headers: requestHeaders,
        body: JSON.stringify(payload),
      });
      
      const data = await response.json().catch(() => ({ message: 'Respuesta sin JSON válido' }));
      const duration = Math.round(performance.now() - start);
      
      const log: WebhookLog = {
        id: crypto.randomUUID(),
        webhookId: conf.id,
        event: event,
        duration: duration,
        timestamp: new Date().toISOString(),
        status: response.ok ? 'success' : 'failure',
        request: { headers: requestHeaders, body: payload },
        response: { status: response.status, body: data },
      };
      addLog(log);
      setLogs(getLogs());
    } catch (error) {
      const duration = Math.round(performance.now() - start);
      addLog({
        id: crypto.randomUUID(),
        webhookId: conf.id,
        event: event,
        duration: duration,
        timestamp: new Date().toISOString(),
        status: 'failure',
        request: { headers: requestHeaders, body: payload },
        response: {},
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      setLogs(getLogs());
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f] text-white font-sans">
      <aside className="w-[30%] min-w-[280px] bg-[#16213e] flex flex-col p-4 border-r border-gray-800">
        <header className="mb-6">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">🔥 Webhook Simulator</h1>
          <p className="text-gray-400 text-xs mt-1">Hotmart Testing Tool</p>
        </header>

        <button onClick={() => { 
          setConfig({
            name: '',
            url: '',
            events: [],
            buyerData: {
              name: 'Hugo Belmonte',
              email: 'huedbelgo@hotmail.com',
              document: '2021138',
              documentType: 'DNI',
              country: 'BO',
              city: 'Santa Cruz',
              productName: 'AI Metabolic Food Scanner',
              productUcode: '59ebc1fa-4506-42c4-aa38-c5ff0f936166',
              planName: 'Mensual',
              price: 654.00,
              currency: 'BOB',
              hottok: generateNewHottok()
            }
          });
          setSelectedConfigId(null);
          setActiveView('form');
        }} className="w-full bg-[#e94560] text-white py-2 rounded font-medium hover:brightness-110 transition mb-6 shadow">
          + Nueva Configuración
        </button>

        <div className="flex-grow overflow-y-auto space-y-2">
          {configs.length === 0 ? (
            <p className="text-sm text-gray-400 text-center mt-10">No hay configuraciones guardadas.<br />Crea tu primera configuración para comenzar.</p>
          ) : (
            configs.map(c => (
              <div 
                key={c.id} 
                onClick={() => { setSelectedConfigId(c.id); setActiveView('welcome'); }}
                className={`p-3 rounded cursor-pointer transition ${selectedConfigId === c.id ? 'bg-[#0f3460] border-l-4 border-[#e94560]' : 'hover:bg-[#0f3460] border-l-4 border-transparent'}`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium truncate">{c.name}</p>
                  <span className="text-[10px] bg-[#1a1a2e] px-1.5 py-0.5 rounded text-[#a29bfe] font-mono shrink-0">Hottok 🔒</span>
                </div>
                <p className="text-xs text-[#b2bec3] truncate mt-1">{c.url}</p>
              </div>
            ))
          )}
        </div>
      </aside>

      <main className="flex-grow p-8 overflow-y-auto">
        {activeView === 'form' ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold">{selectedConfigId ? 'Editar' : 'Nueva'} Configuración</h2>
            <div className="bg-[#1a1a2e] p-6 rounded-lg border border-gray-800 space-y-4">
              <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">Datos básicos</h3>
              <div>
                <label className="block text-xs text-[#b2bec3] mb-1">Nombre de la configuración *</label>
                <input type="text" placeholder="Ej: Mi Servidor en Producción" value={config.name || ''} onChange={e => setConfig({...config, name: e.target.value})} className="w-full p-2.5 bg-[#0f0f0f] border border-gray-700 rounded text-white" />
              </div>
              <div>
                <label className="block text-xs text-[#b2bec3] mb-1">URL del Webhook (Access Point) *</label>
                <input type="url" placeholder="https://mi-api.com/webhook/hotmart" value={config.url || ''} onChange={e => setConfig({...config, url: e.target.value})} className="w-full p-2.5 bg-[#0f0f0f] border border-gray-700 rounded text-white" />
              </div>
            </div>

            <div className="bg-[#1a1a2e] p-6 rounded-lg border border-gray-800 space-y-4">
              <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                <h3 className="text-lg font-semibold">🔒 Hottok de Verificación y Seguridad</h3>
                <button 
                  type="button"
                  onClick={() => setConfig({
                    ...config,
                    buyerData: {
                      ...config.buyerData!,
                      hottok: generateNewHottok()
                    }
                  })}
                  className="bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-xs font-bold transition"
                >
                  🔄 Generar nuevo Hottok
                </button>
              </div>
              <p className="text-xs text-gray-300">
                Este token de seguridad se enviará en el header <code className="text-[#a29bfe]">X-Hotmart-Hottok</code> y en el payload para que tu backend pueda verificar que el evento es auténtico.
              </p>
              <div>
                <label className="block text-xs text-[#b2bec3] mb-1">Hottok (Token de verificación)</label>
                <input 
                  type="text" 
                  value={config.buyerData?.hottok || ''} 
                  onChange={e => setConfig({...config, buyerData: {...config.buyerData!, hottok: e.target.value}})} 
                  className="w-full p-2.5 bg-[#0f0f0f] border border-gray-700 rounded font-mono text-sm text-[#55efc4]" 
                />
              </div>
            </div>

            <div className="bg-[#1a1a2e] p-6 rounded-lg border border-gray-800 space-y-4">
              <h3 className="text-lg font-semibold border-b border-gray-700 pb-2">Eventos a simular *</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {['PURCHASE_COMPLETE', 'PURCHASEREFUNDREQUEST', 'PURCHASEWAITINGPAYMENT', 'PURCHASE_REFUNDED', 'PURCHASE_APPROVED', 'PURCHASE_EXPIRED', 'PURCHASE_CANCELED', 'PURCHASE_CHARGEBACK', 'SUBSCRIPTION_CANCELLATION', 'PURCHASE_BILLET_PRINTED', 'PURCHASE_PROTEST', 'UPDATE_SUBSCRIPTION_CHARGE_DATE', 'SWITCH_PLAN', 'PURCHASE_DELAYED'].map(evt => (
                  <label key={evt} className="flex items-center gap-2 cursor-pointer bg-[#0f0f0f] p-2.5 rounded border border-gray-800 hover:border-gray-700">
                    <input type="checkbox" checked={config.events?.includes(evt)} onChange={e => {
                      const newEvents = e.target.checked ? [...(config.events || []), evt] : (config.events || []).filter(e => e !== evt);
                      setConfig({...config, events: newEvents});
                    }} className="accent-[#e94560]" />
                    <span className="font-mono text-xs">{evt}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-[#1a1a2e] p-6 rounded-lg border border-gray-800 space-y-4">
              <button type="button" onClick={() => setIsBuyerDataExpanded(!isBuyerDataExpanded)} className="text-lg font-semibold w-full text-left flex justify-between items-center">
                <span>Datos del comprador simulado y transacción</span> 
                <span className="text-sm">{isBuyerDataExpanded ? '▲' : '▼'}</span>
              </button>
              {isBuyerDataExpanded && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs text-[#b2bec3] mb-1">Nombre completo</label>
                    <input type="text" value={config.buyerData?.name || ''} onChange={e => setConfig({...config, buyerData: {...config.buyerData!, name: e.target.value}})} className="w-full p-2 bg-[#0f0f0f] border border-gray-700 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#b2bec3] mb-1">Email</label>
                    <input type="email" value={config.buyerData?.email || ''} onChange={e => setConfig({...config, buyerData: {...config.buyerData!, email: e.target.value}})} className="w-full p-2 bg-[#0f0f0f] border border-gray-700 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#b2bec3] mb-1">Documento (CPF/DNI)</label>
                    <input type="text" value={config.buyerData?.document || ''} onChange={e => setConfig({...config, buyerData: {...config.buyerData!, document: e.target.value}})} className="w-full p-2 bg-[#0f0f0f] border border-gray-700 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#b2bec3] mb-1">Tipo de documento</label>
                    <select value={config.buyerData?.documentType || 'DNI'} onChange={e => setConfig({...config, buyerData: {...config.buyerData!, documentType: e.target.value}})} className="w-full p-2 bg-[#0f0f0f] border border-gray-700 rounded">
                      {['CPF', 'CNPJ', 'DNI', 'RUT', 'CC'].map(type => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#b2bec3] mb-1">País (ISO)</label>
                    <input type="text" value={config.buyerData?.country || ''} onChange={e => setConfig({...config, buyerData: {...config.buyerData!, country: e.target.value}})} className="w-full p-2 bg-[#0f0f0f] border border-gray-700 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#b2bec3] mb-1">Ciudad</label>
                    <input type="text" value={config.buyerData?.city || ''} onChange={e => setConfig({...config, buyerData: {...config.buyerData!, city: e.target.value}})} className="w-full p-2 bg-[#0f0f0f] border border-gray-700 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#b2bec3] mb-1">Nombre del producto</label>
                    <input type="text" value={config.buyerData?.productName || ''} onChange={e => setConfig({...config, buyerData: {...config.buyerData!, productName: e.target.value}})} className="w-full p-2 bg-[#0f0f0f] border border-gray-700 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#b2bec3] mb-1">Nombre del plan</label>
                    <select value={config.buyerData?.planName || 'Mensual'} onChange={e => setConfig({...config, buyerData: {...config.buyerData!, planName: e.target.value}})} className="w-full p-2 bg-[#0f0f0f] border border-gray-700 rounded">
                      {['3 Días', '7 Días', 'Mensual', 'Semestral', 'Anual'].map(plan => <option key={plan} value={plan}>{plan}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-[#b2bec3] mb-1">Precio</label>
                    <input type="number" value={config.buyerData?.price || 0} onChange={e => setConfig({...config, buyerData: {...config.buyerData!, price: parseFloat(e.target.value) || 0}})} className="w-full p-2 bg-[#0f0f0f] border border-gray-700 rounded" />
                  </div>
                  <div>
                    <label className="block text-xs text-[#b2bec3] mb-1">Moneda</label>
                    <select value={config.buyerData?.currency || 'USD'} onChange={e => setConfig({...config, buyerData: {...config.buyerData!, currency: e.target.value}})} className="w-full p-2 bg-[#0f0f0f] border border-gray-700 rounded">
                      {['BRL', 'USD', 'MXN', 'COP', 'ARS', 'CLP', 'PEN', 'BOB'].map(cur => <option key={cur} value={cur}>{cur}</option>)}
                    </select>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 pt-2">
              <button onClick={handleSaveConfig} className="bg-[#e94560] px-6 py-2.5 rounded font-bold hover:brightness-110 transition shadow">💾 Guardar Configuración</button>
              <button onClick={() => setActiveView('welcome')} className="bg-gray-700 px-6 py-2.5 rounded hover:bg-gray-600 transition">✖ Cancelar</button>
            </div>
            {statusMessage && (
              <div className={`p-4 rounded ${statusMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white`}>
                {statusMessage.text}
              </div>
            )}
          </div>
        ) : !selectedConfig ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <span className="text-6xl mb-6">🔥</span>
            <h2 className="text-3xl font-bold mb-2">Hotmart Webhook Simulator</h2>
            <p className="text-[#b2bec3] max-w-md mb-8">Simula el envío de webhooks de Hotmart a tu Access Point y publica tu Hottok de verificación para probar tus integraciones con máxima seguridad.</p>
            <button onClick={() => {
              setConfig({
                name: '',
                url: '',
                events: [],
                buyerData: {
                  name: 'Hugo Belmonte',
                  email: 'huedbelgo@hotmail.com',
                  document: '2021138',
                  documentType: 'DNI',
                  country: 'BO',
                  city: 'Santa Cruz',
                  productName: 'AI Metabolic Food Scanner',
                  productUcode: '59ebc1fa-4506-42c4-aa38-c5ff0f936166',
                  planName: 'Mensual',
                  price: 654.00,
                  currency: 'BOB',
                  hottok: generateNewHottok()
                }
              });
              setSelectedConfigId(null);
              setActiveView('form');
            }} className="bg-[#e94560] text-white px-6 py-3 rounded font-medium hover:brightness-110 transition shadow">→ {configs.length > 0 ? "Crear nueva configuración" : "Crear primera configuración"}</button>
          </div>
        ) : (
          <div className="space-y-8">
            <header className="bg-[#1a1a2e] p-6 rounded-lg border border-gray-800 flex justify-between items-center shadow">
              <div>
                <h2 className="text-2xl font-bold">{selectedConfig.name}</h2>
                <a href={selectedConfig.url} target="_blank" rel="noreferrer" className="text-[#a29bfe] text-sm hover:underline flex items-center gap-1 mt-1">🔗 {selectedConfig.url}</a>
              </div>
              <button onClick={() => { setConfig(selectedConfig); setActiveView('form'); }} className="bg-[#1a1a2e] border border-gray-700 px-4 py-2 rounded hover:bg-gray-700 transition">✏️ Editar</button>
            </header>

            {/* Hottok Publication & Verification Card */}
            <div className="bg-gradient-to-r from-[#16213e] to-[#1a1a2e] p-6 rounded-lg border border-[#e94560]/30 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <h3 className="text-lg font-bold">Hottok de Verificación Publicado</h3>
                  <span className="bg-[#00b894]/20 text-[#00b894] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide">Activo</span>
                </div>
                <p className="text-xs text-gray-300">
                  Header requerido en tu backend: <code className="text-[#a29bfe]">X-Hotmart-Hottok: {selectedConfig.buyerData.hottok}</code>
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(selectedConfig.buyerData.hottok);
                    alert('¡Hottok copiado al portapapeles!');
                  }}
                  className="bg-[#00b894] hover:brightness-110 text-white px-4 py-2 rounded text-xs font-bold transition shadow"
                >
                  📋 Copiar Hottok
                </button>
                <button 
                  onClick={() => setShowHottokModal(true)}
                  className="bg-[#e94560] hover:brightness-110 text-white px-4 py-2 rounded text-xs font-bold transition shadow"
                >
                  💻 Ver Código Backend
                </button>
              </div>
            </div>

            <div className="bg-[#fdcb6e] p-4 rounded-lg text-[#0f0f0f] flex justify-between items-center shadow">
              <p className="text-sm font-medium">⚠️ Si ves errores CORS, tu servidor debe aceptar peticiones desde este origen. Habilita los headers: <code className="font-mono bg-black/10 px-1 py-0.5 rounded">Access-Control-Allow-Origin: *</code> y <code className="font-mono bg-black/10 px-1 py-0.5 rounded">Access-Control-Allow-Methods: POST, OPTIONS</code></p>
              <button onClick={(e) => (e.target as HTMLElement).parentElement?.remove()} className="font-bold ml-2">✕</button>
            </div>

            <section>
              <h3 className="text-lg font-semibold mb-4">Eventos disponibles para simular</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {selectedConfig.events.map(evt => (
                  <div key={evt} className="bg-[#1a1a2e] p-4 rounded-lg border border-gray-800 hover:border-gray-700 transition shadow flex flex-col justify-between">
                    <div>
                      <p className="font-mono text-xs font-bold text-[#55efc4] mb-1">{evt}</p>
                      <p className="text-xs text-gray-400">Envía simulación firmada con Hottok.</p>
                    </div>
                    <button onClick={() => handleSend(selectedConfig, evt)} className="mt-4 bg-[#e94560] hover:brightness-110 w-full py-2 rounded text-sm font-bold transition shadow">▶ Enviar Webhook</button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-[#1a1a2e] p-6 rounded-lg border border-gray-800 shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">📋 Historial de Envíos</h3>
                {logs.filter(l => l.webhookId === selectedConfigId).length > 0 && (
                  <button onClick={() => { 
                    const newLogs = logs.filter(l => l.webhookId !== selectedConfigId);
                    localStorage.setItem('hotmart_webhook_logs', JSON.stringify(newLogs));
                    setLogs(getLogs());
                  }} className="text-xs text-red-400 hover:underline">🗑 Limpiar historial</button>
                )}
              </div>
              {logs.filter(l => l.webhookId === selectedConfigId).length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No hay envíos registrados para esta configuración. Haz clic en "Enviar Webhook" arriba.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[#b2bec3] border-b border-gray-800">
                        <th className="p-3">Envío</th>
                        <th className="p-3">Fecha y Hora</th>
                        <th className="p-3">Evento</th>
                        <th className="p-3">Hottok Header</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Tiempo</th>
                        <th className="p-3">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.filter(l => l.webhookId === selectedConfigId).map((log, index) => {
                        const allLogsForConf = logs.filter(l => l.webhookId === selectedConfigId);
                        const sendNumber = allLogsForConf.length - index;
                        return (
                          <tr key={log.id} className="border-t border-gray-800/60 hover:bg-[#0f0f0f]/40">
                            <td className="p-3 font-mono text-xs">#{sendNumber}</td>
                            <td className="p-3 text-xs text-gray-300">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="p-3 font-mono text-xs text-[#a29bfe]">{log.event}</td>
                            <td className="p-3 font-mono text-[10px] text-gray-400 truncate max-w-[150px]" title={log.request?.headers?.['X-Hotmart-Hottok']}>
                              {log.request?.headers?.['X-Hotmart-Hottok'] || 'N/A'}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'success' ? 'bg-[#00b894] text-white' : 'bg-[#d63031] text-white'}`}>{log.status}</span>
                            </td>
                            <td className="p-3 text-xs">{log.duration} ms</td>
                            <td className="p-3">
                              <button onClick={() => setSelectedLog(log)} className="text-[#a29bfe] hover:underline mr-3 text-xs font-semibold">👁 Detalle</button>
                              <button onClick={() => handleSend(selectedConfig, log.event)} className="text-[#fdcb6e] hover:underline text-xs font-semibold">🔄 Reintentar</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
        {selectedLog && (
          <WebhookDetailModal 
            log={selectedLog} 
            onClose={() => setSelectedLog(null)} 
            onRetry={() => { handleSend(selectedConfig!, selectedLog.event); setSelectedLog(null); }} 
          />
        )}
        {showHottokModal && selectedConfig && (
          <HottokModal 
            hottok={selectedConfig.buyerData.hottok} 
            onClose={() => setShowHottokModal(false)}
            onRegenerate={() => {
              const newH = generateNewHottok();
              const updated = {
                ...selectedConfig,
                buyerData: {
                  ...selectedConfig.buyerData,
                  hottok: newH
                }
              };
              saveConfig(updated);
              setConfigs(getConfigs());
            }}
          />
        )}
      </main>
    </div>
  );
}
