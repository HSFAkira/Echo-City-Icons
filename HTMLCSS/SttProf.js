(function() {
    // Configuración básica del gráfico
    const MAX_VALOR = 10; // Escala fija del 1 al 10
    const TAMANO = 220;   // Tamaño del SVG (un poco más grande para el perfil)
    const CENTRO = TAMANO / 2;
    const RADIO = (TAMANO / 2) - 25; // Margen para que los textos no se corten

    // Función matemática para calcular las coordenadas de los 5 vértices
    const obtenerCoordenadas = (indice, valor, maximo) => {
        const angulo = (Math.PI * 2 / 5) * indice - (Math.PI / 2); // -90 grados para empezar arriba
        const distancia = (valor / maximo) * RADIO;
        return {
            x: CENTRO + distancia * Math.cos(angulo),
            y: CENTRO + distancia * Math.sin(angulo)
        };
    };

    const generarGraficoPentagonoPerfil = () => {
        // Apuntamos directamente al ID de tu campo de estadísticas
        const campoStats = document.getElementById('field_id28');
        if (!campoStats) return;

        // Buscamos el contenedor del texto plano (el uneditable)
        const contenedorTexto = campoStats.querySelector('.field_uneditable');
        if (!contenedorTexto || campoStats.querySelector('.rpg-chart-container')) return;

        const textoOriginal = contenedorTexto.textContent.trim();
        if (!textoOriginal) return;

        // 1. PARSEAR LAS STATS (Soporta letras con acentos, espacios y números)
        const regex = /([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s*:\s*(\d+)/g;
        let coincidencias;
        const stats = [];

        while ((coincidencias = regex.exec(textoOriginal)) !== null) {
            stats.push({
                nombre: coincidencias[1],
                valor: Math.min(Math.max(parseInt(coincidencias[2], 10), 0), MAX_VALOR)
            });
        }

        // Si el usuario no tiene exactamente 5 stats configuradas, no dibujamos el pentágono
        if (stats.length !== 5) return;

        const maximoGrafico = MAX_VALOR; 

        // 2. CONSTRUIR LA RED DE FONDO (4 pentágonos concéntricos)
        let lineasGuiaHTML = '';
        for (let nivel = 1; nivel <= 4; nivel++) {
            const escala = nivel / 4;
            const puntosGuia = [];
            for (let i = 0; i < 5; i++) {
                const p = obtenerCoordenadas(i, escala * maximoGrafico, maximoGrafico);
                puntosGuia.push(`${p.x},${p.y}`);
            }
            lineasGuiaHTML += `<polygon points="${puntosGuia.join(' ')}" class="chart-grid-line" />`;
        }

        // 3. MAPEAR EJES, TEXTOS Y POLÍGONO DEL JUGADOR
        let ejesHTML = '';
        let textosHTML = '';
        const puntosUsuario = [];

        stats.forEach((stat, i) => {
            const pMax = obtenerCoordenadas(i, maximoGrafico, maximoGrafico);
            const pUser = obtenerCoordenadas(i, stat.valor, maximoGrafico);
            
            puntosUsuario.push(`${pUser.x},${pUser.y}`);

            // Línea del eje central a la esquina
            ejesHTML += `<line x1="${CENTRO}" y1="${CENTRO}" x2="${pMax.x}" y2="${pMax.y}" class="chart-axis" />`;

            // Ajustes de posición para las etiquetas alrededor del círculo
            let anchor = 'middle';
            let ajusteY = 0;
            if (pMax.x < CENTRO - 10) anchor = 'end';
            if (pMax.x > CENTRO + 10) anchor = 'start';
            if (pMax.y > CENTRO + 10) ajusteY = 12;
            if (pMax.y < CENTRO - 10) ajusteY = -5;

            textosHTML += `<text x="${pMax.x}" y="${pMax.y + ajusteY}" text-anchor="${anchor}" class="chart-label">${stat.nombre} (${stat.valor})</text>`;
        });

        // 4. ENSAMBLAR EL SVG COMPLETO
        const svgHTML = `
            <div class="rpg-chart-container">
                <svg viewBox="0 0 ${TAMANO} ${TAMANO}" width="100%" height="100%">
                    <!-- Red de fondo -->
                    ${lineasGuiaHTML}
                    ${ejesHTML}
                    <!-- Polígono de estadísticas del usuario -->
                    <polygon points="${puntosUsuario.join(' ')}" class="chart-user-polygon" />
                    <!-- Esferas en los vértices del usuario -->
                    ${stats.map((stat, i) => {
                        const p = obtenerCoordenadas(i, stat.valor, maximoGrafico);
                        return `<circle cx="${p.x}" cy="${p.y}" r="3.5" class="chart-user-point" />`;
                    }).join('')}
                    <!-- Textos -->
                    ${textosHTML}
                </svg>
            </div>
        `;

        // Ocultamos físicamente la visualización del texto feo original ("Stat:0, Stat:0...")
        contenedorTexto.style.display = 'none';
        
        // Inyectamos el gráfico justo debajo del título del campo en la estructura
        campoStats.querySelector('.fieldContent').insertAdjacentHTML('beforeend', svgHTML);
    };

    // Ejecución controlada
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', generarGraficoPentagonoPerfil);
    } else {
        generarGraficoPentagonoPerfil();
    }
})();
