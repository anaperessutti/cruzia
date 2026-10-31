/** Textos legales de Cruzia. Se editan acá; las páginas /terminos-promociones y /privacidad los muestran. */

export type BloqueLegal =
  | { tipo: "p"; texto: string }
  | { tipo: "ul"; items: { destacado?: string; texto: string }[] };

export type SeccionLegal = { titulo: string; bloques: BloqueLegal[] };

export type DocumentoLegal = {
  actualizacion: string;
  secciones: SeccionLegal[];
};

export const TERMINOS: DocumentoLegal = {
  actualizacion: "Última actualización: octubre de 2026.",
  secciones: [
    {
      titulo: "1. Objeto y aceptación",
      bloques: [
        {
          tipo: "p",
          texto:
            "Estos términos regulan el acceso y el uso del sitio web y de la aplicación de Cruzia, una plataforma que reúne comercios y promociones del Partido de la Costa. El acceso al Sitio implica la aceptación de estos términos; quien no esté de acuerdo debe abstenerse de utilizarlo.",
        },
      ],
    },
    {
      titulo: "2. Definiciones",
      bloques: [
        {
          tipo: "ul",
          items: [
            {
              destacado: "Cruzia:",
              texto:
                "el proyecto titular del Sitio, con base en Santa Teresita, Partido de la Costa, Provincia de Buenos Aires.",
            },
            { destacado: "Sitio:", texto: "el sitio web y la aplicación de Cruzia." },
            { destacado: "Usuario:", texto: "toda persona que accede o utiliza el Sitio." },
            {
              destacado: "Comercio:",
              texto: "el negocio cuya información y promociones se difunden a través del Sitio.",
            },
            {
              destacado: "Promoción:",
              texto:
                "el beneficio, descuento o cupón ofrecido por un Comercio y difundido a través del Sitio.",
            },
          ],
        },
      ],
    },
    {
      titulo: "3. Rol de Cruzia",
      bloques: [
        {
          tipo: "p",
          texto:
            "Cruzia actúa como medio de difusión e intermediario entre Comercios y Usuarios. No es parte de la relación que se establece entre ambos, no comercializa ni presta los bienes o servicios de los Comercios y no financia las Promociones, que son ofrecidas, financiadas y cumplidas por cada Comercio.",
        },
        {
          tipo: "p",
          texto:
            "Cruzia colaborará razonablemente en la gestión de los reclamos que reciba. Lo dispuesto en esta cláusula no excluye ni limita los derechos que la normativa de defensa del consumidor reconoce a los Usuarios.",
        },
      ],
    },
    {
      titulo: "4. Información de los Comercios",
      bloques: [
        {
          tipo: "p",
          texto:
            "La información que se publica sobre cada Comercio, como descripciones, horarios, direcciones, imágenes y precios, es proporcionada por éste y puede cambiar. Cruzia no garantiza que se encuentre permanentemente actualizada, por lo que se recomienda confirmarla directamente con el Comercio. La presencia de un Comercio en el Sitio no constituye una recomendación ni una garantía de Cruzia.",
        },
      ],
    },
    {
      titulo: "5. Promociones",
      bloques: [
        {
          tipo: "p",
          texto:
            "Cada Promoción indica su vigencia y sus condiciones, que son definidas por el Comercio y se publican en su ficha. Solo puede utilizarse dentro de la vigencia indicada y según las condiciones establecidas.",
        },
        {
          tipo: "p",
          texto:
            "Las Promociones pueden renovarse, modificarse o retirarse periódicamente. Dado que el Sitio no requiere registro, los plazos de uso de cada Promoción se controlan por dispositivo.",
        },
      ],
    },
    {
      titulo: "6. Reclamos",
      bloques: [
        {
          tipo: "p",
          texto:
            "Si un Comercio no cumple una Promoción, el Usuario puede escribir a somoscruzia@gmail.com indicando el Comercio, la Promoción, la fecha y una descripción de lo ocurrido.",
        },
      ],
    },
    {
      titulo: "7. Uso adecuado del Sitio",
      bloques: [
        {
          tipo: "p",
          texto:
            "El Usuario se compromete a utilizar el Sitio de buena fe y, en particular, a no manipular códigos QR, no suministrar información falsa, no interferir con su funcionamiento y no emplearlo con fines fraudulentos. Cruzia podrá restringir el acceso ante un uso indebido.",
        },
      ],
    },
    {
      titulo: "8. Propiedad intelectual",
      bloques: [
        {
          tipo: "p",
          texto:
            "Las marcas, logotipos, diseños, textos y el software del Sitio pertenecen a Cruzia o a sus licenciantes. Los nombres, marcas e imágenes de los Comercios pertenecen a sus titulares y se difunden en el Sitio con su autorización. Queda prohibida su reproducción o uso sin autorización previa.",
        },
      ],
    },
    {
      titulo: "9. Disponibilidad y enlaces de terceros",
      bloques: [
        {
          tipo: "p",
          texto:
            "Cruzia procura mantener el Sitio disponible, sin garantizar un acceso ininterrumpido. El Sitio puede enlazar a servicios de terceros, como WhatsApp, que se rigen por sus propias condiciones.",
        },
      ],
    },
    {
      titulo: "10. Condiciones particulares de los Comercios",
      bloques: [
        {
          tipo: "p",
          texto:
            "Los Comercios que se integren al Sitio se rigen, además, por las condiciones particulares de adhesión que acuerden con Cruzia.",
        },
      ],
    },
    {
      titulo: "11. Modificaciones",
      bloques: [
        {
          tipo: "p",
          texto:
            "Cruzia podrá modificar estos términos. Las modificaciones se publicarán en esta página con indicación de la fecha de última actualización.",
        },
      ],
    },
    {
      titulo: "12. Ley aplicable y jurisdicción",
      bloques: [
        {
          tipo: "p",
          texto:
            "Estos términos se rigen por las leyes de la República Argentina. Para cualquier controversia serán competentes los Tribunales Ordinarios del Departamento Judicial de Dolores, Provincia de Buenos Aires, sin perjuicio del derecho del Usuario consumidor a optar por los tribunales de su domicilio, conforme a la normativa aplicable.",
        },
      ],
    },
  ],
};

