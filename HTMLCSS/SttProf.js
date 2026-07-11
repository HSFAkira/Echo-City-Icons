(function() {
    // Configuración básica del gráfico
    const MAX_VALOR = 10; // Escala fija del 1 al 10
    const TAMANO = 220;   // Tamaño del SVG
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
        const campoStats = document.getElementById('field_id28');
        if (!campoStats) return;

        // Buscamos el contenedor del texto plano para leer los datos antes de borrar nada
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

        // Si no hay exactamente 5 stats, no hacemos nada
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
                    ${lineasGuiaHTML}
                    ${ejesHTML}
                    <polygon points="${puntosUsuario.join(' ')}" class="chart-user-polygon" />
                    ${stats.map((stat, i) => {
                        const p = obtenerCoordenadas(i, stat.valor, maximoGrafico);
                        return `<circle cx="${p.x}" cy="${p.y}" r="3.5" class="chart-user-point" />`;
                    }).join('')}
                    ${textosHTML}
                </svg>
            </div>
        `;

        // 5. LIMPIEZA ABSOLUTA: Borramos todo el HTML interno de #field_id28
        // e inyectamos directamente el gráfico
        campoStats.innerHTML = svgHTML;
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', generarGraficoPentagonoPerfil);
    } else {
        generarGraficoPentagonoPerfil();
    }
})();
