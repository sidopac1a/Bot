import React from 'react';
import logo from './logo.png';
import { FaWhatsapp } from 'react-icons/fa';

export default function Header() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 20px',
      backgroundColor: '#f5f5f5',
      borderBottom: '1px solid #ddd'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={logo} alt="Logo" style={{ height: '50px', marginRight: '15px' }} />
        <div>
          <h1 style={{ margin: 0 }}>WCBot 1.2 v by sidoDz</h1>
          <p style={{ margin: 0, fontSize: '12px', color: '#555' }}>
            نسخة تجريبية – النسخة الكاملة متوفرة 2026
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <p style={{ margin: '0 10px 0 0', fontSize: '14px', color: '#333' }}>
          تواصل للاستفسار على واتساب:
        </p>
        <a 
          href="https://wa.me/967XXXXXXXXX" // ضع رقمك هنا بصيغة دولية بدون + أو 0
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#25D366', fontSize: '24px' }}
        >
          <FaWhatsapp />
        </a>
      </div>
    </div>
  );
}
