import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'

// ── Inline parser: **bold**, [text](url), bare URLs ───────────────────────
function parseInline(text) {
  const result = []
  const regex = /\*\*(.*?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)]+)\)|(https?:\/\/[^\s,)>\]]+)/g
  let lastIndex = 0
  let match
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) result.push(text.slice(lastIndex, match.index))

    if (match[1] !== undefined) {
      result.push(<strong key={key++} style={{ color: '#f1f5f9', fontWeight: 700 }}>{match[1]}</strong>)
    } else if (match[2] !== undefined) {
      result.push(
        <a key={key++} href={match[3]} target="_blank" rel="noopener noreferrer"
          style={{ color: '#f97316', textDecoration: 'underline', textUnderlineOffset: 2 }}>
          {match[2]}
        </a>
      )
    } else {
      result.push(
        <a key={key++} href={match[4]} target="_blank" rel="noopener noreferrer"
          style={{ color: '#f97316', textDecoration: 'underline', textUnderlineOffset: 2, wordBreak: 'break-all' }}>
          {match[4]}
        </a>
      )
    }
    lastIndex = regex.lastIndex
  }
  if (lastIndex < text.length) result.push(text.slice(lastIndex))
  return result
}

// ── Block renderer ────────────────────────────────────────────────────────
function MarkdownDoc({ content }) {
  const lines = content.split('\n')
  const els = []
  let listBuf = []
  let tableBuf = []
  let k = 0

  const flushList = () => {
    if (!listBuf.length) return
    els.push(
      <ul key={k++} style={{ margin: '8px 0 16px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
        {listBuf.map((item, i) => (
          <li key={i} style={{ color: '#94a3b8', fontFamily: 'Space Mono', fontSize: 13, lineHeight: 1.75 }}>
            {parseInline(item)}
          </li>
        ))}
      </ul>
    )
    listBuf = []
  }

  const flushTable = () => {
    if (!tableBuf.length) return
    const rows = tableBuf.filter(r => !/^\|[\s\-|:]+\|$/.test(r.trim()))
    const cells = (row) => row.split('|').slice(1, -1).map(c => c.trim())
    const [head, ...body] = rows
    els.push(
      <div key={k++} style={{ overflowX: 'auto', margin: '12px 0 20px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Space Mono', fontSize: 12 }}>
          <thead>
            <tr>
              {cells(head).map((c, i) => (
                <th key={i} style={{ color: '#6b7280', textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid #1f2937', whiteSpace: 'nowrap' }}>
                  {parseInline(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #1f293740' }}>
                {cells(row).map((c, j) => (
                  <td key={j} style={{ color: '#94a3b8', padding: '8px 12px', verticalAlign: 'top' }}>
                    {parseInline(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    tableBuf = []
  }

  const flush = () => { flushList(); flushTable() }

  for (const line of lines) {
    if (line.startsWith('### ')) {
      flush()
      els.push(<h3 key={k++} style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 15, color: '#f97316', margin: '20px 0 8px' }}>{parseInline(line.slice(4))}</h3>)
    } else if (line.startsWith('## ')) {
      flush()
      els.push(<h2 key={k++} style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 19, color: '#f1f5f9', margin: '28px 0 10px', paddingBottom: 8, borderBottom: '1px solid #1f2937' }}>{parseInline(line.slice(3))}</h2>)
    } else if (line.startsWith('# ')) {
      flush()
      els.push(<h1 key={k++} style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 26, color: '#f1f5f9', margin: '0 0 4px' }}>{parseInline(line.slice(2))}</h1>)
    } else if (line === '---') {
      flush()
      els.push(<hr key={k++} style={{ border: 'none', borderTop: '1px solid #1f2937', margin: '20px 0' }} />)
    } else if (line.startsWith('- ')) {
      flushTable()
      listBuf.push(line.slice(2))
    } else if (line.startsWith('| ')) {
      flushList()
      tableBuf.push(line)
    } else if (line.trim() === '') {
      flush()
    } else {
      flush()
      if (line.trim()) {
        els.push(<p key={k++} style={{ color: '#94a3b8', fontFamily: 'Space Mono', fontSize: 13, lineHeight: 1.8, margin: '0 0 12px' }}>{parseInline(line)}</p>)
      }
    }
  }
  flush()
  return <>{els}</>
}

// ── Contenidos ────────────────────────────────────────────────────────────
const PRIVACY = `# Política de Privacidad — StrideAI

**Última actualización:** Mayo 2026
**Versión:** 1.0

---

## 1. Información General

StrideAI es una aplicación de entrenamiento deportivo inteligente desarrollada y operada por **Alejandro Cifuentes Osorio**, con sede en Colombia.

Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y protegemos tu información personal cuando usas StrideAI en https://strideai-frontend.vercel.app

Al usar StrideAI, aceptas las prácticas descritas en esta política.

**Contacto:** alejandro.cifuentes.osorio@gmail.com

---

## 2. Información que Recopilamos

### 2.1 Información de Strava

Cuando conectas tu cuenta de Strava, obtenemos acceso a:

- **Perfil público:** nombre, foto de perfil, ciudad, país
- **Actividades deportivas:** distancia, tiempo, ritmo, frecuencia cardíaca, potencia, desnivel, fecha y hora
- **Métricas de rendimiento:** datos históricos de entrenamientos

Solo accedemos a la información que Strava te permite autorizar explícitamente. Puedes revocar este acceso en cualquier momento desde tu cuenta de Strava.

### 2.2 Información generada por la app

- **Planes de entrenamiento** generados por IA y guardados en nuestra base de datos
- **Historial de chat** con el entrenador IA
- **Métricas calculadas:** CTL, ATL, TSB, TSS estimado

### 2.3 Información técnica

- **Tokens de autenticación:** access_token y refresh_token de Strava (cifrados)
- **Registros de uso:** número de mensajes enviados al chat IA por día

---

## 3. Cómo Usamos tu Información

Usamos tu información exclusivamente para:

- **Mostrar tu dashboard** con métricas y actividades reales de Strava
- **Generar planes de entrenamiento** personalizados basados en tu historial
- **Proporcionar análisis de rendimiento** mediante inteligencia artificial
- **Operar el chat con el entrenador IA** con contexto de tus datos reales
- **Mantener tu sesión activa** de forma segura mediante JWT

**No usamos tu información para:**

- Publicidad o marketing de terceros
- Venta de datos a terceros
- Entrenar modelos de inteligencia artificial sin tu consentimiento
- Ningún propósito distinto a los mencionados arriba

---

## 4. Inteligencia Artificial

StrideAI utiliza servicios de IA de terceros para generar análisis, planes y respuestas del entrenador:

- **Anthropic Claude** — https://www.anthropic.com
- **OpenAI GPT** — https://www.openai.com

Cuando interactúas con el entrenador IA, un resumen de tus actividades recientes se envía a estos servicios para generar respuestas personalizadas. Estos servicios tienen sus propias políticas de privacidad. No enviamos tu nombre completo ni información de identificación personal a estos servicios — solo datos de entrenamiento agregados.

---

## 5. Almacenamiento y Seguridad

### 5.1 Dónde almacenamos tus datos

- **Base de datos:** PostgreSQL alojada en Railway (https://railway.app) — servidores en Estados Unidos
- **Aplicación backend:** Railway — servidores en Estados Unidos
- **Aplicación frontend:** Vercel (https://vercel.com) — CDN global

### 5.2 Cómo protegemos tus datos

- Autenticación mediante **JWT (JSON Web Tokens)** con firma criptográfica
- Comunicaciones cifradas mediante **HTTPS/TLS** en todos los endpoints
- Los tokens de Strava se almacenan de forma segura en base de datos
- Acceso restringido a los datos — solo tú puedes ver tu información

### 5.3 Retención de datos

Conservamos tus datos mientras tengas una cuenta activa en StrideAI. Si deseas eliminar tu cuenta y todos tus datos, contáctanos a alejandro.cifuentes.osorio@gmail.com y procesaremos tu solicitud en un plazo de 30 días.

---

## 6. Compartir Información con Terceros

**No vendemos ni compartimos tu información personal con terceros**, excepto en los siguientes casos necesarios para operar el servicio:

| Tercero | Propósito | Política |
|---------|-----------|----------|
| Strava | Fuente de datos de actividades | https://www.strava.com/legal/privacy |
| Anthropic | Generación de respuestas IA | https://www.anthropic.com/privacy |
| OpenAI | Generación de respuestas IA | https://openai.com/privacy |
| Railway | Hosting del backend y DB | https://railway.app/legal/privacy |
| Vercel | Hosting del frontend | https://vercel.com/legal/privacy-policy |

---

## 7. Tus Derechos

Tienes derecho a:

- **Acceder** a tus datos personales almacenados en StrideAI
- **Corregir** información incorrecta
- **Eliminar** tu cuenta y todos tus datos asociados
- **Revocar** el acceso de StrideAI a tu cuenta de Strava en cualquier momento desde https://www.strava.com/settings/apps
- **Portabilidad** de tus datos en formato legible

Para ejercer cualquiera de estos derechos, contáctanos a: **alejandro.cifuentes.osorio@gmail.com**

---

## 8. Cookies y Almacenamiento Local

StrideAI utiliza **localStorage** del navegador para almacenar tu token de autenticación (JWT). Este token es necesario para mantener tu sesión activa. No utilizamos cookies de seguimiento ni publicidad.

---

## 9. Menores de Edad

StrideAI es apta para todo público. Sin embargo, si eres menor de 14 años, necesitas el consentimiento de tus padres o tutores para usar la aplicación. No recopilamos intencionalmente datos de menores de 14 años sin consentimiento parental.

---

## 10. Cambios a esta Política

Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos de cambios significativos a través de la aplicación. La fecha de "última actualización" al inicio del documento siempre reflejará la versión más reciente.

---

## 11. Contacto

Si tienes preguntas sobre esta Política de Privacidad o sobre cómo manejamos tus datos:

**Alejandro Cifuentes Osorio**
Email: alejandro.cifuentes.osorio@gmail.com
Aplicación: https://strideai-frontend.vercel.app
País de operación: Colombia`

const TERMS = `# Términos de Servicio — StrideAI

**Última actualización:** Mayo 2026
**Versión:** 1.0

---

## 1. Aceptación de los Términos

Al acceder y usar StrideAI (https://strideai-frontend.vercel.app), aceptas estar sujeto a estos Términos de Servicio. Si no estás de acuerdo con alguna parte de estos términos, no debes usar la aplicación.

StrideAI es desarrollado y operado por **Alejandro Cifuentes Osorio**, Colombia.

**Contacto:** alejandro.cifuentes.osorio@gmail.com

---

## 2. Descripción del Servicio

StrideAI es una aplicación de entrenamiento deportivo inteligente que:

- Se conecta con tu cuenta de Strava para acceder a tus actividades deportivas
- Analiza tu rendimiento usando inteligencia artificial
- Genera planes de entrenamiento personalizados
- Proporciona un chat con un entrenador IA basado en tus datos reales

---

## 3. Elegibilidad

Puedes usar StrideAI si:

- Tienes una cuenta activa en Strava
- Aceptas estos Términos de Servicio y nuestra Política de Privacidad
- Si eres menor de 14 años, cuentas con el consentimiento de tus padres o tutores

---

## 4. Cuenta y Autenticación

### 4.1 Conexión con Strava

StrideAI usa OAuth2 de Strava para autenticarte. No almacenamos tu contraseña de Strava. Al conectar tu cuenta, autorizas a StrideAI a leer tus actividades y perfil de Strava.

### 4.2 Seguridad de tu sesión

Eres responsable de mantener seguro el dispositivo desde el que accedes a StrideAI. Si cierras sesión o limpias el almacenamiento del navegador, necesitarás reconectarte con Strava.

### 4.3 Revocación de acceso

Puedes desconectar StrideAI de tu cuenta Strava en cualquier momento desde https://www.strava.com/settings/apps

---

## 5. Uso Aceptable

### 5.1 Puedes:

- Usar StrideAI para analizar tus propias actividades deportivas
- Generar planes de entrenamiento para tu uso personal
- Chatear con el entrenador IA para obtener consejos de entrenamiento
- Compartir capturas de pantalla de tus métricas en redes sociales

### 5.2 No puedes:

- Intentar acceder a los datos de otros usuarios
- Hacer ingeniería inversa o copiar el código de la aplicación
- Usar la aplicación para fines ilegales
- Sobrecargar los servidores con solicitudes automatizadas o bots
- Intentar eludir los límites de uso establecidos

---

## 6. Límites de Uso

Para garantizar un servicio estable para todos los usuarios, StrideAI aplica los siguientes límites:

- **Chat con entrenador IA:** máximo 10 mensajes por día por usuario
- Los límites se renuevan automáticamente a medianoche
- Nos reservamos el derecho de ajustar estos límites con previo aviso

---

## 7. Inteligencia Artificial

### 7.1 Naturaleza de las respuestas

El entrenador IA de StrideAI genera respuestas basadas en tus datos de entrenamiento usando modelos de lenguaje de Anthropic y OpenAI. Estas respuestas son:

- **Orientativas**, no reemplazan la asesoría de un entrenador profesional certificado
- **Generadas automáticamente**, pueden contener errores o imprecisiones
- **Basadas en datos históricos**, no en evaluaciones médicas

### 7.2 No es asesoría médica

StrideAI no es una aplicación médica. Los planes de entrenamiento y análisis generados por IA son sugerencias generales. Si tienes condiciones de salud, lesiones o dudas médicas, consulta a un profesional de la salud antes de seguir cualquier plan de entrenamiento.

---

## 8. Disponibilidad del Servicio

StrideAI es un servicio en fase beta. Esto significa:

- El servicio puede no estar disponible en todo momento
- Pueden ocurrir interrupciones por mantenimiento o errores técnicos
- Las funcionalidades pueden cambiar sin previo aviso durante la fase beta
- No garantizamos un tiempo de actividad específico

Haremos nuestro mejor esfuerzo para mantener el servicio disponible y notificar interrupciones planificadas.

---

## 9. Datos y Privacidad

El uso de tus datos personales está regulado por nuestra **Política de Privacidad**, disponible en la aplicación. Al usar StrideAI, aceptas también nuestra Política de Privacidad.

---

## 10. Propiedad Intelectual

### 10.1 StrideAI

El código, diseño, marca y contenido de StrideAI son propiedad de Alejandro Cifuentes Osorio. No puedes copiar, modificar o distribuir ninguna parte de la aplicación sin autorización expresa.

### 10.2 Tus datos

Tus actividades y datos de Strava son tuyos. StrideAI solo los usa para proporcionarte el servicio. No reclamamos propiedad sobre tus datos de entrenamiento.

---

## 11. Limitación de Responsabilidad

En la máxima medida permitida por la ley:

- StrideAI se proporciona "tal cual" sin garantías de ningún tipo
- No somos responsables de lesiones, daños o pérdidas derivadas del uso de los planes de entrenamiento generados por IA
- No somos responsables por interrupciones del servicio de Strava o de los proveedores de IA
- Nuestra responsabilidad máxima no superará el monto que hayas pagado por el servicio en los últimos 12 meses

---

## 12. Terminación

Nos reservamos el derecho de suspender o terminar tu acceso a StrideAI si:

- Violas estos Términos de Servicio
- Usas la aplicación de forma abusiva o fraudulenta
- Lo requerimos por razones legales o técnicas

Tú puedes dejar de usar StrideAI en cualquier momento. Para eliminar tu cuenta y datos, contáctanos a alejandro.cifuentes.osorio@gmail.com

---

## 13. Cambios a los Términos

Podemos modificar estos Términos de Servicio en cualquier momento. Los cambios significativos serán notificados a través de la aplicación. El uso continuado de StrideAI después de la notificación constituye aceptación de los nuevos términos.

---

## 14. Ley Aplicable

Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa será resuelta en los tribunales competentes de Colombia.

---

## 15. Contacto

Para preguntas sobre estos Términos de Servicio:

**Alejandro Cifuentes Osorio**
Email: alejandro.cifuentes.osorio@gmail.com
Aplicación: https://strideai-frontend.vercel.app
País: Colombia`

// ── Página ────────────────────────────────────────────────────────────────
export default function Legal() {
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState(searchParams.get('tab') === 'terms' ? 'terms' : 'privacy')
  const navigate = useNavigate()

  const tabBtn = (id, label) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: '8px 20px',
        background: tab === id ? '#f9731622' : 'transparent',
        border: `1px solid ${tab === id ? '#f9731666' : '#1f2937'}`,
        borderRadius: 8,
        color: tab === id ? '#f97316' : '#6b7280',
        fontFamily: 'Space Mono', fontSize: 13,
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f1f5f9' }}>

      {/* Mini header */}
      <div style={{
        background: '#0b1120', borderBottom: '1px solid #1f2937',
        padding: '0 1.5rem', height: 56,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Link to="/" style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 18, color: '#f97316', textDecoration: 'none', letterSpacing: -0.5 }}>
          ⚡ StrideAI
        </Link>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none', border: '1px solid #1f2937', borderRadius: 8,
            padding: '5px 14px', color: '#6b7280', fontFamily: 'Space Mono', fontSize: 12,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.color = '#f97316' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#1f2937'; e.currentTarget.style.color = '#6b7280' }}
        >
          ← Volver
        </button>
      </div>

      {/* Contenido */}
      <div style={{ maxWidth: 780, margin: '0 auto', padding: '2rem 1.5rem 4rem' }}>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
          {tabBtn('privacy', '🔒 Privacidad')}
          {tabBtn('terms', '📋 Términos')}
        </div>

        {/* Documento */}
        <MarkdownDoc content={tab === 'privacy' ? PRIVACY : TERMS} />

      </div>
    </div>
  )
}
