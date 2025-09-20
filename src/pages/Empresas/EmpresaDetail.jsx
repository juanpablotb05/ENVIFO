import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import placeholderImg from '../../assets/Logo.jpeg';
import './Empresas.css';

const sampleCompanies = [
  {
    id: 'c1',
    name: 'Constructora Alpha',
    short: 'Soluciones residenciales sostenibles',
    description: 'Constructora Alpha se especializa en viviendas eco-friendly con enfoque en eficiencia energética y materiales locales.',
    images: [
      'https://images.unsplash.com/photo-1505691723518-36a36b4f1b68?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1493787039807-1f8e2f0d1a0f?auto=format&fit=crop&w=1200&q=80'
    ]
  },
  {
    id: 'c2',
    name: 'Diseño Beta',
    short: 'Arquitectura e interiorismo de vanguardia',
    description: 'Diseño Beta crea espacios únicos mezclando funcionalidad y estética contemporánea.',
    images: [
      'https://images.unsplash.com/photo-1505691723518-36a36b4f1b68?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=abcd1234ef567890abcd1234ef567890',
      'https://images.unsplash.com/photo-1475855581690-80accde3ae0a?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=1234abcd5678ef901234abcd5678ef90'
    ]
  },
  {
    id: 'c3',
    name: 'Proyectos Gamma',
    short: 'Gestión integral de proyectos',
    description: 'Proyectos Gamma acompaña la obra desde la concepción hasta la entrega, optimizando tiempos y costos.',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=3f4e5d6c7b8a9c0d1e2f3a4b5c6d7e8f',
      'https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=99887766554433221100aabbccddeeff'
    ]
  }
];

export default function EmpresaDetail(){
  const { id } = useParams();
  const navigate = useNavigate();
  const company = sampleCompanies.find(c => c.id === id);
  const [index, setIndex] = useState(0);

  if(!company) return (
    <div className="empresas-container">
      <p>Empresa no encontrada. <Link to="/Empresas">Volver</Link></p>
    </div>
  );

  const prev = () => setIndex(i => (i -1 + company.images.length) % company.images.length);
  const next = () => setIndex(i => (i +1) % company.images.length);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <div className="empresa-detail">
      <div className="detail-top">
        <div className="carousel">
          <button className="back-btn" onClick={() => navigate('/Empresas')} aria-label="Volver">← Volver</button>
          <button className="chev left" onClick={prev}>‹</button>

          <div className="img-wrapper">
            {!imgLoaded && <div className="img-placeholder"> </div>}
            <img
              src={company.images[index]}
              alt={`${company.name} ${index+1}`}
              onLoad={() => setImgLoaded(true)}
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholderImg; setImgLoaded(true); }}
              style={{ opacity: imgLoaded ? 1 : 0, transition: 'opacity 300ms ease' }}
            />
          </div>

          <button className="chev right" onClick={next}>›</button>
        </div>
      </div>

      <div className="detail-bottom">
        <h2>{company.name}</h2>
        <p className="company-short">{company.short}</p>
        <p className="company-desc">{company.description}</p>
        <div className="image-info">Imagen {index + 1} de {company.images.length}</div>
      </div>
    </div>
  );
}
