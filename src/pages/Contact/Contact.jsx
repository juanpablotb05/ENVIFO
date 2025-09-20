import React, { useState } from 'react'
import './Contact.css'


function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido'
    }
    
    return newErrors
  }

  const handleSubmit = () => {
    const newErrors = validateForm()
    
    if (Object.keys(newErrors).length === 0) {
      console.log('Formulario enviado:', formData)
      alert('Mensaje enviado correctamente!')
      setFormData({ name: '', email: '', message: '' })
    } else {
      setErrors(newErrors)
    }
  }

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <div className="contact-header">
          <h2>Contáctanos</h2>
          <p className="contact-description">
            ¿Tienes alguna pregunta o comentario? Nos encantaría escucharte. 
            Envíanos un mensaje y te responderemos lo antes posible.
          </p>
        </div>

        <div className="contact-form-card">
          <div className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Nombre completo</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
                placeholder="Ingresa tu nombre completo"
              />
              {errors.name && (
                <p className="error-message">
                  <span className="error-icon">⚠️</span>
                  {errors.name}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="correo@ejemplo.com"
              />
              {errors.email && (
                <p className="error-message">
                  <span className="error-icon">⚠️</span>
                  {errors.email}
                </p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="message">Mensaje</label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleInputChange}
                className={errors.message ? 'error' : ''}
                placeholder="Escribe tu mensaje aquí..."
              />
              {errors.message && (
                <p className="error-message">
                  <span className="error-icon">⚠️</span>
                  {errors.message}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="submit-button"
            >
              <span className="button-content">
                <svg className="button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
                Enviar Mensaje
              </span>
            </button>
          </div>
        </div>

        <div className="contact-footer">
          <p>
            También puedes contactarnos directamente por email: 
            <span className="email-highlight">contacto@empresa.com</span>
          </p>
        </div>
      </div>
    </section>
  )
}

export default Contact