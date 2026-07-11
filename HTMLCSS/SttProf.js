(function() {
    // Configuración calibrada para contenedor de 390x390
    const MAX_VALOR = 10; 
    const TAMANO = 450;   // Lienzo matemático interno más grande para dar margen
    const CENTRO = TAMANO / 2;
    const RADIO = 140;    // Radio del pentágono (deja ~85px libres en los bordes para los textos)

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
        const campoStats = document.getElementById('field_id28');
        if (!campoStats) return;

        const contenedorTexto = campoStats.querySelector('.field_uneditable');
        if (!contenedorTexto || campoStats.querySelector('.rpg-chart-container')) return;

        const textoOriginal = contenedorTexto.textContent.trim();
        if (!textoOriginal) return;

        // 1. PARSEAR LAS STATS
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

            ejesHTML += `<line x1="${CENTRO}" y1="${CENTRO}" x2="${pMax.x}" y2="${pMax.y}" class="chart-axis" />`;

            // Algoritmo de desplace fino para evitar textos encimados o cortados
            let anchor = 'middle';
            let ajusteY = 0;
            let ajusteX = 0;

            if (pMax.x < CENTRO - 20) {
                anchor = 'end';      // Lado izquierdo del pentágono
                ajusteX = -8;
            } else if (pMax.x > CENTRO + 20) {
                anchor = 'start';    // Lado derecho del pentágono
                ajusteX = 8;
            }

            if (pMax.y > CENTRO + 20) {
                ajusteY = 15;        // Vértices de abajo
            } else if (pMax.y < CENTRO - 20) {
                ajusteY = -12;       // Vértice superior central
            }

            textosHTML += `<text x="${pMax.x + ajusteX}" y="${pMax.y + ajusteY}" text-anchor="${anchor}" class="chart-label">${stat.nombre} (${stat.valor})</text>`;
        });

        // 4. ENSAMBLAR EL SVG COMPLETO
        const svgHTML = `
            <div class="rpg-chart-container">
                <svg viewBox="0 0 ${TAMANO} ${TAMANO}" width="100%" height="100%">
                    ${lineasGuiaHTML}
                    ${ejesHTML}
                    <polygon points="${puntosUsuario.join(' ')}" class="chart-user-polygon" />
                    ${stats.map((stat, i) => {
                        const p = obtenerCoordenadas(i, stat.valor, maximoGrafico);
                        return `<circle cx="${p.x}" cy="${p.y}" r="4" class="chart-user-point" />`;
                    }).join('')}
                    ${textosHTML}
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
