(function() {
    const MAX_VALOR = 10; 
    const TAMANO = 390;   // Contenedor físico 1:1
    const CENTRO = TAMANO / 2;
    
    // Dimensiones de las cajitas de los números (26px)
    const LADO_CAJA = 26;
    const RADIO = CENTRO - (LADO_CAJA / 2); 

    // CALCULADORA DINÁMICA DE COORDENADAS
    // Ahora recibe 'totalStats' para dividir el círculo en N partes iguales
    const obtenerCoordenadas = (indice, valor, maximo, totalStats) => {
        const angulo = (Math.PI * 2 / totalStats) * indice - (Math.PI / 2);
        const distancia = (valor / maximo) * RADIO;
        return {
            x: CENTRO + distancia * Math.cos(angulo),
            y: CENTRO + distancia * Math.sin(angulo)
        };
    };

    const generarGraficoPerfilAdaptativo = () => {
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

        // Se necesitan al menos 3 puntos para formar un polígono
        const totalStats = stats.length;
        if (totalStats < 3) return;

        const maximoGrafico = MAX_VALOR; 

        // 1. POLÍGONO BASE SÓLIDO (N lados)
        const puntosBase = [];
        for (let i = 0; i < totalStats; i++) {
            const p = obtenerCoordenadas(i, maximoGrafico, maximoGrafico, totalStats);
            puntosBase.push(`${p.x},${p.y}`);
        }
        const poligonoBaseHTML = `<polygon points="${puntosBase.join(' ')}" class="chart-base-solid" />`;

        // 2. GUÍAS INTERNAS (Niveles del 1 al 9)
        let lineasGuiaHTML = '';
        for (let nivel = 1; nivel <= 9; nivel++) {
            const escala = nivel / MAX_VALOR;
            const puntosGuia = [];
            for (let i = 0; i < totalStats; i++) {
                const p = obtenerCoordenadas(i, escala * maximoGrafico, maximoGrafico, totalStats);
                puntosGuia.push(`${p.x},${p.y}`);
            }
            lineasGuiaHTML += `<polygon points="${puntosGuia.join(' ')}" class="chart-grid-line" />`;
        }

        // 3. EJES, POLÍGONO DEL JUGADOR Y BOTONES DE NÚMEROS
        let ejesHTML = '';
        let contenedoresHTML = '';
        const puntosUsuario = [];

        stats.forEach((stat, i) => {
            const pMax = obtenerCoordenadas(i, maximoGrafico, maximoGrafico, totalStats);
            const pUser = obtenerCoordenadas(i, stat.valor, maximoGrafico, totalStats);
            
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

        // 4. ENSAMBLAR SVG
        const svgHTML = `
            <div class="rpg-chart-container">
                <svg viewBox="0 0 ${TAMANO} ${TAMANO}" width="100%" height="100%">
                    ${poligonoBaseHTML}
                    ${lineasGuiaHTML}
                    ${ejesHTML}
                    <polygon points="${puntosUsuario.join(' ')}" class="chart-user-polygon" />
                    ${stats.map((stat, i) => {
                        const p = obtenerCoordenadas(i, stat.valor, maximoGrafico, totalStats);
                        return `<circle cx="${p.x}" cy="${p.y}" r="3.5" class="chart-user-point" />`;
                    }).join('')}
                    ${contenedoresHTML}
                </svg>
            </div>
        `;

        campoStats.innerHTML = svgHTML;
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', generarGraficoPerfilAdaptativo);
    } else {
        generarGraficoPerfilAdaptativo();
    }
})();
