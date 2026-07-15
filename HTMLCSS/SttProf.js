(function() {
    const MAX_VALOR = 10; 
    const TAMANO = 390;   // Contenedor físico 1:1
    const CENTRO = TAMANO / 2;
    
    // Dimensiones de las cajitas de los números (26px)
    const LADO_CAJA = 26;
    const RADIO = CENTRO - (LADO_CAJA / 2); 

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

        // 1. PENTÁGONO BASE SÓLIDO (Este representa el Nivel 10)
        const puntosBase = [];
        for (let i = 0; i < 5; i++) {
            const p = obtenerCoordenadas(i, maximoGrafico, maximoGrafico);
            puntosBase.push(`${p.x},${p.y}`);
        }
        const pentagonoBaseHTML = `<polygon points="${puntosBase.join(' ')}" class="chart-base-solid" />`;

        // NUEVO: Dibujamos las guías internas para los niveles del 1 al 9
        let lineasGuiaHTML = '';
        for (let nivel = 1; nivel <= 9; nivel++) {
            const escala = nivel / MAX_VALOR; // Fracción exacta (0.1, 0.2 ... 0.9)
            const puntosGuia = [];
            for (let i = 0; i < 5; i++) {
                const p = obtenerCoordenadas(i, escala * maximoGrafico, maximoGrafico);
                puntosGuia.push(`${p.x},${p.y}`);
            }
            lineasGuiaHTML += `<polygon points="${puntosGuia.join(' ')}" class="chart-grid-line" />`;
        }

        // 2. EJES, POLÍGONO DEL JUGADOR Y BOTONES DE NÚMEROS
        let ejesHTML = '';
        let contenedoresHTML = '';
        const puntosUsuario = [];

        stats.forEach((stat, i) => {
            const pMax = obtenerCoordenadas(i, maximoGrafico, maximoGrafico);
            const pUser = obtenerCoordenadas(i, stat.valor, maximoGrafico);
            
            puntosUsuario.push(`${pUser.x},${pUser.y}`);
            ejesHTML += `<line x1="${CENTRO}" y1="${CENTRO}" x2="${pMax.x}" y2="${pMax.y}" class="chart-axis" />`;

            const cajaX = pMax.x - (LADO_CAJA / 2);
            const cajaY = pMax.y - (LADO_CAJA / 2);

            contenedoresHTML += `
                <foreignObject x="${cajaX}" y="${cajaY}" width="${LADO_CAJA}" height="${LADO_CAJA}">
                    <div class="chart-tag-box" title="${stat.nombre}" xmlns="http://www.w3.org/1999/xhtml">
                        ${stat.valor}
                    </div>
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
                        return `<circle cx="${p.x}" cy="${p.y}" r="3.5" class="chart-user-point" />`;
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
