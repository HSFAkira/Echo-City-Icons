(function() {
    const MAX_VALOR = 10; 
    const TAMANO = 450;   
    const CENTRO = TAMANO / 2;
    const RADIO = 125;    

    const obtenerCoordenadas = (indice, valor, maximo) => {
        const angulo = (Math.PI * 2 / 5) * indice - (Math.PI / 2);
        const distancia = (valor / maximo) * RADIO;
        return {
            x: CENTRO + distancia * Math.cos(angulo),
            y: CENTRO + distancia * Math.sin(angulo)
        };
    };

    const generarGraficoPentagonoPerfil = () => {
        const campoStats = document.getElementById('field_id28');
        if (!campoStats) return;

        const contenedorTexto = campoStats.querySelector('.field_uneditable');
        if (!contenedorTexto || campoStats.querySelector('.rpg-chart-container')) return;

        const textoOriginal = contenedorTexto.textContent.trim();
        if (!textoOriginal) return;

        const regex = /([a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+)\s*:\s*(\d+)/g;
        let coincidencias;
        const stats = [];

        while ((coincidencias = regex.exec(textoOriginal)) !== null) {
            stats.push({
                nombre: coincidencias[1].trim(),
                valor: Math.min(Math.max(parseInt(coincidencias[2], 10), 0), MAX_VALOR)
            });
        }

        if (stats.length !== 5) return;

        const maximoGrafico = MAX_VALOR; 

        // 1. PENTÁGONO BASE SÓLIDO
        const puntosBase = [];
        for (let i = 0; i < 5; i++) {
            const p = obtenerCoordenadas(i, maximoGrafico, maximoGrafico);
            puntosBase.push(`${p.x},${p.y}`);
        }
        const pentagonoBaseHTML = `<polygon points="${puntosBase.join(' ')}" class="chart-base-solid" />`;

        // Red de guías interna
        let lineasGuiaHTML = '';
        for (let nivel = 1; nivel <= 3; nivel++) {
            const escala = nivel / 4;
            const puntosGuia = [];
            for (let i = 0; i < 5; i++) {
                const p = obtenerCoordenadas(i, escala * maximoGrafico, maximoGrafico);
                puntosGuia.push(`${p.x},${p.y}`);
            }
            lineasGuiaHTML += `<polygon points="${puntosGuia.join(' ')}" class="chart-grid-line" />`;
        }

        // 2. EJES Y POLÍGONO DEL JUGADOR
        let ejesHTML = '';
        let contenedoresHTML = '';
        const puntosUsuario = [];

        // Dimensiones FIJAS para los cuadritos de las etiquetas
        const ANCHO_CAJA = 26;
        const ALTO_CAJA = 26;

        stats.forEach((stat, i) => {
            const pMax = obtenerCoordenadas(i, maximoGrafico, maximoGrafico);
            const pUser = obtenerCoordenadas(i, stat.valor, maximoGrafico);
            
            puntosUsuario.push(`${pUser.x},${pUser.y}`);
            ejesHTML += `<line x1="${CENTRO}" y1="${CENTRO}" x2="${pMax.x}" y2="${pMax.y}" class="chart-axis" />`;

            // Desplazamientos inteligentes de las cajas según su cuadrante para que no pisen el gráfico
            let desplaceX = 0;
            let desplaceY = 0;

            if (pMax.x < CENTRO - 20) {
                desplaceX = -ANCHO_CAJA - 12; // Izquierda
            } else if (pMax.x > CENTRO + 20) {
                desplaceX = 12;               // Derecha
            } else {
                desplaceX = -ANCHO_CAJA / 2;  // Centro (vértice superior)
            }

            if (pMax.y > CENTRO + 20) {
                desplaceY = 10;               // Abajo
            } else if (pMax.y < CENTRO - 20) {
                desplaceY = -ALTO_CAJA - 12;  // Arriba
            } else {
                desplaceY = -ALTO_CAJA / 2;   // Centrado vertical
            }

            const cajaX = pMax.x + desplaceX;
            const cajaY = pMax.y + desplaceY;

            // Inyectamos HTML real usando foreignObject para un control absoluto
            contenedoresHTML += `
                <foreignObject x="${cajaX}" y="${cajaY}" width="${ANCHO_CAJA}" height="${ALTO_CAJA}">
                    <div class="chart-tag-box" title="${stat.nombre}" xmlns="http://www.w3.org/1999/xhtml">${stat.valor}</div>
                </foreignObject>
            `;
        });

        // 3. ENSAMBLAR SVG
        const svgHTML = `
            <div class="rpg-chart-container">
                <svg viewBox="0 0 ${TAMANO} ${TAMANO}" width="100%" height="100%">
                    ${pentagonoBaseHTML}
                    ${lineasGuiaHTML}
                    ${ejesHTML}
                    <polygon points="${puntosUsuario.join(' ')}" class="chart-user-polygon" />
                    ${stats.map((stat, i) => {
                        const p = obtenerCoordenadas(i, stat.valor, maximoGrafico);
                        return `<circle cx="${p.x}" cy="${p.y}" r="4" class="chart-user-point" />`;
                    }).join('')}
                    ${contenedoresHTML}
                </svg>
            </div>
        `;

        campoStats.innerHTML = svgHTML;
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', generarGraficoPentagonoPerfil);
    } else {
        generarGraficoPentagonoPerfil();
    }
})();
