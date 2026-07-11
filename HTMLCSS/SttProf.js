(function() {
    // Configuración calibrada para contenedor de 390x390
    const MAX_VALOR = 10; 
    const TAMANO = 450;   // Lienzo matemático interno
    const CENTRO = TAMANO / 2;
    const RADIO = 125;    // Ajustado un poco para dar más espacio a los fondos de texto

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

        const regex = /([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)\s*:\s*(\d+)/g;
        let coincidencias;
        const stats = [];

        while ((coincidencias = regex.exec(textoOriginal)) !== null) {
            stats.push({
                nombre: coincidencias[1],
                valor: Math.min(Math.max(parseInt(coincidencias[2], 10), 0), MAX_VALOR)
            });
        }

        if (stats.length !== 5) return;

        const maximoGrafico = MAX_VALOR; 

        // 1. DIBUJAR PENTÁGONO BASE (Fondo sólido total)
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

        // 2. MAPEAR EJES Y POLÍGONO DEL JUGADOR
        let ejesHTML = '';
        let textosYFondosHTML = '';
        const puntosUsuario = [];

        stats.forEach((stat, i) => {
            const pMax = obtenerCoordenadas(i, maximoGrafico, maximoGrafico);
            const pUser = obtenerCoordenadas(i, stat.valor, maximoGrafico);
            
            puntosUsuario.push(`${pUser.x},${pUser.y}`);
            ejesHTML += `<line x1="${CENTRO}" y1="${CENTRO}" x2="${pMax.x}" y2="${pMax.y}" class="chart-axis" />`;

            // Configuración de desplace fino para las etiquetas
            let anchor = 'middle';
            let ajusteY = 0;
            let ajusteX = 0;

            if (pMax.x < CENTRO - 20) {
                anchor = 'end';
                ajusteX = -12;
            } else if (pMax.x > CENTRO + 20) {
                anchor = 'start';
                ajusteX = 12;
            }

            if (pMax.y > CENTRO + 20) {
                ajusteY = 18;
            } else if (pMax.y < CENTRO - 20) {
                ajusteY = -15;
            }

            const posX = pMax.x + ajusteX;
            const posY = pMax.y + ajusteY;
            const textoCompleto = `${stat.nombre} (${stat.valor})`;

            // Estimación del ancho de la caja de fondo basada en el largo del texto
            const anchoAproximado = textoCompleto.length * 7.5 + 14; 
            const altoCaja = 22;
            
            // Ajuste del origen X de la caja según la alineación del texto
            let cajaX = posX - (anchoAproximado / 2);
            if (anchor === 'end') cajaX = posX - anchoAproximado;
            if (anchor === 'start') cajaX = posX;

            const cajaY = posY - 15;

            // Agrupamos el rectángulo de fondo y el texto juntos
            textosYFondosHTML += `
                <g class="chart-label-group">
                    <rect x="${cajaX}" y="${cajaY}" width="${anchoAproximado}" height="${altoCaja}" rx="4" class="chart-label-bg" />
                    <text x="${posX}" y="${posY}" text-anchor="${anchor}" class="chart-label">${textoCompleto}</text>
                </g>
            `;
        });

        // 3. ENSAMBLAR
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
                    ${textosYFondosHTML}
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