export const PRIVACIDAD: DocumentoLegal = {
  actualizacion: "Última actualización: octubre de 2026.",
  secciones: [
    {
      titulo: "1. Responsable y contacto",
      bloques: [
        {
          tipo: "p",
          texto:
            'Cruzia es un proyecto en desarrollo con base en Santa Teresita, Partido de la Costa, Provincia de Buenos Aires (en adelante, "Cruzia"). Para consultas sobre esta política o sobre el tratamiento de datos personales, puede escribirse a somoscruzia@gmail.com.',
        },
      ],
    },
    {
      titulo: "2. Alcance",
      bloques: [
        {
          tipo: "p",
          texto:
            'Esta política se aplica al sitio web y a la aplicación de Cruzia (el "Sitio"), a las personas que lo utilizan (los "Usuarios") y a los comercios que se comunican para integrarlo (los "Comercios"). El uso del Sitio implica el conocimiento de esta política.',
        },
      ],
    },
    {
      titulo: "3. Datos que se recopilan",
      bloques: [
        {
          tipo: "p",
          texto:
            "Cruzia recopila únicamente los datos necesarios para el funcionamiento del Sitio, según la interacción de cada persona:",
        },
        {
          tipo: "ul",
          items: [
            {
              texto:
                "Datos de contacto e identificación que el Usuario o el Comercio proporciona voluntariamente mediante formularios o comunicaciones, como nombre, correo electrónico, número de WhatsApp, localidad y el contenido del mensaje.",
            },
            {
              texto:
                "Datos de uso, incluidos identificadores técnicos anónimos del dispositivo, necesarios para el funcionamiento de las promociones y para elaborar estadísticas de uso.",
            },
            {
              texto:
                "Ubicación y acceso a funciones del dispositivo, como la cámara, únicamente cuando el Usuario lo autoriza.",
            },
          ],
        },
      ],
    },
    {
      titulo: "4. Finalidades",
      bloques: [
        {
          tipo: "p",
          texto:
            "Los datos se utilizan para operar y mejorar el Sitio, gestionar el uso de las promociones, responder consultas, evaluar solicitudes de Comercios y postulaciones recibidas, elaborar informes estadísticos para los Comercios y cumplir obligaciones legales.",
        },
      ],
    },
    {
      titulo: "5. Comunicación a terceros",
      bloques: [
        {
          tipo: "p",
          texto: "Cruzia no comercializa datos personales. Podrá comunicarlos únicamente:",
        },
        {
          tipo: "ul",
          items: [
            {
              texto:
                "A proveedores de servicios tecnológicos, como alojamiento e infraestructura, que actúan por cuenta de Cruzia y cuyos servidores pueden encontrarse fuera de la República Argentina.",
            },
            {
              texto:
                "A los Comercios, en la medida necesaria para el uso de una promoción o para la comunicación solicitada por el Usuario, y mediante información estadística sobre el uso del Sitio.",
            },
            { texto: "A las autoridades competentes, cuando exista un requerimiento legal." },
          ],
        },
      ],
    },
    {
      titulo: "6. Conservación",
      bloques: [
        {
          tipo: "p",
          texto:
            "Los datos se conservan durante el tiempo necesario para cumplir las finalidades indicadas, o hasta que se solicite su supresión, salvo que una norma exija conservarlos.",
        },
      ],
    },
    {
      titulo: "7. Seguridad",
      bloques: [
        {
          tipo: "p",
          texto:
            "Cruzia adopta medidas técnicas y organizativas razonables para proteger los datos personales. Ningún sistema conectado a internet es infalible, por lo que no puede garantizarse una seguridad absoluta.",
        },
      ],
    },
    {
      titulo: "8. Derechos del titular",
      bloques: [
        {
          tipo: "p",
          texto:
            "El titular de los datos puede solicitar su acceso, rectificación, actualización y supresión escribiendo a somoscruzia@gmail.com. Cruzia responderá dentro de los plazos previstos por la normativa vigente.",
        },
        {
          tipo: "p",
          texto:
            "El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326.",
        },
        {
          tipo: "p",
          texto:
            "La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.",
        },
      ],
    },
    {
      titulo: "9. Menores de edad",
      bloques: [
        {
          tipo: "p",
          texto:
            "El Sitio no está dirigido a menores de edad. Quienes no hayan alcanzado la mayoría de edad deben utilizarlo con la supervisión de una persona adulta.",
        },
      ],
    },
    {
      titulo: "10. Modificaciones",
      bloques: [
        {
          tipo: "p",
          texto:
            "Cruzia podrá modificar esta política. Las modificaciones se publicarán en esta página con indicación de la fecha de última actualización.",
        },
      ],
    },
    // Aviso que ya estaba publicado en la página antes de cargar este documento.
    // No figura en el texto original aportado: se conserva para no perder la información
    // sobre los datos de quien recibe una Gift Box. Mover o quitar según se decida.
    {
      titulo: "Gift Box",
      bloques: [
        {
          tipo: "p",
          texto:
            "Cuando comprás una Gift Box, guardamos el nombre, el WhatsApp (si lo indicás) y el mensaje de la persona que recibe el regalo, junto con la fecha y la dirección de entrega, únicamente para preparar y entregar ese regalo.",
        },
      ],
    },
  ],
};
